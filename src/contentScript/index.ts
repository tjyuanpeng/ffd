async function getStorageItem(): Promise<OriginStorage> {
  const storage: Storage = await chrome.storage.sync.get([window.location.origin])
  return storage[window.location.origin]
}

async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const storageItem = await getStorageItem()
    const origin = new URL(storageItem.host ?? window.location.origin).origin
    const result = await fetch(`${origin}/api/ycSystem/external/user/currentRootMenuTree`, {
      headers: { authorization: localStorage.getItem('token') ?? '' },
    }).then(r => r.json())
    return result.code === 200 ? result.rows : []
    // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (_e) {
    return []
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'RELOAD_ORIGIN_RULES') {
    getMenuItems().then(sendResponse)
  } else if (message.type === 'RELOAD_PAGE') {
    setInjectScriptConfig().then(() => setTimeout(() => window.location.reload())).then(sendResponse)
  } else if (message.type === 'GET_TOKEN') {
    const token = localStorage.getItem('token')
    sendResponse({ token })
  } else if (message.type === 'SET_TOKEN') {
    localStorage.setItem('token', message.payload)
    sendResponse()
  }
  return true
})

window.addEventListener('message', (e) => {
  if (e.source !== window || !e.data.type) {
    return
  }
  if (e.data.type === '__FFD__PROXY_URL__') {
    getStorageItem().then((storageItem) => {
      chrome.storage.sync.set({
        [window.location.origin]: {
          ...storageItem,
          host: e.data.payload,
        },
      })
    })
  }
})

async function fixCurrentMenuItem(storageItem: OriginStorage) {
  try {
    if (!('CURRENT_MENU_ITEM' in localStorage)) {
      return
    }
    const cmi = JSON.parse(localStorage.getItem('CURRENT_MENU_ITEM') ?? '{}')
    const found = storageItem?.fixRules?.find(i => i.appName === cmi.appName)
    if (!found) {
      return
    }
    if (found.enable && storageItem.enable) {
      cmi.path = found.fixedPath
    } else {
      cmi.path = found.path
    }
    localStorage.setItem('CURRENT_MENU_ITEM', JSON.stringify(cmi))
  // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (_e) {
  }
}

async function setInjectScriptConfig() {
  const storageItem = await getStorageItem()
  if (storageItem && storageItem.enable) {
    sessionStorage.setItem('__FFD__ENABLE__', '1')
    if (storageItem.fixRules && storageItem.fixRules.length) {
      sessionStorage.setItem('__FFD__FIXRULES__', JSON.stringify(storageItem.fixRules))
    } else {
      sessionStorage.removeItem('__FFD__FIXRULES__')
    }
  } else {
    sessionStorage.removeItem('__FFD__ENABLE__')
    sessionStorage.removeItem('__FFD__FIXRULES__')
  }
  await fixCurrentMenuItem(storageItem)
}

setInjectScriptConfig()

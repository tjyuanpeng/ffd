console.log('background is running')

async function updateTabIcon(tabId?: number, url?: string) {
  if (!tabId || !url) {
    return
  }
  const origin = new URL(url).origin
  const storage: Storage = await chrome.storage.sync.get([origin])
  const storageItem: StorageItem = storage[origin]
  if (!storageItem) {
    return
  }
  await chrome.action.setIcon({
    path: storageItem.enable ? { 32: 'img/active.png' } : { 32: 'img/inactive.png' },
    tabId,
  })
  // console.log('[FFD] updated icon.', storageItem.enable)
}

chrome.runtime.onInstalled.addListener(async () => {
  // console.log('[FFD] chrome.runtime.onInstalled.')
  const allTabs = await chrome.tabs.query({})
  for (const tab of allTabs) {
    await updateTabIcon(tab.id, tab.url)
  }
})

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // console.log('[FFD] chrome.tabs.onActivated.')
  const tab = await chrome.tabs.get(activeInfo.tabId)
  await updateTabIcon(activeInfo.tabId, tab.url)
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // console.log('[FFD] chrome.tabs.onUpdated.', changeInfo)
  if (changeInfo.status === 'loading') {
    await updateTabIcon(tabId, tab.url)
  }
})

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  // console.log('[FFD] chrome.windows.onFocusChanged.')
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    return
  }
  const [activeTab] = await chrome.tabs.query({ active: true, windowId })
  await updateTabIcon(activeTab?.id, activeTab?.url)
})

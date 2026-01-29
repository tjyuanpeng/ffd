import { defineStore } from 'pinia'
import { ref, toRaw, watch } from 'vue'

export const useStore = defineStore('popup', () => {
  const activeTab = ref<chrome.tabs.Tab>()
  const origin = ref()
  const storageItem = ref<StorageItem>({})

  const sendMessage = (type: string, payload?: any) => new Promise<any>((resolve) => {
    chrome.tabs.sendMessage(activeTab.value!.id!, { type, payload }, resolve)
  })
  const loadOriginRules = async () => {
    const oRules = await sendMessage('RELOAD_ORIGIN_RULES')
    storageItem.value.originRules = oRules
  }

  let waitInitialized: any = null
  let resolve: any = null
  const initialized = ref<boolean>(false)
  const init = async () => {
    await waitInitialized
    if (initialized.value) {
      return
    }
    waitInitialized ??= new Promise(r => resolve = r)
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!currentTab || !currentTab.url) {
      throw new Error('No active tab found')
    }
    activeTab.value = currentTab
    origin.value = new URL(currentTab.url).origin
    const s: Storage = await chrome.storage.sync.get([origin.value])
    storageItem.value = s[origin.value] ?? {}

    watch(storageItem, (v: any) => {
      chrome.storage.sync.set({
        [origin.value]: JSON.parse(JSON.stringify(toRaw(v))),
      })
    }, { deep: true })

    initialized.value = true
    resolve()
  }

  async function clearAllData() {
    await chrome.storage.sync.clear()
    origin.value && await chrome.browsingData.remove({ origins: [origin.value] }, { cookies: true, localStorage: true })
    await sendMessage('RELOAD_PAGE')
    window.close()
  }

  return {
    initialized,
    init,
    origin,
    sendMessage,
    storageItem,
    loadOriginRules,
    clearAllData,
  }
})

/**
 * 基础版防抖函数
 * @param {Function} func - 要防抖的目标函数
 * @param {number} wait - 延迟执行的时间，单位ms
 * @returns {Function} 防抖后的包装函数
 */

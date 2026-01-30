import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useStore = defineStore('popup', () => {
  const activeTab = ref<chrome.tabs.Tab>()
  const origin = ref()
  const originStorage = ref<OriginStorage>({})
  const storage = ref<BaseStorage>({})

  const sendMessage = (type: string, payload?: any) => new Promise<any>((resolve) => {
    chrome.tabs.sendMessage(activeTab.value!.id!, { type, payload }, resolve)
  })

  let waitInitialized: Promise<boolean>
  let setInitialized: (r: boolean) => void
  const initialized = ref(false)
  const init = async () => {
    if (await waitInitialized) {
      return
    }
    waitInitialized = new Promise(r => setInitialized = r)
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!currentTab || !currentTab.url) {
      throw new Error('No active tab found')
    }
    activeTab.value = currentTab
    origin.value = new URL(currentTab.url).origin

    const s = await chrome.storage.sync.get<Storage>()
    const { [origin.value]: os, ...others } = s ?? {}
    originStorage.value = os ?? {}
    storage.value = others ?? {}

    watch(originStorage, (v: OriginStorage) => {
      chrome.storage.sync.set({
        [origin.value]: JSON.parse(JSON.stringify(v)),
      })
    }, { deep: true })

    watch(storage, (v: BaseStorage) => {
      chrome.storage.sync.set(JSON.parse(JSON.stringify(v)))
    }, { deep: true })

    setInitialized(true)
    initialized.value = true
  }

  async function clearAllData() {
    await chrome.storage.sync.clear()
    origin.value && await chrome.browsingData.remove({ origins: [origin.value] }, { cookies: true, localStorage: true })
    await sendMessage('RELOAD_PAGE')
    window.close()
  }

  return {
    init,
    initialized,
    origin,
    sendMessage,
    storage,
    originStorage,
    clearAllData,
  }
})

import type { Ref } from 'vue'
import { computed, ref, toRaw, watch } from 'vue'

export function useActiveTab(): { activeTab: Ref<chrome.tabs.Tab | undefined>, sendMessage: (type: string, payload?: any) => Promise<any> } {
  const activeTab = ref<chrome.tabs.Tab>()
  const queryActiveTab = (): Promise<chrome.tabs.Tab | undefined> => {
    if (activeTab.value) {
      return Promise.resolve(activeTab.value)
    }
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        activeTab.value = tabs[0]
        resolve(activeTab.value)
      })
    })
  }
  queryActiveTab()

  const sendMessage = async (type: string, payload?: any) => {
    return new Promise<any>((resolve, reject) => {
      queryActiveTab().then((tab) => {
        if (!tab) {
          reject(new Error('No active tab found'))
          return
        }
        chrome.tabs.sendMessage(
          tab.id!,
          { type, payload },
          resolve,
        )
      })
    })
  }
  return { activeTab, sendMessage }
}

export function useOrigin() {
  const { activeTab } = useActiveTab()
  return computed(() => {
    return activeTab.value && activeTab.value.url ? new URL(activeTab.value.url).origin : null
  })
}

export function useStorageItem(): { storageItem: Ref<StorageItem | undefined>, save: (data: any) => Promise<void> } {
  const origin = useOrigin()
  const storageItem = ref()

  async function load() {
    if (!origin.value) {
      return
    }
    const storage: Storage = await chrome.storage.sync.get([origin.value])
    storageItem.value = storage[origin.value]
  }
  watch(origin, () => load())

  async function save(data: StorageItem) {
    if (!origin.value) {
      return
    }
    storageItem.value = {
      ...storageItem.value,
      ...data,
    }
    await chrome.storage.sync.set({
      [origin.value]: JSON.parse(JSON.stringify(toRaw(storageItem.value))),
    })
  }

  return { storageItem, save }
}

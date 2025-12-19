import type { Ref } from 'vue'
import { computed, onMounted, ref, toRaw, watch } from 'vue'

export function useActiveTab(): [Ref<chrome.tabs.Tab | undefined>, (type: string, payload?: any) => Promise<any>] {
  const activeTab = ref<chrome.tabs.Tab | undefined>()
  onMounted(async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    activeTab.value = tabs[0]
  })

  const sendMessage = (type: string, payload?: any) => {
    return new Promise<any>((resolve) => {
      const id = activeTab.value?.id
      if (!id) {
        resolve(null)
        return
      }
      chrome.tabs.sendMessage(
        id,
        { type, payload },
        resolve,
      )
    })
  }
  return [activeTab, sendMessage]
}

export function useOrigin() {
  const [activeTab] = useActiveTab()
  return computed(() => {
    return activeTab.value && activeTab.value.url ? new URL(activeTab.value.url).origin : null
  })
}

export function useStorageItem(): [Ref<StorageItem | undefined>, () => Promise<void>, (data: any) => Promise<void>] {
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

  return [storageItem, load, save]
}

/// <reference types="vite/client" />
/// <reference types="@types/chrome" />

interface Storage {
  [key: string]: StorageItem
}

interface StorageItem {
  enable: boolean
  originRules?: MenuItem[]
  fixRules?: MenuItem[]
  host?: string
}

interface MenuItem {
  appName: string
  title: string
  path: string
  fixedPath?: string
  enable?: boolean
}

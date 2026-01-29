/// <reference types="vite/client" />
/// <reference types="@types/chrome" />

interface Storage {
  [key: string]: StorageItem
}

interface TokenInfo {
  username: string
  password: string
  env: string
  url: string
}

interface StorageItem {
  enable?: boolean
  originRules?: MenuItem[]
  fixRules?: MenuItem[]
  host?: string
  popupActiveTab?: string
  loginForm?: TokenInfo
  tokenInfos?: TokenInfo[]
}

interface MenuItem {
  appName: string
  title: string
  path: string
  fixedPath?: string
  enable?: boolean
}

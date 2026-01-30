/// <reference types="vite/client" />
/// <reference types="@types/chrome" />

type Storage = BaseStorage & OriginStorage

interface BaseStorage {
  popupActiveTab?: string
  loginForm?: TokenInfo
  tokenInfos?: TokenInfo[]
}

interface OriginStorage {
  enable?: boolean
  originRules?: MenuItem[]
  fixRules?: MenuItem[]
  host?: string
}

interface TokenInfo {
  username: string
  password: string
  env: string
  url: string
}

interface MenuItem {
  appName: string
  title: string
  path: string
  fixedPath?: string
  enable?: boolean
}

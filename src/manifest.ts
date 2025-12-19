import process from 'node:process'
import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${process.env.NODE_ENV === 'development' ? ` ➡️ Dev` : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  host_permissions: ['<all_urls>'],
  icons: {
    16: 'img/ffd.png',
    32: 'img/ffd.png',
    48: 'img/ffd.png',
    128: 'img/ffd.png',
  },
  permissions: [
    'tabs',
    'storage',
    'browsingData',
  ],
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/contentScript/index.ts'],
      run_at: 'document_start',
    },
    {
      matches: ['<all_urls>'],
      js: ['src/contentScript/inject.js'],
      run_at: 'document_start',
      world: 'MAIN',
    },
  ],
  action: {
    default_popup: 'popup.html',
    default_icon: 'img/inactive.png',
    default_title: 'FFD',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
})

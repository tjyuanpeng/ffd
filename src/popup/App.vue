<script setup lang="ts">
import { ClearOutlined } from '@ant-design/icons-vue'
import { onMounted } from 'vue'
import Inject from './inject.vue'
import { useStore } from './store'
import Token from './token.vue'

const store = useStore()
onMounted(store.init)
</script>

<template>
  <a-tabs v-model:active-key="store.storageItem.popupActiveTab" type="card">
    <a-tab-pane v-if="store.storageItem.enable" key="inject" tab="子应用配置">
      <Inject />
    </a-tab-pane>
    <a-tab-pane v-if="store.storageItem.enable" key="token" tab="Token">
      <Token />
    </a-tab-pane>
    <template #rightExtra>
      <a-tooltip title="清除当前网站所有数据" placement="left">
        <a-button v-if="store.storageItem.enable" type="text" @click="store.clearAllData">
          <template #icon>
            <ClearOutlined />
          </template>
        </a-button>
      </a-tooltip>
      <span v-if="!store.storageItem.enable">对当前网站启用: </span>
      <a-switch v-model:checked="store.storageItem.enable" style="margin-left: 12px; margin-right: 12px;" />
    </template>
  </a-tabs>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  width: 576px;
  min-height: 300px;
  max-height: 1000px;
}

.ant-tabs {
  padding: 4px;
}

.ant-tabs .ant-tabs-nav {
  margin-bottom: 0;
  z-index: 1;
}

.ant-tabs-nav-wrap {
  height: 40px;
}

.ant-tabs-content-holder {
  margin-top: -1px;
}

.ant-tabs-tab:first-child {
  border-bottom-left-radius: 0;
}

.ant-card {
  border-top-left-radius: 0;
}
</style>

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
  <a-tabs v-if="store.initialized" v-model:active-key="store.storage.popupActiveTab" type="card">
    <a-tab-pane key="inject" tab="子应用配置">
      <Inject />
    </a-tab-pane>
    <a-tab-pane key="token" tab="Token">
      <Token />
    </a-tab-pane>
    <template #rightExtra>
      <a-tooltip title="清除扩展以及当前网站所有数据" placement="left">
        <a-button type="text" style="margin-right: 20px;" @click="store.clearAllData">
          <template #icon>
            <ClearOutlined />
          </template>
        </a-button>
      </a-tooltip>
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

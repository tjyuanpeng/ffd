<script setup lang="ts">
import { ClearOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { Form } from 'ant-design-vue'
import { reactive, ref, watch } from 'vue'
import { useActiveTab, useOrigin, useStorageItem } from './hooks'

const useForm = Form.useForm
const [storageItem, _load, save] = useStorageItem()
const origin = useOrigin()
const [_activeTab, sendMessage] = useActiveTab()
const enable = ref<boolean>()
const originRules = ref<MenuItem[]>()
const fixRules = ref<MenuItem[]>()

const form = ref<MenuItem[]>([])
const rules = reactive<any>({})
const { validateInfos: vis } = useForm(form, rules, {
  onValidate: async (name, status) => {
    const [_, index, field] = (name as string).match(/(\d)\.(\w+)/) ?? []
    if (field === 'fixedPath' && index !== undefined) {
      const rule = form.value[+index]
      if (rule && rule.enable === undefined) {
        rule.enable = true
      }
    }
    if (status) {
      await save({ fixRules: form.value.filter(i => i.fixedPath) })
      await sendMessage('RELOAD_PAGE')
    }
  },
})

watch(storageItem, (si) => {
  if (!si) {
    return
  }
  Object.keys(rules).forEach(name => delete rules[name])
  form.value = []
  enable.value = si.enable
  originRules.value = si.originRules ?? []
  fixRules.value = si.fixRules ?? []
  for (let i = 0; i < originRules.value.length; i++) {
    const o = originRules.value[i]!
    const found = fixRules.value.find(i => i.appName === o.appName)
    form.value.push({
      appName: o.appName,
      title: o.title,
      path: o.path,
      fixedPath: found ? found.fixedPath : undefined,
      enable: found?.enable,
    })
    rules[`${i}.fixedPath`] = [{ pattern: /(http|https):\/\/\S+/g, message: 'URL格式错误' }]
    rules[`${i}.enable`] = [{ required: true, message: '必填项目' }]
  }
})

async function loadOriginRules() {
  const oRules = await sendMessage('RELOAD_ORIGIN_RULES')
  await save({ originRules: oRules })
}
async function clearAllData() {
  await chrome.storage.sync.clear()
  origin.value && await chrome.browsingData.remove({ origins: [origin.value] }, { cookies: true, localStorage: true })
  await sendMessage('RELOAD_PAGE')
  window.close()
}
async function handleEnableChange() {
  await save({ enable: enable.value })
  if (enable.value) {
    await loadOriginRules()
  }
  await sendMessage('RELOAD_PAGE')
}
</script>

<template>
  <a-card style="width: 100%">
    <template #title>
      对该网站启用
    </template>
    <template #extra>
      <a-switch v-model:checked="enable" @click="handleEnableChange" />
    </template>
    <template v-if="enable">
      <div class="toolbar">
        <a-button type="text" @click="loadOriginRules">
          <template #icon>
            <ReloadOutlined />
          </template>
          加载原始规则
        </a-button>
        <a-button type="text" @click="clearAllData">
          <template #icon>
            <ClearOutlined />
          </template>
          清除所有数据
        </a-button>
      </div>
      <a-form class="form" :label-col="{ span: 4 }">
        <a-form-item v-for="(item, index) in form" :key="item.appName" :label="item.title" v-bind="vis[`${index}.fixedPath`]">
          <a-input v-model:value.lazy="item.fixedPath" :placeholder="item.path" />
          <a-form-item-rest v-bind="vis[`${index}.enable`]">
            <a-switch v-model:checked.lazy="item.enable" size="small" />
          </a-form-item-rest>
        </a-form-item>
      </a-form>
    </template>
  </a-card>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  width: 576px;
  min-height: 300px;
  max-height: 1000px;
}

.toolbar {
  display: flex;
  justify-content: start;
  align-items: center;
  padding: 0 0 10px;
  margin-top: -14px;
}

.form {
  width: 100%;

  .ant-form-item-control-input-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>

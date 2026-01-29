<script setup lang="ts">
import { ReloadOutlined } from '@ant-design/icons-vue'
import { Form } from 'ant-design-vue'
import { onMounted, reactive, ref, watch } from 'vue'
import { useStore } from './store'

const useForm = Form.useForm
const store = useStore()

const originRules = ref<MenuItem[]>()
const loadOriginRules = async () => {
  const oRules = await store.sendMessage('RELOAD_ORIGIN_RULES')
  console.log('# loadOriginRules', oRules)
  store.storageItem.originRules = oRules
}
onMounted(async () => {
  await store.init()
  await loadOriginRules()
})

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
      store.storageItem.fixRules = form.value.filter(i => i.fixedPath)
      await store.sendMessage('RELOAD_PAGE')
    }
  },
})
watch(() => store.storageItem, (si) => {
  Object.keys(rules).forEach(name => delete rules[name])
  form.value = []
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
}, { immediate: true, deep: true })
</script>

<template>
  <a-card>
    <div class="toolbar">
      <a-button type="text" @click="loadOriginRules">
        <template #icon>
          <ReloadOutlined />
        </template>
        加载原始规则
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
  </a-card>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: start;
  align-items: center;
  padding: 0 0 10px;
  margin-top: -14px;
}

.form {
  width: 100%;

  :deep(.ant-form-item-control-input-content) {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>

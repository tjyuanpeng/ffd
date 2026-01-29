<script setup lang="ts">
import { Form } from 'ant-design-vue'
import { computed, onMounted, ref, toRaw, watch } from 'vue'
import { useStore } from './store'

const encrypt = (text: string) => {
  if (!text) {
    return text
  }
  return btoa(encodeURIComponent(text)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}
const decrypt = (text: string) => {
  if (!text) {
    return text
  }
  let base64Str = text.replace(/-/g, '+').replace(/_/g, '/')
  const padLen = 4 - (base64Str.length % 4)
  if (padLen !== 4) {
    base64Str += '='.repeat(padLen)
  }
  return decodeURIComponent(atob(text))
}

const useForm = Form.useForm
const store = useStore()

const token = ref()
const refreshToken = async () => {
  const t = await store.sendMessage('GET_TOKEN')
  token.value = t?.token
}
onMounted(async () => {
  await store.init()
  refreshToken()
})

const envOptions = [
  {
    label: 'Dev',
    value: 'Dev',
    url: 'https://dev.yingmai.net:9001/api/auth/login',
  },
  {
    label: 'Test',
    value: 'Test',
    url: 'https://test.yingmai.net:9001/api/auth/login',
  },
  {
    label: 'Pre',
    value: 'Pre',
    url: 'https://pre.yingmai.net/api/auth/login',
  },
  {
    label: 'Prod',
    value: 'Prod',
    url: 'https://www.yingmai.net/api/auth/login',
  },
  {
    label: '自定义',
    value: 'Custom',
  },
]
const loginForm = ref<any>({
  env: store.storageItem?.loginForm?.env ?? envOptions[0]!.value,
  url: store.storageItem?.loginForm?.url,
  username: store.storageItem?.loginForm?.username,
  password: store.storageItem?.loginForm?.password,
})
const pwdField = computed({
  get: () => decrypt(loginForm.value.password),
  set: async (v: string) => loginForm.value.password = encrypt(v),
})
watch(loginForm, (value) => {
  store.storageItem.loginForm = toRaw(value)
}, { deep: true })
watch(() => loginForm.value.env, (value: any) => {
  loginForm.value.url = envOptions.find(i => i.value === value)?.url ?? loginForm.value.url
}, { immediate: true })

const tokenInfoOptions = computed(() => store.storageItem.tokenInfos?.map(i => ({
  ...i,
  label: `${i.username} (${i.env})`,
  value: i.username + Math.random().toString(36).slice(2),
})))
const saveTokenInfo = () => {
  store.storageItem.tokenInfos ??= []
  const index = store.storageItem.tokenInfos
    .findIndex(i => i.username === loginForm.value.username && i.env === loginForm.value.env)
  if (index > -1) {
    Object.assign(store.storageItem.tokenInfos[index]!, { ...loginForm.value })
  } else {
    store.storageItem.tokenInfos.push({ ...loginForm.value })
  }
}
const handleSelect = (_v: any, option: any) => {
  const { label, value, ...tokenInfo } = option
  Object.assign(loginForm.value, tokenInfo)
}
const loginRules = {
  url: [{ required: true, message: '请输入环境Url' }],
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }],
}
const { validateInfos: vis, validate } = useForm(loginForm, loginRules)
const loading = ref(false)
const result = ref<any>(null)
const login = async () => {
  result.value = null
  await validate()
  try {
    loading.value = true
    const response = await fetch(loginForm.value.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: loginForm.value.username,
        password: decrypt(loginForm.value.password),
      }),
    })
    const data = await response.json()
    if (data.code === 200) {
      result.value = {
        success: true,
        message: '登录成功',
      }
      saveTokenInfo()
      await store.sendMessage('SET_TOKEN', data.rows.token)
      refreshToken()
    } else {
      result.value = {
        success: false,
        message: data.message,
      }
    }
  } catch (e) {
    result.value = {
      success: false,
      message: `登录失败. ${(e as any).message}`,
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <a-card>
    <a-form class="form" :label-col="{ span: 4 }">
      <a-form-item label="用户名" v-bind="vis.username">
        <a-select
          v-model:value.lazy="loginForm.username"
          mode="SECRET_COMBOBOX_MODE_DO_NOT_USE"
          placeholder="请输入用户名"
          :options="tokenInfoOptions"
          :filter-option="(v: any, o: any) => o.label.includes(v)"
          @select="handleSelect"
        />
      </a-form-item>
      <a-form-item label="密码" v-bind="vis.password">
        <a-input-password v-model:value.lazy="pwdField" placeholder="请输入密码" />
      </a-form-item>
      <a-form-item label="Url" v-bind="vis.url">
        <a-segmented v-model:value.lazy="loginForm.env" :options="envOptions" style="margin-bottom: 4px;" />
        <a-input v-model:value.lazy="loginForm.url" placeholder="请输入环境Url" :disabled="loginForm.env !== 'Custom'" />
      </a-form-item>
      <a-row>
        <a-col offset="4" span="4">
          <a-button type="primary" :loading="loading" @click="login">
            登录
          </a-button>
        </a-col>
        <a-col v-if="result && !loading" class="result">
          <div :class="{ ['result-success']: result.success, ['result-error']: !result.success }">
            {{ result.message }}
          </div>
        </a-col>
      </a-row>
      <a-divider />
      <a-form-item label="当前 Token" class="token-item">
        <a-textarea :value="token" auto-size readonly @focus="(e) => (e.target as HTMLTextAreaElement)?.select()" />
      </a-form-item>
    </a-form>
  </a-card>
</template>

<style scope>
.result {
  flex: 1;
  display: flex;
  align-items: center;
}
.result-success {
  color: green;
}
.result-error {
  color: red;
}
.token-item {
  margin-bottom: 0;
}
</style>

<style>
.login-tip-x {
  .ant-tooltip-inner {
    width: max-content;
  }
}
</style>

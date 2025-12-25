function hijackXHR() {
  const OriginalXHR = window.XMLHttpRequest
  function CustomXHR() {
    const xhr = new OriginalXHR()
    let _url = null

    const originalOpen = xhr.open
    xhr.open = function (method, url, ...args) {
      if (/\/api\/ycSystem\/external\/user\/currentRootMenuTree/.test(url)) {
        _url = url
        window.postMessage({ type: '__FFD__PROXY_URL__', payload: url }, '*')
      }
      return originalOpen.call(this, method, url, ...args)
    }

    return new Proxy(xhr, {
      get(target, prop) {
        const value = target[prop]

        if (_url && prop === 'responseText') {
          try {
            const fixRules = JSON.parse(sessionStorage.getItem('__FFD__FIXRULES__') ?? '[]')
            const result = JSON.parse(value)
            if (fixRules?.length && result.code === 200 && result.rows.length) {
              result.rows = result.rows.map((rule) => {
                for (const fix of fixRules) {
                  if (fix.enable && fix.appName === rule.appName) {
                    console.log(`[FFD] fix rules applied. [${rule.path}] => [${fix.fixedPath}]`)
                    rule.path = fix.fixedPath
                    break
                  }
                }
                return rule
              })
              window.XMLHttpRequest = OriginalXHR
              return JSON.stringify(result)
            }
          }
          // eslint-disable-next-line unused-imports/no-unused-vars
          catch (_e) {
            window.XMLHttpRequest = OriginalXHR
          }
        }

        return typeof value === 'function' ? value.bind(target) : value
      },
      set(target, prop, value) {
        target[prop] = value
        return true
      },
    })
  }
  CustomXHR.prototype = OriginalXHR.prototype
  window.XMLHttpRequest = CustomXHR
}

function main() {
  if ('__FFD__ENABLE__' in sessionStorage) {
    console.log('[FFD] injectScript is running.')
    hijackXHR()
  }
}
main()

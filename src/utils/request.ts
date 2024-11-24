import { apiPrefix, httpCode } from '@/config'
import { Message } from '@arco-design/web-vue'
import { useCredentialStore } from '@/stores/credential'
import router from '@/router'
const TIME_OUT = 60 * 1000
const baseFetchOptions = {
  method: 'GET',
  mode: 'cors',
  credentals: 'include',
  headers: new Headers({
    'Content-Type': 'application/json',
  }),
  redirect: 'follow',
}

type FetchOptionType = Omit<RequestInit, 'body'> & {
  params?: Record<string, any>
  body?: BodyInit | Record<string, any> | null
}

const baseFetch = <T>(url: string, fetchOption: FetchOptionType): Promise<T> => {
  const options: typeof baseFetchOptions & FetchOptionType = Object.assign(
    {},
    baseFetchOptions,
    fetchOption,
  )
  const { credential, clear: clearCredential } = useCredentialStore()
  if (credential.access_token) {
    options.headers.set('Authorization', `Bearer ${credential.access_token}`)
  }
  let urlWithPrefix = `${apiPrefix}${url.startsWith('/') ? url : `/${url}`}`
  const { method, params, body } = options
  if (method === 'GET' && params) {
    const paramsArray: string[] = []
    Object.keys(params).forEach((key) => {
      paramsArray.push(`${key}=${encodeURIComponent(params[key])}`)
    })
    if (urlWithPrefix.search(/\?/) === -1) {
      urlWithPrefix += `?${paramsArray.join('&')}`
    } else {
      urlWithPrefix += `&${paramsArray.join('&')}`
    }
    delete options.params
  }
  if (body) {
    options.body = JSON.stringify(body)
  }
  return Promise.race([
    new Promise((_resolve, reject) => {
      setTimeout(() => {
        reject('接口超时')
      }, TIME_OUT)
    }),
    new Promise((resolve, reject) => {
      globalThis
        .fetch(urlWithPrefix, options as RequestInit)
        .then(async (res) => {
          const json = await res.json()
          if (json.code === httpCode.success) {
            resolve(json)
          } else if (json.code === httpCode.unauthorized) {
            clearCredential()
            await router.replace({ path: '/auth/login' })
          } else {
            Message.error(json.message)
            reject(new Error(json.message))
          }
        })
        .catch((err) => {
          Message.error(err.message)
          reject(err)
        })
    }),
  ]) as Promise<T>
}

export const request = <T>(url: string, options = {}) => {
  return baseFetch<T>(url, options)
}

export const get = <T>(url: string, options = {}) => {
  return request<T>(url, Object.assign({}, options, { method: 'GET' }))
}

export const post = <T>(url: string, options = {}) => {
  return request<T>(url, Object.assign({}, options, { method: 'POST' }))
}

export const ssePost = async (
  url: string,
  fetchOptions: FetchOptionType,
  onData: (data: { [key: string]: any }) => void,
) => {
  const options = Object.assign({}, baseFetchOptions, { method: 'POST' }, fetchOptions)

  const { credential } = useCredentialStore()
  if (credential.access_token) {
    options.headers.set('Authorization', `Bearer ${credential.access_token}`)
  }

  const urlWithPrefix = `${apiPrefix}${url.startsWith('/') ? url : `/${url}`}`
  const { body } = fetchOptions
  if (body) options.body = JSON.stringify(body)

  const response = await globalThis.fetch(urlWithPrefix, options as RequestInit)
  return handleStream(response, onData)
}

const handleStream = (response: Response, onData: (data: { [key: string]: any }) => void) => {
  // 检测网络请求
  if (!response.ok) throw new Error('网络请求失败')
  // 构建reader和decoder
  const reader = response.body?.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  const read = () => {
    let hasError = false
    reader?.read().then((result: any) => {
      if (result.done) return
      buffer += decoder.decode(result.value, { stream: true })
      const lines = buffer.split('\n')
      let event = ''
      let data = ''
      try {
        lines.forEach((line) => {
          line = line.trim()
          if (line.startsWith('event:')) {
            event = line.slice(6).trim()
          } else if (line.startsWith('data:')) {
            data = line.slice(5).trim()
          }
          if (line === '') {
            if (event !== '' && data !== '') {
              onData({
                event: event,
                data: JSON.parse(data),
              })
              event = ''
              data = ''
            }
          }
        })
        buffer = lines.pop() || ''
      } catch (e) {
        hasError = true
      }

      if (!hasError) read()
    })
  }

  read()
}

export const upload = <T>(url: string, options: any = {}): Promise<T> => {
  // 1 组装请求URL
  const urlWithPrefix = `${apiPrefix}${url.startsWith('/') ? url : `/${url}`}`

  // 2.组装xhr请求配置信息
  const defaultOptions = {
    method: 'POST',
    url: urlWithPrefix,
    headers: {},
    data: {},
  }
  options = {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...options.headers },
  }

  const { credential, clear: clearCredential } = useCredentialStore()
  if (credential.access_token) {
    options.headers['Authorization'] = `Bearer ${credential.access_token}`
  }

  // 3.构建promise并使用xhr完成文件上传
  return new Promise((resolve, reject) => {
    // 4.创建xhr服务
    const xhr = new XMLHttpRequest()

    // 5.初始化xhr请求并配置headers
    xhr.open(options.method, options.url)
    for (const key in options.headers) {
      xhr.setRequestHeader(key, options.headers[key])
    }

    // 6.设置xhr响应格式并携带授权凭证（例如cookie）
    xhr.withCredentials = true
    xhr.responseType = 'json'

    // 7.监听xhr状态变化并导出数据
    xhr.onreadystatechange = async () => {
      // 8.判断xhr的状态是不是为4，如果为4则代表已经传输完成（涵盖成功与失败）
      if (xhr.readyState === 4) {
        // 9.检查响应状态码，当HTTP状态码为200的时候表示请求成功
        if (xhr.status === 200) {
          const response = xhr.response
          if (response.code === httpCode.success) {
            resolve(response)
          } else if (response.code === httpCode.unauthorized) {
            clearCredential()
            await router.replace({ path: '/auth/login' })
          } else {
            resolve(xhr.response)
          }
        } else {
          reject(xhr)
        }
      }
    }

    // 10.添加xhr进度监听
    xhr.upload.onprogress = options.onprogress

    // 11.发送请求
    xhr.send(options.data)
  })
}

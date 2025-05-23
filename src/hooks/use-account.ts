import { ref } from 'vue'
import {
  getCurrentUser,
  updateAvatar,
  updateName,
  updatePassword,
  register,
  sendVerificationCode,
  forgetPassword,
} from '@/services/account'
import { Message } from '@arco-design/web-vue'
import JSEncrypt from 'jsencrypt'
import type { RegisterAccountRequest } from '@/models/account'

export const public_key = `-----BEGIN PUBLIC KEY-----
        MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAowxB6KlOBUx2ary8Rjjt
        Y4vQ1BMpH40FwvpTk2gmB5/edvFDTzW9X38HLkVgiKWWSTdErc1EI6qZ0i1eh0zQ
        GXfKr+WsFhm3CadsAAKt2duxKtQqmPryyttJEUqluZANJxVkrjhCJVMNOU3/adGr
        UTYg3XBY4nboO5ndeu5Ui1ecyUDto6ly2zID6AvC2xrMNTKtSbQxy1bWjy50sGYE
        3dg6+VrizkVIyPwe9iWqMEbGFdNqRODRgmwBJT2+64EqXig+O3Z8w+4/SyagpUDY
        iReAufHqabKuBOOZw9r6SWHewMmVVY2NrR1bZ86BOs/KydIug1VHUhpQolSn7XaJ
        wQIDAQAB
        -----END PUBLIC KEY-----
        `

export const useGetCurrentUser = () => {
  const loading = ref(false)
  const current_user = ref<Record<string, any>>({})

  const loadCurrentUser = async () => {
    try {
      loading.value = true
      const resp = await getCurrentUser()
      current_user.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, current_user, loadCurrentUser }
}

export const useUpdateAvatar = () => {
  const loading = ref(false)

  const handleUpdateAvatar = async (avatar: string) => {
    try {
      loading.value = true
      const resp = await updateAvatar(avatar)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdateAvatar }
}

export const useUpdateName = () => {
  const loading = ref(false)

  const handleUpdateName = async (name: string) => {
    try {
      loading.value = true
      await updateName(name)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdateName }
}

export const useUpdatePassword = () => {
  const loading = ref(false)

  const handleUpdatePassword = async (password: string) => {
    try {
      const encryptor = new JSEncrypt()
      encryptor.setPublicKey(public_key)
      loading.value = true
      const resp = await updatePassword(String(encryptor.encrypt(password)))
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdatePassword }
}

export const useRegister = () => {
  const loading = ref(false)
  const handlerRegister = async (req: RegisterAccountRequest) => {
    try {
      loading.value = true
      const encryptor = new JSEncrypt()
      encryptor.setPublicKey(public_key)
      req.password = String(encryptor.encrypt(req.password))
      req.confirmPassword = String(encryptor.encrypt(req.confirmPassword))
      const resp = await register(req)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }
  return { loading, handlerRegister }
}

export const useForgetPassword = () => {
  const loading = ref(false)
  const handlerForgetPassword = async (req: RegisterAccountRequest) => {
    try {
      loading.value = true
      const encryptor = new JSEncrypt()
      encryptor.setPublicKey(public_key)
      req.password = String(encryptor.encrypt(req.password))
      req.confirmPassword = String(encryptor.encrypt(req.confirmPassword))
      const resp = await forgetPassword(req)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }
  return { loading, handlerForgetPassword }
}

export const useSendVerificationCode = () => {
  const loading = ref(false)
  const handlerSendCode = async (email: string) => {
    try {
      loading.value = true
      const resp = await sendVerificationCode(email)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }
  return { loading, handlerSendCode }
}

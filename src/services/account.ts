import type { GetCurrentUserResponse, RegisterAccountRequest } from '@/models/account'
import { type BaseResponse } from '@/models/base'
import { get, post } from '@/utils/request'

export const getCurrentUser = () => {
  return get<GetCurrentUserResponse>(`/account`)
}

export const updatePassword = (password: string) => {
  return post<BaseResponse<any>>(`/account/password`, {
    body: { password },
  })
}

export const updateName = (name: string) => {
  return post<BaseResponse<any>>(`/account/name`, {
    body: { name },
  })
}

export const updateAvatar = (avatar: string) => {
  return post<BaseResponse<any>>(`/account/avatar`, {
    body: { avatar },
  })
}

export const register = (req: RegisterAccountRequest) => {
  return post<BaseResponse<any>>(`/account/register`, { body: req })
}

export const sendVerificationCode = (email: string) => {
  return post<BaseResponse<any>>(`/account/sendVerificationCode`, { body: { email } })
}

export const forgetPassword = (req: RegisterAccountRequest) => {
  return post<BaseResponse<any>>(`/account/forgetPassword`, { body: req })
}

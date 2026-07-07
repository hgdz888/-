import { baseRequestClient, requestClient } from '#/api/request';

export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken?: string;
    code?: number;
    data?: any;
    message?: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }

  /** 验证码登录参数 */
  export interface VerifyCodeLoginParams {
    phoneNumber?: string;
    code?: string;
  }

  /** 发送验证码参数 */
  export interface SendCodeParams {
    email: string;
  }

  /** 修改密码参数 */
  export interface ChangePasswordParams {
    typeId: number;
    newPassword?: string;
  }

  /** 验证当前密码参数 */
  export interface VerifyPasswordParams {
    userId?: string;
    oldPassword?: string;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  return requestClient.post<AuthApi.LoginResult>('/v1/auth/login', data);
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  return baseRequestClient.post<AuthApi.RefreshTokenResult>(
    '/v1/auth/refresh',
    {
      withCredentials: true,
    },
  );
}

/**
 * 退出登录
 */
export async function logoutApi() {
  return baseRequestClient.post('/v1/auth/Logout', {
    withCredentials: true,
  });
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  return requestClient.post<string[]>('/v1/auth/codes');
}

/**
 * 验证码登录
 */
export async function verifyCodeLoginApi(data: AuthApi.VerifyCodeLoginParams) {
  return requestClient.post<AuthApi.LoginResult>(
    '/v1/auth/VerifyCodeLogin',
    data,
  );
}

/**
 * 发送邮箱验证码
 */
export async function sendEmailCodeApi(email: string) {
  return requestClient.get('/v1/Satff/Emailcode', { params: { email } });
}

/**
 * 验证当前用户密码是否正确
 */
export async function verifyPasswordApi(data: AuthApi.VerifyPasswordParams) {
  return requestClient.get('/v1/Satff/verifyCurrentUserPassword', {
    params: data,
  });
}

/**
 * 修改密码 (typeId=2 表示修改密码)
 */
export async function changePasswordApi(data: AuthApi.ChangePasswordParams) {
  return requestClient.post('/v1/Satff/StaffAccountOperate', data);
}

/**
 * 获取微信扫码登录QR码URL
 */
export async function getWechatQrcodeApi() {
  return requestClient.get<string>('/v1/auth/wechat/qrcode');
}

/**
 * 微信扫码授权回调
 */
export async function wechatCallbackApi(code: string, state: string) {
  return requestClient.get<AuthApi.LoginResult>('/v1/auth/wechat/callback', {
    params: { code, state },
  });
}

/**
 * 微信移动端登录
 */
export async function wechatLoginApi(code: string) {
  return requestClient.post<AuthApi.LoginResult>('/v1/auth/wechat/login', {
    code,
  });
}

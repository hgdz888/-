<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, ref } from 'vue';

import { AuthenticationCodeLogin, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useAuthStore } from '#/store';

import { sendEmailCodeApi, verifyCodeLoginApi } from '#/api';

defineOptions({ name: 'CodeLogin' });

const authStore = useAuthStore();
const loading = ref(false);
const CODE_LENGTH = 6;

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入手机号或邮箱',
      },
      fieldName: 'phoneNumber',
      label: '手机号/邮箱',
      rules: z
        .string()
        .min(1, { message: '请输入手机号或邮箱' }),
    },
    {
      component: 'VbenPinInput',
      componentProps: {
        codeLength: CODE_LENGTH,
        createText: (countdown: number) => {
          const text =
            countdown > 0
              ? `${countdown}秒后重发`
              : '发送验证码';
          return text;
        },
        placeholder: $t('authentication.code'),
        onSendCode: async () => {
          const values = await authStore.authLogin;
          void values;
        },
      },
      fieldName: 'code',
      label: $t('authentication.code'),
      rules: z.string().length(CODE_LENGTH, {
        message: $t('authentication.codeTip', [CODE_LENGTH]),
      }),
    },
  ];
});

async function handleLogin(values: Recordable<any>) {
  try {
    loading.value = true;
    const result = await verifyCodeLoginApi({
      code: values.code,
      phoneNumber: values.phoneNumber,
    });

    let accessToken: null | string = null;
    if (typeof result === 'string') {
      accessToken = result;
    } else if (result && typeof result === 'object') {
      accessToken =
        (result as any).data || (result as any).accessToken || null;
    }

    if (accessToken) {
      const { useAccessStore } = await import('@vben/stores');
      const accessStore = useAccessStore();
      accessStore.setAccessToken(accessToken);

      const { getUserInfoApi } = await import('#/api');
      const userInfo = await getUserInfoApi();
      const { useUserStore } = await import('@vben/stores');
      const userStore = useUserStore();
      userStore.setUserInfo(userInfo);

      const { getAccessCodesApi } = await import('#/api');
      const accessCodes = await getAccessCodesApi();
      accessStore.setAccessCodes(accessCodes);

      const { useRouter } = await import('vue-router');
      const router = useRouter();
      await router.push(userInfo.homePath || '/dashboard/analytics');
    }
  } catch {
    // 错误由请求拦截器处理
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthenticationCodeLogin
    :form-schema="formSchema"
    :loading="loading"
    @submit="handleLogin"
  />
</template>

<script lang="ts" setup>
import type { VbenFormSchema } from '@vben/common-ui';
import type { Recordable } from '@vben/types';

import { computed, ref } from 'vue';

import { AuthenticationForgetPassword, z } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useAccessStore, useUserStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { changePasswordApi, sendEmailCodeApi } from '#/api';

defineOptions({ name: 'ForgetPassword' });

const loading = ref(false);
const CODE_LENGTH = 6;

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入邮箱',
      },
      fieldName: 'email',
      label: '邮箱',
      rules: z
        .string()
        .min(1, { message: '请输入邮箱' })
        .email({ message: '请输入有效的邮箱地址' }),
    },
    {
      component: 'VbenPinInput',
      componentProps: {
        codeLength: CODE_LENGTH,
        createText: (countdown: number) => {
          return countdown > 0 ? `${countdown}秒后重发` : '发送验证码';
        },
        placeholder: '请输入验证码',
      },
      fieldName: 'code',
      label: '验证码',
      rules: z.string().length(CODE_LENGTH, {
        message: `请输入${CODE_LENGTH}位验证码`,
      }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: '请输入新密码',
      },
      fieldName: 'newPassword',
      label: '新密码',
      rules: z
        .string()
        .min(6, { message: '密码至少6位' }),
    },
  ];
});

async function handleSubmit(values: Recordable<any>) {
  try {
    loading.value = true;
    await changePasswordApi({
      newPassword: values.newPassword,
      typeId: 2,
    });
    message.success('密码修改成功，请重新登录');

    const accessStore = useAccessStore();
    const userStore = useUserStore();
    accessStore.setAccessToken(null);
    userStore.setUserInfo(null);

    const { useRouter } = await import('vue-router');
    const router = useRouter();
    await router.push('/auth/login');
  } catch {
    // 错误由请求拦截器处理
  } finally {
    loading.value = false;
  }
}

async function handleSendCode() {
  // 发送验证码的逻辑由组件内部处理
}
</script>

<template>
  <AuthenticationForgetPassword
    :form-schema="formSchema"
    :loading="loading"
    title="修改密码"
    sub-title="请输入邮箱和验证码来修改密码"
    submit-button-text="修改密码"
    @submit="handleSubmit"
  />
</template>

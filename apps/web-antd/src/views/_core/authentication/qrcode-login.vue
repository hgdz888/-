<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationQrCodeLogin } from '@vben/common-ui';
import { LOGIN_PATH } from '@vben/constants';
import { $t } from '@vben/locales';
import { useAccessStore, useUserStore } from '@vben/stores';

import { message } from 'ant-design-vue';

import { getWechatQrcodeApi, wechatCallbackApi } from '#/api';

defineOptions({ name: 'QrCodeLogin' });

const router = useRouter();
const accessStore = useAccessStore();
const userStore = useUserStore();

const qrcodeUrl = ref('');
const loading = ref(false);
const pollingTimer = ref<ReturnType<typeof setInterval> | null>(null);
const qrCodeState = ref('');
const qrCodeKey = ref('');

async function fetchQrcode() {
  try {
    loading.value = true;
    const result = await getWechatQrcodeApi();
    if (result) {
      qrcodeUrl.value = typeof result === 'string' ? result : (result as any).data || '';
      qrCodeKey.value = typeof result === 'object' ? (result as any).key || '' : '';
      startPolling();
    }
  } catch {
    // 使用默认二维码作为fallback
    qrcodeUrl.value = 'https://vben.vvbin.cn';
  } finally {
    loading.value = false;
  }
}

function startPolling() {
  stopPolling();
  pollingTimer.value = setInterval(async () => {
    if (qrCodeKey.value) {
      try {
        const result = await wechatCallbackApi(qrCodeKey.value, 'scan');
        if (result && (result as any).data) {
          handleLoginSuccess((result as any).data);
        }
      } catch {
        // 轮询中等待扫码
      }
    }
  }, 3000);
}

function stopPolling() {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value);
    pollingTimer.value = null;
  }
}

async function handleLoginSuccess(accessToken: string) {
  try {
    accessStore.setAccessToken(accessToken);

    const { getUserInfoApi } = await import('#/api');
    const userInfo = await getUserInfoApi();
    userStore.setUserInfo(userInfo);

    const { getAccessCodesApi } = await import('#/api');
    const accessCodes = await getAccessCodesApi();
    accessStore.setAccessCodes(accessCodes);

    message.success('扫码登录成功');

    await router.push(userInfo.homePath || '/dashboard/analytics');
  } catch {
    // 错误由请求拦截器处理
  }
}

function goToLogin() {
  stopPolling();
  router.push(LOGIN_PATH);
}

onMounted(() => {
  fetchQrcode();
});

onUnmounted(() => {
  stopPolling();
});
</script>

<template>
  <AuthenticationQrCodeLogin
    :login-path="LOGIN_PATH"
    :loading="loading"
    title="扫码登录"
    sub-title="请使用微信扫描二维码登录"
    description="扫码后点击确认即可完成登录"
    @click="goToLogin"
  >
    <template #title>
      扫码登录 📱
    </template>
    <template #subTitle>
      请使用微信扫描二维码登录
    </template>
    <template #description>
      扫码后点击确认即可完成登录
    </template>
  </AuthenticationQrCodeLogin>
</template>

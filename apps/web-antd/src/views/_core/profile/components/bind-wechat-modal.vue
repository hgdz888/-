<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import { Button, message, Modal } from 'ant-design-vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  cancel: [];
  success: [];
}>();

const qrCodeUrl = ref('');
const loading = ref(false);
const pollingTimer = ref<null | ReturnType<typeof setInterval>>(null);

// 获取微信二维码
async function fetchQrCode() {
  loading.value = true;
  qrCodeUrl.value = '';
  try {
    const response = await fetch('/v1/auth/wechat/qrcode');
    const data = await response.json();
    if (data.code === 0 && data.data) {
      qrCodeUrl.value = data.data;
      startPolling();
    } else {
      message.error(data.message || '获取微信二维码失败');
    }
  } catch {
    message.error('获取微信二维码失败，请检查网络连接');
  } finally {
    loading.value = false;
  }
}

// 轮询扫码状态
function startPolling() {
  stopPolling();
  pollingTimer.value = setInterval(async () => {
    try {
      const response = await fetch('/v1/auth/wechat/callback');
      const data = await response.json();
      if (data.code === 0 && data.data?.success) {
        message.success('微信绑定成功');
        emit('success');
        stopPolling();
      }
    } catch {
      // 忽略轮询错误
    }
  }, 3000);
}

function stopPolling() {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value);
    pollingTimer.value = null;
  }
}

function handleClose() {
  stopPolling();
  qrCodeUrl.value = '';
  emit('cancel');
}

onMounted(() => {
  if (props.visible) {
    fetchQrCode();
  }
});

onUnmounted(() => {
  stopPolling();
});
</script>

<template>
  <Teleport to="body">
    <Modal
      :open="visible"
      title="绑定微信"
      :width="420"
      :footer="null"
      @cancel="handleClose"
    >
      <div class="flex flex-col items-center py-4">
        <div class="mb-4 text-sm text-gray-500">
          请使用微信扫描下方二维码完成绑定
        </div>

        <div v-if="loading" class="flex h-48 items-center justify-center">
          加载中...
        </div>

        <div
          v-else-if="qrCodeUrl"
          class="border border-gray-200 p-2 dark:border-gray-700"
        >
          <img :src="qrCodeUrl" alt="微信二维码" class="h-40 w-40" />
        </div>

        <div v-else class="flex h-48 items-center justify-center text-gray-400">
          二维码加载失败，请点击刷新
        </div>

        <Button class="mt-4" @click="fetchQrCode"> 刷新二维码 </Button>
      </div>
    </Modal>
  </Teleport>
</template>

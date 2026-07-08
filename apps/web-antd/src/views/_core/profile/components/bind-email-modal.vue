<script setup lang="ts">
import { ref, watch } from 'vue';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenForm, z } from '#/adapter/form';
import {
  bindAccountApi,
  rebindAccountApi,
  sendBindingCodeApi,
  verifyBindPasswordApi,
} from '#/api/core/auth';

const props = defineProps<{
  action: 'bind' | 'rebind';
  currentAccount?: string;
  visible: boolean;
}>();

const emit = defineEmits<{
  cancel: [];
  success: [];
}>();

const loading = ref(false);
const step = ref<'bind' | 'verify'>('verify');
const verifyToken = ref('');
const countdown = ref(0);
const countdownTimer = ref<null | ReturnType<typeof setInterval>>(null);

const [VerifyForm, verifyFormApi] = useVbenForm({
  commonConfig: {
    hideLabel: true,
    hideRequiredMark: true,
  },
  schema: [
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: '请输入当前密码',
      },
      fieldName: 'password',
      label: '密码',
      rules: z.string().min(1, { message: '请输入密码' }),
    },
  ],
  showDefaultActions: false,
});

const [BindForm, bindFormApi] = useVbenForm({
  commonConfig: {
    hideLabel: true,
    hideRequiredMark: true,
  },
  schema: [
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入新邮箱',
      },
      fieldName: 'email',
      label: '邮箱',
      rules: z
        .string()
        .min(1, { message: '请输入邮箱' })
        .email({ message: '请输入正确的邮箱格式' }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: '请输入验证码',
      },
      fieldName: 'code',
      label: '验证码',
      rules: z.string().min(6, { message: '请输入6位验证码' }),
    },
  ],
  showDefaultActions: false,
});

// 发送验证码
async function handleSendCode() {
  const values = await bindFormApi.getValues();
  if (!values.email) {
    message.warning('请先输入邮箱');
    return;
  }

  try {
    await sendBindingCodeApi({
      type: 'email',
      account: values.email,
      purpose: props.action,
    });
    message.success('验证码已发送');
    startCountdown();
  } catch {
    message.error('发送验证码失败');
  }
}

function startCountdown() {
  countdown.value = 60;
  countdownTimer.value = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value);
        countdownTimer.value = null;
      }
    }
  }, 1000);
}

// 验证密码
async function handleVerifyPassword() {
  const values = await verifyFormApi.getValues();
  loading.value = true;
  try {
    const result = await verifyBindPasswordApi({ password: values.password });
    verifyToken.value = result?.token || '';
    step.value = 'bind';
    message.success('密码验证成功');
  } catch {
    message.error('密码验证失败');
  } finally {
    loading.value = false;
  }
}

// 提交绑定
async function handleBind() {
  const values = await bindFormApi.getValues();
  loading.value = true;
  try {
    const data = {
      type: 'email',
      account: values.email,
      code: values.code,
      token: verifyToken.value,
    };

    if (props.action === 'bind') {
      await bindAccountApi(data);
    } else {
      await rebindAccountApi(data);
    }

    message.success(props.action === 'bind' ? '绑定成功' : '换绑成功');
    emit('success');
  } catch {
    message.error(props.action === 'bind' ? '绑定失败' : '换绑失败');
  } finally {
    loading.value = false;
  }
}

// 关闭弹窗
function handleClose() {
  step.value = 'verify';
  verifyToken.value = '';
  verifyFormApi.resetForm();
  bindFormApi.resetForm();
  emit('cancel');
}

watch(
  () => props.visible,
  (val) => {
    if (!val) {
      step.value = 'verify';
      verifyToken.value = '';
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <Modal
      :open="visible"
      :title="action === 'bind' ? '绑定邮箱' : '换绑邮箱'"
      :width="420"
      :footer="null"
      @cancel="handleClose"
    >
      <!-- 步骤1: 验证密码 -->
      <div v-if="step === 'verify'">
        <div class="mb-4 text-sm text-gray-500">
          为了您的账号安全，请先验证登录密码
        </div>
        <VerifyForm />
        <div class="mt-4">
          <Button
            type="primary"
            :loading="loading"
            class="w-full"
            @click="handleVerifyPassword"
          >
            验证密码
          </Button>
        </div>
      </div>

      <!-- 步骤2: 绑定新邮箱 -->
      <div v-if="step === 'bind'">
        <div class="mb-4 text-sm text-gray-500">请输入新的邮箱地址</div>
        <BindForm />
        <div class="mt-4 flex gap-3">
          <Button class="flex-1" @click="step = 'verify'"> 上一步 </Button>
          <Button
            type="primary"
            :loading="loading"
            class="flex-1"
            @click="handleSendCode"
            :disabled="countdown > 0"
          >
            {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
          </Button>
        </div>
        <Button
          type="primary"
          :loading="loading"
          class="mt-3 w-full"
          @click="handleBind"
        >
          {{ action === 'bind' ? '绑定' : '换绑' }}
        </Button>
      </div>
    </Modal>
  </Teleport>
</template>

<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { message } from 'ant-design-vue';

import { useVbenForm, z } from '#/adapter/form';
import { registerApi, sendEmailCodeApi } from '#/api/core/auth';

defineOptions({ name: 'Register' });

const router = useRouter();
const loading = ref(false);
const currentStep = ref(1);
const countdown = ref(0);
const countdownTimer = ref<null | ReturnType<typeof setInterval>>(null);

const formValues = ref<Recordable<any>>({});

const [BasicForm, basicFormApi] = useVbenForm(
  reactive({
    commonConfig: {
      hideLabel: true,
      hideRequiredMark: true,
    },
    schema: computed(() => [
      {
        component: 'VbenInput',
        componentProps: {
          placeholder: '请输入用户名',
        },
        fieldName: 'username',
        label: '用户名',
        rules: z.string().min(1, { message: '请输入用户名' }),
      },
      {
        component: 'VbenInput',
        componentProps: {
          placeholder: '请输入邮箱',
        },
        fieldName: 'account',
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
      {
        component: 'VbenInputPassword',
        componentProps: {
          placeholder: '请输入密码',
        },
        fieldName: 'password',
        label: '密码',
        rules: z.string().min(6, { message: '密码至少6位' }),
      },
      {
        component: 'VbenInputPassword',
        componentProps: {
          placeholder: '请确认密码',
        },
        dependencies: {
          rules(values: Recordable<any>) {
            const { password } = values;
            return z
              .string({ required_error: '请确认密码' })
              .min(1, { message: '请确认密码' })
              .refine((value) => value === password, {
                message: '两次密码不一致',
              });
          },
          triggerFields: ['password'],
        },
        fieldName: 'confirmPassword',
        label: '确认密码',
      },
    ]),
    showDefaultActions: false,
  }),
);

const [EnterpriseForm] = useVbenForm(
  reactive({
    commonConfig: {
      hideLabel: true,
      hideRequiredMark: true,
    },
    schema: computed(() => [
      {
        component: 'VbenInput',
        componentProps: {
          placeholder: '请输入公司名称',
        },
        fieldName: 'companyName',
        label: '公司名称',
      },
      {
        component: 'VbenInput',
        componentProps: {
          placeholder: '请输入公司地址',
        },
        fieldName: 'companyAddress',
        label: '公司地址',
      },
    ]),
    showDefaultActions: false,
  }),
);

async function handleSendCode() {
  const values = await basicFormApi.getValues();

  if (!values.account) {
    message.warning('请先输入邮箱');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(values.account)) {
    message.warning('请输入正确的邮箱格式');
    return;
  }

  try {
    await sendEmailCodeApi(values.account);
    message.success('验证码已发送到您的邮箱');
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

async function handleNextStep() {
  const { valid } = await basicFormApi.validate();
  if (!valid) return;

  const values = await basicFormApi.getValues();
  formValues.value = { ...formValues.value, ...values };
  currentStep.value = 2;
}

function handlePrevStep() {
  currentStep.value = 1;
}

async function handleSubmit() {
  loading.value = true;
  try {
    const submitData = {
      account: formValues.value.account,
      code: formValues.value.code,
      password: formValues.value.password,
      username: formValues.value.username,
    };

    await registerApi(submitData);
    message.success('注册成功');
    router.push('/auth/login');
  } catch {
    message.error('注册失败');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <div class="mb-6 text-center">
      <h2 class="text-2xl font-bold">创建一个账号 🚀</h2>
      <p class="mt-2 text-sm text-gray-500">让您的应用程序管理变得简单而有趣</p>
    </div>

    <div class="mb-8">
      <div class="flex items-center justify-center">
        <div class="flex items-center">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium"
            :class="[
              currentStep >= 1
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-500',
            ]"
          >
            1
          </div>
          <span
            class="ml-2 text-sm font-medium"
            :class="[currentStep >= 1 ? 'text-blue-500' : 'text-gray-500']"
          >
            基本信息
          </span>
        </div>

        <div
          class="mx-4 h-0.5 w-24"
          :class="[currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-200']"
        ></div>

        <div class="flex items-center">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium"
            :class="[
              currentStep >= 2
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-500',
            ]"
          >
            2
          </div>
          <span
            class="ml-2 text-sm font-medium"
            :class="[currentStep >= 2 ? 'text-blue-500' : 'text-gray-500']"
          >
            企业信息
          </span>
        </div>
      </div>
    </div>

    <div v-show="currentStep === 1">
      <BasicForm />

      <div class="mt-4">
        <div
          class="flex w-full cursor-pointer items-center justify-center rounded-md border border-blue-500 px-4 py-2 text-blue-500 hover:bg-blue-50"
          :class="{ 'pointer-events-none opacity-50': countdown > 0 }"
          @click="handleSendCode"
        >
          {{ countdown > 0 ? `${countdown}s 后重新发送` : '获取验证码' }}
        </div>
      </div>

      <div
        class="mt-4 flex w-full cursor-pointer items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        @click="handleNextStep"
      >
        下一步
      </div>
    </div>

    <div v-show="currentStep === 2">
      <EnterpriseForm />

      <div class="mt-4 flex gap-4">
        <div
          class="flex flex-1 cursor-pointer items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50"
          @click="handlePrevStep"
        >
          上一步
        </div>
        <div
          class="flex flex-1 cursor-pointer items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          :class="{ 'cursor-wait opacity-50': loading }"
          @click="handleSubmit"
        >
          {{ loading ? '注册中...' : '注册' }}
        </div>
      </div>
    </div>

    <div class="mt-4 text-center text-sm">
      已经有账号了？
      <span
        class="vben-link text-sm font-normal"
        @click="router.push('/auth/login')"
      >
        去登录
      </span>
    </div>
  </div>
</template>

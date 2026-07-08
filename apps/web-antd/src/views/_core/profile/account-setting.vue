<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { getUserInfoApi } from '#/api';

import BindEmailModal from './components/bind-email-modal.vue';
import BindPhoneModal from './components/bind-phone-modal.vue';
import BindWechatModal from './components/bind-wechat-modal.vue';
import ChangePasswordModal from './components/change-password-modal.vue';
import UnbindModal from './components/unbind-modal.vue';

const userInfo = ref<any>(null);

// 弹窗状态
const bindPhoneVisible = ref(false);
const bindEmailVisible = ref(false);
const bindWechatVisible = ref(false);
const unbindVisible = ref(false);
const changePasswordVisible = ref(false);

// 当前操作类型
const currentAction = ref<'bind' | 'rebind'>('bind');
const currentBindType = ref<'email' | 'phone' | 'wechat'>('phone');

// 脱敏显示
function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone || '';
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

function maskEmail(email: string): string {
  if (!email || email.length < 5) return email || '';
  const parts = email.split('@');
  const local = parts[0];
  const domain = parts[1];
  if (!local || !domain) return email;
  const maskedLocal =
    local.length > 2 ? `${local.slice(0, 2)}***` : `${local.slice(0, 1)}***`;
  return `${maskedLocal}@${domain}`;
}

// 获取用户信息
async function loadUserInfo() {
  try {
    const data = await getUserInfoApi();
    userInfo.value = data;
  } catch {
    message.error('获取用户信息失败');
  }
}

// 绑定/换绑手机
function handleBindPhone(action: 'bind' | 'rebind') {
  currentAction.value = action;
  currentBindType.value = 'phone';
  bindPhoneVisible.value = true;
}

// 绑定/换绑邮箱
function handleBindEmail(action: 'bind' | 'rebind') {
  currentAction.value = action;
  currentBindType.value = 'email';
  bindEmailVisible.value = true;
}

// 绑定/换绑微信
function handleBindWechat() {
  bindWechatVisible.value = true;
}

// 解绑
function handleUnbind(type: 'email' | 'phone' | 'wechat') {
  currentBindType.value = type;
  unbindVisible.value = true;
}

// 修改密码
function handleChangePassword() {
  changePasswordVisible.value = true;
}

// 绑定/换绑成功回调
function handleBindSuccess() {
  bindPhoneVisible.value = false;
  bindEmailVisible.value = false;
  bindWechatVisible.value = false;
  loadUserInfo();
}

// 解绑成功回调
function handleUnbindSuccess() {
  unbindVisible.value = false;
  loadUserInfo();
}

// 修改密码成功回调
function handleChangePasswordSuccess() {
  changePasswordVisible.value = false;
}

onMounted(() => {
  loadUserInfo();
});
</script>

<template>
  <Page title="账号设置" description="管理您的账号绑定信息">
    <div class="mx-auto max-w-2xl">
      <!-- 手机号 -->
      <div class="border-b border-gray-200 py-6 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              手机号
            </div>
            <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ userInfo?.phone ? maskPhone(userInfo.phone) : '未绑定手机号' }}
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span
              v-if="userInfo?.phone"
              class="cursor-pointer text-sm text-blue-500 hover:text-blue-600"
              @click="handleBindPhone('rebind')"
            >
              换绑
            </span>
            <span
              v-if="userInfo?.phone"
              class="cursor-pointer text-sm text-red-500 hover:text-red-600"
              @click="handleUnbind('phone')"
            >
              解绑
            </span>
            <span
              v-if="!userInfo?.phone"
              class="cursor-pointer text-sm text-blue-500 hover:text-blue-600"
              @click="handleBindPhone('bind')"
            >
              绑定
            </span>
          </div>
        </div>
      </div>

      <!-- 邮箱 -->
      <div class="border-b border-gray-200 py-6 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              邮箱
            </div>
            <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ userInfo?.email ? maskEmail(userInfo.email) : '未绑定邮箱' }}
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span
              v-if="userInfo?.email"
              class="cursor-pointer text-sm text-blue-500 hover:text-blue-600"
              @click="handleBindEmail('rebind')"
            >
              换绑
            </span>
            <span
              v-if="userInfo?.email"
              class="cursor-pointer text-sm text-red-500 hover:text-red-600"
              @click="handleUnbind('email')"
            >
              解绑
            </span>
            <span
              v-if="!userInfo?.email"
              class="cursor-pointer text-sm text-blue-500 hover:text-blue-600"
              @click="handleBindEmail('bind')"
            >
              绑定
            </span>
          </div>
        </div>
      </div>

      <!-- 微信号 -->
      <div class="border-b border-gray-200 py-6 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              微信号
            </div>
            <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{
                userInfo?.wechatNickname
                  ? `${userInfo.wechatNickname} · 绑定于 ${userInfo.wechatBindTime || '未知'}`
                  : '未绑定微信'
              }}
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span
              v-if="userInfo?.wechatNickname"
              class="cursor-pointer text-sm text-blue-500 hover:text-blue-600"
              @click="handleBindWechat"
            >
              换绑
            </span>
            <span
              v-if="userInfo?.wechatNickname"
              class="cursor-pointer text-sm text-red-500 hover:text-red-600"
              @click="handleUnbind('wechat')"
            >
              解绑
            </span>
            <span
              v-if="!userInfo?.wechatNickname"
              class="cursor-pointer text-sm text-blue-500 hover:text-blue-600"
              @click="handleBindWechat"
            >
              绑定
            </span>
          </div>
        </div>
      </div>

      <!-- 密码 -->
      <div class="py-6">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              密码
            </div>
            <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              已设置密码
            </div>
          </div>
          <div class="flex items-center">
            <span
              class="cursor-pointer text-sm text-blue-500 hover:text-blue-600"
              @click="handleChangePassword"
            >
              修改密码
            </span>
          </div>
        </div>
      </div>
    </div>
  </Page>

  <!-- 绑定手机弹窗 -->
  <BindPhoneModal
    :visible="bindPhoneVisible"
    :action="currentAction"
    :current-account="userInfo?.phone"
    @success="handleBindSuccess"
    @cancel="bindPhoneVisible = false"
  />

  <!-- 绑定邮箱弹窗 -->
  <BindEmailModal
    :visible="bindEmailVisible"
    :action="currentAction"
    :current-account="userInfo?.email"
    @success="handleBindSuccess"
    @cancel="bindEmailVisible = false"
  />

  <!-- 绑定微信弹窗 -->
  <BindWechatModal
    :visible="bindWechatVisible"
    @success="handleBindSuccess"
    @cancel="bindWechatVisible = false"
  />

  <!-- 解绑弹窗 -->
  <UnbindModal
    :visible="unbindVisible"
    :bind-type="currentBindType"
    @success="handleUnbindSuccess"
    @cancel="unbindVisible = false"
  />

  <!-- 修改密码弹窗 -->
  <ChangePasswordModal
    :visible="changePasswordVisible"
    @success="handleChangePasswordSuccess"
    @cancel="changePasswordVisible = false"
  />
</template>

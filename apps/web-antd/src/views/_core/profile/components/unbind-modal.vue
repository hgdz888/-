<script setup lang="ts">
import { ref } from 'vue';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenForm, z } from '#/adapter/form';
import { unbindAccountApi, verifyBindPasswordApi } from '#/api/core/auth';

const props = defineProps<{
  bindType: 'email' | 'phone' | 'wechat';
  visible: boolean;
}>();

const emit = defineEmits<{
  cancel: [];
  success: [];
}>();

const loading = ref(false);

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

// 获取绑定类型名称
function getBindTypeName(): string {
  const names = {
    phone: '手机号',
    email: '邮箱',
    wechat: '微信',
  };
  return names[props.bindType];
}

// 确认解绑
async function handleUnbind() {
  const values = await verifyFormApi.getValues();
  loading.value = true;
  try {
    // 先验证密码
    await verifyBindPasswordApi({ password: values.password });

    // 执行解绑
    await unbindAccountApi({ type: props.bindType });

    message.success(`${getBindTypeName()}已解绑`);
    emit('success');
  } catch {
    message.error('解绑失败，请检查密码是否正确');
  } finally {
    loading.value = false;
  }
}

// 关闭弹窗
function handleClose() {
  verifyFormApi.resetForm();
  emit('cancel');
}
</script>

<template>
  <Teleport to="body">
    <Modal
      :open="visible"
      :title="`解绑${getBindTypeName()}`"
      :width="420"
      :footer="null"
      @cancel="handleClose"
    >
      <div class="mb-4">
        <div class="mb-2 text-sm text-red-500">
          温馨提示：解绑后将无法使用{{ getBindTypeName() }}登录
        </div>
        <div class="text-sm text-gray-500">
          为了您的账号安全，请先验证登录密码
        </div>
      </div>

      <VerifyForm />

      <div class="mt-4 flex gap-3">
        <Button class="flex-1" @click="handleClose"> 取消 </Button>
        <Button
          type="primary"
          danger
          :loading="loading"
          class="flex-1"
          @click="handleUnbind"
        >
          确认解绑
        </Button>
      </div>
    </Modal>
  </Teleport>
</template>

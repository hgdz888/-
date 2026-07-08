<script setup lang="ts">
import { ref } from 'vue';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenForm, z } from '#/adapter/form';
import { changePasswordApi } from '#/api/core/auth';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  cancel: [];
  success: [];
}>();

const loading = ref(false);

const [PasswordForm, passwordFormApi] = useVbenForm({
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
      fieldName: 'oldPassword',
      label: '当前密码',
      rules: z.string().min(1, { message: '请输入当前密码' }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: '请输入新密码',
      },
      fieldName: 'newPassword',
      label: '新密码',
      rules: z.string().min(6, { message: '密码至少6位' }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: '请确认新密码',
      },
      dependencies: {
        rules(values: Record<string, any>) {
          const { newPassword } = values;
          return z
            .string({ required_error: '请确认密码' })
            .min(1, { message: '请确认密码' })
            .refine((value) => value === newPassword, {
              message: '两次密码不一致',
            });
        },
        triggerFields: ['newPassword'],
      },
      fieldName: 'confirmPassword',
      label: '确认密码',
    },
  ],
  showDefaultActions: false,
});

// 提交修改密码
async function handleSubmit() {
  const { valid } = await passwordFormApi.validate();
  if (!valid) return;

  const values = await passwordFormApi.getValues();
  loading.value = true;
  try {
    await changePasswordApi({
      typeId: 2,
      newPassword: values.newPassword,
    });
    message.success('密码修改成功');
    emit('success');
  } catch {
    message.error('密码修改失败');
  } finally {
    loading.value = false;
  }
}

// 关闭弹窗
function handleClose() {
  passwordFormApi.resetForm();
  emit('cancel');
}
</script>

<template>
  <Teleport to="body">
    <Modal
      :open="visible"
      title="修改密码"
      :width="420"
      :footer="null"
      @cancel="handleClose"
    >
      <div class="mb-4 text-sm text-gray-500">
        为了您的账号安全，请输入当前密码并设置新密码
      </div>

      <PasswordForm />

      <div class="mt-4 flex gap-3">
        <Button class="flex-1" @click="handleClose"> 取消 </Button>
        <Button
          type="primary"
          :loading="loading"
          class="flex-1"
          @click="handleSubmit"
        >
          确认修改
        </Button>
      </div>
    </Modal>
  </Teleport>
</template>

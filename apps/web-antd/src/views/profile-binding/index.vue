<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { onMounted } from 'vue';

import { Page } from '@vben/common-ui';
import { useUserStore } from '@vben/stores';

import { Card, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { updateStaffApi } from '#/api/core/auth';

const userStore = useUserStore();

const formSchema: VbenFormSchema[] = [
  {
    fieldName: 'realName',
    component: 'Input',
    label: '姓名',
    componentProps: {
      placeholder: '请输入姓名',
    },
    rules: 'required',
  },
  {
    fieldName: 'phone',
    component: 'Input',
    label: '手机号',
    componentProps: {
      placeholder: '请输入手机号',
    },
    rules: 'required',
  },
  {
    fieldName: 'age',
    component: 'InputNumber',
    label: '年龄',
    componentProps: {
      placeholder: '请输入年龄',
      min: 1,
      max: 150,
    },
  },
  {
    fieldName: 'email',
    component: 'Input',
    label: '邮箱',
    componentProps: {
      placeholder: '请输入邮箱',
    },
    rules: 'required',
  },
  {
    fieldName: 'gender',
    component: 'Select',
    label: '性别',
    componentProps: {
      placeholder: '请选择性别',
      options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
        { label: '其他', value: 'other' },
      ],
    },
  },
  {
    fieldName: 'address',
    component: 'Textarea',
    label: '地址',
    componentProps: {
      placeholder: '请输入地址',
      rows: 3,
    },
  },
];

const [Form, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 120,
  },
  schema: formSchema,
  showDefaultActions: true,
  handleSubmit: async (values: Record<string, any>) => {
    try {
      await updateStaffApi(values);
      message.success('保存成功');
    } catch {
      message.error('保存失败');
    }
  },
});

onMounted(async () => {
  const userInfo = userStore.userInfo;
  if (userInfo) {
    formApi.setValues({
      realName: userInfo.realName || '',
      phone: userInfo.phone || '',
      age: userInfo.age || undefined,
      email: userInfo.email || '',
      gender: userInfo.gender || '',
      address: userInfo.address || '',
    });
  }
});
</script>

<template>
  <Page title="个人信息绑定" description="请填写您的个人信息以便我们为您提供更好的服务">
    <Card>
      <Form />
    </Card>
  </Page>
</template>

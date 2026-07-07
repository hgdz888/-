<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { Page } from '@vben/common-ui';

import { Card, message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

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
});

const handleSubmit = async () => {
  const { valid, values } = await formApi.validateAndSubmitForm();
  if (valid) {
    console.log('Form values:', values);
    message.success('保存成功');
  }
};
</script>

<template>
  <Page title="个人信息绑定" description="请填写您的个人信息以便我们为您提供更好的服务">
    <Card>
      <Form @submit="handleSubmit" />
    </Card>
  </Page>
</template>

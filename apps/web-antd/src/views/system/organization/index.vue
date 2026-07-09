<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { Button, message, Modal, Space, Table } from 'ant-design-vue';

import {
  addOrganizationApi,
  deleteOrganizationApi,
  getAllOrganizationApi,
  updateOrganizationApi,
} from '#/api/core/org-staff';

interface OrgRecord {
  id: number;
  name: string;
  code?: string;
  parentId?: number;
  level?: number;
  operator?: string;
  createTime?: string;
  updateTime?: string;
  children?: OrgRecord[];
}

const loading = ref(false);
const dataSource = ref<OrgRecord[]>([]);
const modalVisible = ref(false);
const modalTitle = ref('添加组织');
const formData = ref<Partial<OrgRecord>>({});
const expandedRowKeys = ref<number[]>([]);

const columns = [
  { title: '序号', dataIndex: 'id', key: 'id', width: 80 },
  { title: '组织名称', dataIndex: 'name', key: 'name' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 180 },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', width: 180 },
  { title: '操作人', dataIndex: 'operator', key: 'operator', width: 100 },
  { title: '操作', key: 'action', width: 160, fixed: 'right' as const },
];

function generateSequence(tree: OrgRecord[], prefix = ''): Map<number, string> {
  const map = new Map<number, string>();
  let index = 1;
  for (const node of tree) {
    const seq = prefix ? `${prefix}.${index}` : `${index}`;
    map.set(node.id, seq);
    if (node.children && node.children.length > 0) {
      const childMap = generateSequence(node.children, seq);
      for (const [k, v] of childMap) {
        map.set(k, v);
      }
    }
    index++;
  }
  return map;
}

const sequenceMap = computed(() => generateSequence(dataSource.value));

async function fetchData() {
  loading.value = true;
  try {
    const res = await getAllOrganizationApi();
    dataSource.value = (Array.isArray(res)
      ? res
      : []) as unknown as OrgRecord[];
    expandedRowKeys.value = dataSource.value.map((item) => item.id);
  } catch {
    message.error('获取组织列表失败');
  } finally {
    loading.value = false;
  }
}

function handleAdd(parentId?: number) {
  formData.value = { parentId: parentId || 0 };
  modalTitle.value = '添加组织';
  modalVisible.value = true;
}

function handleEdit(record: OrgRecord) {
  formData.value = { ...record };
  modalTitle.value = '编辑组织';
  modalVisible.value = true;
}

function handleDelete(record: OrgRecord) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除组织"${record.name}"吗？`,
    onOk: async () => {
      try {
        await deleteOrganizationApi(record.id);
        message.success('删除成功');
        fetchData();
      } catch {
        message.error('删除失败');
      }
    },
  });
}

async function handleSubmit() {
  if (!formData.value.name) {
    message.warning('请输入组织名称');
    return;
  }
  try {
    if (formData.value.id) {
      await updateOrganizationApi(formData.value);
      message.success('修改成功');
    } else {
      await addOrganizationApi(formData.value);
      message.success('添加成功');
    }
    modalVisible.value = false;
    fetchData();
  } catch {
    message.error('操作失败');
  }
}

function handleExpand(expanded: boolean, record: OrgRecord) {
  if (expanded) {
    expandedRowKeys.value.push(record.id);
  } else {
    expandedRowKeys.value = expandedRowKeys.value.filter(
      (k) => k !== record.id,
    );
  }
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="p-4">
    <div class="mb-4">
      <Button type="primary" @click="handleAdd()"> 添加组织 </Button>
    </div>
    <Table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="false"
      :default-expand-all-rows="true"
      row-key="id"
      :scroll="{ x: 900 }"
      @expand="handleExpand"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'id'">
          {{ sequenceMap.get(record.id) || record.id }}
        </template>
        <template v-if="column.key === 'action'">
          <Space>
            <Button
              type="primary"
              size="small"
              @click="handleEdit(record as OrgRecord)"
            >
              编辑
            </Button>
            <Button
              size="small"
              class="!bg-red-500 !border-red-500 !text-white hover:!bg-red-400"
              @click="handleDelete(record as OrgRecord)"
            >
              删除
            </Button>
          </Space>
        </template>
      </template>
    </Table>

    <Modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleSubmit"
      @cancel="modalVisible = false"
    >
      <div class="py-4">
        <div class="mb-3">
          <label class="mb-1 block">组织名称</label>
          <input
            v-model="formData.name"
            class="w-full rounded border px-3 py-2"
            placeholder="请输入组织名称"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>

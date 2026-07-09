<script setup lang="ts">
import type { DataNode } from 'ant-design-vue/es/tree';

import { computed, onMounted, reactive, ref } from 'vue';

import {
  Button,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tree,
} from 'ant-design-vue';

import {
  deleteStaffApi,
  getAllOrganizationApi,
  getStaffByOrgApi,
  resetStaffPwdApi,
} from '#/api/core/org-staff';

interface StaffRecord {
  sId: number;
  userId?: string;
  realName?: string;
  phoneNum?: string;
  email?: string;
  sex?: number;
  addTime?: string;
  companyName?: string;
  approved?: number;
  [key: string]: any;
}

interface OrgNode {
  id: number;
  name: string;
  children?: OrgNode[];
}

const loading = ref(false);
const dataSource = ref<StaffRecord[]>([]);
const total = ref(0);
const orgTree = ref<OrgNode[]>([]);
const selectedOrgId = ref<number | undefined>(undefined);
const expandedOrgKeys = ref<number[]>([]);

const searchForm = reactive({
  OrgId: undefined as number | undefined,
  UserName: '',
  Approved: undefined as number | undefined,
  currentPage: 1,
  pageSize: 15,
});

const columns = [
  { title: '序号', dataIndex: 'sId', key: 'sId', width: 60 },
  { title: '昵称', dataIndex: 'realName', key: 'realName', width: 100 },
  { title: '用户账号', dataIndex: 'userId', key: 'userId', width: 120 },
  {
    title: '性别',
    dataIndex: 'sex',
    key: 'sex',
    width: 60,
    customRender: ({ text }: any) =>
      text === 1 ? '男' : text === 2 ? '女' : '保密',
  },
  {
    title: '所属组织',
    dataIndex: 'companyName',
    key: 'companyName',
    width: 120,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    width: 150,
    ellipsis: true,
  },
  { title: '手机号', dataIndex: 'phoneNum', key: 'phoneNum', width: 120 },
  { title: '创建时间', dataIndex: 'addTime', key: 'addTime', width: 160 },
  {
    title: '状态',
    dataIndex: 'approved',
    key: 'approved',
    width: 80,
    customRender: ({ text }: any) =>
      text === 1 ? '同意' : text === 0 ? '待审核' : '拒绝',
  },
  { title: '操作', key: 'action', width: 200, fixed: 'right' as const },
];

const orgTreeData = computed<DataNode[]>(() => {
  return orgTree.value.map((node) => convertToTreeNode(node));
});

function convertToTreeNode(node: OrgNode): DataNode {
  return {
    key: node.id,
    title: node.name,
    children:
      node.children && node.children.length > 0
        ? node.children.map((child) => convertToTreeNode(child))
        : undefined,
  };
}

async function fetchOrgTree() {
  try {
    const res = await getAllOrganizationApi();
    const treeData = (Array.isArray(res) ? res : []) as unknown as OrgNode[];
    orgTree.value = treeData;
    // 递归收集所有节点ID用于默认展开
    const collectKeys = (nodes: OrgNode[]): number[] => {
      const keys: number[] = [];
      for (const node of nodes) {
        keys.push(node.id);
        if (node.children && node.children.length > 0) {
          keys.push(...collectKeys(node.children));
        }
      }
      return keys;
    };
    expandedOrgKeys.value = collectKeys(treeData);
  } catch {
    // ignore
  }
}

async function fetchData() {
  loading.value = true;
  try {
    const params = { ...searchForm };
    if (selectedOrgId.value) {
      params.OrgId = selectedOrgId.value;
    }
    const res = await getStaffByOrgApi(params);
    if (res && typeof res === 'object') {
      dataSource.value =
        res.data || res.items || (Array.isArray(res) ? res : []);
      total.value = res.total || res.rowCount || 0;
    } else {
      dataSource.value = [];
      total.value = 0;
    }
  } catch {
    message.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
}

function handleOrgSelect(keys: any[]) {
  if (keys.length > 0) {
    selectedOrgId.value = Number(keys[0]);
  } else {
    selectedOrgId.value = undefined;
  }
  searchForm.currentPage = 1;
  fetchData();
}

function handleSearch() {
  searchForm.currentPage = 1;
  fetchData();
}

function handleReset() {
  searchForm.OrgId = undefined;
  searchForm.UserName = '';
  searchForm.Approved = undefined;
  searchForm.currentPage = 1;
  selectedOrgId.value = undefined;
  fetchData();
}

function handleDelete(record: StaffRecord) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除用户"${record.realName || record.userId}"吗？`,
    onOk: async () => {
      try {
        await deleteStaffApi(record.sId);
        message.success('删除成功');
        fetchData();
      } catch {
        message.error('删除失败');
      }
    },
  });
}

function handleResetPwd(record: StaffRecord) {
  Modal.confirm({
    title: '确认重置密码',
    content: `确定要重置用户"${record.realName || record.userId}"的密码吗？`,
    onOk: async () => {
      try {
        await resetStaffPwdApi({
          type: 'email',
          account: record.email || record.userId,
        });
        message.success('密码已重置');
      } catch {
        message.error('重置失败');
      }
    },
  });
}

function handleTableChange(pagination: any) {
  searchForm.currentPage = pagination.current;
  searchForm.pageSize = pagination.pageSize;
  fetchData();
}

onMounted(() => {
  fetchOrgTree();
  fetchData();
});
</script>

<template>
  <div class="flex h-full">
    <!-- 左侧组织树 -->
    <div class="dark-tree-panel w-60 flex-shrink-0 border-r">
      <div class="border-b p-3 font-medium">总节点</div>
      <div class="overflow-auto" style="height: calc(100% - 44px)">
        <Tree
          v-if="orgTreeData.length > 0"
          :tree-data="orgTreeData"
          :field-names="{ title: 'title', key: 'key', children: 'children' }"
          default-expand-all
          :selectable="true"
          :selected-keys="selectedOrgId ? [selectedOrgId] : []"
          @select="handleOrgSelect"
        />
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="flex-1 overflow-auto p-4">
      <!-- 搜索区域 -->
      <div class="mb-4 rounded p-4">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="whitespace-nowrap">审核状态</span>
            <Select
              v-model:value="searchForm.Approved"
              placeholder="请选择用户状态"
              allow-clear
              style="width: 180px"
              :options="[
                { label: '同意', value: 1 },
                { label: '待审核', value: 0 },
                { label: '拒绝', value: -1 },
              ]"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="whitespace-nowrap">用户名</span>
            <Input
              v-model:value="searchForm.UserName"
              placeholder="请输入用户名"
              style="width: 200px"
              allow-clear
              @keyup.enter="handleSearch"
            />
          </div>
          <Space>
            <Button @click="handleReset">重置</Button>
            <Button type="primary" @click="handleSearch">搜索</Button>
          </Space>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="mb-4">
        <Button type="primary" @click="message.info('添加用户功能待实现')">
          添加用户
        </Button>
      </div>

      <!-- 表格 -->
      <div class="rounded">
        <Table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :pagination="{
            current: searchForm.currentPage,
            pageSize: searchForm.pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t: number) => `共 ${t} 条记录`,
          }"
          row-key="sId"
          :scroll="{ x: 1200 }"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <Space>
                <Button
                  type="link"
                  size="small"
                  @click="message.info('编辑功能待实现')"
                >
                  编辑
                </Button>
                <Button
                  type="link"
                  size="small"
                  @click="handleResetPwd(record as StaffRecord)"
                >
                  重置密码
                </Button>
                <Button
                  type="link"
                  danger
                  size="small"
                  @click="handleDelete(record as StaffRecord)"
                >
                  删除
                </Button>
              </Space>
            </template>
          </template>
        </Table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dark-tree-panel :deep(.ant-tree-node-selected) {
  background-color: rgb(255 255 255 / 10%) !important;
}

.dark-tree-panel :deep(.ant-tree-node-content-wrapper:hover) {
  background-color: rgb(255 255 255 / 5%) !important;
}
</style>

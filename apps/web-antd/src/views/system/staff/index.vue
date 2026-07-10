<script setup lang="ts">
import type { DataNode } from 'ant-design-vue/es/tree';

import { computed, onMounted, reactive, ref } from 'vue';

import {
  Button,
  Form,
  FormItem,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tree,
} from 'ant-design-vue';

import {
  addStaffApi,
  deleteStaffApi,
  getAllOrganizationApi,
  getStaffByOrgApi,
  resetStaffPwdApi,
  updateStaffApi,
} from '#/api/core/org-staff';

interface StaffRecord {
  staffId: number;
  userId?: string;
  userName?: string;
  realName?: string;
  phoneNum?: string;
  email?: string;
  sex?: number;
  addtime?: string;
  companyName?: string;
  approved?: number;
  cid?: number[];
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

// 添加用户相关状态
const addModalVisible = ref(false);
const addFormLoading = ref(false);
const addFormRef = ref();
const addForm = reactive({
  userId: '',
  realName: '',
  phoneNum: '',
  email: '',
  sex: undefined as number | undefined,
  passWord: '',
  cid: undefined as number | undefined,
  approved: 0,
});
const addFormRules: Record<string, any[]> = {
  userId: [
    {
      required: true,
      message: '请输入用户账号',
      trigger: 'blur',
      type: 'string',
    },
  ],
  realName: [
    {
      required: true,
      message: '请输入昵称',
      trigger: 'blur',
      type: 'string',
    },
  ],
  phoneNum: [
    {
      required: true,
      message: '请输入手机号',
      trigger: 'blur',
      type: 'string',
    },
  ],
  email: [
    {
      required: true,
      message: '请输入邮箱',
      trigger: 'blur',
      type: 'string',
    },
  ],
  passWord: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur',
      type: 'string',
    },
  ],
};

// 编辑用户相关状态
const editModalVisible = ref(false);
const editFormLoading = ref(false);
const editForm = reactive({
  sId: 0,
  userId: '',
  realName: '',
  phoneNum: '',
  email: '',
  sex: undefined as number | undefined,
  cid: undefined as number | undefined,
  approved: 0,
});

const columns = [
  { title: '序号', dataIndex: 'staffId', key: 'staffId', width: 60 },
  { title: '昵称', dataIndex: 'realName', key: 'realName', width: 100 },
  { title: '用户账号', dataIndex: 'userName', key: 'userName', width: 120 },
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
    dataIndex: 'orgName',
    key: 'orgName',
    width: 120,
    customRender: ({ text }: any) =>
      Array.isArray(text) ? text.join(', ') : text || '',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    width: 150,
    ellipsis: true,
  },
  { title: '手机号', dataIndex: 'phoneNum', key: 'phoneNum', width: 120 },
  { title: '创建时间', dataIndex: 'addtime', key: 'addtime', width: 160 },
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

function showAddModal() {
  addForm.userId = '';
  addForm.realName = '';
  addForm.phoneNum = '';
  addForm.email = '';
  addForm.sex = undefined;
  addForm.passWord = '';
  addForm.cid = undefined;
  addForm.approved = 0;
  addModalVisible.value = true;
}

async function handleAddSubmit() {
  try {
    await addFormRef.value?.validate();
  } catch {
    return;
  }
  try {
    addFormLoading.value = true;
    const submitData = {
      ...addForm,
      cid: addForm.cid ? [addForm.cid] : [],
    };
    await addStaffApi(submitData);
    message.success('添加用户成功');
    addModalVisible.value = false;
    fetchData();
  } catch (error: any) {
    message.error(error?.message || '添加用户失败');
  } finally {
    addFormLoading.value = false;
  }
}

function handleEdit(record: StaffRecord) {
  editForm.sId = record.staffId;
  editForm.userId = record.userName || '';
  editForm.realName = record.realName || '';
  editForm.phoneNum = record.phoneNum || '';
  editForm.email = record.email || '';
  editForm.sex = record.sex;
  editForm.cid =
    record.cid && record.cid.length > 0 ? record.cid[0] : undefined;
  editForm.approved = record.approved || 0;
  editModalVisible.value = true;
}

async function handleEditSubmit() {
  try {
    editFormLoading.value = true;
    const submitData = {
      sId: editForm.sId,
      userName: editForm.userId,
      realName: editForm.realName,
      phoneNum: editForm.phoneNum,
      email: editForm.email,
      sex: editForm.sex,
      cid: editForm.cid ? [editForm.cid] : [],
      approved: editForm.approved,
    };
    await updateStaffApi(submitData);
    message.success('修改用户成功');
    editModalVisible.value = false;
    fetchData();
  } catch (error: any) {
    message.error(error?.message || '修改用户失败');
  } finally {
    editFormLoading.value = false;
  }
}

function handleDelete(record: StaffRecord) {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除用户"${record.realName || record.userName}"吗？`,
    onOk: async () => {
      try {
        await deleteStaffApi(record.staffId);
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
    content: `确定要重置用户"${record.realName || record.userName}"的密码吗？`,
    onOk: async () => {
      try {
        await resetStaffPwdApi({
          type: 'email',
          account: record.email || record.userName,
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
        <Button type="primary" @click="showAddModal"> 添加用户 </Button>
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
          row-key="staffId"
          :scroll="{ x: 1200 }"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <Space>
                <Button
                  type="link"
                  size="small"
                  @click="handleEdit(record as StaffRecord)"
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

    <!-- 添加用户模态框 -->
    <Modal
      v-model:open="addModalVisible"
      title="添加用户"
      :confirm-loading="addFormLoading"
      @ok="handleAddSubmit"
      @cancel="addModalVisible = false"
    >
      <Form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        layout="vertical"
      >
        <FormItem label="用户账号" name="userId">
          <Input v-model:value="addForm.userId" placeholder="请输入用户账号" />
        </FormItem>
        <FormItem label="昵称" name="realName">
          <Input v-model:value="addForm.realName" placeholder="请输入昵称" />
        </FormItem>
        <FormItem label="手机号" name="phoneNum">
          <Input v-model:value="addForm.phoneNum" placeholder="请输入手机号" />
        </FormItem>
        <FormItem label="邮箱" name="email">
          <Input v-model:value="addForm.email" placeholder="请输入邮箱" />
        </FormItem>
        <FormItem label="密码" name="passWord">
          <Input.Password
            v-model:value="addForm.passWord"
            placeholder="请输入密码"
          />
        </FormItem>
        <FormItem label="性别" name="sex">
          <Select
            v-model:value="addForm.sex"
            placeholder="请选择性别"
            allow-clear
            :options="[
              { label: '男', value: 1 },
              { label: '女', value: 2 },
              { label: '保密', value: 0 },
            ]"
          />
        </FormItem>
        <FormItem label="所属组织" name="cid">
          <Select
            v-model:value="addForm.cid"
            placeholder="请选择所属组织"
            allow-clear
            :options="
              orgTreeData.map((node) => ({
                label: node.title,
                value: node.key,
              }))
            "
          />
        </FormItem>
      </Form>
    </Modal>

    <!-- 编辑用户模态框 -->
    <Modal
      v-model:open="editModalVisible"
      title="编辑用户"
      :confirm-loading="editFormLoading"
      @ok="handleEditSubmit"
      @cancel="editModalVisible = false"
    >
      <Form :model="editForm" layout="vertical">
        <FormItem label="用户账号" name="userId">
          <Input
            v-model:value="editForm.userId"
            placeholder="用户账号"
            disabled
          />
        </FormItem>
        <FormItem label="昵称" name="realName">
          <Input v-model:value="editForm.realName" placeholder="请输入昵称" />
        </FormItem>
        <FormItem label="手机号" name="phoneNum">
          <Input v-model:value="editForm.phoneNum" placeholder="请输入手机号" />
        </FormItem>
        <FormItem label="邮箱" name="email">
          <Input v-model:value="editForm.email" placeholder="请输入邮箱" />
        </FormItem>
        <FormItem label="性别" name="sex">
          <Select
            v-model:value="editForm.sex"
            placeholder="请选择性别"
            allow-clear
            :options="[
              { label: '男', value: 1 },
              { label: '女', value: 2 },
              { label: '保密', value: 0 },
            ]"
          />
        </FormItem>
        <FormItem label="所属组织" name="cid">
          <Select
            v-model:value="editForm.cid"
            placeholder="请选择所属组织"
            allow-clear
            :options="
              orgTreeData.map((node) => ({
                label: node.title,
                value: node.key,
              }))
            "
          />
        </FormItem>
      </Form>
    </Modal>
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

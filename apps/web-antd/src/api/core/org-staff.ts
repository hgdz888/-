import { requestClient } from '#/api/request';

// ==================== 组织架构相关 ====================

export interface OrganizationItem {
  id: number;
  code?: string;
  name?: string;
  level?: number;
  parentId?: number;
  createTime?: string;
  updateTime?: string;
  isDel?: boolean;
  path?: string;
  isLeaf?: boolean;
  children?: OrganizationItem[];
}

/** 获取所有组织架构 */
export async function getAllOrganizationApi() {
  return requestClient.get<OrganizationItem[]>(
    '/v1/Organizationstructure/GetAllOrganizationstructure',
  );
}

/** 根据组织机构编号获取组织机构树 */
export async function getOrganizationTreeApi(orgId: number) {
  return requestClient.get<OrganizationItem[]>(
    '/v1/Organizationstructure/GetOrganizationstructureTree',
    { params: { orgId } },
  );
}

/** 根据当前用户Token获取组织机构树 */
export async function getOrganizationTreeByTokenApi() {
  return requestClient.get<OrganizationItem[]>(
    '/v1/Organizationstructure/GetOrganizationstructureTreeByToken',
  );
}

/** 添加组织机构 */
export async function addOrganizationApi(data: Partial<OrganizationItem>) {
  return requestClient.post(
    '/v1/Organizationstructure/AddOrganizationstructure',
    data,
  );
}

/** 修改组织机构 */
export async function updateOrganizationApi(data: Partial<OrganizationItem>) {
  return requestClient.post(
    '/v1/Organizationstructure/UpdateOrganizationstructure',
    data,
  );
}

/** 删除组织机构 */
export async function deleteOrganizationApi(orgId: number) {
  return requestClient.get(
    '/v1/Organizationstructure/DeleteOrganizationstructure',
    { params: { orgId } },
  );
}

/** 判断组织机构是否存在 */
export async function checkOrganizationExistsApi(name: string) {
  return requestClient.post(
    '/v1/Organizationstructure/GetOrganizationstructureByName',
    null,
    { params: { name } },
  );
}

// ==================== 员工相关 ====================

export interface StaffItem {
  sId: number;
  userId?: string;
  realName?: string;
  phoneNum?: string;
  email?: string;
  sex?: number;
  addTime?: string;
  updateTime?: string;
  approved?: number;
  userName?: string;
  companyName?: string;
  cid?: string;
  [key: string]: any;
}

export interface StaffListParams {
  currentPage?: number;
  pageSize?: number;
  OrgId?: number;
  UserName?: string;
  Approved?: number;
  IsPage?: boolean;
}

/** 根据组织架构查询用户信息 */
export async function getStaffByOrgApi(params: StaffListParams) {
  return requestClient.get<any>('/v1/Satff/GetStaffByOrganizationstructure', {
    params,
  });
}

/** 根据真实姓名模糊查询 */
export async function getStaffByRealNameApi(params: {
  Approved?: number;
  currentPage?: number;
  pageSize?: number;
  realName?: string;
}) {
  return requestClient.get<any>('/v1/Satff/GetStaffByRealName', { params });
}

/** 添加用户 */
export async function addStaffApi(data: any) {
  return requestClient.post('/v1/Satff/AddStaff', data);
}

/** 修改用户信息 */
export async function updateStaffApi(data: any) {
  return requestClient.post('/v1/Satff/UpdateStaff', data);
}

/** 删除用户 */
export async function deleteStaffApi(sid: number) {
  return requestClient.get('/v1/Satff/DeleteStaff', { params: { sid } });
}

/** 设置启用禁用 */
export async function setStaffDisableApi(sid: number) {
  return requestClient.post('/v1/Satff/SetDisable', null, { params: { sid } });
}

/** 重置密码 */
export async function resetStaffPwdApi(data: {
  account?: string;
  type?: string;
}) {
  return requestClient.post('/v1/Satff/ResetPwd', data);
}

/** 给用户设置角色权限 */
export async function setStaffRoleApi(data: {
  roleID?: number[];
  staffid: number;
}) {
  return requestClient.post('/v1/Satff/setStaffRole', data);
}

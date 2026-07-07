# API 接口文档

## 基础信息

- **API文档地址**: http://gxcah.com:8077/swagger/index.html
- **Swagger JSON**: http://gxcah.com:8077/swagger/v1/swagger.json
- **API版本**: v1
- **协议**: RESTful API

## 认证方式

所有API需要JWT认证，在请求头中携带：
```
Authorization: Bearer <token>
```

---

## 接口分类

### 1. Login (认证登录)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/v1/auth/login` | 密码登录 |
| POST | `/v1/auth/VerifyCodeLogin` | 验证码登录 |
| GET | `/v1/auth/userinfo` | 根据token获取用户信息 |
| POST | `/v1/auth/Logout` | 退出登录 |
| POST | `/v1/auth/codes` | 获取权限码 |
| GET | `/v1/auth/wechat/qrcode` | 获取微信扫码登录QR码URL |
| GET | `/v1/auth/wechat/callback` | 微信扫码授权回调 |
| POST | `/v1/auth/wechat/login` | 微信移动端登录 |

### 2. Acceptance (验收单)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/v1/Acceptance/Getacceptance_sheets` | 查询验收单列表 |
| POST | `/v1/Acceptance/add` | 添加验收单 |
| GET | `/v1/Acceptance/detail/{sheetId}` | 获取验收单详情 |
| PATCH | `/v1/Acceptance/status/{sheetId}` | 更新验收单状态 |
| POST | `/v1/Acceptance/batch-delete` | 批量删除验收单 |
| GET | `/v1/Acceptance/GetStorebyStatus` | 获取待验收门店下拉 |
| GET | `/v1/Acceptance/GetStorebyId` | 根据门店编号获取门店地址、安装时间 |
| GET | `/v1/Acceptance/GetEquipmentbyId` | 根据门店编号安装设备信息 |
| GET | `/v1/Acceptance/GetMaterials` | 查询辅材信息 |
| POST | `/v1/Acceptance/AddMaterial` | 添加辅材信息 |
| POST | `/v1/Acceptance/UpdateMaterial` | 修改辅材信息 |
| GET | `/v1/Acceptance/DeleteMaterial` | 删除辅材信息 |
| POST | `/v1/Acceptance/BatchDeleteMaterials` | 批量删除辅材信息 |

### 3. AlarmInformation (报警信息)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/AlarmInformation/GetAlarmDetails` | 获取报警详情信息 |
| GET | `/v1/AlarmInformation/GetStoreAlarmDetails` | 获取门店报警详情信息 |
| GET | `/v1/AlarmInformation/ResolveTheAlarm` | 解决报警记录 |
| GET | `/v1/AlarmInformation/storelist` | 获取报警门店 |

### 4. Alarminformationpush (报警信息推送)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/Alarminformationpush/GetAlarminformationpush` | 查询报警信息推送 |
| POST | `/v1/Alarminformationpush/AddAlarminformationpush` | 新增报警信息推送内容 |
| POST | `/v1/Alarminformationpush/UpdateAlarminformationpush` | 修改报警信息推送内容 |
| GET | `/v1/Alarminformationpush/DeleteAlarminformationpush` | 删除报警信息推送内容 |

### 5. AlarmRuleDetails (报警规则详情)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/AlarmRuleDetails/GetAlarmRuleDetails` | 查询报警规则列表 |
| POST | `/v1/AlarmRuleDetails/AddAlarmruledetails` | 添加报警规则详情 |
| GET | `/v1/AlarmRuleDetails/GetAlarmruledetailsByid` | 根据报警规则详情ID获取详情 |
| POST | `/v1/AlarmRuleDetails/updateAAlarmruledetails` | 修改报警规则详情 |
| GET | `/v1/AlarmRuleDetails/deleteAlarmruledetails` | 根据报警规则编号删除报警规则 |

### 6. CompanyRegional (地区信息)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/company-regional` | 查询地区信息 |
| GET | `/v1/company-regional/lazy/{id}` | 懒加载查询地区信息 |
| GET | `/v1/company-regional/by-level` | 根据等级查询地区信息 |
| GET | `/v1/company-regional/GetCompanyRegional` | 根据父类编号获取子集集合 |

### 7. DeepSeek (AI接口)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/v1/DeepSeek/Generate` | 生成内容 |
| POST | `/v1/DeepSeek/GenerateStream` | 流式生成内容 |

### 8. DeviceParameter (设备参数)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/device-parameter/tree` | 获取完整的设备参数树形结构 |
| GET | `/v1/device-parameter/GetParameterTreeByvariable` | 获取变量属性树形结构 |
| GET | `/v1/device-parameter/children/{parentId}` | 根据父节点ID获取子节点 |
| GET | `/v1/device-parameter/tree-by-device/{deviceType}` | 根据设备类型获取参数树 |
| GET | `/v1/device-parameter/detail/{id}` | 根据ID获取参数详情 |
| GET | `/v1/device-parameter/role-attributes/{rid}` | 根据角色Id查询绑定属性 |

### 9. Equipment (设备管理)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/device-parameter/GetAllEquipment` | 设备查询 |
| POST | `/v1/device-parameter/AddEquipment` | 新增设备 |
| GET | `/v1/device-parameter/DeleteEquipment/{device_code}` | 删除设备 |
| POST | `/v1/device-parameter/UpdateEquipment` | 更新设备信息 |

### 10. EquipmentData (设备数据)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/EquipmentData/calculate-memory` | 计算内存 |

### 11. FileUploadPDF (文件上传)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/v1/FileUploadPDF/upload` | WPF文件上传接口 |

### 12. HistoryList (历史数据)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/HistoryList/GetHistoryData` | 查询设备历史数据 |
| GET | `/v1/HistoryList/Get7DaysDataByStore` | 根据门店ID获取历史7天能耗 |
| GET | `/v1/HistoryList/GetHistoryOnlineData` | 查询设备历史在线数据 |
| GET | `/v1/HistoryList/GetTempVariable` | 变量/非变量下拉菜单 |
| GET | `/v1/HistoryList/GetStoreTempInfo` | 根据门店获取门店设备及属性信息（三级联动） |

### 13. Image (图片上传)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/v1/image/upload` | 上传图片到本地服务器 |
| POST | `/v1/image/UploadLocalFiles` | 上传多张图片到本地服务器（自动压缩） |

### 14. Menu2 (菜单管理2)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/Menu2/GetFullMenuTree` | 获取完整菜单树形结构 |
| GET | `/v1/Menu2/getmenubystaff` | 根据用户Token查询有权限的树形结构 |
| GET | `/v1/Menu2/GetRoleFullMenuTree` | 通过角色ID获取完整菜单树形结构 |

### 15. Messages (国际化)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/locale/messages` | 获取指定语言的国际化文案 |
| POST | `/v1/locale` | 新增多语言文案 |
| PUT | `/v1/locale/{key}` | 编辑多语言文案 |
| DELETE | `/v1/locale/{key}` | 删除国际化文案 |
| GET | `/{key}` | 根据Key查询多语言文案 |
| GET | `/v1/locale/list` | 获取语言列表 |
| GET | `/v1/locale/check-key-exists` | 判断指定语言+FullKey是否存在 |

### 16. Notification (通知)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/todo` | 获取我的待办事项 |
| GET | `/dynamic` | 获取我的最新动态 |
| GET | `/popup` | 获取我的右上角通知弹窗 |
| GET | `/unread-count` | 获取我的未读数量 |
| POST | `/mark-read` | 标记单条/多条已读 |
| POST | `/mark-all-read` | 标记全部已读 |
| POST | `/handle-todo` | 处理待办（完成/忽略） |
| POST | `/delete` | 删除通知 |
| GET | `/readed` | 获取我的已读/历史通知 |

### 17. OnlineDevice (在线设备)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/OnlineDevice/GetOnlineDeviceCount` | 获取在线设备数量 |
| GET | `/v1/OnlineDevice/GetDevicemodels` | 获取设备型号统计 |
| GET | `/v1/OnlineDevice/GetAlarmStatistics` | 报警统计 |
| POST | `/v1/OnlineDevice/GetStoreCountWithTotal` | 获取组织下的门店总数及新增数 |
| GET | `/v1/OnlineDevice` | 获取设备定位 |
| GET | `/v1/OnlineDevice/all-status` | 获取所有状态 |

### 18. Organizationstructure (组织架构)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/Organizationstructure/GetAllOrganizationstructure` | 获取所有组织架构 |
| POST | `/v1/Organizationstructure/AddOrganizationstructure` | 添加组织机构 |
| POST | `/v1/Organizationstructure/GetOrganizationstructureByName` | 判断组织机构是否存在 |
| POST | `/v1/Organizationstructure/UpdateOrganizationstructure` | 修改组织机构 |
| GET | `/v1/Organizationstructure/DeleteOrganizationstructure` | 删除组织机构 |

### 19. PermissionGroup (设备权限分组)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/system/device-permission-group/list` | 获取设备权限分组列表（分页） |
| POST | `/v1/system/device-permission-group` | 创建设备权限分组 |
| PUT | `/v1/system/device-permission-group/{id}` | 更新设备权限分组 |
| DELETE | `/v1/system/device-permission-group/{id}` | 删除设备权限分组 |

### 20. RealtimeTest (实时测试)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/RealtimeTest/GetDeviceByStoreId` | 获取设备属性详情信息 |
| GET | `/v1/RealtimeTest/test` | 查询RedisKey是否存在 |
| GET | `/v1/RealtimeTest/GetDeviceInfoBySN` | 根据设备SN获取多模板联动信息 |
| GET | `/v1/RealtimeTest/GetAlarmlevel` | 判断是否报警 |
| GET | `/v1/RealtimeTest` | 定时扫描Redis过期报警缓存 |
| GET | `/v1/RealtimeTest/GetAlarmlevelBydevice_code` | 获取报警级别 |
| GET | `/v1/RealtimeTest/GetTodayAlarmRecords` | 获取当天报警记录 |
| GET | `/v1/RealtimeTest/GetAlarmRecordsAll` | 获取门店和设备的报警记录 |
| GET | `/v1/RealtimeTest/GetRealtimeDate` | 调用websocket广播实时数据 |

### 21. Role (角色管理)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/RoleController/GetAllRole` | 角色字典 |
| GET | `/v1/RoleController/GetRoleByName` | 判断角色是否存在 |
| GET | `/v1/RoleController/GetAllRoleByName` | 角色权限分页查询及模糊查询 |
| POST | `/v1/RoleController/AddRole` | 添加角色 |
| POST | `/v1/RoleController/UpdateRole` | 修改角色 |
| GET | `/v1/RoleController/DeleteRole` | 删除角色 |
| POST | `/v1/RoleController/setRolePermissions` | 设置角色权限 |
| GET | `/v1/RoleController/GetRoleResourceWithOrg` | 编辑角色权限 |

### 22. Role_Menu (角色菜单)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/system/role/list` | 获取角色列表 |
| POST | `/v1/system/role` | 创建角色 |
| PUT | `/v1/system/role/{id}` | 更新角色 |
| DELETE | `/v1/system/role/{id}` | 删除角色 |

### 23. Staff (员工管理)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/Satff/GetStaffByOrganizationstructure` | 根据组织架构查询用户信息 |
| GET | `/v1/Satff/GetStaffByRealName` | 根据真实姓名模糊查询用户信息 |
| POST | `/v1/Satff/GetStaddbyPhoneNum` | 判断手机号或邮箱是否已注册 |
| GET | `/v1/Satff/GetApprovedByAccount` | 根据账号获取当前注册用户的状态 |
| GET | `/v1/Satff/GetStaffAllByOrganizationstructure` | 查询当前组织机构下面所有员工姓名 |
| POST | `/v1/Satff/Register` | 注册用户 |
| GET | `/v1/Satff/Emailcode` | 发送邮箱验证码 |
| POST | `/v1/Satff/AddStaff` | 添加用户 |
| POST | `/v1/Satff/UpdateStaff` | 修改用户信息 |
| POST | `/v1/Satff/SetDisable` | 设置启用禁用 |
| GET | `/v1/Satff/verifyCurrentUserPassword` | 验证当前用户密码是否正确 |
| POST | `/v1/Satff/setStaffRole` | 给用户设置角色权限 |
| GET | `/v1/Satff/DeleteStaff` | 删除用户 |
| POST | `/v1/Satff/StaffAccountOperate` | 员工账号统一操作 |

### 24. Sse (Server-Sent Events)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/Sse/connect` | SSE 连接端点 |
| GET | `/v1/Sse/count` | 获取当前连接的客户端数量 |
| GET | `/v1/Sse/cleanup-dead-connections` | 清理长时间没有心跳的僵尸连接 |
| POST | `/v1/Sse/test-broadcast` | 测试广播消息到所有客户端 |
| POST | `/v1/Sse/test-store` | 测试向指定门店发送消息 |
| POST | `/v1/Sse/test-admin` | 测试向管理员发送消息 |
| POST | `/v1/Sse/mark-as-read` | 标记SSE消息为已读 |
| GET | `/v1/Sse/unread-count` | 查询当前用户的未读消息数量 |
| GET | `/v1/Sse/message-history` | 查询最近发送的SSE消息记录 |

### 25. Store (门店管理)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/v1/store/Getstore` | 获取门店列表（含省市区地址拼接） |
| GET | `/v1/store/GetStoreByName` | 判断店名是否存在 |
| GET | `/v1/store/GetByStoreId` | 查询门店详情和安装调试表信息 |
| GET | `/v1/store/Deletestore` | 删除门店 |
| POST | `/v1/store/Addstore` | 添加门店 |
| GET | `/v1/store/GetstoreById` | 根据门店ID查询门店详情 |
| POST | `/v1/store/UpdateStore` | 修改门店（含营业时间同步更新） |

### 26. StoreAnnotation (门店标注)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/v1/StoreAnnotation/save` | 保存门店标注 |
| GET | `/v1/StoreAnnotation/get` | 获取门店标注 |
| POST | `/v1/StoreAnnotation/delete` | 删除门店标注 |
| GET | `/v1/StoreAnnotation/getStoreAnnotation` | 获取门店标注信息 |

### 27. StoreInstallation (门店安装)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/v1/StoreInstallation/AddStoreInstallation` | 添加安装信息 |
| GET | `/v1/StoreInstallation/GetStoreInstallationList` | 查询安装信息列表 |
| GET | `/v1/StoreInstallation/GetStoreInstallationDetail` | 安装详情（含分组后的图片URL） |
| POST | `/v1/StoreInstallation/UpdateStoreInstallation` | 更新安装信息 |
| POST | `/v1/StoreInstallation/DeleteStoreInstallation` | 删除安装信息 |
| GET | `/v1/StoreInstallation/GetInstallers` | 获取安装人员列表 |
| GET | `/v1/StoreInstallation/GetEquipmentById` | 根据设备ID获取设备信息 |
| GET | `/v1/StoreInstallation/GetEquipments` | 获取设备列表 |
| POST | `/v1/StoreInstallation/UploadEquipmentImageByUrls` | 上传设备图片 |
| GET | `/v1/StoreInstallation/GetImagesByinstallationId` | 根据安装编号和图片类型查询图片 |
| POST | `/v1/StoreInstallation/DeleteImageById` | 删除设备图片 |
| POST | `/v1/StoreInstallation/EditEquipmentImagesByEquipmentId` | 编辑设备图片 |
| GET | `/v1/StoreInstallation/GetDeviceInfoBySN` | 根据设备code查询对应的数据 |

### 28. StoreTree (门店树)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/StoreTree/StaffStoreTree` | 根据员工Token获取门店树 |
| GET | `/v1/StoreTree/GetStoreTreeAll` | 获取设备店铺树/匹配门店 |
| GET | `/v1/StoreTree/GetStoreTreeA` | 获取门店树 |
| POST | `/v1/StoreTree/GetAll` | 根据组织ID和门店ID获取经纬度 |

### 29. sys_menu (系统菜单)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/v1/sys_menu/GetMenuTreeList` | 获取所有系统菜单 |
| GET | `/v1/sys_menu/getmenubystaff` | 根据当前用户获取系统菜单 |
| POST | `/v1/sys_menu/add` | 添加菜单 |
| POST | `/v1/sys_menu/update/{id}` | 更新菜单 |

---

## 使用说明

1. 在开发新功能时，使用DevTools MCP工具打开 `http://gxcah.com:8077/swagger/index.html` 查看接口详情
2. 接口请求体和响应体的详细结构可在Swagger UI中展开对应接口查看
3. 所有接口需要JWT认证，登录接口为 `/v1/auth/login`

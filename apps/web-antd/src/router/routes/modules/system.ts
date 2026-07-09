import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'SystemManagement',
    path: '/system',
    meta: {
      icon: 'lucide:settings',
      order: 10,
      title: '系统管理',
    },
    children: [
      {
        name: 'UserManagement',
        path: '/system/user',
        meta: {
          icon: 'lucide:users',
          title: '用户管理',
        },
        children: [
          {
            name: 'OrganizationManagement',
            path: '/system/organization',
            component: () => import('#/views/system/organization/index.vue'),
            meta: {
              icon: 'lucide:building-2',
              title: '组织管理',
            },
          },
          {
            name: 'StaffManagement',
            path: '/system/staff',
            component: () => import('#/views/system/staff/index.vue'),
            meta: {
              icon: 'lucide:user-circle',
              title: '用户管理',
            },
          },
        ],
      },
    ],
  },
];

export default routes;

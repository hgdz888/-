import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:user-circle',
      order: 10,
      title: '个人信息绑定',
    },
    name: 'ProfileBinding',
    path: '/profile-binding',
    children: [
      {
        name: 'ProfileBindingIndex',
        path: 'index',
        component: () => import('#/views/profile-binding/index.vue'),
        meta: {
          icon: 'lucide:user-circle',
          title: '个人信息绑定',
        },
      },
    ],
  },
];

export default routes;

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta:{
      guest: true
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta:{
      guest: true
    }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta:{
      guest: true
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'profile-info',
        component: () => import('@/components/UserProfile/UserProfileInfo.vue'),
      },
      {
        path: 'user_projects',
        name: 'user-projects',
        component: () => import('@/components/UserProfile/UserProjects.vue')
      },
      {
        path: 'user_all_projects',
        name: 'user-all-projects',
        component: () => import('@/components/UserProfile/UserAllProjects.vue')
      },
      {
        path: 'subscriptions',
        name: 'subscriptions',
        component: () => import('@/components/UserProfile/UserSubscriptions.vue'),
      },
      {
        path: 'portfolio',
        name: 'portfolio',
        component: () => import('@/components/UserProfile/UserPortfolio.vue'),
      }
    ]
  },
  {
    path: '/logout',
    component: () => import('@/components/LogOut.vue')
  },
  {
    path: '/create_project',
    component: () => import('@/components/Project/CreateProject.vue')
  },
  {
    path: '/edit_project/:id',
    name: 'project-edit',
    props: true,
    component: () => import('@/components/Project/EditProject.vue')
  },
  {
    path: '/project_view/:id',
    name: 'project-view',
    props: true,
    component: () => import('@/views/ProjectInfoView.vue'),
    meta:{
      guest: true
    }
  },
  {
    path: '/project_view/:id/expertise',
    name: 'project-expertise',
    props: true,
    component: () => import('@/views/ProjectExpertiseView.vue'),
    children: [
      {
        path: '',
        name: 'project-expertise-info',
        props: true,
        component: () => import('@/components/Project/ProjectExpertiseInfo.vue'),
      },
      {
        path: 'select_experts',
        name: 'select-experts-form',
        props: true,
        component: () => import('@/components/Moderation/SelectExpertsForm.vue'),
      },
      {
        path: 'expertise-form',
        name: 'expertise-form',
        props: true,
        component: () => import('@/components/Expertise/ExpertiseForm.vue'),
      }
    ]
  },
  {
    path: '/project_view/:id/team',
    name: 'project-team',
    props: true,
    component: () => import('@/views/ProjectTeamView.vue'),
    children: [
      {
        path: '',
        name: 'project-team-info',
        props: true,
        component: () => import('@/components/Project/ProjectTeamInfo.vue'),
      },
      {
        path: 'select_team',
        name: 'select-team-form',
        props: true,
        component: () => import('@/components/Curation/TeamForm.vue'),
      },
      {
        path: 'select_team-members',
        name: 'select-team-members-form',
        props: true,
        component: () => import('@/components/Curation/SelectTeamMembersForm.vue'),
      },
    ]
  },
  {
    path: '/curation',
    name: 'curation',
    component: () => import('@/views/CurationView.vue'),
    children: [
      {
        path: '',
        component: () => import('@/components/Curation/CurationProjects.vue')
      },
      {
        path: 'my-projects',
        component: () => import('@/components/Curation/CurationMyProjects.vue'),
        children: [
          {
            path: '',
            component: () => import('@/components/Curation/CurationMyProjectsAll.vue'),
          },
          {
            path: 'current',
            component: () => import('@/components/Curation/CurationMyProjectsCurrent.vue'),
          },
          {
            path: 'completed',
            component: () => import('@/components/Curation/CurationMyProjectsCompleted.vue')
          },
        ]
      }
    ]
  },
  {
    path: '/moderation',
    name: 'moderation',
    component: () => import('@/views/ModerationView'),
    children: [
      {
        path: '',
        component: () => import('@/components/Moderation/ModerationRequests.vue'),
      },
      {
        path: 'my-requests',
        component: () => import('@/components/Moderation/ModerationMyRequests.vue'),
        children: [
          {
            path: '',
            component: () => import('@/components/Moderation/ModerationMyRequestsAll.vue'),
          },
          {
            path: 'current',
            component: () => import('@/components/Moderation/ModerationMyRequestsCurrent.vue'),
          },
          {
            path: 'completed',
            component: () => import('@/components/Moderation/ModerationMyRequestsCompleted.vue')
          },
          {
            path: 'rejected',
            component: () => import('@/components/Moderation/ModerationMyRequestsRejected.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/expertise',
    name: 'expertise',
    component: () => import('@/views/ExpertiseView'),
    children: [
      {
        path: '',
        component: () => import('@/components/Expertise/ExpertiseRequestsAll.vue'),
      },
      {
        path: 'new',
        component: () => import('@/components/Expertise/ExpertiseRequestsNew.vue'),
      },
      {
        path: 'rated',
        component: () => import('@/components/Expertise/ExpertiseRequestsRated.vue'),
      }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  const publicPages = ['login', 'register', 'home', 'project-view', 'project-team-info'];
  const authRequired = !publicPages.includes(to.name);
  const loggedIn = localStorage.getItem('user');
  // trying to access a restricted page + not logged in
  // redirect to login page
  if (authRequired && !loggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router

<template>
  <div id="app">
    <Toast />
    <ConfirmDialog></ConfirmDialog>
    <div class="menu-fixed" :class="{ menu_fixed_scroll: ifScroll }">
      <Menubar :model="items">
        <template #end>
          <div class="btn-auth-list" v-if="!currentUser">
            <router-link to="/login" class="btn-auth-list-item">
              <Button id="btn-menu-signin">Войти</Button>
            </router-link>
            <div class="vl btn-auth-list-item"></div>
            <router-link to="/register" class="btn-auth-list-item">
              <Button id="btn-menu-register">Зарегистрироваться</Button>
            </router-link>
          </div>
          <div v-else class="menu-end">
            <router-link :to="'/create_project'">
              <Button
                  v-if="checkCreateProjectPermissions"
                  id="btn-create-project"
                  label="Создать проект"
                  icon="pi pi-plus"
                  class="mr-2">
              </Button>
            </router-link>
            <Button type="button" @click="toggle" icon="pi pi-user" class="p-button-rounded p-button-info"/>
            <Menu ref="menu" :model="profile_menu" :popup="true" />
          </div>
        </template>
      </Menubar>
    </div>
    <router-view class="main-container"/>
  </div>
</template>

<script>
import EventBus from "./common/EventBus";
export default {
  name: 'App',
  data() {
    return {
      ifScroll: false,
      profile_menu:[
        {
          label: 'Профиль',
          to: '/profile'
        },
        {
          label: 'Проекты',
          to: '/profile/user_all_projects',
          visible: () => {
            return this.checkCreateProjectPermissions;
          }
        },
        {
          label: 'Мои проекты',
          to: '/profile/user_projects',
          visible: () => {
            return this.checkCreateProjectPermissions;
          }
        },
        {
          label: 'Подписки',
          to: '/profile/subscriptions',
          visible: () => {
            return this.currentUser.roles.find(role => role.name === 'student');
          }
        },
        {
          label: 'Портфолио',
          to: '/profile/portfolio',
          visible: () => {
            return this.currentUser.roles.find(role => role.name === 'student');
          }
        },
        {
          label: 'Выйти',
          to: '/logout'
        }
      ],
      items: [
        {
          label: 'Главная',
          to: '/',
          icon: 'pi pi-home',
          role: 'public',
          visible: true
        },
        {
          label: 'Модерация',
          items: [
            {label: 'Заявки', to: '/moderation' },
            {label: 'Мои заявки', items: [
                {label: 'Все', to: '/moderation/my-requests'},
                {label: 'Текущие', to: '/moderation/my-requests/current'},
                {label: 'Завершенные', to: '/moderation/my-requests/completed'},
                {label: 'Отклоненные', to: '/moderation/my-requests/rejected'}
              ]
            }
          ],
          visible: () => {
            if(this.currentUser) {
              return this.currentUser.roles.find(role => role.name === 'moderator');
            }
          },
        },
        {
          label: 'Экспертиза',
          items: [
            {label: 'Все заявки', to: '/expertise'},
            {label: 'Новые заявки', to: '/expertise/new'},
            {label: 'Оцененные заявки', to: '/expertise/rated'}
          ],
          visible: () => {
            if(this.currentUser) {
              return this.currentUser.roles.find(role => role.name === 'expert');
            }
          }
        },
        {
          label: 'Курирование',
          items: [
            {label: 'Набор кураторов', to: '/curation' },
            {label: 'Мои проекты', items: [
                {label: 'Все', to: '/curation/my-projects'},
                {label: 'Текущие', to: '/curation/my-projects/current'},
                {label: 'Завершенные', to: '/curation/my-projects/completed'},
              ]
            }
          ],
          visible: () => {
            if(this.currentUser) {
              return this.currentUser.roles.find(role => role.name === 'curator');
            }
          },
        },
        {
          label: 'Войти',
          class: 'btn-auth-list-item-mobile',
          to: '/login',
          role: 'public',
          icon: 'pi pi-user',
          visible: () => {
            return !this.$store.state.auth.user;
          }
        },
        {
          label: 'Зарегистрироваться',
          class: 'btn-auth-list-item-mobile',
          to: '/register',
          role: 'public',
          icon: 'pi pi-user-plus',
          visible: () => {
            return !this.$store.state.auth.user;
          }
        },
        {
          label: 'Профиль',
          icon: 'pi pi-user',
          class: 'btn-auth-list-item-mobile',
          to: '/profile',
          visible: () => {
            return this.$store.state.auth.user;
          }
        },
        {
          label: 'Проекты',
          class: 'btn-auth-list-item-mobile',
          icon: 'pi pi-file',
          to: '/profile/user_all_projects',
          visible: () => {
            return this.$store.state.auth.user && this.checkCreateProjectPermissions;
          }
        },
        {
          label: 'Мои проекты',
          class: 'btn-auth-list-item-mobile',
          icon: 'pi pi-file',
          to: '/profile/user_projects',
          visible: () => {
            return this.$store.state.auth.user && this.checkCreateProjectPermissions;
          }
        },
        {
          label: 'Подписки',
          class: 'btn-auth-list-item-mobile',
          icon: 'pi pi-bookmark',
          to: '/profile/subscriptions',
          visible: () => {
            return this.$store.state.auth.user && this.currentUser.roles.find(role => role.name === 'student');
          }
        },
        {
          label: 'Портфолио',
          class: 'btn-auth-list-item-mobile',
          icon: 'pi pi-briefcase',
          to: '/profile/portfolio',
          visible: () => {
            return this.$store.state.auth.user && this.currentUser.roles.find(role => role.name === 'student');
          }
        },
        {
          label: 'Выйти',
          class: 'btn-auth-list-item-mobile',
          icon: 'pi pi-sign-out',
          to: '/logout',
          visible: () => {
            return this.$store.state.auth.user;
          }
        }
      ]
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    checkCreateProjectPermissions() {
      let check = false;
      if(this.currentUser) {
        this.$store.state.createProjectPermissions.forEach(el => {
          if (this.currentUser.roles.find(role => role.name === el)) {
            check = true;
          }
        })
      }
      return check;
    },
  },
  created() {
    this.loggedIn = localStorage.getItem('token');
  },
  mounted() {
    EventBus.on("logout", () => {
      this.logOut();
    });
    window.addEventListener('scroll', () => this.ifScroll = window.scrollY > 50);
  },
  beforeUnmount() {
    EventBus.remove("logout");
  },
  methods: {
    toggle(event) {
      this.$refs.menu.toggle(event);
    },
    logOut() {
      this.$store.dispatch('auth/logout');
      this.$router.push('/');
    }
  }
}
</script>

<style>
  #app {
    display: flex;
    flex-direction: column;
  }
  #btn-create-project {
    margin-right: 20px;
  }
  .vl {
    border-left: 2px solid #dee2e6;
  }
  .btn-auth-list {
    display: flex;
  }
  .btn-auth-list-item {
    margin: 0 5px;
  }
  .btn-auth-list-item-mobile {
    display: none;
  }
  .menu-end {
    width: auto;
  }
  .menu-fixed {
    position: fixed !important;
    width: 100%;
    z-index: 10;
  }
  .menu_fixed_scroll {
    -webkit-box-shadow: 0 4px 8px 0 rgba(34, 60, 80, 0.2);
  }
  @media (max-width: 960px) {
    #btn-create-project {
       margin-right: 0;
    }
    .p-button.p-button-icon-only.p-button-rounded {
      display: none;
    }
    .btn-auth-list {
      display: none;
    }
    .btn-auth-list-item-mobile {
      display: block;
    }
  }
</style>

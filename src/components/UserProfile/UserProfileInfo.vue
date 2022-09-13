<template>
  <div class="view-container">
    <div class="view-box" id="user-card">
      <div v-if="user_info !== null && user_info !== 'undefined'" class="card-container">
        <span class="header-text">Информация</span>
        <hr>
        <div class="user-info">
          <div class="user-avatar">
            <img class="icon-user" src="../../assets/icons/account_person_icon.svg">
          </div>
          <div class="user-info-container">
            <ul class="user-info-text">
              <span class="header-text-2">{{ userFullName }}</span>
              <hr>
              <li v-if="currentUser?.roles.find(role => role.name !== 'student')">
                <span>Организация: </span>
                <span>{{ user_info.organization }}</span>
              </li>
              <div v-if="currentUser?.roles.find(role => role.name === 'student')">
                <li>
                  <span>{{user_info.institute}}</span>
                </li>
                <li>
                  <span>{{user_info.specialty?.name}}</span>
                </li>
                <li>
                  <span>Группа: {{user_info.group}}</span>
                </li>
              </div>
              <hr>
              <li>
                <span>E-mail: </span>
                <span>{{ user_info.email }}</span>
              </li>
              <li>
                <span>Телефон: </span>
                <span>{{ user_info.phone }}</span>
              </li>
            </ul>
<!--            <Button v-if="currentUser?.roles.find(role => role.name === 'partner')" label="Редактировать информацию" class="p-button-lg"></Button>-->
          </div>
        </div>
      </div>
      <div v-else class="card">
        <div class="grid formgrid">
          <div class="field col-12 md:col-6 md:pr-6 pr-0">
            <div class="custom-skeleton p-4">
              <div class="flex mb-3">
                <Skeleton shape="circle" size="4rem" class="mr-2"></Skeleton>
                <div>
                  <Skeleton width="10rem" class="mb-2"></Skeleton>
                  <Skeleton width="5rem" class="mb-2"></Skeleton>
                  <Skeleton height=".5rem"></Skeleton>
                </div>
              </div>
              <Skeleton width="100%" height="150px"></Skeleton>
              <div class="flex justify-content-center mt-3">
                <Skeleton width="4rem" height="2rem"></Skeleton>
                <Skeleton width="4rem" height="2rem"></Skeleton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="checkCreateProjectPermissions" class="view-box">
      <div v-if="user_projects !== null && user_projects !== 'undefined'" class="view-box-1">
        <span class="header-text">Текущие проекты</span>
        <hr>
        <div v-if="getActualProjects?.length !== 0">
          <ul class="project-list" v-for="project in getActualProjects" :key="project.id">
            <li class="project-items">
              <router-link :to="`/project_view/${project.id}`">
                <a>{{ project.name }}</a>
              </router-link>
              <Badge :value="project.status" class="mr-2"></Badge>
            </li>
          </ul>
        </div>
        <span v-else>Нет текущих проектов</span>
      </div>
      <div v-else class="view-box-1">
        <div class="grid formgrid">
          <div class="field col-12 md:col-6">
            <Skeleton class="mb-2"></Skeleton>
            <Skeleton width="10rem" class="mb-2"></Skeleton>
            <Skeleton width="5rem" class="mb-2"></Skeleton>
            <Skeleton height="2rem" class="mb-2"></Skeleton>
            <Skeleton width="10rem" height="4rem"></Skeleton>
            <Skeleton width="5rem" class="mb-2"></Skeleton>
            <Skeleton width="10rem" class="mb-2"></Skeleton>
            <Skeleton width="5rem" class="mb-2"></Skeleton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserService from "@/services/user.service";
import EventBus from "@/common/EventBus";
export default {
  name: "UserProfileInfo",
  components: {},
  props: ['user_projects'],
  data() {
    return {
      user_info: null,
      statuses: this.$store.state.Status
    }
  },
  computed: {
    userFullName() {
      if(this.user_info) {
        return `${this.user_info.surname} ${this.user_info.name} ${this.user_info.patronymic}`;
      } else return ''
    },
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
    getActualProjects() {
      const remove_statuses = ['IN_ARCHIVE', 'COMPLETED', 'REJECTED']
      // eslint-disable-next-line no-unused-vars
      const {[remove_statuses]: _, ...other} = this.statuses;
      return this.user_projects.filter( project => Object.values(other).includes(project.status));
    },
  },
  created() {
    UserService.getUserProfileInfo().then(
        (response) => {
          this.user_info = response.data;
        },
        (error) => {
          this.user_info = null;
          if (error.response && error.response.status === 403) {
            EventBus.dispatch("logout");
          }
        }
    );
  },
}
</script>

<style scoped>
hr {
  width: 100%;
}
li {
  margin-top: 10px;
}
#user-card {
  flex-grow: 1;
  margin-right: 50px;
}
.p-skeleton {
  margin: 10px 0;
}
.icon-user {
  height: 240px;
  filter: invert(84%) sepia(0%) saturate(1%) hue-rotate(137deg) brightness(97%) contrast(80%);
}
.view-container {
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
}
.view-box {
  width: auto;
  flex-grow: 1;
}
.view-box-1 {
  width: 100%;
}
.card {
  width: 100%;
}
.card-container {
  width: 100%;
}
.user-info {
  display: flex;
  margin-top: 20px;
  width: 100%;
}
.user-info-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 30px;
  width: 100%;
}
.user-info-text {
  margin-bottom: 20px;
}
.user-avatar {
  border: 1px solid #dee2e6;
  border-radius: 5px;
  box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.2);
  padding: 10px;
}
.header-text {
  font-size: 26px;
}
.header-text-2 {
  font-size: 22px;
}
.project-list {
  width: 100%;
}
.project-items {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.p-badge {
  min-width: 180px;
}
.project-status {
  padding: 2px 10px;
  text-align: center;
  font-size: 14px;
}
.btn-edit-info {
  width: 100%;
  margin-top: 20px;
  justify-content: center;
}
.main-container {
  align-items: stretch;
}
@media (max-width: 768px) {
  .user-info {
    flex-direction: column;
  }
  .user-info-container {
    margin: 20px 0 0 0;
    width: auto;
  }
  .user-avatar {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .icon-user {
    width: 100%;
    height: 300px;
  }
}
@media (max-width: 1078px) {
  #user-card {
    margin-right: 0;
  }
  .view-container {
    flex-direction: column;
  }
}
</style>
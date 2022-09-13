<template>
  <div class="view-container">
    <router-view :user_projects="user_projects" />
  </div>
</template>

<script>
import UserService from "@/services/user.service";
import EventBus from "@/common/EventBus";
export default {
  name: "ProfileView",
  data() {
    return {
      user_projects: null
    }
  },
  methods: {
    getDate(date) {
      if(date instanceof Date)
        return date;
      else {
        //  Convert a "dd.MM.yyyy" string into a Date object
        let d = date.split(".");
        date = new Date(d[2] + '.' + d[1] + '.' + d[0]);
        return date;
      }
    },
    getDatetime(datetime) {
      if(datetime instanceof Date)
        return datetime;
      else {
        //  Convert a "dd.MM.yyyy hh:mm" string into a Date object
        let d = datetime.split(/\s/);
        let time = d[1].split(':');
        let date = d[0].split('.')
        datetime = new Date(date[2] + '.' + date[1] + '.' + date[0] + ' ' + time[0] + ':' + time[1]);
        return datetime;
      }
    },
  },
  mounted() {
    UserService.getUserProfileProjects().then(
        (response) => {
          response.data.forEach(project => {
            project.start_date = this.getDate(project.start_date);
            project.finish_date = this.getDate(project.finish_date);
            project.created_at = this.getDatetime(project.created_at);
          })
          response.data.sort((a, b) => (a.created_at < b.created_at) ? 1 : -1)
          this.user_projects = response.data;
        },
        (error) => {
          this.user_projects = null;
          if (error.response && error.response.status === 403) {
            EventBus.dispatch("logout");
          }
        }
    );
  }
}
</script>

<style scoped>

</style>
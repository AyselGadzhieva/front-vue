<template>
  <div class="view-container">
    <ProjectsContainer
        :projects="projects"
        :filter_statuses="filter_statuses"
        :items="items"
    />
  </div>
</template>

<script>
import UserService from "@/services/user.service";
import ProjectsContainer from "@/components/ProjectsContainer";
import EventBus from "@/common/EventBus";
export default {
  name: 'HomeView',
  components: {
    ProjectsContainer
  },
  data() {
    return {
      items: [
        {label: 'Главная', to: '/'},
      ],
      projects: [],
      filter_statuses: [
        this.$store.state.Status.SELECT_MEMBERS,
        this.$store.state.Status.IN_PROGRESS,
        this.$store.state.Status.COMPLETED,
        this.$store.state.Status.IN_ARCHIVE
      ],
    }
  },
  mounted() {
    UserService.getProjectsPublic().then(
        (response) => {
          response.data.forEach(project => {
            project.start_date = this.getDate(project.start_date);
            project.finish_date = this.getDate(project.finish_date);
            project.created_at = this.getDatetime(project.created_at);
          })
          response.data.sort((a, b) => (a.created_at < b.created_at) ? 1 : -1)
          this.projects = response.data;
        },
        (error) => {
          if (error.response && error.response.status === 403) {
            EventBus.dispatch("logout");
          }
        }
    );
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
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
  }
}
</script>

<style scoped>

</style>

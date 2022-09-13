<template>
  <ProjectsContainer
      :projects="projects"
      :filter_statuses="filter_statuses"
      :items="items"
  />
</template>

<script>
import ProjectsContainer from "@/components/ProjectsContainer";
import UserService from "@/services/user.service";
import EventBus from "@/common/EventBus";
export default {
  name: "ModerationRequests",
  components: {
    ProjectsContainer
  },
  data() {
    return {
      items: [
        {label: 'Модерация', to: '/moderation'},
        {label: 'Заявки', to: '/moderation'},
      ],
      projects: [],
      filter_statuses: [this.$store.state.Status.MODERATION]
    }
  },
  created() {
    UserService.getModerationRequests().then(
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
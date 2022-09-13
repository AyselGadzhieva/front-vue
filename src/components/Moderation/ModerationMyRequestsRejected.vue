<template>
  <ProjectsContainer
      :projects="rejectedRequests"
      :filter_statuses="filter_statuses"
      :items="items"
  />
</template>

<script>
import ProjectsContainer from "@/components/ProjectsContainer";
export default {
  name: "ModerationMyRequestsRejected",
  components: {
    ProjectsContainer
  },
  props: {
    projects: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      home: {icon: 'pi pi-home', to: '/'},
      items: [
        {label: 'Модерация', to: '/moderation'},
        {label: 'Мои заявки', to: '/moderation/my-requests'},
        {label: 'Отклоненные', to: '/moderation/my-requests/rejected'},
      ],
      filter_statuses: [this.$store.state.Status.REJECTED,],
    }
  },
  computed: {
    rejectedRequests() {
      return this.projects.filter(project => this.filter_statuses.includes(project.status));
    },
  }
}
</script>

<style scoped>

</style>
<template>
  <ProjectsContainer
      :projects="completedRequests"
      :filter_statuses="filter_statuses"
      :items="items"
  />
</template>

<script>
import ProjectsContainer from "@/components/ProjectsContainer";
export default {
  name: "ModerationMyRequestsCompleted",
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
      items: [
        {label: 'Модерация', to: '/moderation'},
        {label: 'Мои заявки', to: '/moderation/my-requests'},
        {label: 'Завершенные', to: '/moderation/my-requests/completed'},
      ],
      filter_statuses: [this.$store.state.Status.COMPLETED]
    }
  },
  computed: {
    completedRequests() {
      return this.projects.filter(project => this.filter_statuses.includes(project.status));
    },
  }
}
</script>

<style scoped>

</style>
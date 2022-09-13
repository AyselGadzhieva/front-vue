<template>
  <ProjectsContainer
      :projects="completedProjects"
      :filter_statuses="filter_statuses"
      :items="items"
  />
</template>

<script>
import ProjectsContainer from "@/components/ProjectsContainer";
export default {
  name: "CurationMyProjectsCompleted",
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
        {label: 'Курирование', to: '/curation'},
        {label: 'Мои проекты', to: '/curation/my-projects'},
        {label: 'Завершенные', to: '/moderation/my-requests/completed'},
      ],
      filter_statuses: [this.$store.state.Status.COMPLETED],
    }
  },
  computed: {
    completedProjects() {
      return this.projects.filter(project => this.filter_statuses.includes(project.status));
    },
  }
}
</script>

<style scoped>

</style>
<template>
  <ProjectsContainer
      :projects="currentProjects"
      :filter_statuses="filter_statuses"
      :items="items"
  />
</template>

<script>
import ProjectsContainer from "@/components/ProjectsContainer";
export default {
  name: "CurationMyProjectsCurrent",
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
        {label: 'Текущие', to: '/moderation/my-requests/current'},
      ],
      filter_statuses: [
          this.$store.state.Status.SELECT_CURATORS,
          this.$store.state.Status.CURATORS_SELECTED,
          this.$store.state.Status.SELECT_MEMBERS,
          this.$store.state.Status.MEMBERS_SELECTED,
          this.$store.state.Status.IN_PROGRESS
      ],
    }
  },
  computed: {
    currentProjects() {
      return this.projects.filter(project => this.filter_statuses.includes(project.status));
    },
  },
}
</script>

<style scoped>

</style>
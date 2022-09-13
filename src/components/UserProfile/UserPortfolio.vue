<template>
  <ProjectsContainer
      :projects="projectsPortfolio"
      :filter_statuses="filter_statuses"
      :items="items"
  />
</template>

<script>
import ProjectsContainer from "@/components/ProjectsContainer";

export default {
  name: "UserPortfolio",
  props: {
    user_projects: {
      type: Array,
      required: true
    }
  },
  components: {
    ProjectsContainer
  },
  data() {
    return {
      items: [
        {label: 'Профиль', to: '/profile'},
        {label: 'Портфолио', to: '/profile/portfolio'},
      ],
      filter_statuses:[this.$store.state.Status.COMPLETED]
    }
  },
  computed: {
    projectsPortfolio() {
      return this.user_projects?.filter(project => this.filter_statuses.includes(project.status));
    },
  },
}
</script>

<style scoped>

</style>
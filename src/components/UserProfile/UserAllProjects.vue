<template>
  <ProjectsContainer
      :projects="user_projects"
      :filter_statuses="filter_statuses"
      :items="items"
  />
</template>

<script>
import ProjectsContainer from "@/components/ProjectsContainer";
export default {
  name: "UserAllProjects",
  components: {
    ProjectsContainer
  },
  props: ['user_projects'],
  data() {
    return {
      items: [
        {label: 'Профиль', to: '/profile'},
        {label: 'Проекты', to: '/profile/user_all_projects'},
      ],
      filter_statuses: Object.values(this.$store.state.Status),
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    }
  },
}
</script>

<style scoped>
.view-container {
  display: flex;
  flex-direction: row;
}
@media (max-width: 880px) {
  .view-container {
    flex-direction: column;
  }
}
</style>
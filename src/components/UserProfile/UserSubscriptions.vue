<template>
  <ProjectsContainer
      :projects="projectsSubscriptions"
      :filter_statuses="filter_statuses"
      :items="items"
  />
</template>

<script>
import ProjectsContainer from "@/components/ProjectsContainer";

export default {
  name: "UserSubscriptions",
  components: {
    ProjectsContainer
  },
  props: ['user_projects'],
  data() {
    return {
      items: [
        {label: 'Профиль', to: '/profile'},
        {label: 'Подписки', to: '/profile/subscriptions'},
      ],
      filter_statuses: [this.$store.state.Status.SELECT_MEMBERS]
    }
  },
  computed: {
    projectsSubscriptions() {
      return this.user_projects?.filter(project => this.filter_statuses.includes(project.status));
    },
  },
}
</script>

<style scoped>

</style>
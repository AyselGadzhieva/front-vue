<template>
  <ProjectsContainer
      :projects="newRequests"
      :filter_statuses="filter_statuses"
      :items="items"
  />
</template>

<script>
import ProjectsContainer from "@/components/ProjectsContainer";
export default {
  name: "ExpertiseRequestsNew",
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
        {label: 'Экспертиза', to: '/expertise'},
        {label: 'Новые заявки', to: '/expertise/new'},
      ],
      filter_statuses: [this.$store.state.Status.EXAMINATION]
    }
  },
  computed: {
    newRequests() {
      return this.projects.filter(project => this.filter_statuses.includes(project.status));
    }
  }
}
</script>

<style scoped>

</style>
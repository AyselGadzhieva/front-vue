<template>
  <ProjectsContainer
      :projects="ratedRequests"
      :filter_statuses="filter_statuses"
      :items="items"
  />
</template>

<script>
import ProjectsContainer from "@/components/ProjectsContainer";
export default {
  name: "ExpertiseRequestsRated",
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
        {label: 'Оцененные заявки', to: '/expertise/rated'},
      ],
      filter_statuses: [
          this.$store.state.Status.RATED,
          this.$store.state.Status.SELECT_CURATORS,
          this.$store.state.Status.CURATORS_SELECTED,
          this.$store.state.Status.SELECT_MEMBERS,
          this.$store.state.Status.MEMBERS_SELECTED,
          this.$store.state.Status.IN_PROGRESS,
          this.$store.state.Status.IN_ARCHIVE,
          this.$store.state.Status.COMPLETED,
          this.$store.state.Status.REJECTED,
      ]
    }
  },
  computed: {
    ratedRequests() {
      return this.projects.filter(project => this.filter_statuses.includes(project.status));
    }
  }
}
</script>

<style scoped>

</style>
<template>
  <ProjectsContainer
      :projects="projects"
      :filter_statuses="filter_statuses"
      :items="items"
  />
</template>

<script>
import ProjectsContainer from "@/components/ProjectsContainer";
export default {
  name: "ModerationMyRequestsAll",
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
      ],
      filter_statuses: [
        this.$store.state.Status.MODERATION,
        this.$store.state.Status.EXAMINATION,
        this.$store.state.Status.RATED,
        this.$store.state.Status.SELECT_CURATORS,
        this.$store.state.Status.CURATORS_SELECTED,
        this.$store.state.Status.SELECT_MEMBERS,
        this.$store.state.Status.MEMBERS_SELECTED,
        this.$store.state.Status.IN_PROGRESS,
        this.$store.state.Status.IN_ARCHIVE,
        this.$store.state.Status.COMPLETED,
        this.$store.state.Status.REJECTED,
      ],
    }
  }
}
</script>

<style scoped>

</style>
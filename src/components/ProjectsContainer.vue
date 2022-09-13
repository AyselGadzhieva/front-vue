<template>
  <Breadcrumb :home="home" :model="items" />
  <div class="view-container-1">
    <ProjectFilter id="project-filter" :searchWithFilter="searchWithFilter" :projects="projects" :statuses="filter_statuses"/>
    <ProjectList :projects="filteredProjects"/>
  </div>
</template>

<script>
import ProjectList from "@/components/Project/ProjectList";
import ProjectFilter from "@/components/Project/ProjectFilter";
export default {
  name: "ProjectsContainer",
  components: {
    ProjectList,
    ProjectFilter
  },
  props: {
    projects: {
      type: Array,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    filter_statuses: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      home: {icon: 'pi pi-home', to: '/'},
      filtered_projects: null,
    }
  },
  computed: {
    filteredProjects() {
      return this.filtered_projects === null ? this.projects : this.filtered_projects;
    }
  },
  methods: {
    searchWithFilter(filteredProjects) {
      this.filtered_projects = filteredProjects;
    }
  }
}
</script>

<style scoped>
  .view-box {
    align-items: center;
  }
</style>
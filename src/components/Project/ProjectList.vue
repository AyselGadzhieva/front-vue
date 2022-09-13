<template>
  <DataView class="view-box" :value="projects" :layout="layout" :paginator="true" :rows="4" :sortOrder="sortOrder" :sortField="sortField">
    <template #header>
      <div class="grid grid-nogutter">
        <div class="col-6" style="text-align: left">
          <Dropdown v-model="sortKey" :options="sortOptions" optionLabel="label" placeholder="Сортировать по" @change="onSortChange($event)"/>
        </div>
      </div>
    </template>
    <template #grid="slotProps">
      <div class="product-grid-item card">
        <ProjectListItem class="project-list-item" :project="slotProps.data"/>
      </div>
    </template>
    <template #empty>Нет проектов</template>
  </DataView>
</template>

<script>
import ProjectListItem from "@/components/Project/ProjectListItem";
export default {
  name: "ProjectList",
  components: {
    ProjectListItem,
  },
  props: {
    projects: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      layout: 'grid',
      sortKey: null,
      sortOrder: null,
      sortField: null,
      sortOptions: [
        {label: 'Сначала новые', value: '!created_at'},
        {label: 'Сначала старые', value: 'created_at'},
      ]
    }
  },
  methods: {
    onSortChange(event){
      const value = event.value.value;
      const sortValue = event.value;

      if (value.indexOf('!') === 0) {
        this.sortOrder = -1;
        this.sortField = value.substring(1, value.length);
        this.sortKey = sortValue;
      }
      else {
        this.sortOrder = 1;
        this.sortField = value;
        this.sortKey = sortValue;
      }
    }
  }
}
</script>

<style scoped>
  .view-box {
    align-items: center;
  }
</style>
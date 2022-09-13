<template>
  <div class="view-box">
    <span class="project-view-box-label">Фильтр</span>
    <form class="card">
      <div class="card-item">
        <span>Название проекта:</span>
        <InputText
            id="name"
            v-model="filters.name"
            class="input-text"
            placeholder="Введите название проекта"
        />
      </div>
      <div class="card-item">
        <span>Тип проекта:</span>
        <MultiSelect
            v-model="filters.selectedTypes"
            :options="types"
            optionLabel="name"
            placeholder="Выберите тип проекта"
            :filter="true"
            class="multiselect-custom">
          <template #value="slotProps">
            <div
                v-for="option of slotProps.value"
                :key="option.code">
              <div>{{option.name}}</div>
            </div>
            <template v-if="!slotProps.value || slotProps.value.length === 0">
              Любой
            </template>
          </template>
          <template #option="slotProps">
            <div>
              <div>{{slotProps.option.name}}</div>
            </div>
          </template>
        </MultiSelect>
      </div>
      <div class="card-item">
        <span>Предметные области:</span>
        <MultiSelect
            v-model="filters.selectedAreas"
            :options="subject_areas"
            optionLabel="name"
            placeholder="Выберите предметные области"
            :filter="true"
            class="multiselect-custom">
          <template #value="slotProps">
            <div
                v-for="option of slotProps.value"
                :key="option.code">
              <div>{{option.name}}</div>
            </div>
            <template v-if="!slotProps.value || slotProps.value.length === 0">
              Все
            </template>
          </template>
          <template #option="slotProps">
            <div>
              <div>{{slotProps.option.name}}</div>
            </div>
          </template>
        </MultiSelect>
      </div>
      <div class="card-item">
        <span>Статус проекта:</span>
        <MultiSelect
            v-model="filters.selectedStatuses"
            :options="statuses"
            placeholder="Выберите статус проекта"
            :filter="true"
            class="multiselect-custom">
          <template #value="slotProps">
            <div
                v-for="option of slotProps.value"
                :key="option.code">
              <div>{{option}}</div>
            </div>
            <template v-if="!slotProps.value || slotProps.value.length === 0">
              Любой
            </template>
          </template>
          <template #option="slotProps">
            <div>{{slotProps.option}}</div>
          </template>
        </MultiSelect>
      </div>
      <div class="card-item">
        <span>Роль:</span>
        <MultiSelect
            v-model="filters.selectedRoles"
            :options="roles"
            optionLabel="name"
            placeholder="Выберите роль проекта"
            :filter="true"
            class="multiselect-custom">
          <template #value="slotProps">
            <div
                v-for="option of slotProps.value"
                :key="option.code">
              <div>{{option.name}}</div>
            </div>
            <template v-if="!slotProps.value || slotProps.value.length === 0">
              Любой
            </template>
          </template>
          <template #option="slotProps">
            <div>
              <div>{{slotProps.option.name}}</div>
            </div>
          </template>
        </MultiSelect>
      </div>
      <div class="card-item">
        <span>Дата начала:</span>
        <Calendar
            id="start-date"
            v-model="filters.start_date"
            :showIcon="true"
            dateFormat="dd.mm.yy"
            manualInput="true"
            :maxDate="filters.finish_date"
        />
      </div>
      <div class="card-item">
        <span>Дата окончания:</span>
        <Calendar
            id="finish-date"
            v-model="filters.finish_date"
            :showIcon="true"
            dateFormat="dd.mm.yy"
            manualInput="true"
            :minDate="filters.start_date"
        />
      </div>
      <div class="card-item card-item-btn">
        <Button id="btn-filter-search" label="Искать" @click="searchProject"></Button>
        <Button id="btn-filter-clear" icon="pi pi-filter-slash" label="Сбросить" class="p-button-outlined" @click="clearFilter"/>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: "ProjectFilter",
  props: ['searchWithFilter', 'projects', 'statuses'],
  data() {
    return {
      filters: {
        name: '',
        selectedTypes: [],
        selectedAreas: [],
        selectedStatuses: [],
        selectedRoles: [],
        start_date: null,
        finish_date: null
      },
      subject_areas: [
        {
          id: 1,
          name: 'Информационные технологии'
        },
        {
          id: 2,
          name: 'Математика'
        }
      ],
      types: [
        {
          id: 1,
          name: "Стартап"
        },
        {
          id: 2,
          name: "Задача"
        },
        {
          id: 3,
          name: "Проблема"
        }
      ],
      roles: [
        {
          id: 1,
          name: 'Frontend-разработчик'
        },
        {
          id: 2,
          name: 'Математик'
        },
        {
          id: 3,
          name: 'Backend-разработчик'
        }
      ],
      currentDate: new Date()
    }
  },
  methods: {
    getDate(date) {
      if(date instanceof Date)
        return date;
      else {
        //  Convert a "dd.MM.yyyy" string into a Date object
        let d = date.split(".");
        date = new Date(d[2] + '.' + d[1] + '.' + d[0]);
        return date;
      }
    },
    futureDate(add_month) {
      return new Date(
          this.currentDate.getFullYear(),
          this.currentDate.getMonth() + add_month,
          this.currentDate.getDay());
    },
    clearFilter() {
      this.filters.name = '';
      this.filters.selectedTypes = [];
      this.filters.selectedAreas = [];
      this.filters.selectedStatuses = [];
      this.filters.selectedRoles = [];
      this.filters.start_date = null;
      this.filters.finish_date = null;
    },
    searchProject() {
      let filteredProjects = [];
      filteredProjects = this.projects
          // filter name
          .filter(project => {
            return this.filters.name?.length === 0 || project.name.toLowerCase().includes(this.filters.name.toLowerCase());
          })
          // filter types
          .filter(project => {
            return this.filters.selectedTypes?.length === 0 || this.filters.selectedTypes.some(type => type.id === project.project_type.id);
          })
          // filter areas
          .filter(project => {
            return this.filters.selectedAreas?.length === 0 || this.filters.selectedAreas.some(area => {
              return project.subject_areas.some(project_area => {
                return area.id === project_area.id;
              })
            });
          })
          // filter statuses
          .filter(project => {
            return this.filters.selectedStatuses?.length === 0 || this.filters.selectedStatuses.some(status => status === project.status);
          })
          // filter roles
          .filter(project => {
            return this.filters.selectedRoles?.length === 0 || this.filters.selectedRoles.some(role => {
              return project.project_roles.some(project_role => {
                return role.id === project_role.id;
              })
            });
          })
          // filter start_date
          .filter(project => {
            return !this.filters.start_date || this.filters.start_date.toLocaleDateString() === project.start_date.toLocaleDateString();
          })
          // filter finish_date
          .filter(project => {
            return !this.filters.finish_date || this.filters.finish_date.toLocaleDateString() === project.finish_date.toLocaleDateString();
          })
      this.searchWithFilter(filteredProjects);
    }
  }
}
</script>

<style scoped>
  #btn-filter-search {
    min-width: 40%;
    margin-bottom: 15px;
  }
  .card {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .card-item {
    display: flex;
    flex-direction: column;
    margin: 15px 0 15px 0;
  }
  .card-item-btn {
    width: 100%;
  }
  .project-view-box-label {
    margin-bottom: 15px;
  }
  @media (min-width: 1250px) {
    .card-item-btn {
      flex-flow: row wrap;
      justify-content: space-between;
    }
    #btn-filter-search {
      margin-bottom: 0;
    }
  }
</style>
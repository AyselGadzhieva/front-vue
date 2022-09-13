<template>
  <router-link :to="{name: 'project-view', params: {id: project.id}}">
    <Button class="p-button-secondary project-card">
      <div class="project-card-content">
      <div class="project-card-content-1">
        <div id="project-name">{{ project.name }}</div>
      </div>
      <div class="project-card-content-1">
        <div class="project-card-content-2 left-item">
          <div class="project-card-content-3">
            <div>Тип проекта: </div>
            <div>{{ project.project_type }}</div>
          </div>
          <div class="project-card-content-3">
            <div>Сроки проекта: </div>
            <div>{{ project.start_date.toLocaleDateString() }} -> {{ project.finish_date.toLocaleDateString() }}</div>
          </div>
        </div>
        <div class="project-card-content-2">
          <div class="project-card-content-3">
            <div>Автор: </div>
            <div>{{ shortOwnerName }}</div>
          </div>
          <div class="project-card-content-3">
            <div>Участники: </div>
            <div>{{ notAvailableRoles }} из {{ countRoles }}</div>
          </div>
        </div>
      </div>
      <div class="project-card-content-1">{{ project.status }}</div>
    </div>
    </Button>
  </router-link>
</template>

<script>
export default {
  name: "ProjectListItem",
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  computed: {
    shortOwnerName() {
      return `${this.project.owner.surname} ${this.project.owner.name[0]}. ${this.project.owner.patronymic[0]}.`;
    },
    countRoles() {
      let count = 0;
      this.project.project_roles.map((role) => {
        return count += role.number_seats;
      })
      return count;
    },
    notAvailableRoles() {
      let count = 0;
      this.project.team.forEach(team => team.students.forEach(student => {
        if(student.student) {
          count++;
        }
      }))
      return count;
    },
  }
}
</script>

<style scoped>
  .project-card {
    width: fill-available;
    border-radius: 5px;
    border: transparent;
    box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.25);
    margin: 20px;
    padding: 20px 20px 0;
    background: linear-gradient(rgba(59, 67, 87, 0.7), rgba(59, 67, 87, 0.7)), url("/src/assets/images/logo3.png") no-repeat center / cover;
    color: white;
  }
  .p-button-secondary.project-card:hover {
    background: linear-gradient(rgba(59, 67, 87, 0.4), rgba(59, 67, 87, 0.4)), url("/src/assets/images/logo3.png") no-repeat center / cover ;
  }
  .project-card-content {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }
  #project-name {
    text-align: start;
    font-size: 22px;
    margin-bottom: 10px;
  }
  .project-card-content-1 {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    width: 100%;
  }
  .project-card-content-2 {
    display: flex;
    flex-direction: column;
  }
  .project-card-content-3 {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: start;
    margin-bottom: 10px;
  }
  .left-item {
    margin-right: 15px;
  }
  @media (max-width: 500px) {
    .p-paginator-bottom {
      width: 100% !important;
    }
    #project-name {
      font-size: 16px;
    }
    .project-card {
      font-size: 11px;
      margin: 5px;
    }
    .left-item {
      margin-right: 5px;
    }
  }
</style>
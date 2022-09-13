<template>
  <div class="project-view-main-container">
    <Button id="btn-return" class="p-button-outlined p-button-lg" icon="pi pi-backward" @click="$router.back()"/>
    <div class="view-container">
      <span id="project-name">Заявка на создание проекта</span>
      <ProjectForm ref="childComponent" :project="project"/>
      <div class="btn-list">
        <Button label="Отменить" class="p-button-raised p-button-lg p-button-text button-form left-item" @click="$router.back()"></Button>
        <Button label="Сохранить изменения" class="p-button-raised p-button-lg button-form" @click="editProject"></Button>
      </div>
    </div>
  </div>
</template>

<script>
import ProjectForm from "@/components/Project/ProjectForm";
import UserService from "@/services/user.service";
export default {
  name: "EditProject",
  components: {
    ProjectForm
  },
  props: {
    id: {
      required: true
    }
  },
  data() {
    return {
      project: ''
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
    editProject() {
      this.$refs.childComponent.getProjectFields().then(
          (res) => {
            if(res.form) {
              UserService.editProject(this.id, res.form).then(
                  () => {
                    this.$toast.add({severity: 'success', detail: 'Изменения сохранены', life: 3000});
                    this.$router.back();
                  },
                  (error) => {
                    this.$toast.add({severity: 'error', detail: 'Не удалось сохранить изменения', life: 3000});
                    console.log('Упс: ' + error.toString())
                  }
              );
            }
          },
          (error) => {
            console.log(error);
          }
      );
    },
  },
  mounted() {
    UserService.getProjectForEdit(this.id).then(
        (response) => {
          response.data.start_date = this.getDate(response.data.start_date);
          response.data.finish_date = this.getDate(response.data.finish_date);
          this.project = response.data;
        },
        (error) => {
          this.project =
              (error.response &&
                  error.response.data &&
                  error.response.data.message) ||
              error.message ||
              error.toString();
        }
    );
  },
}
</script>

<style scoped>
.main-container {
  justify-content: center;
}
.view-container {
  align-items: center;
}
</style>
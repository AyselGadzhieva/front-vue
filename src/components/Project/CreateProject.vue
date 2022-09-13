<template>
  <div class="project-view-main-container">
    <Button id="btn-return" class="p-button-outlined p-button-lg" icon="pi pi-backward" @click="$router.back()"/>
    <div class="view-container">
      <span id="project-name">Заявка на создание проекта</span>
      <ProjectForm ref="childComponent"/>
      <div class="btn-list">
        <Button label="Сохранить как черновик" class="p-button-raised p-button-lg p-button-text left-item" @click="createProjectDraft"></Button>
        <Button label="Отправить заявку на создание проекта" class="p-button-raised p-button-lg button-form" @click="createProject"></Button>
      </div>
    </div>
  </div>
</template>

<script>
import ProjectForm from "@/components/Project/ProjectForm";
import UserService from "@/services/user.service";
export default {
  name: "CreateProject",
  components: {
    ProjectForm
  },
  methods: {
    createProject() {
      this.$refs.childComponent.getProjectFields().then(
          (res) => {
            if(res.form) {
              this.$confirm.require({
                message: 'Вы уверены, что хотите отправить заявку на модерацию? Редактирование будет недоступно.',
                header: 'Подтверждение отправки заявки',
                icon: 'pi pi-info-circle',
                accept: () => {
                  UserService.createProject(res.form).then(
                      () => {
                        this.$toast.add({severity: 'success', detail: 'Заявка успешно создана', life: 3000});
                        this.$router.push('/profile/user_projects');
                      },
                      (error) => {
                        this.$toast.add({severity: 'error', detail: 'Не удалось создать заявку', life: 3000});
                        console.log('Упс: ' + error.toString())
                      }
                  );
                },
                reject: () => {
                  this.$confirm.close();
                }
              });
            }
          },
          (error) => {
            console.log(error);
          }
      );
    },
    createProjectDraft() {
      this.$refs.childComponent.getProjectFields().then(
          (res) => {
            if(res.form) {
              UserService.createProjectDraft(res.form).then(
                  () => {
                    this.$toast.add({severity: 'success', detail: 'Черновик сохранен', life: 3000});
                    this.$router.push('/profile/user_projects');
                  },
                  (error) => {
                    this.$toast.add({severity: 'error', detail: 'Не удалось сохранить черновик', life: 3000});
                    console.log('Упс: ' + error.toString())
                  }
              );
            }
          },
          (error) => {
            console.log(error);
          }
      );
    }
  }
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
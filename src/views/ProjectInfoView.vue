<template>
  <div class="project-view-main-container">
    <Button id="btn-return" class="p-button-outlined p-button-lg" icon="pi pi-backward" @click="$router.back()"/>
    <div class="view-container" v-if="project">
      <div class="view-container-label">
        <span id="project-name">{{ project.name }}</span>
        <router-link
            v-if="(currentUser?.id === project.moderator?.id && Object.values(removeStatuses(['SELECT_CURATORS', 'CURATORS_SELECTED', 'SELECT_MEMBERS', 'MEMBERS_SELECTED', 'IN_PROGRESS', 'IN_ARCHIVE', 'COMPLETED', 'REJECTED'])).includes(project.status))
            || (currentUser?.id === project.owner.id && project.status === statuses.DRAFT)"
            :to="{name: 'project-edit', params: {id: id}}">
          <Button id="btn-project-edit" icon="pi pi-pencil" class="p-button-outlined" />
        </router-link>
      </div>
      <div class="view-container-item">
        <div class="project-view">
          <div class="view-box">
            <span class="project-view-box-label">Предметные области проекта:</span>
            <ul v-for="area in project.subject_areas" :key="area.id">
              <li>{{ area.name }}</li>
            </ul>
          </div>
          <div class="view-box">
            <div class="project-view-box-1">
              <span class="project-view-box-label">Описание проекта:</span>
              <span>{{ project.description }}</span>
            </div>
            <span class="project-view-box-label">Тип проекта:</span>
            <span>{{ project.project_type }}</span>
          </div>
          <div class="view-box">
            <span class="project-view-box-label">Цели:</span>
            <ul class="ul-items-reverse" v-for="(goal, index) in project.goals" :key="goal.id">
              <li class="ul-items-list">
                <Badge class="ul-item badge-left" :value="index+1" size="large"></Badge>
                <span class="ul-item">{{ goal.text }}</span>
              </li>
            </ul>
          </div>
          <div class="view-box">
            <span class="project-view-box-label">Команда проекта:</span>

            <div id="roles-card" class="card">
              <DataTable :value="project.project_roles"
                         dataKey="id"
                         responsiveLayout="stack"
                         breakpoint="960px">
                <Column field="name" header="Роль" sortable></Column>
                <Column field="number_seats" header="Количество" sortable></Column>
                <Column field="availableRoles" header="Свободно" sortable>
                  <template #body="slotProps">
                    {{ this.availableRoles(slotProps.data.id) }}
                  </template>
                </Column>
                <Column field="subscribes.length" header="Подписки" sortable></Column>
                <Column v-if="currentUser?.roles.find(role => role.name === 'student') && project.status === statuses.SELECT_MEMBERS" >
                  <template #body="slotProps">
                    <Button v-if="slotProps.data.subscribes.findIndex(subscribe => subscribe.id === currentUser?.id) === -1"
                            type="button" icon="pi pi-check-circle"
                            label="Подписаться"
                            dataKey="id"
                            @click="subscribeTo(slotProps.data.id)">
                    </Button>
                    <Button v-else icon="pi pi-bookmark" label="Оформлено" disabled="disabled" />
                  </template>
                </Column>
              </DataTable>
            </div>

            <Button
                id="btn-project-team-info"
                class="p-button button-form"
                label="Просмотреть информацию"
                @click="$router.push({name: 'project-team-info', params: { id: id }})"
            />

          </div>
          <div class="view-box">
            <div class="project-view-box-1">
              <span class="project-view-box-label">Автор:</span>
              <span>{{ ownerFullName }}</span>
            </div>
            <div class="project-view-box-1">
              <span class="project-view-box-label">Дата подачи заявки:</span>
              <span>{{project.created_at.toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'})}}</span>
            </div>
            <div class="project-view-box-1">
              <span class="project-view-box-label">Сроки реализации проекта:</span>
              <ul>
                <li>Дата начала: {{ project.start_date.toLocaleDateString() }}</li>
                <li>Дата окончания: {{ project.finish_date.toLocaleDateString()  }}</li>
              </ul>
            </div>
            <span class="project-view-box-label">Статус проекта: </span>
            <Badge :value="project.status" class="mr-2"></Badge>
          </div>
          <div
              v-if="(currentUser?.id === project.moderator?.id && Object.values(removeStatuses(['DRAFT', 'MODERATION_REQUEST'])).includes(project.status))
              || (currentUser?.id === project.owner.id && Object.values(removeStatuses(['DRAFT', 'MODERATION_REQUEST', 'MODERATION'])).includes(project.status))
              || (project.expertise?.find(expert => expert.expert?.id === currentUser?.id) && Object.values(removeStatuses(['DRAFT', 'MODERATION_REQUEST', 'MODERATION'])).includes(project.status))"
              class="view-box">
            <span class="project-view-box-label">Экспертиза:</span>
            <div class="btn-list">
              <Button
                  id="btn-project-expertise-info"
                  class="p-button button-form left-item"
                  label="Просмотреть информацию"
                  @click="$router.push({name: 'project-expertise-info', params: {id: id}})"
              />
              <Button
                  id="btn-project-expertise-select"
                  v-if="(project.status === statuses.MODERATION || project.status === statuses.RATED)
                  && currentUser?.id === project.moderator?.id"
                  class="p-button button-form"
                  label="Выбрать экспертов"
                  @click="$router.push({name: 'select-experts-form', params: {id: id}})"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="btn-list" v-if="project.status === statuses.DRAFT
          && currentUser?.id === project.owner.id">
        <Button label="Удалить заявление" class="p-button-raised p-button-lg p-button-danger left-item" @click="deleteProjectDraft"></Button>
        <Button label="Отправить заявку на модерацию" class="p-button-raised p-button-lg button-form" @click="sendProjectForModeration"></Button>
      </div>
      <div v-if="currentUser?.roles.find(role => role.name === 'moderator')" class="btn-list">
        <Button
            v-if="project.status === statuses.MODERATION_REQUEST && project.owner.id !== currentUser?.id"
            class="p-button-lg p-button-raised button-form"
            label="Принять на модерацию"
            @click="acceptForModeration"
        />
        <Button
            v-if="project.status === statuses.MODERATION
            && currentUser?.id === project.moderator.id"
            class="p-button-lg p-button-danger p-button-raised button-form"
            label="Отклонить"
            @click="rejectModeratedRequest"
        />
        <Button
            v-if="project.status === statuses.RATED
            && currentUser?.id === project.moderator.id"
            class="p-button-lg p-button-raised button-form"
            label="Отправить кураторам"
            @click="sendToCurators"
        />
        <Button
            v-if="project.status === statuses.CURATORS_SELECTED
            && currentUser?.id === project.moderator?.id"
            class="p-button-lg p-button-raised button-form"
            label="Начать набор участников"
            @click="startSelectMembersProject"
        />
        <Button
            v-if="project.status === statuses.MEMBERS_SELECTED
            && currentUser?.id === project.moderator.id"
            class="p-button-lg p-button-raised button-form"
            label="Начать работу над проектом"
            @click="startProject"
        />
      </div>
      <div v-if="currentUser?.roles.find(role => role.name === 'expert')
          && project.expertise?.find(expert => expert.expert.id === currentUser?.id)"
          class="btn-list">
        <Button
            v-if="project.status === statuses.EXAMINATION"
            class="p-button-lg p-button-raised button-form"
            label="Оценить"
            @click="$router.push({name: 'expertise-form', params: {id: id}})"
        />
      </div>
    </div>
  </div>
</template>

<script>
import UserService from "@/services/user.service";

export default {
  name: "ProjectInfoView",
  props: {
    id: {
      required: true
    }
  },
  data() {
    return {
      statuses: this.$store.state.Status,
      project: null
    }
  },
  created () {
    UserService.getProjectPublic(this.id).then(
        (response) => {
          response.data.start_date = this.getDate(response.data.start_date);
          response.data.finish_date = this.getDate(response.data.finish_date);
          response.data.created_at = this.getDatetime(response.data.created_at);
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
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
    ownerFullName() {
      if(this.project.owner) {
        return `${this.project.owner.surname} ${this.project.owner.name} ${this.project.owner.patronymic}`;
      } else return ''
    },
  },
  methods: {
    removeStatuses(remove_values) {
      let o = Object.assign({}, this.statuses);
      for (let n of remove_values) delete o[n];
      return o;
    },
    getDate(date) {
      if(date instanceof Date)
        return date
      else {
        //  Convert a "dd.MM.yyyy" string into a Date object
        let d = date.split(".");
        date = new Date(d[2] + '.' + d[1] + '.' + d[0]);
        return date;
      }
    },
    getDatetime(datetime) {
      if(datetime instanceof Date)
        return datetime;
      else {
        //  Convert a "dd.MM.yyyy hh:mm" string into a Date object
        let d = datetime.split(/\s/);
        let time = d[1].split(':');
        let date = d[0].split('.')
        datetime = new Date(date[2] + '.' + date[1] + '.' + date[0] + ' ' + time[0] + ':' + time[1]);
        return datetime;
      }
    },
    availableRoles(id) {
      let role = this.project.project_roles.find(role => role.id === id)
      let count = role.number_seats;
      this.project.team.forEach(team => {
        team.students?.forEach(student_role => {
          if(student_role.student && student_role.role?.id === role.id) {
            count--;
          }
        })
      });
      return count;
    },
    subscribeTo(role_id) {
      this.$confirm.require({
        message: 'Вы уверены, что хотите подписаться на роль? Подписка на другие роли в проекте будет недоступна.',
        header: 'Подтверждение подписки',
        icon: 'pi pi-info-circle',
        accept: () => {
          UserService.subscribeTo(this.project.id, role_id).then(
              () => {
                location.reload();
                this.$toast.add({severity: 'success', detail: 'Подписка оформлена', life: 3000});
              },
              (error) => {
                if (error.response.status === 403) {
                  this.$toast.add({severity: 'error', detail: 'Уже оформлена подписка на роль в этом проекте', life: 3000});
                } else {
                  this.$toast.add({severity: 'error', detail: 'Не удалось подписаться на роль', life: 3000});
                }
              }
          );
        },
        reject: () => {
          this.$confirm.close();
        }
      });
    },
    sendProjectForModeration() {
      this.$confirm.require({
        message: 'Вы уверены, что хотите отправить заявку на модерацию? Редактирование будет недоступно.',
        header: 'Подтверждение отправки заявки',
        icon: 'pi pi-info-circle',
        accept: () => {
          UserService.sendProjectForModeration(this.project.id).then(
              () => {
                this.$toast.add({severity: 'success', detail: 'Заявка отправлена на модерацию', life: 3000});
                this.$router.push('/profile/user_projects');
              },
              (error) => {
                this.$toast.add({severity: 'error', detail: 'Не удалось отправить заявку на модерацию', life: 3000});
                console.log('Упс: ' + error.toString())
              }
          );
        },
        reject: () => {
          this.$confirm.close();
        }
      });
    },
    deleteProjectDraft() {
      this.$confirm.require({
        message: 'Вы уверены, что хотите удалить заявку?',
        header: 'Подтверждение удаления',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: () => {
          UserService.deleteProjectDraft(this.project.id).then(
              () => {
                this.$toast.add({severity: 'success', detail: 'Заявка удалена', life: 3000});
                this.$router.push('/profile/user_projects');
              },
              (error) => {
                this.$toast.add({severity: 'error', detail: 'Не удалось удалить заявку', life: 3000});
                console.log(error);
              }
          );
        },
        reject: () => {
          this.$confirm.close();
        }
      });
    },
    acceptForModeration() {
      this.$confirm.require({
        message: 'Вы уверены, что хотите принять заявку на модерацию?',
        header: 'Подтверждение принятия заявки',
        icon: 'pi pi-info-circle',
        accept: () => {
          UserService.acceptForModeration(this.project.id).then(
              () => {
                this.$toast.add({severity: 'success', detail: 'Заявка принята на модерацию', life: 3000});
                this.$router.push('/moderation/my-requests/current');
              },
              (error) => {
                this.$toast.add({severity: 'error', detail: 'Не удалось принять заявку на модерацию', life: 3000});
                console.log(error);
              }
          );
        },
        reject: () => {
          this.$confirm.close();
        }
      });
    },
    rejectModeratedRequest() {
      this.$confirm.require({
        message: 'Вы уверены, что хотите отклонить заявку?',
        header: 'Подтверждение отклонения',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: () => {
          UserService.rejectModeratedRequest(this.project.id).then(
              () => {
                this.$toast.add({severity: 'success', detail: 'Заявка отклонена', life: 3000});
                this.$router.push('/moderation/my-requests/current');
              },
              (error) => {
                this.$toast.add({severity: 'error', detail: 'Не удалось отклонить заявку', life: 3000});
                console.log(error);
              }
          );
        },
        reject: () => {
          this.$confirm.close();
        }
      });
    },
    sendToCurators() {
      this.$confirm.require({
        message: 'Вы уверены, что хотите начать набор кураторов? Редактирование будет недоступно',
        header: 'Подтверждение отправки кураторам',
        icon: 'pi pi-info-circle',
        accept: () => {
          UserService.sendToCurators(this.project.id).then(
              () => {
                this.$toast.add({severity: 'success', detail: 'Проект отправлен кураторам', life: 3000});
                this.$router.push('/moderation/my-requests/current');
              },
              (error) => {
                this.$toast.add({severity: 'error', detail: 'Не удалось отправить проект кураторам', life: 3000});
                console.log(error);
              }
          );
        },
        reject: () => {
          this.$confirm.close();
        }
      });
    },
    startSelectMembersProject() {
      this.$confirm.require({
        message: 'Вы уверены, что хотите начать набор участников? Редактирование будет недоступно',
        header: 'Подтверждение начала набора участников',
        icon: 'pi pi-info-circle',
        accept: () => {
          UserService.startSelectMembersProject(this.project.id).then(
              () => {
                this.$toast.add({severity: 'success', detail: 'Начат набор участников в команду', life: 3000});
                this.$router.push('/moderation/my-requests/current');
              },
              (error) => {
                this.$toast.add({severity: 'error', detail: 'Не удалось начать набор участников', life: 3000});
                console.log(error);
              }
          );
        },
        reject: () => {
          this.$confirm.close();
        }
      });
    },
    startProject() {
      this.$confirm.require({
        message: 'Вы уверены, что хотите начать работу над проектом?',
        header: 'Подтверждение начала работы над проектом',
        icon: 'pi pi-info-circle',
        accept: () => {
          UserService.startProject(this.project.id).then(
              () => {
                this.$toast.add({severity: 'success', detail: 'Начата работа над проектом', life: 3000});
                this.$router.push('/moderation/my-requests/current');
              },
              (error) => {
                this.$toast.add({severity: 'error', detail: 'Не удалось начать работу над проектом', life: 3000});
                console.log(error);
              }
          );
        },
        reject: () => {
          this.$confirm.close();
        }
      });
    }
  }
}
</script>

<style scoped>
  #btn-project-team-info{
    margin-top: 30px;
  }
  .mr-2 {
    font-size: 0.9rem;
  }
  .view-container {
    align-items: center;
  }
  #roles-card {
    width: inherit;
  }
  .ul-items-list {
    min-width: 100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .ul-items-reverse {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  .ul-item {
    margin-bottom: 10px;
  }
  .badge-left {
    margin-right: 15px;
  }
</style>
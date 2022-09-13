<template>
  <div class="view-container">
    <div class="view-container-item">
      <div class="project-view">
        <div class="view-box">
          <span class="project-view-box-label">Список ролей проекта:</span>
          <div id="roles-card" class="card">
            <DataTable :value="roles"
                       dataKey="index"
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
              <Column v-if="currentUser?.roles.find(role => role.name === 'student') && status === statuses.SELECT_MEMBERS" >
                <template #body="slotProps">
                  <Button v-if="slotProps.data.subscribes.findIndex(subscribe => subscribe.id === currentUser.id) === -1"
                          type="button" icon="pi pi-check-circle"
                          label="Подписаться"
                          @click="subscribeTo(slotProps.data.id)">
                  </Button>
                  <Button v-else icon="pi pi-bookmark" label="Оформлено" disabled="disabled" />
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
        <div class="view-box">
          <span class="project-view-box-label">Список команд проекта:</span>
          <span v-if="teams.length === 0">Команды еще не сформированы</span>
          <TabView v-else v-model:activeIndex="active" :scrollable="true">
            <TabPanel v-for="tab in teams" :key="tab.id">
              <template #header>
                <Avatar v-if="tab.curator" :label="tab.curator.surname[0]"/>
                <Avatar v-else label="N"/>
              </template>
              <div id="curator-info">
                <h2>Куратор: </h2>
                <p v-if="tab.curator">{{ getFullName(tab.curator) }}</p>
                <p v-else>Куратор не выбран</p>
              </div>
              <div>
                <h2>Команда:</h2>
                <DataTable :value="tab.students"
                           responsiveLayout="stack"
                           breakpoint="960px"
                           dataKey="id">
<!--                  <Column field="id" header="#" sortable>-->
<!--                    <template #body="slotProps">-->
<!--                      <span>{{ slotProps.data.id + 1 }}</span>-->
<!--                    </template>-->
<!--                  </Column>-->
                  <Column field="role.name" header="Роль" sortable></Column>
                  <Column field="student" header="Студент" sortable>
                    <template #body="slotProps">
                      <span v-if="slotProps.data.student">{{getShortName(slotProps.data.student)}}</span>
                      <span v-else>Не назначен</span>
                    </template>
                  </Column>
                </DataTable>
                <Button v-if="status === statuses.SELECT_MEMBERS && tab.curator?.id === this.currentUser?.id"
                        id="btn-project-team-select-members"
                        class="p-button button-form"
                        label="Выбрать участников в команду"
                        @click="$router.push({name: 'select-team-members-form', params: {id: id}})"
                />
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </div>
    <Button v-if="(status === statuses.SELECT_CURATORS) && currentUser?.roles.find(role => role.name === 'curator')"
            id="btn-project-team-create"
            class="p-button-lg p-button-raised button-form"
            label="Сформировать команду"
            @click="$router.push({name: 'select-team-form', params: {id: id}})"
    />
  </div>
</template>

<script>
import UserService from "@/services/user.service";
import EventBus from "@/common/EventBus";

export default {
  name: "ProjectTeamInfo",
  props: {
    id: {
      required: true
    }
  },
  data() {
    return {
      teams: [],
      roles: [],
      active: 0,
      status: null,
      statuses: this.$store.state.Status,
      displayModal: null
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    }
  },
  methods: {
    getFullName(user) {
      return `${user.surname} ${user.name} ${user.patronymic}`;
    },
    getShortName(user) {
      return `${user.surname} ${user.name[0]}. ${user.patronymic[0]}.`;
    },
    availableRoles(index) {
      let role = this.roles.find(role => role.id === index)
      let count = role.number_seats;
      this.teams.forEach(team => {
        team.students.filter(student_role => {
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
          UserService.subscribeTo(this.id, role_id).then(
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
  },
  mounted() {
    UserService.getTeamInfo(this.id).then(
        (response) => {
          this.teams = response.data.teams;
          this.roles = response.data.project_roles;
          this.status = response.data.status;
        },
        (error) => {
          if (error.response && error.response.status === 403) {
            EventBus.dispatch("logout");
          }
        }
    );
  },
}
</script>

<style scoped>
  #btn-project-team-select-members{
    margin-top: 15px;
  }
  .card {
    width: inherit;
  }
  .p-tabview{
    width: fill-available;
    border: 1px solid #dee2e6;
  }
</style>
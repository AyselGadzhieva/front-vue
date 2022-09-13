<template>
  <div class="view-container">
    <div class="view-container-item">
      <div class="project-view">
        <div class="view-box">
          <span class="project-view-box-label">Команда проекта:</span>
          <DataTable class="card" :value="team" responsiveLayout="scroll" dataKey="id">
            <Column field="id" header="#" sortable></Column>
            <Column field="role.name" header="Роль" sortable></Column>
            <Column field="student" header="Студент" sortable>
              <template #body="slotProps">
                <span v-if="slotProps.data.student">{{getShortName(slotProps.data.student)}}</span>
                <span v-else>Не назначен</span>
              </template>
            </Column>
            <Column>
              <template #body="slotProps">
                <Button v-if="!slotProps.data.student"
                        label="Назначить"
                        @click="approveStudent(slotProps.data)">
                </Button>
                <Button v-else label="Изменить" @click="approveStudent(slotProps.data)"></Button>
              </template>
            </Column>
          </DataTable>
          <Dialog header="Назначить на роль" v-model:visible="displayModal">
            <Listbox v-model="selectedStudent"
                     :options="roleSubscriptions"
                     :filter="true"
                     :optionLabel="id"
                     listStyle="max-height:250px"
                     filterPlaceholder="Искать студента">
              <template #option="slotProps">
                <div>{{getShortName(slotProps.option)}}</div>
              </template>
            </Listbox>
            <template #footer>
              <Button label="Отменить" icon="pi pi-times" @click="closeModalForm" class="p-button-text"/>
              <Button label="Сохранить" icon="pi pi-check" @click="saveStudent" />
            </template>
          </Dialog>
        </div>
      </div>
    </div>
    <Button id="btn-project-team-create"
            class="p-button-lg p-button-raised button-form"
            label="Сохранить команду"
            @click="saveTeam"
    />
  </div>
</template>

<script>
import UserService from "@/services/user.service";
import EventBus from "@/common/EventBus";

export default {
  name: "SelectTeamMembersForm",
  props: {
    id: {
      required: true
    }
  },
  data() {
    return {
      team: null,
      roles: [],
      selectedTeamIndex: null,
      selectedRole: null,
      selectedStudentId: null,
      selectedStudent: null,
      roleSubscriptions: null,
      displayModal: null
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    }
  },
  mounted() {
    UserService.getTeamAvailableRoles(this.id).then(
        (response) => {
          this.team = response.data.team;
          this.roles = response.data.project_roles;
        },
        (error) => {
          if (error.response && error.response.status === 403) {
            EventBus.dispatch("logout");
          }
        }
    );
  },
  methods: {
    getFullName(user) {
      return `${user.surname} ${user.name} ${user.patronymic}`;
    },
    getShortName(user) {
      return `${user.surname} ${user.name[0]}. ${user.patronymic[0]}.`;
    },
    getSubscription(team_role) {
      let id = this.roles.findIndex(role => role.id === team_role.role.id);
      let index_team = this.team.findIndex(team => team.id === team_role.id);
      return this.roles[id].subscribes.filter(subscribe => subscribe.status_subscribe === false
          || this.team[index_team].student?.id === subscribe.id);
    },
    approveStudent(team_role) {
      console.log(team_role)
      this.selectedRole = team_role;
      this.roleSubscriptions = this.getSubscription(team_role)
      let index_team = this.team.findIndex(role => role.id === this.selectedRole.id)
      let student = this.team[index_team].student;
      if(student) {
        let subscribe_id = this.roleSubscriptions.findIndex(subscribe => subscribe.id === student.id);
        this.selectedStudent = this.roleSubscriptions[subscribe_id];
        this.selectedStudentId = this.selectedStudent?.id;
      }
      this.displayModal = true;
    },
    closeModalForm() {
      this.selectedRole = null;
      this.selectedStudent = null;
      this.roleSubscriptions = null;
      this.displayModal = false;
    },
    //TODO исправить
    saveStudent() {
      if(this.selectedStudent) {
        let index = this.roles.findIndex(role => role.id === this.selectedRole.role.id);
        let subscribes = this.roles[index].subscribes;
        subscribes.find((subscribe, index, subscribes) => {
          if(subscribe.id === this.selectedStudent.id) {
            subscribes[index].status_subscribe = true;
          }
        })
        let index_team = this.team.findIndex(role => role.id === this.selectedRole.id)
        if(this.team[index_team].student) {
          let subscribes = this.roles[index].subscribes;
          subscribes.find((subscribe, index, subscribes) => {
            if(subscribe.id === this.team[index_team].student.id) {
              subscribes[index].status_subscribe = false;
            }
          })
        }
        this.team[index_team].student = {
          id: this.selectedStudent.id,
          surname: this.selectedStudent.surname,
          name: this.selectedStudent.name,
          patronymic: this.selectedStudent.patronymic
        };
      } else {
        let index_team = this.team.findIndex(role => role.id === this.selectedRole.id)
        this.team[index_team].student = null;
        let index = this.roles.findIndex(role => role.id === this.selectedRole.role.id);
        let subscribes = this.roles[index].subscribes;
        subscribes.find((subscribe, index, subscribes) => {
          if(subscribe.id === this.selectedStudentId) {
            subscribes[index].status_subscribe = false;
          }
        })
        // this.roles[index].subscribes.find(subscribe => {
        //   if(subscribe.id === this.selectedStudentId) {
        //     subscribe.status_subscribe = false;
        //   }
        // })
        this.selectedStudentId = null;
      }
      this.closeModalForm();
    },
    saveTeam() {
      if(this.team.findIndex(role => role.student !== null) === -1) {
        this.$toast.add({severity: 'error', detail: 'Нет назначенных ролей', life: 3000});
        return;
      }
      this.$confirm.require({
        message: 'Вы уверены, что хотите сохранить команду?',
        header: 'Подтверждение сохранения команды',
        icon: 'pi pi-info-circle',
        accept: () => {
          UserService.saveMembersTeam(this.id, this.team.filter(role => role.student !== null)).then(
              () => {
                this.$toast.add({severity: 'success', detail: 'Команда сохранена', life: 3000});
                this.$router.back();
              },
              (error) => {
                this.$toast.add({severity: 'error', detail: 'Не удалось сохранить команду', life: 3000});
                console.log('Упс: ' + error.toString())
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
  .card {
    width: inherit;
  }
</style>
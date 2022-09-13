<template>
  <div class="view-container">
    <div class="view-container-item">
      <div class="project-view">
        <div class="view-box">
          <span class="project-view-box-label">Выберите свою команду:</span>
          <PickList id="select-roles" v-model="roles_picker" listStyle="height:342px" dataKey="id">
            <template #sourceheader>
              Доступные роли
            </template>
            <template #targetheader>
              Выбранные роли
            </template>
            <template #item="slotProps">
              <div class="role-container">
                <Avatar v-if="!slotProps.item.student" class="student-avatar" label="N" shape="circle"/>
                <Avatar v-else class="student-avatar" :label="slotProps.item.student.surname[0]" shape="circle"/>
                <div class="role-info">
                  <span>{{slotProps.item.role.name}}</span>
                  <span v-if="!slotProps.item.student">Не назначен</span>
                  <span v-else>{{ shortName(slotProps.item.student) }}</span>
                </div>
              </div>
            </template>
          </PickList>
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
  name: "TeamForm",
  props: {
    id: {
      required: true
    }
  },
  data() {
    return {
      roles_picker: [[], []],
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  methods: {
    shortName(student) {
      return `${student.surname} ${student.name[0]}. ${student.patronymic[0]}.`;
    },
    saveTeam() {
      if(this.roles_picker[1].length === 0) {
        this.$toast.add({severity: 'error', detail: 'Нет выбранных ролей', life: 3000});
        return;
      }
      this.$confirm.require({
        message: 'Вы уверены, что хотите сохранить команду?',
        header: 'Подтверждение сохранения команды',
        icon: 'pi pi-info-circle',
        accept: () => {
          UserService.saveTeam(this.id, this.roles_picker[1]).then(
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
  },
  mounted() {
    UserService.getTeamInfo(this.id).then(
        (response) => {
          const project_roles = response.data.project_roles;
          const teams = response.data.teams;
          let my_team = [];
          let my_team_id = teams.findIndex(team => team.curator?.id === this.currentUser.id);
          if (my_team_id !== -1)
          {
            my_team = teams[my_team_id].students;
          }
          let available_roles = [];
          project_roles.filter(role => {
            if(this.currentUser?.roles.find(user_role => user_role.name === 'curator' && user_role.subject_areas.find(sub_area => sub_area.id === role.subject_area.id))) {
              let count = role.number_seats
              teams.forEach(team => {
                team.students.filter(student_role => {
                  if(student_role.role?.id === role.id) {
                    if(!team.curator) {
                      let id = 0;
                      if(available_roles.length > 0) {
                        id = available_roles[available_roles.length-1].id
                      }
                      available_roles.push({
                        id: id + 1,
                        student: student_role.student,
                        role: {
                          id: role.id,
                          name: role.name,
                          subject_area: role.subject_area
                        }
                      })
                    }
                    count--;
                  }
                })
              });
              while(count !== 0) {
                let id = 0;
                if(available_roles.length > 0) {
                  id = available_roles[available_roles.length-1].id
                }
                available_roles.push({
                  id: id + 1,
                  student: null,
                  role: {
                    id: role.id,
                    name: role.name,
                    subject_area: role.subject_area
                  }
                })
                count--;
              }
            }
          })
          this.roles_picker[0] = available_roles;
          this.roles_picker[1] = my_team;
        },
        (error) => {
          if (error.response && error.response.status === 403) {
            EventBus.dispatch("logout");
          }
        }
    );
  }
}
</script>

<style scoped>
  #select-roles {
    width: inherit;
  }
  .role-container {
    display: flex;
    font-size: 14px;
  }
  .role-info {
    display: flex;
    flex-direction: column;
  }
  .student-avatar {
    margin-right: 15px;
  }
</style>
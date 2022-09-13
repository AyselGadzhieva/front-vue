<template>
  <form class="project-form" @submit.prevent="getProjectFields">
    <div class="view-container-item">
      <div class="project-view">

        <div class="view-box">
          <span class="project-view-box-label">Название проекта:</span>
          <InputText
              id="name"
              v-model="v$.form.name.$model"
              class="input-text"
              :class="{'p-invalid':v$.form.name.$invalid && v$.form.name.$dirty}"
              placeholder="Введите название проекта"
          />
          <small v-if="v$.form.name.maxLength.$invalid" class="p-error">{{v$.form.name.maxLength.$message}}</small>
          <span v-else-if="v$.form.name.$error && v$.form.name.$dirty">
            <span class="error-list" id="name-error" v-for="(error, index) of v$.form.name.$errors" :key="index">
              <small class="p-error">{{error.$message}}</small>
            </span>
          </span>
        </div>

        <div class="view-box">
          <span class="project-view-box-label">Описание проекта:</span>
          <Textarea
              id="description"
              class="input-text"
              :class="{'p-invalid':v$.form.description.$invalid && v$.form.description.$dirty}"
              v-model="v$.form.description.$model"
              :autoResize="true"
              placeholder="Введите описание проекта"
              rows="5"
              cols="max"
          />
          <small v-if="v$.form.description.maxLength.$invalid" class="p-error">{{v$.form.description.maxLength.$message}}</small>
          <span v-else-if="v$.form.description.$error && v$.form.description.$dirty">
            <span class="error-list" id="description-error" v-for="(error, index) of v$.form.description.$errors" :key="index">
              <small class="p-error">{{error.$message}}</small>
            </span>
          </span>
        </div>

        <div class="view-box">
          <span class="project-view-box-label">Тип проекта:</span>
          <div class="project-view-box-container">
            <Dropdown
                :class="{'p-invalid':v$.form.project_type.$invalid && v$.form.project_type.$dirty}"
                v-model="v$.form.project_type.$model"
                :options="types"
                placeholder="Выберите тип проекта"
                style="min-width: 30%"
            />
          </div>
          <span v-if="v$.form.project_type.$error && v$.form.project_type.$dirty">
            <span class="error-list" id="selected-type-error" v-for="(error, index) of v$.form.project_type.$errors" :key="index">
              <small class="p-error">{{error.$message}}</small>
            </span>
          </span>
        </div>

        <div class="view-box">
          <span class="project-view-box-label">Цели:</span>
          <ul class="ul-items-list" v-for="(goal, index) in v$.form.goals.$model" :key="goal.id">
            <li class="ul-items">
              <span id="goal-text" class="ul-item">{{ goal.text }}</span>
              <div class="ul-item">
                <Button icon="pi pi-pencil" class="mr-2 goal-tool" @click="editGoal(goal)"/>
                <Button icon="pi pi-times" class="p-button-danger goal-tool" @click="deleteGoal(index)"/>
              </div>
            </li>
          </ul>
          <Button label="Добавить" icon="pi pi-plus" class="mr-2" @click="addGoal"/>
          <small v-if="v$.form.goals.maxLength.$invalid" class="p-error">{{v$.form.goals.maxLength.$message}}</small>
          <span v-else-if="v$.form.goals.$error">
            <span class="error-list" id="goals-error" v-for="(error, index) of v$.form.goals.$errors" :key="index">
              <small class="p-error">{{error.$message}}</small>
            </span>
          </span>
          <Dialog header="Цель проекта" v-model:visible="displayModalGoal">
            <InputText id="goal-text-input" :class="{'p-invalid':v$.goalText.$error}" v-model="v$.goalText.$model"/>
            <span v-if="v$.goalText.$invalid && v$.goalText.$dirty">
              <span class="error-list" id="goal-text-error" v-for="(error, index) of v$.goalText.$errors" :key="index">
                <small class="p-error">{{error.$message}}</small>
              </span>
            </span>
            <template #footer>
              <Button label="Отменить" icon="pi pi-times" @click="closeGoalForm" class="p-button-text"/>
              <Button label="Сохранить" icon="pi pi-check" @click="saveGoal(!v$.goalText.$invalid)" />
            </template>
          </Dialog>
        </div>

        <div class="view-box">
          <span class="project-view-box-label">Сроки реализации проекта:</span>
          <ul class="date-list">
            <li>Дата начала:</li>
            <li class="project-view-box-container">
              <Calendar
                  id="start-date"
                  :class="{'p-invalid':v$.form.start_date.$invalid && v$.form.start_date.$dirty}"
                  v-model="v$.form.start_date.$model"
                  :showIcon="true"
                  dateFormat="dd.mm.yy"
                  manualInput="true"
                  :minDate="currentDate"
                  :maxDate="form.finish_date"
              />
              <span v-if="v$.form.start_date.$error && v$.form.start_date.$dirty">
                <span class="error-list" id="start-date-error" v-for="(error, index) of v$.form.start_date.$errors" :key="index">
                  <small class="p-error">{{error.$message}}</small>
                </span>
              </span>
            </li>
          </ul>
          <ul>
            <li>Дата окончания:</li>
            <li class="project-view-box-container">
              <Calendar
                  id="finish-date"
                  :class="{'p-invalid':v$.form.finish_date.$invalid && v$.form.finish_date.$dirty}"
                  v-model="v$.form.finish_date.$model"
                  :showIcon="true"
                  dateFormat="dd.mm.yy"
                  manualInput="true"
                  :minDate="v$.form.start_date.$model"
                  :maxDate="futureDate(6)"
              />
              <small v-if="v$.form.finish_date.required.$invalid && v$.form.finish_date.$dirty" class="p-error">{{v$.form.finish_date.required.$message}}</small>
              <span v-else-if="v$.form.finish_date.$error && v$.form.finish_date.$dirty">
                <span class="error-list" id="finish-date-error" v-for="(error, index) of v$.form.finish_date.$errors" :key="index">
                  <small class="p-error">{{error.$message}}</small>
                </span>
              </span>
            </li>
          </ul>
        </div>

        <form class="view-box">
          <span class="project-view-box-label">Предметные области проекта:</span>
          <div class="project-view-box-container">
            <MultiSelect
                v-model="v$.form.subject_areas.$model"
                :options="subject_areas"
                optionLabel="name"
                placeholder="Выберите предметные области"
                :filter="true"
                class="multiselect-custom"
                :class="{'p-invalid':v$.form.subject_areas.$invalid && submitted}">
              <template #value="slotProps">
                <div
                    v-for="option of slotProps.value"
                    :key="option.code">
                  <div>{{option.name}}</div>
                </div>
                <template v-if="!slotProps.value || slotProps.value.length === 0">
                  Выберите предметные области
                </template>
              </template>
              <template #option="slotProps">
                <div>
                  <div>{{slotProps.option.name}}</div>
                </div>
              </template>
            </MultiSelect>
          </div>
          <small v-if="(v$.form.subject_areas.$invalid && submitted) || v$.form.subject_areas.$pending.$response" class="p-error">Обязательное поле</small>
        </form>

        <div class="view-box">
          <span class="project-view-box-label">Роли проекта:</span>
          <p v-if="currentUser?.roles.find(role => role.name === 'curator')" class="p-error">Вы являетесь куратором этого проекта</p>
          <div class="project-view-box-container">
            <MultiSelect
                id="select-role"
                v-model="form.project_roles"
                :options="availableRoles()"
                optionLabel="name"
                placeholder="Выберите роли проекта"
                :filter="true"
                class="multiselect-custom"
                dataKey="id"
                :class="{'p-invalid':v$.form.project_roles.$invalid && submitted}">
              <template #value="slotProps">
                <div
                    v-for="option of slotProps.value"
                    :key="option.id">
                  <div>{{option.name}}</div>
                </div>
                <template v-if="!slotProps.value || slotProps.value.length === 0">
                  Выберите роли проекта
                </template>
              </template>
              <template #option="slotProps">
                <div>{{slotProps.option.name}}</div>
              </template>
            </MultiSelect>
            <small v-if="(v$.form.project_roles.$invalid && submitted) || v$.form.project_roles.$pending.$response" class="p-error">Обязательное поле</small>
            <ul class="ul-items-list" v-for="role in v$.form.project_roles.$model" :key="role.id">
              <div class="list-roles">
                <li class="ul-items-reverse left-item">
                  <span class="ul-item">{{ role.name }}</span>
                  <InputNumber id="minmax-buttons" v-model="role.number_seats" mode="decimal" showButtons :min="1" :max="20" />
                </li>
                <li v-if="currentUser?.roles.find(role => role.name === 'student')" class="ul-items-reverse">
                  <Button v-if="v$.form.selected_role_id.$model !== role.id" label="Выбрать" @click="selectMyRole(role.id)"></Button>
                  <Button v-else label="Выбрано" disabled></Button>
                </li>
              </div>
            </ul>
            <small v-if="currentUser?.roles.find(role => role.name === 'student') && v$.form.selected_role_id.$invalid" class="p-error">Выберите свою роль</small>
          </div>
        </div>

        <div class="view-box">
          <span class="project-view-box-label">Вознаграждение:</span>
          <InputText
              id="remuneration"
              maxlength="150"
              v-model="v$.form.remuneration.$model"
              class="input-text"
              :class="{'p-invalid':v$.form.remuneration.$invalid && v$.form.remuneration.$dirty}"
              placeholder="Введите вознаграждение"
          />
          <span v-if="v$.form.remuneration.$error && v$.form.remuneration.$dirty">
            <span class="error-list" id="remuneration-error" v-for="(error, index) of v$.form.remuneration.$errors" :key="index">
              <small class="p-error">{{error.$message}}</small>
            </span>
          </span>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import {helpers, maxLength, requiredIf, required} from "@vuelidate/validators";
import {useVuelidate} from "@vuelidate/core";
import UserService from "@/services/user.service";
import EventBus from "@/common/EventBus";

export default {
  name: "ProjectForm",
  props: {
    project: {
      type: Object,
      default() {
        return {
          name: '',
          description: '',
          project_type: null,
          start_date: null,
          finish_date: null,
          subject_areas: null,
          project_roles: null,
          goals: [],
          remuneration: '',
        }
      }
    },
  },
  setup: () => ({ v$: useVuelidate() }),
  data() {
    return {
      form: {
        name: '',
        description: '',
        project_type: null,
        start_date: null,
        finish_date: null,
        subject_areas: null,
        project_roles: null,
        goals: [],
        remuneration: '',
        selected_role_id: null
      },
      types: [],
      subject_areas: [],
      roles: [],
      currentDate: new Date(),
      displayModalGoal: false,
      goalText: '',
      goalId: null,
      submitted: false,
    }
  },
  validations() {
    return {
      form: {
        name: {
          required: helpers.withMessage('Обязательное поле', required),
          maxLength: helpers.withMessage('Максимальная длина 150 символов', maxLength(150))
        },
        description: {
          required: helpers.withMessage('Обязательное поле', required),
          maxLength: helpers.withMessage('Максимальная длина 2500 символов', maxLength(2500))
        },
        project_type: {
          required: helpers.withMessage('Обязательное поле', required)
        },
        subject_areas: {
          required: helpers.withMessage('Обязательное поле', required)
        },
        project_roles: {
          required: helpers.withMessage('Обязательное поле', required),
        },
        goals: {
          required: helpers.withMessage('Добавьте цели в проект', required),
          maxLength: helpers.withMessage('Максимальное кол-во целей: 10', maxLength(10))
        },
        start_date: {
          required: helpers.withMessage('Обязательное поле', required)
        },
        finish_date: {
          required: helpers.withMessage('Обязательное поле', required),
        },
        remuneration: {
          required: helpers.withMessage('Обязательное поле', required),
          maxLength: helpers.withMessage('Максимальная длина 150 символов', maxLength(150))
        },
        selected_role_id: {
          requiredIfRoleSelected: requiredIf(this.$store.state.auth.user.roles.find(role => role.name === 'student')),
        }
      },
      goalText: {
        required: helpers.withMessage('Обязательное поле', required)
      }
    }
  },
  created() {
    let types = this.$store.state.Types;
    if(this.$store.state.auth.user.roles.find(role => role.name === 'student')) {
      types = this.removeValuesFromEnum(['TASK', 'PROBLEM'], this.$store.state.Types)
    }
    this.types = Object.values(types);
  },
  mounted() {
    UserService.getInfoForProjectForm().then(
        (response) => {
          console.log(response)
          this.subject_areas = response.data.subject_areas;
          this.roles = response.data.roles;
        },
        (error) => {
          console.log(error);
          if (error.response && error.response.status === 403) {
            EventBus.dispatch("logout");
          }
        }
    );
  },
  watch: {
    project: function() {
      this.form = {...this.project};
    },
    form: {
      handler() {
          if(this.form.subject_areas && this.form.project_roles){
            this.form.project_roles = this.form.project_roles.filter( role => this.availableRoles().find(r => r.id === role.id));
          }
        if(!this.form.project_roles || this.form.project_roles.findIndex(role => role.id === this.form.selected_role_id) === -1) {
          this.form.selected_role_id = null;
        }
        this.form.project_roles?.forEach((role, index) => {
          if (role.number_seats < 1) {
            this.form.project_roles[index].number_seats = 1;
          }
        })
      },
      deep: true
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.auth.user;
    },
  },
  methods: {
    availableRoles() {
      if(this.form.subject_areas) {
        return this.roles.filter( role => this.form.subject_areas.find(area => area.id === role.subject_area.id));
      } else return [];
    },
    removeValuesFromEnum(remove_values, select_enum) {
      let o = Object.assign({}, select_enum);
      for (let n of remove_values) delete o[n];
      return o;
    },
    futureDate(add_month) {
      return new Date(
          this.currentDate.getFullYear(),
          this.currentDate.getMonth() + add_month,
          this.currentDate.getDay());
    },
    addGoal() {
      if(this.v$.form.goals.$model.length !== 0) {
        this.goalId = this.v$.form.goals.$model[this.v$.form.goals.$model.length-1].id + 1;
      } else this.goalId = 0;
      this.displayModalGoal = true;
    },
    editGoal(goal) {
      this.goalId = goal.id;
      this.goalText = goal.text;
      this.displayModalGoal = true;
    },
    deleteGoal(index) {
      this.v$.form.goals.$model.splice(index, 1);
    },
    closeGoalForm() {
      this.goalText = '';
      this.goalId = null;
      this.v$.goalText.$dirty = false;
      this.displayModalGoal = false;
    },
    saveGoal(isFormValid) {
      if (!isFormValid) {
        this.v$.goalText.$touch();
        return;
      }
      let index = this.v$.form.goals.$model.findIndex(goal => goal.id === this.goalId);
      if(index !== -1) {
        this.v$.form.goals.$model[index].text = this.goalText;
      } else this.v$.form.goals.$model.push({ "id": this.goalId, "text": this.goalText } );
      this.closeGoalForm();
    },
    selectMyRole(id) {
      this.form.selected_role_id = id;
    },

    async getProjectFields() {
      this.submitted = true;
      const isFormCorrect = await this.v$.form.$validate();
      if (!isFormCorrect) {
        const el = document.querySelector(".p-invalid");
        el.scrollIntoView({behavior: "smooth", block: "center" });
        return {form: null}
      } else {
        return {
          form: {
            name: this.form.name,
            description: this.form.description,
            subject_areas: this.form.subject_areas,
            project_type: this.form.project_type,
            goals: this.form.goals,
            project_roles: this.form.project_roles,
            start_date: this.form.start_date.toLocaleDateString(),
            finish_date: this.form.finish_date.toLocaleDateString(),
            remuneration: this.form.remuneration,
            selected_role_id: this.form.selected_role_id
          }
        }
      }
    }
  }
}
</script>

<style scoped>
  #goal-text-input {
    width: 100%;
  }
  #goal-text {
    display: flex;
    flex-wrap: wrap;
    align-self: center;
  }
  .project-form {
    width: 100%;
  }
  .error-list {
    display: flex;
    flex-flow: column wrap;
  }
  .p-error {
    margin-top: 0.2rem;
  }
  .btn-delete-img {
    display: flex;
    justify-content: flex-end;
  }
  .project-images-list {
    display: flex;
    flex-wrap: wrap;
    margin-top: 15px;
  }
  .project-images-item {
    margin: 0 15px 15px 0;
  }
  .project-img {
    margin: 0 10px 10px 10px;
    border-radius: 5px;
  }
  .input-text {
    width: 100%;
  }
  .date-list {
    margin-bottom: 20px;
  }
  .ul-items-list {
    width: 100%;
  }
  .ul-items {
    display: flex;
    width: 100%;
    justify-content: space-between;
    border: 1px solid #ced4da;
    background-color: white;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 15px;
  }
  .ul-items-reverse {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .ul-item {
    display: flex;
    margin-right: 10px;
  }
  .goal-tool {
    margin-right: 5px;
    height: fit-content;
  }
  .list-roles {
    display: flex;
  }
  .project-view-box-container {
    display: flex;
    flex-direction: column;
    width: inherit;
  }
  li.field {
    display: flex;
    flex-direction: column;
  }
  @media (max-width: 600px) {
    .left-item {
      margin-right: 0;
    }
    .list-roles {
      flex-direction: column;
    }
  }
</style>
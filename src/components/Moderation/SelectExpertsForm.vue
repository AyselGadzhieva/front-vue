<template>
  <form class="project-form" @submit.prevent="sendToExperts()">
    <div class="view-container-item">
      <div class="project-view">

        <div class="view-box">
          <span class="project-view-box-label">Выбор экспертов:</span>
          <div class="list-items" v-for="(obj, index) in selectedExpertsArray" :key="index">
            <div class="list-items-1" :class="{'first-item': index === 0}">
              <div class="list-items-2">
                <Dropdown
                    id="select_sub_area"
                    v-model="obj.selectedArea"
                    :options="availableAreas"
                    optionLabel="name"
                    placeholder="Выберите предметную область"
                    :class="{'p-invalid':v$.selectedExpertsArray.$each.$response.$data[index].selectedArea.$invalid && submitted}"
                >
<!--                  :class="{'p-invalid':v$.selectedExpertsArray.$each.$response.$data[index].selectedArea.$invalid && submitted}"-->
                  <template #value="slotProps">
                    <template v-if="!slotProps.value || slotProps.value.length === 0">
                      Выберите предметную область
                    </template>
                    <template v-else>
                      {{obj.selectedArea.name}}
                    </template>
                  </template>
                </Dropdown>
                <small v-if="v$.selectedExpertsArray.$each.$response.$data[index].selectedArea.$invalid && submitted" class="p-error">Обязательное поле</small>
                <MultiSelect
                    id="select-role"
                    v-model="obj.experts"
                    :options="availableExperts(index)"
                    optionLabel="name"
                    placeholder="Выберите экспертов"
                    :filter="true"
                    class="multiselect-custom"
                    :class="{'p-invalid':v$.selectedExpertsArray.$each.$response.$data[index].experts.$invalid && submitted}"
                    >
                  <template #value="slotProps">
                    <div
                        v-for="option of slotProps.value"
                        :key="option.code">
                      <div>{{shortExpertName(option)}}</div>
                    </div>
                    <template v-if="!slotProps.value || slotProps.value.length === 0">
                      Выберите экспертов
                    </template>
                  </template>
                  <template #option="slotProps">
                    <div>{{shortExpertName(slotProps.option)}}</div>
                  </template>
                </MultiSelect>
                <small v-if="v$.selectedExpertsArray.$each.$response.$data[index].experts.$invalid && submitted" class="p-error">Обязательное поле</small>
              </div>
              <Button id="btn-delete"  v-if="index !== 0" icon="pi pi-times" class="p-button-rounded p-button-danger btn-right" @click="deleteSelect(index)"/>
            </div>
          </div>
          <Button label="Добавить" icon="pi pi-plus" @click="addSelects"/>
        </div>
      </div>
    </div>
    <Button class="p-button-lg p-button-raised button-form" label="Отправить на экспертизу" @click="sendToExperts"></Button>
  </form>
</template>

<script>
import UserService from "@/services/user.service";
import {helpers, required} from "@vuelidate/validators";
import {useVuelidate} from "@vuelidate/core";

export default {
  name: "SelectExpertsForm",
  props: {
    id: {
      required: true
    }
  },
  setup: () => ({ v$: useVuelidate() }),
  data() {
    return {
      projectAreas: [],
      subjectAreaExperts: [],
      selectedExpertsArray: [
        {
          selectedArea: null,
          experts: null
        }
      ],
      submitted: false,
    }
  },
  validations() {
    return {
      selectedExpertsArray: {
        $each: helpers.forEach({
          selectedArea: {
            required: helpers.withMessage('Обязательное поле', required),
          },
          experts: {
            required: helpers.withMessage('Обязательное поле', required),
          }
        }),
        checkSelectedExperts: (value) => {
          value.map((obj, index) => {
            obj.experts = obj.experts.filter(expert => this.availableExperts(index).includes(expert));
          })
          return true;
        }
      },
    }
  },
  created () {
    //TODO переписать запрос (передавать область в пропсах)
    UserService.getProjectPublic(this.id).then(
        (response) => {
          this.projectAreas = response.data.subject_areas;
        },
        (error) => {
          this.projectAreas =
              (error.response &&
                  error.response.data &&
                  error.response.data.message) ||
              error.message ||
              error.toString();
        }
    );
    UserService.getExperts().then(
        (response) => {
          console.log(response)
          this.subjectAreaExperts = response.data;
        },
        (error) => {
          console.log(error)
        }
    )
    // this.subjectAreaExperts = [
    //   {
    //     id: 4,
    //     surname: 'Петрушов',
    //     name: 'Алексей',
    //     patronymic: 'Сергеевич',
    //     subject_area: {
    //       id: 1,
    //       name: 'Информационные технологии'
    //     }
    //   }
    // ];
  },
  computed: {
    availableAreas() {
      if (this.projectAreas.length !== 0) {
        const dirtyAreas = this.projectAreas.filter(area => this.selectedExpertsArray.find(obj => obj.selectedArea?.id === area.id));
        return this.projectAreas.filter(area => !dirtyAreas.includes(area));
      } else return [];
    }
  },
  methods: {
    availableExperts(index) {
      if(this.selectedExpertsArray[index]?.selectedArea) {
        return this.subjectAreaExperts.filter(expert => this.selectedExpertsArray[index].selectedArea.id === expert.subject_area.id);
      } else return '';
    },
    shortExpertName(expert) {
      return `${expert.surname} ${expert.name[0]}.${expert.patronymic[0]}.`;
    },
    addSelects() {
      this.selectedExpertsArray.push({selectedArea: null, experts: null});
    },
    deleteSelect(index) {
      this.selectedExpertsArray.splice(index, 1);
    },
    sendToExperts() {
      this.submitted = true;
      let isFormValid = !this.v$.$invalid;
      if (!isFormValid) {
        return;
      }
      this.$confirm.require({
        message: 'Вы уверены, что хотите отправить заявку на экспертизу?',
        header: 'Подтверждение отправки заявки',
        icon: 'pi pi-info-circle',
        accept: () => {
          let experts_id = this.selectedExpertsArray.map(obj => obj.experts.map(expert => expert.id));
          UserService.sendToExperts(this.id, experts_id.flat()).then(
              () => {
                this.$toast.add({severity: 'success', detail: 'Заявка отправлена на экспертизу', life: 3000});
                this.$router.back();
              },
              (error) => {
                this.$toast.add({severity: 'error', detail: 'Не удалось отправить заявку на экспертизу', life: 3000});
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
#select_sub_area {
  margin-bottom: 5px;
}
.project-form {
  width: 100%;
}
.list-items {
  display: flex;
  margin-bottom: 30px;
  width: inherit;
}
.list-items-1 {
  display: flex;
  width: fill-available;
}
.list-items-2 {
  display: flex;
  flex-direction: column;
  width: 100%;
  color: #6c757d;
}
.view-container-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  width: 800px;
}
.btn-right {
  margin-left: 15px;
}
.first-item {
  margin-right: 3.295rem;
}
.p-button.p-button-icon-only {
  min-width: 2.357rem;
}
@media (max-width: 880px) {
  .view-container-item {
    width: 100%;
    margin: 20px 0;
  }
}
</style>
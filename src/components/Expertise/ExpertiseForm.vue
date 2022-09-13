<template>
  <form class="project-form" @submit.prevent="sendExpertise">
    <div class="view-container-item">
      <div class="project-view">

        <div class="view-box">
          <div class="project-view-box-1">
            <span class="project-view-box-label">Комментарий:</span>
            <Textarea
                id="description"
                class="input-text"
                :class="{'p-invalid':v$.form.comment.$invalid && v$.form.comment.$dirty}"
                v-model="v$.form.comment.$model"
                :autoResize="true"
                placeholder="Введите комментарий"
                rows="5"
                cols="max"
            />
            <small v-if="v$.form.comment.maxLength.$invalid" class="p-error">{{v$.form.comment.maxLength.$message}}</small>
            <span v-else-if="v$.form.comment.$error && v$.form.comment.$dirty">
              <span class="error-list" id="name-error" v-for="(error, index) of v$.form.comment.$errors" :key="index">
                <small class="p-error">{{error.$message}}</small>
              </span>
            </span>
          </div>
          <div class=" btn-list">
            <Button class="p-button-lg p-button-danger button-form left-item" icon="pi pi-thumbs-down" @click="gradeFalse"></Button>
            <Button class="p-button-lg p-button-success button-form" icon="pi pi-thumbs-up" @click="gradeTrue"></Button>
          </div>
          <small v-if="v$.form.grade.$error && v$.form.grade.$dirty" class="p-error">Поставьте оценку</small>
          <div v-if="click" class="project-view-box-1 margin-top">
            <span class="project-view-box-label">Итоги экспертизы:</span>
            <Badge v-if="v$.form.grade.$model" value="Пройдена" class="mr-2" size="large" severity="success"></Badge>
            <Badge v-else value="Не пройдена" class="mr-2" size="large" severity="danger"></Badge>
          </div>
        </div>
      </div>
    </div>
    <Button class="p-button-lg p-button-raised button-form" label="Отправить" @click="sendExpertise"></Button>
  </form>
</template>

<script>
import UserService from "@/services/user.service";
import {helpers, required, maxLength} from "@vuelidate/validators";
import {useVuelidate} from "@vuelidate/core";

export default {
  name: "ExpertiseForm",
  props: {
    id: {
      required: true,
    }
  },
  setup: () => ({ v$: useVuelidate() }),
  data() {
    return {
      form: {
        comment: null,
        grade: null
      },
      click: false,
    }
  },
  validations() {
    return {
      form: {
        comment: {
          required: helpers.withMessage('Обязательное поле', required),
          maxLength: helpers.withMessage('Максимальная длина 2500 символов', maxLength(2500))
        },
        grade: {
          required: helpers.withMessage('Поставьте оценку', required),
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
  },
  methods: {
    gradeTrue() {
      this.click = true;
      this.form.grade = true;
    },
    gradeFalse() {
      this.click = true;
      this.form.grade = false;
    },
    async sendExpertise() {
      const isFormCorrect = await this.v$.form.$validate();
      if (!isFormCorrect) {
        const el = document.querySelector(".p-invalid");
        el.scrollIntoView({behavior: "smooth", block: "center" });
      } else {
        this.$confirm.require({
          message: 'Вы уверены, что хотите отправить результат экспертизы?',
          header: 'Подтверждение отправки результатов',
          icon: 'pi pi-info-circle',
          accept: () => {
            UserService.sendExpertise(this.id, this.form).then(
                () => {
                  this.$toast.add({severity: 'success', detail: 'Результат экспертизы успешно отправлен', life: 3000});
                  this.$router.back();
                },
                (error) => {
                  this.$toast.add({severity: 'error', detail: 'Не удалось отправить результат экспертизы', life: 3000});
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
}
</script>

<style scoped>
  .p-button-success {
    background: #22C55E !important;
    border: 1px solid #22C55E !important;
  }
  .p-badge.p-badge-success {
    background-color: #22C55E !important;
  }
  .project-form {
    width: 100%;
  }
  .project-view-box-1 {
    width: 100%;
  }
  .margin-top {
    margin: 50px 0 0 0;
  }
  .button-form {
    width: 100% !important;
  }
  .view-container-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;
    width: 800px;
  }
  .input-text {
    width: 100%;
  }
  .p-badge {
    font-weight: normal;
  }
  @media (max-width: 880px) {
    .view-container-item {
      width: 100%;
      margin: 20px 0;
    }
  }
</style>
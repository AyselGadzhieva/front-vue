<template>
  <div class="reg-auth">
    <div class="reg-auth-container">
      <div class="card">
        <h2 class="text-center">Регистрация</h2>

        <form class="p-fluid" @submit.prevent="handleSubmit(!v$.$invalid)" autocomplete="off">

          <div class="field">
            <div class="p-float-label">
              <InputText id="surname" maxlength="256" v-model="v$.surname.$model" :class="{'p-invalid':v$.surname.$invalid && submitted}"/>
              <label for="surname" :class="{'p-error':v$.surname.$invalid && submitted}">Фамилия*</label>
            </div>
            <small v-if="(v$.surname.$invalid && submitted) || v$.surname.$pending.$response" class="p-error">Обязательное поле</small>
          </div>

          <div class="field">
            <div class="p-float-label">
              <InputText id="name" maxlength="256" v-model="v$.name.$model" :class="{'p-invalid':v$.name.$invalid && submitted}"/>
              <label for="name" :class="{'p-error':v$.name.$invalid && submitted}">Имя*</label>
            </div>
            <small v-if="(v$.name.$invalid && submitted) || v$.name.$pending.$response" class="p-error">Обязательное поле</small>
          </div>

          <div class="field">
            <div class="p-float-label">
              <InputText id="patronymic" v-model="patronymic"/>
              <label for="patronymic">Отчество</label>
            </div>
          </div>

          <div class="field">
            <div class="p-float-label p-input-icon-right">
              <i class="pi pi-building" />
              <InputText id="organization" maxlength="256" v-model="v$.organization.$model" :class="{'p-invalid':v$.organization.$invalid && submitted}"/>
              <label for="organization" :class="{'p-error':v$.organization.$invalid && submitted}">Организация*</label>
            </div>
            <small v-if="(v$.organization.$invalid && submitted) || v$.organization.$pending.$response" class="p-error">Обязательное поле</small>
          </div>

          <div class="field">
            <div class="p-float-label p-input-icon-right">
              <i class="pi pi-phone" />
              <InputMask id="phone" mask="+7 (999) 999-99-99" v-model="v$.phone.$model" :class="{'p-invalid':v$.phone.$invalid && submitted}"/>
              <label for="phone" :class="{'p-error':v$.phone.$invalid && submitted}">Телефон*</label>
            </div>
            <small v-if="(v$.phone.$invalid && submitted) || v$.phone.$pending.$response" class="p-error">Обязательное поле</small>
          </div>

          <div class="field">
            <div class="p-float-label p-input-icon-right">
              <i class="pi pi-envelope" />
              <InputText id="email" maxlength="256"  v-model="v$.email.$model" :class="{'p-invalid':v$.email.$invalid && submitted}" aria-describedby="email-error"/>
              <label for="email" :class="{'p-error':v$.email.$invalid && submitted}">Email*</label>
            </div>
            <small v-if="v$.email.email.$invalid && submitted" class="p-error">Введите корректный e-mail</small>
            <small v-else-if="(v$.email.required.$invalid && submitted) || v$.email.$pending.$response" class="p-error">Обязательное поле</small>
          </div>

          <div class="field">
            <div class="p-float-label">
              <Password autocomplete="new-password" id="password" minlength="5" maxlength="256" v-model="v$.password.$model" :class="{'p-invalid':v$.password.$invalid && submitted}" :feedback="false" toggleMask/>
              <label for="password" :class="{'p-error':v$.password.$invalid && submitted}">Пароль*</label>
            </div>
            <small v-if="(v$.password.$invalid && submitted) || v$.password.$pending.$response" class="p-error">Обязательное поле</small>
          </div>

          <div class="field">
            <div class="p-float-label">
              <Password autocomplete="new-password" id="confirm_password" minlength="5" maxlength="256" v-model="v$.confirm_password.$model" :class="{'p-invalid':v$.confirm_password.$invalid && submitted}" :feedback="false" toggleMask/>
              <label for="confirm_password" :class="{'p-error':v$.confirm_password.$invalid}">Подтвердите пароль*</label>
            </div>
            <small v-if="v$.confirm_password.sameAsPassword.$invalid && submitted" class="p-error">Пароли не совпадают</small>
            <small v-else-if="(v$.confirm_password.required.$invalid && submitted) || v$.confirm_password.$pending.$response" class="p-error">Обязательное поле</small>
          </div>

          <Button id="btn-register" type="submit" label="Зарегистрироваться" class="button-form" />

        </form>

        <router-link to="/login" class="switch-auth-form">
          <a>Есть аккаунт? Войти</a>
        </router-link>

        <div id="invalid-pass" class="p-error" v-if="error">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { email, required, sameAs} from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
export default {
  name: "RegisterView",
  setup: () => ({ v$: useVuelidate() }),
  data() {
    return {
      surname: '',
      name: '',
      patronymic: '',
      organization: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: '',
      error: false,
      message: '',
      submitted: false
    }
  },
  validations() {
    return {
      surname: {
        required
      },
      name: {
        required
      },
      organization: {
        required
      },
      phone: {
        required
      },
      email: {
        required,
        email
      },
      password: {
        required
      },
      confirm_password: {
        sameAsPassword: sameAs(this.password),
        required
      }
    }
  },
  computed: {
    loggedIn() {
      return this.$store.state.auth.status.loggedIn;
    },
  },
  created() {
    if (this.loggedIn) {
      this.$router.push("/profile");
    }
  },
  methods: {
    handleSubmit(isFormValid) {

      this.submitted = true;
      if (!isFormValid) {
        return;
      }
      this.$store.dispatch("auth/register",
          {
            "surname": this.surname,
            "name": this.name,
            "patronymic": this.patronymic,
            "organization": this.organization,
            "email": this.email,
            "phone": this.phone,
            "password": this.password
          }).then(
          () => {
            this.$router.push("/");
          },
      ).catch((error) => {
        this.error = true;
        if(error.response.status === 409) {
          this.message = 'Пользователь уже есть в системе';
        }
      });
    }
  }
}
</script>

<style scoped>
form {
  margin-top: 2rem;
}
.field {
  margin-bottom: 2rem;
}
@media (min-width: 576px) {
  .card {
    min-width: 350px;
  }
}
</style>
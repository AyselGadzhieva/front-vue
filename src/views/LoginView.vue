<template>
 <div class="reg-auth">
   <div class="reg-auth-container">
     <div class="card">
       <img class="icon-user" src="../assets/icons/user_account_profile_icon.svg">

       <form class="p-fluid" @submit.prevent="handleSubmit(!v$.$invalid)">

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
             <Password autocomplete="new-password" id="password" maxlength="256" v-model="v$.password.$model" :class="{'p-invalid':v$.password.$invalid && submitted}" :feedback="false" toggleMask/>
             <label for="password" :class="{'p-error':v$.password.$invalid && submitted}">Пароль*</label>
           </div>
           <small v-if="(v$.password.$invalid && submitted) || v$.password.$pending.$response" class="p-error">Обязательное поле</small>
         </div>

         <Button id="btn-signin" type="submit" label="Войти" class="button-form"/>

       </form>

       <router-link to="/register" class="switch-auth-form">
         <a>Нет аккаунта? Зарегистрироваться</a>
       </router-link>

       <div id="invalid-pass" class="p-error" v-if="error">
         {{ message }}
       </div>
     </div>
   </div>
 </div>
</template>

<script>
import { email, required} from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
export default {
  name: "LoginView",
  setup: () => ({ v$: useVuelidate() }),
  data() {
    return {
      email: '',
      password: '',
      error: false,
      message: '',
      submitted: false
    }
  },
  validations() {
    return {
      email: {
        required,
        email
      },
      password: {
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
      this.$store.dispatch("auth/login", {"email": this.email, "password": this.password}).then(
          () => {
            this.$router.push("/profile");
          },
      ).catch(() => {
        this.error = true;
        this.message = 'Неверный логин или пароль';
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
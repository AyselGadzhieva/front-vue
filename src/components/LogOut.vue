<template>
  <div></div>
</template>

<script>
export default {
  name: "LogOut",
  created(){
    this.$store.dispatch('auth/logout');
    this.$router.push('/');
  },
}
</script>

<style scoped>

</style>
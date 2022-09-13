<template>
  <div class="project-view-main-container">
    <Button id="btn-return" class="p-button-outlined p-button-lg" icon="pi pi-backward" @click="$router.back()"/>
    <div class="view-container">
      <span id="project-name">Экспертиза проекта</span>
      <router-view :id="id"></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: "ExpertiseView",
  props: {
    id: {
      required: true
    }
  },
}
</script>

<style scoped>
  .view-container {
    align-items: center;
  }
  .btn-list {
    display: flex;
    justify-content: space-between;
    width: 100%;
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
  @media (max-width: 580px) {
    .btn-list {
      flex-direction: column;
    }
  }
</style>
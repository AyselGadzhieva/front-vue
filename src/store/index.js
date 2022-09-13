import { createStore } from 'vuex'
import { auth } from "./auth.module";

export default createStore({
  state: {
    createProjectPermissions: [ 'student', 'curator', 'partner', 'expert' ],
    Status: {
      DRAFT: 'Черновик',
      MODERATION_REQUEST: 'Отправлена заявка',
      MODERATION: 'В обработке',
      EXAMINATION: 'На экспертизе',
      RATED: 'Оценен',
      SELECT_CURATORS: 'Отправлен кураторам',
      CURATORS_SELECTED: 'Кураторы определены',
      SELECT_MEMBERS: 'Набор участников',
      MEMBERS_SELECTED: 'Команда собрана',
      IN_PROGRESS: 'В процессе',
      IN_ARCHIVE: 'В архиве',
      COMPLETED: 'Завершён',
      REJECTED: 'Отклонён'
    },
    Types: {
      STARTUP: 'Стартап',
      TASK: 'Задача',
      PROBLEM: 'Проблема'
    }
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    auth,
  }
})

<template>
  <div class="view-container">
    <div class="view-container-item">
      <div class="project-view">

        <div class="view-box">
          <span class="project-view-box-label">Результаты экспертизы:</span>
          <TabView v-if="expertise && expertise?.length !== 0" v-model:activeIndex="active" :scrollable="true">
            <TabPanel v-for="(tab, index) in expertise" :key="index">
              <template #header>
                <Avatar v-if="tab.comments?.length === 0" :label="tab.expert?.surname[0]" shape="circle"/>
                <div v-else>
                  <Avatar v-if="sortGrade(tab.comments)" :label="tab.expert?.surname[0]" shape="circle" v-badge.success="`+`"/>
                  <Avatar v-else :label="tab.expert?.surname[0]" v-badge.danger="`-`"/>
                </div>
              </template>
              <h2>{{ expertFullName(index) }}</h2>
              <p v-if="tab.comments?.length === 0">Нет оценок</p>
              <ScrollPanel v-else style="width: 100%; height: 150px" class="custombar1">
                <div v-for="(comment, index) in sortComments(tab.comments)" :key="index">
                  <hr>
                  <div v-if="comment.comment">
                    <p>{{comment.comment}}</p>
                    <p>{{comment.datetime?.toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'})}}</p>
                    <Badge v-if="comment.grade" value="Пройдена" class="mr-2" severity="success"></Badge>
                    <Badge v-else value="Не пройдена" class="mr-2" severity="danger"></Badge>
                  </div>
                  <p v-else>Нет оценки</p>
                </div>
              </ScrollPanel>
              <h2>Предметная область:</h2>
              <p>{{tab.expert.subject_area.name}}</p>
              <h2>Результат экспертизы:</h2>
              <div v-if="tab.comments?.length !== 0">
                <Badge v-if="sortGrade(tab.comments)" value="Пройдена" class="mr-2" severity="success"></Badge>
                <Badge v-else value="Не пройдена" class="mr-2" severity="danger"></Badge>
              </div>
              <p v-else>Нет информации по экспертизе</p>
            </TabPanel>
          </TabView>
          <span v-else>Нет информации по экспертизе</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserService from "@/services/user.service";
import EventBus from "@/common/EventBus";

export default {
  name: "ProjectExpertiseInfo",
  props: {
    id: {
      required: true
    }
  },
  data() {
    return {
      active: 0,
      expertise: [],
    }
  },
  methods: {
    expertFullName(index) {
      return `${this.expertise[index].expert.surname} ${this.expertise[index].expert.name} ${this.expertise[index].expert.patronymic}`;
    },
    getDatetime(datetime) {
      if(datetime) {
        if(datetime instanceof Date)
          return datetime;
        else {
          //  Convert a "dd.MM.yyyy hh:mm" string into a Date object
          let d = datetime.split(/\s/);
          let time = d[1].split(':');
          let date = d[0].split('.')
          datetime = new Date(date[2] + '.' + date[1] + '.' + date[0] + ' ' + time[0] + ':' + time[1]);
          return datetime;
        }
      } else return null;
    },
    sortGrade(comments) {
      return comments.slice().sort((a, b) => b.datetime - a.datetime)[0].grade;
    },
    sortComments(comments) {
      return comments.slice().sort((a, b) => b.datetime - a.datetime);
    }
  },
  mounted() {
    UserService.getExpertiseInfo(this.id).then(
        (response) => {
          response.data.forEach(obj => obj.comments.forEach(comment => comment.datetime = this.getDatetime(comment.datetime)));
          this.expertise = response.data;
        },
        (error) => {
          if (error.response && error.response.status === 403) {
            EventBus.dispatch("logout");
          }
        }
    );
  },
}
</script>

<style scoped>
  .p-tabview{
    width: fill-available;
    border: 1px solid #dee2e6;
  }
</style>
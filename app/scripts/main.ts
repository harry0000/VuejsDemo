import Vue from "vue";
import ToDoApp from "./app";

new Vue({
  el        : "#app",
  template  : `<todo-app></todo-app>`,
  components: {
    "todo-app": ToDoApp,
  },
});

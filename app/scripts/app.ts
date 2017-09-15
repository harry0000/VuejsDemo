import Vue from "vue";
import Component from "vue-class-component";
import { Watch } from "vue-property-decorator";
import filters from "./filters";
import Storage from "./storage";
import ToDo from "./todo";

const todoStorage = new Storage();

@Component({
  template: `
    <section class="todoapp">
      <header class="header">
        <h1>todos</h1>
        <input class="new-todo"
               autofocus autocomplete="off"
               placeholder="What needs to be done?"
               v-model="newTodo"
               @keyup.enter="addTodo">
      </header>
      <section class="main" v-show="todos.length" v-cloak>
        <input class="toggle-all" type="checkbox" v-model="allDone">
        <ul class="todo-list">
          <li v-for="todo in filteredTodos"
              class="todo"
              :key="todo.id"
              :class="{ completed: todo.completed, editing: todo == editedTodo }">
            <div class="view">
              <input class="toggle" type="checkbox" v-model="todo.completed">
              <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
              <button class="destroy" @click="removeTodo(todo)"></button>
            </div>
            <input class="edit" type="text"
                   v-model="todo.title"
                   v-todo-focus="todo == editedTodo"
                   @blur="doneEdit(todo)"
                   @keyup.enter="doneEdit(todo)"
                   @keyup.esc="cancelEdit(todo)">
          </li>
        </ul>
      </section>
      <footer class="footer" v-show="todos.length" v-cloak>
            <span class="todo-count">
              <strong>{{ remaining }}</strong> {{ remaining | pluralize }} left
            </span>
        <ul class="filters">
          <li><a href="#/all" :class="{ selected: visibility == 'all' }">All</a></li>
          <li><a href="#/active" :class="{ selected: visibility == 'active' }">Active</a></li>
          <li><a href="#/completed" :class="{ selected: visibility == 'completed' }">Completed</a></li>
        </ul>
        <button class="clear-completed" @click="removeCompleted" v-show="todos.length > remaining">
          Clear completed
        </button>
      </footer>
    </section>`,
  filters: {
    pluralize(n: number) {
      return n === 1 ? "item" : "items";
    },
  },
  // a custom directive to wait for the DOM to be updated
  // before focusing on the input field.
  // http://vuejs.org/guide/custom-directive.html
  directives: {
    "todo-focus": (el: any, binding: any) => {
      if (binding.value) {
        el.focus();
      }
    },
  },
})
export default class ToDoApp extends Vue {
  // app initial state
  public visibility: string = "all";
  private todos: ToDo[] = todoStorage.fetch();
  private newTodo: string = "";
  private editedTodo: ToDo | null = null;
  private beforeEditCache: string = "";

  // watch todos change for localStorage persistence
  @Watch("todos", { deep: true })
  public handler(todos: ToDo[]) {
    todoStorage.save(todos);
  }

  // computed properties
  // http://vuejs.org/guide/computed.html
  get filteredTodos() { return filters[this.visibility](this.todos); }
  get remaining() { return filters.active(this.todos).length; }
  get allDone() { return this.remaining === 0; }
  set allDone(value) { this.todos.forEach((todo) => todo.completed = value); }

  // methods that implement data logic.
  // note there's no DOM manipulation here at all.
  public addTodo() {
    const value = this.newTodo && this.newTodo.trim();
    if (!value) {
      return;
    }
    this.todos.push({
      id: todoStorage.nextId(),
      title: value,
      completed: false,
    });
    this.newTodo = "";
  }

  public removeTodo(todo: ToDo) {
    this.todos.splice(this.todos.indexOf(todo), 1);
  }

  public editTodo(todo: ToDo) {
    this.beforeEditCache = todo.title;
    this.editedTodo = todo;
  }

  public doneEdit(todo: ToDo) {
    if (!this.editedTodo) {
      return;
    }
    this.editedTodo = null;
    todo.title = todo.title.trim();
    if (!todo.title) {
      this.removeTodo(todo);
    }
  }

  public cancelEdit(todo: ToDo) {
    this.editedTodo = null;
    todo.title = this.beforeEditCache;
  }

  public removeCompleted() {
    this.todos = filters.active(this.todos);
  }

  public mounted() {
    // handle routing
    const onHashChange = () => {
      const visibility = window.location.hash.replace(/#\/?/, "");
      if (filters[visibility]) {
        this.visibility = visibility;
      } else {
        window.location.hash = "";
        this.visibility = "all";
      }
    };

    window.addEventListener("hashchange", onHashChange);
    onHashChange();
  }
}

import store from "store";
import ToDo from "./todo";

// Full spec-compliant TodoMVC with localStorage persistence
// and hash-based routing in ~120 effective lines of JavaScript.
export default class Storage {
  // localStorage persistence
  private readonly STORAGE_KEY = "todos-vuejs-2.0";
  private uid = 0;

  public nextId() {
    this.uid++;
    return this.uid;
  }

  public fetch() {
    const todos: ToDo[] = JSON.parse(store.get(this.STORAGE_KEY, "[]"));
    todos.forEach((todo, index) => todo.id = index);
    this.uid = todos.length;
    return todos;
  }

  public save(todos: ToDo[]) {
    store.set(this.STORAGE_KEY, JSON.stringify(todos));
  }
}

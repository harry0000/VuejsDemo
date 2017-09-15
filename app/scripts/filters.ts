import ToDo from "./todo";

type ToDoFilter = (todos: ToDo[]) => ToDo[];

interface Filters {
  all: ToDoFilter;
  active: ToDoFilter;
  completed: ToDoFilter;
  [visibility: string]: ToDoFilter;
}

// visibility filters
const filters: Filters = {
  all:       (todos: ToDo[]) => todos,
  active:    (todos: ToDo[]) => todos.filter((todo) => !todo.completed),
  completed: (todos: ToDo[]) => todos.filter((todo) => todo.completed),
};

export default filters;

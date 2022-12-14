import { define, html } from 'hybrids';
import { store, State, redux, createTask, Task, updateTask, deleteTask } from './store';
import { groupBy } from 'lodash';
import { EntityCreate } from './entities/entity-create';
import { TasqItem } from './tasq-item';
import { TaskSchema } from './models';
import { MonacoEditor } from './monaco-editor/monaco-editor';
const components = { EntityCreate, TasqItem, MonacoEditor };
import styles from './tasq-manager.css';
// import { Store } from 'pinia';

// function useCounter<S extends Store<string, PiniaState, {}, PiniaActions>>(store: S) {
//   return {
//     count: pinia(store, (_, s) => s.count),
//     ...useActions(store, ({ increment, nothing }) => ({ increment, nothing })),
//   };
// }

export const TasqManager = define<any>({
  tag: 'tasq-manager',
  columns: redux(store, (_, state: State) => state.states.data),
  allTasks: redux(store, (_, state: State) => state.tasks.data),
  showArchived: false,
  filteredTasks: ({ allTasks, showArchived }) => allTasks.filter((t) => showArchived || !t.archived),
  tasks: ({ filteredTasks }) => groupBy(filteredTasks, 'state'),
  render: ({ columns, tasks, showArchived, filteredTasks }) =>
    html`
      <div class="container">
        ${columns.map(
          (column, i) => html`<div class="column">
            <header>
              <cam-box flex="space-between center">
                <b>${column.name}</b>
                ${i === 0 && html` <span>Total Tasks: ${filteredTasks.length}</span> `}
                ${i === columns.length - 1 &&
                html`
                  <button
                    class=" archive-filter transparent"
                    onclick="${html.set('showArchived', !showArchived)}"
                    title="${showArchived ? 'hide' : 'show'} archived"
                  >
                    <cam-icon>${showArchived ? 'archive' : 'menu'}</cam-icon>
                  </button>
                `}
              </cam-box>
            </header>
            <div class="tasks">
              ${i === 0 &&
              html`
                <div class="target"></div>
                <entity-create schema="${TaskSchema}" lock-id hide-readonly oncreate="${oncreate}"></entity-create>
              `}
              ${tasks[column.name]?.map(
                (task) =>
                  html`<tasq-item
                    key="${task.id}"
                    task="${task}"
                    onupdate="${onupdate}"
                    ondelete="${ondelete}"
                  ></tasq-item>`,
              )}
            </div>
          </div>`,
        )}
      </div>
      <footer></footer>
      <style>
        .container {
          grid-template-columns: repeat(${columns.length}, 1fr);
        }
      </style>
    `.style(styles),
});

function oncreate(host, e: CustomEvent & { detail: Task }) {
  store.dispatch(createTask(e.detail));
}

function onupdate(host, e: CustomEvent & { detail: Partial<Task> }) {
  store.dispatch(updateTask(e.detail));
}

function ondelete(host, e: CustomEvent & { detail: string }) {
  store.dispatch(deleteTask(e.detail));
}

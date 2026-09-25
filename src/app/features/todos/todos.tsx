import Pango from 'gi://Pango'
import { Gtk } from 'ags/gtk4'
import { For } from 'ags'
import { clsx } from 'clsx'
import { todos, type TodoItem } from '@/infrastructure/todos'

const cs = {
  root: 'todos',
  row: 'todo',
  text: 'todo-text',
  dot: 'todo-dot',

  done: '--done',
}

export function Todos() {
  return (
    <box class={cs.root} orientation={Gtk.Orientation.VERTICAL} visible={todos.items.as((it) => it.length > 0)}>
      <For each={todos.items}>
        {(item: TodoItem) => (
          <button
            class={clsx(cs.row, item.done && cs.done)}
            halign={Gtk.Align.END}
            focusable={false}
            onClicked={() => todos.toggle(item.line)}>
            <box>
              <label class={cs.text} label={item.text} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={36} />
              <box class={cs.dot} valign={Gtk.Align.CENTER} />
            </box>
          </button>
        )}
      </For>
    </box>
  )
}

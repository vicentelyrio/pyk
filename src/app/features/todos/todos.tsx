import Pango from 'gi://Pango'
import { Gtk } from 'ags/gtk4'
import { For } from 'ags'
import { clsx } from 'clsx'
import { todos, type TodoItem } from '@/infrastructure/todos'
import { alignFor, edgeFirst, type Side } from '@/ui/side'

const cs = {
  root: 'todos',
  row: 'todo',
  text: 'todo-text',
  dot: 'todo-dot',

  done: '--done',
}

export function Todos({ side }: { readonly side: Side }) {
  return (
    <box class={cs.root} orientation={Gtk.Orientation.VERTICAL} visible={todos.items.as((it) => it.length > 0)}>
      <For each={todos.items}>
        {(item: TodoItem) => (
          <button
            class={clsx(cs.row, item.done && cs.done)}
            halign={alignFor(side)}
            focusable={false}
            onClicked={() => todos.toggle(item.line)}>
            <box>
              {edgeFirst(
                side,
                <box class={cs.dot} valign={Gtk.Align.CENTER} />,
                <label class={cs.text} label={item.text} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={36} />,
              )}
            </box>
          </button>
        )}
      </For>
    </box>
  )
}

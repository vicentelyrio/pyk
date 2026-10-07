import type { TodoItem } from '../store/state'

const DONE = /^x\s+/
const DATE = /^\d{4}-\d{2}-\d{2}\s+/

export function parseTodos(text: string): readonly TodoItem[] {
  return text.split('\n').flatMap((raw, line) => {
    const trimmed = raw.trim()
    if (!trimmed) return []

    const done = DONE.test(trimmed)
    const body = done ? trimmed.replace(DONE, '').replace(DATE, '') : trimmed

    return body ? [{ line, text: body, done }] : []
  })
}

export function appendLine(text: string, todo: string): string {
  const line = todo.trim()
  if (!line) return text
  if (!text.trim()) return `${line}\n`

  return `${text.replace(/\n*$/, '')}\n${line}\n`
}

export function toggleLine(text: string, line: number): string {
  const lines = text.split('\n')
  const current = lines[line]
  if (current === undefined || !current.trim()) return text

  lines[line] = DONE.test(current.trim())
    ? current.trim().replace(DONE, '').replace(DATE, '')
    : `x ${current.trim()}`

  return lines.join('\n')
}

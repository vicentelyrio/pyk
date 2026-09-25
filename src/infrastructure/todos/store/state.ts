export interface TodoItem {
  readonly line: number
  readonly text: string
  readonly done: boolean
}

export interface TodosState {
  readonly file: string
  readonly items: readonly TodoItem[]
}

export const emptyState: TodosState = {
  file: '',
  items: [],
}

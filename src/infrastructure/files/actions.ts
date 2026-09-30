import { dispatch, request } from '@/infrastructure/runtime'

import { Files, type FileHit } from './store'

export async function find(query: string): Promise<readonly FileHit[]> {
  return (await request(Files, (files) => files.search(query))) ?? []
}

export function open(path: string): void {
  dispatch(Files, (files) => files.open(path))
}

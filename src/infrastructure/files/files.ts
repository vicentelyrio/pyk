import { find, open } from './actions'
import { rank } from './derived'

async function search(query: string, limit: number) {
  return rank(await find(query), query, limit)
}

export const files = {
  search,
  open,
} as const

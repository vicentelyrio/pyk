import { dispatch } from '@/infrastructure/runtime'

import { Apps } from './store'

export function launch(id: string): void {
  dispatch(Apps, (apps) => apps.launch(id))
}

export function reload(): void {
  dispatch(Apps, (apps) => apps.reload)
}

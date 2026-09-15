import { dispatch } from '@/infrastructure/runtime'

import { Session } from './store'

export function lock(): void {
  dispatch(Session, (session) => session.lock)
}

export function suspend(): void {
  dispatch(Session, (session) => session.suspend)
}

export function reboot(): void {
  dispatch(Session, (session) => session.reboot)
}

export function powerOff(): void {
  dispatch(Session, (session) => session.powerOff)
}

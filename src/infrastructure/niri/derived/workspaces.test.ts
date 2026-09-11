import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import type { NiriWindow, NiriWorkspace } from '../schema'
import { emptyState, type NiriState } from '../store/state'
import { buildWorkspaces, byScrollPosition } from './workspaces'

function window(id: number, over: Partial<NiriWindow> = {}): NiriWindow {
  return {
    id,
    title: `w${id}`,
    app_id: 'app',
    workspace_id: 1,
    is_focused: false,
    is_floating: false,
    ...over,
  }
}

const at = (id: number, column: number, tile: number) =>
  window(id, { layout: { pos_in_scrolling_layout: [column, tile] } })

function workspace(id: number): NiriWorkspace {
  return {
    id,
    idx: id,
    name: null,
    output: 'DP-1',
    is_urgent: false,
    is_active: false,
    is_focused: false,
    active_window_id: null,
  }
}

const stateOf = (workspaces: NiriWorkspace[], windows: NiriWindow[]): NiriState => ({
  ...emptyState,
  workspaces,
  windows: new Map(windows.map((w) => [w.id, w])),
})

describe('byScrollPosition', () => {
  test('orders by column then tile', () => {
    const sorted = [at(3, 1, 1), at(1, 0, 0), at(2, 0, 1)].sort(byScrollPosition)
    assert.deepEqual(sorted.map((w) => w.id), [1, 2, 3])
  })

  test('positioned windows come before unpositioned ones', () => {
    const sorted = [window(9), at(1, 0, 0)].sort(byScrollPosition)
    assert.deepEqual(sorted.map((w) => w.id), [1, 9])
  })

  test('falls back to id when neither is positioned', () => {
    const sorted = [window(5), window(2)].sort(byScrollPosition)
    assert.deepEqual(sorted.map((w) => w.id), [2, 5])
  })
})

describe('buildWorkspaces', () => {
  test('groups windows into their workspace, in scroll order', () => {
    const state = stateOf(
      [workspace(1), workspace(2)],
      [
        at(3, 1, 0),
        { ...at(2, 0, 1), workspace_id: 2 },
        at(1, 0, 0),
      ],
    )

    const built = buildWorkspaces(state)

    assert.deepEqual(built.map((w) => w.id), [1, 2])
    assert.deepEqual(built[0].windows.map((w) => w.id), [1, 3])
    assert.deepEqual(built[1].windows.map((w) => w.id), [2])
  })

  test('drops windows with no workspace', () => {
    const state = stateOf([workspace(1)], [window(1, { workspace_id: null })])
    assert.deepEqual(buildWorkspaces(state)[0].windows, [])
  })

  test('projects column and tile from the layout', () => {
    const state = stateOf([workspace(1)], [at(1, 2, 3)])
    const [win] = buildWorkspaces(state)[0].windows

    assert.equal(win.column, 2)
    assert.equal(win.tile, 3)
    assert.equal(win.isFloating, false)
  })

  test('leaves column and tile null when unpositioned', () => {
    const state = stateOf([workspace(1)], [window(1)])
    const [win] = buildWorkspaces(state)[0].windows

    assert.equal(win.column, null)
    assert.equal(win.tile, null)
  })

  test('keeps workspaces that have no windows', () => {
    const built = buildWorkspaces(stateOf([workspace(1)], []))
    assert.deepEqual(built[0].windows, [])
  })
})

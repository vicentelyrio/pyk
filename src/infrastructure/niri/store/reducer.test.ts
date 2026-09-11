import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import type { NiriWindow, NiriWorkspace } from '../schema'
import { reduce } from './reducer'
import { emptyState, type NiriState } from './state'

function workspace(id: number, over: Partial<NiriWorkspace> = {}): NiriWorkspace {
  return {
    id,
    idx: id,
    name: null,
    output: 'DP-1',
    is_urgent: false,
    is_active: false,
    is_focused: false,
    active_window_id: null,
    ...over,
  }
}

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

const withWindows = (...windows: NiriWindow[]): NiriState => ({
  ...emptyState,
  windows: new Map(windows.map((w) => [w.id, w])),
})

describe('WorkspacesChanged', () => {
  test('sorts by output then idx and adopts the focused workspace', () => {
    const next = reduce(emptyState, {
      kind: 'WorkspacesChanged',
      workspaces: [
        workspace(3, { idx: 2, output: 'DP-2' }),
        workspace(2, { idx: 2, is_focused: true }),
        workspace(1, { idx: 1 }),
      ],
    })

    assert.deepEqual(next.workspaces.map((w) => w.id), [1, 2, 3])
    assert.equal(next.focusedWorkspaceId, 2)
  })

  test('keeps the previous focus when none is focused', () => {
    const state = { ...emptyState, focusedWorkspaceId: 9 }
    const next = reduce(state, { kind: 'WorkspacesChanged', workspaces: [workspace(1)] })
    assert.equal(next.focusedWorkspaceId, 9)
  })
})

describe('WorkspaceActivated', () => {
  test('sets focus when focused', () => {
    const next = reduce(emptyState, { kind: 'WorkspaceActivated', id: 4, focused: true })
    assert.equal(next.focusedWorkspaceId, 4)
  })

  test('returns the same state when not focused', () => {
    const next = reduce(emptyState, { kind: 'WorkspaceActivated', id: 4, focused: false })
    assert.equal(next, emptyState)
  })
})

describe('WorkspaceActiveWindowChanged', () => {
  const state: NiriState = { ...emptyState, workspaces: [workspace(1, { active_window_id: 5 })] }

  test('updates the active window', () => {
    const next = reduce(state, {
      kind: 'WorkspaceActiveWindowChanged',
      workspace_id: 1,
      active_window_id: 8,
    })
    assert.equal(next.workspaces[0].active_window_id, 8)
  })

  test('returns the same state when unchanged', () => {
    const next = reduce(state, {
      kind: 'WorkspaceActiveWindowChanged',
      workspace_id: 1,
      active_window_id: 5,
    })
    assert.equal(next, state)
  })

  test('returns the same state for an unknown workspace', () => {
    const next = reduce(state, {
      kind: 'WorkspaceActiveWindowChanged',
      workspace_id: 99,
      active_window_id: 8,
    })
    assert.equal(next, state)
  })
})

describe('WindowsChanged', () => {
  test('replaces the window map and picks up focus', () => {
    const next = reduce(emptyState, {
      kind: 'WindowsChanged',
      windows: [window(1), window(2, { is_focused: true })],
    })
    assert.deepEqual([...next.windows.keys()], [1, 2])
    assert.equal(next.focusedWindowId, 2)
  })

  test('clears focus when nothing is focused', () => {
    const next = reduce({ ...emptyState, focusedWindowId: 7 }, {
      kind: 'WindowsChanged',
      windows: [window(1)],
    })
    assert.equal(next.focusedWindowId, null)
  })
})

describe('WindowOpenedOrChanged', () => {
  test('inserts and takes focus when focused', () => {
    const next = reduce(emptyState, {
      kind: 'WindowOpenedOrChanged',
      window: window(3, { is_focused: true }),
    })
    assert.equal(next.windows.get(3)?.id, 3)
    assert.equal(next.focusedWindowId, 3)
  })

  test('keeps existing focus when the window is not focused', () => {
    const next = reduce({ ...emptyState, focusedWindowId: 1 }, {
      kind: 'WindowOpenedOrChanged',
      window: window(3),
    })
    assert.equal(next.focusedWindowId, 1)
  })
})

describe('WindowClosed', () => {
  test('removes the window and clears focus if it held it', () => {
    const state = { ...withWindows(window(1)), focusedWindowId: 1 }
    const next = reduce(state, { kind: 'WindowClosed', id: 1 })
    assert.equal(next.windows.size, 0)
    assert.equal(next.focusedWindowId, null)
  })

  test('returns the same state for an unknown window', () => {
    const state = withWindows(window(1))
    assert.equal(reduce(state, { kind: 'WindowClosed', id: 99 }), state)
  })
})

describe('WindowFocusChanged', () => {
  test('updates focus', () => {
    const next = reduce(emptyState, { kind: 'WindowFocusChanged', id: 5 })
    assert.equal(next.focusedWindowId, 5)
  })

  test('returns the same state when focus is unchanged', () => {
    const state = { ...emptyState, focusedWindowId: 5 }
    assert.equal(reduce(state, { kind: 'WindowFocusChanged', id: 5 }), state)
  })
})

describe('WindowLayoutsChanged', () => {
  test('applies layouts to known windows', () => {
    const state = withWindows(window(1))
    const next = reduce(state, {
      kind: 'WindowLayoutsChanged',
      changes: [[1, { pos_in_scrolling_layout: [2, 3] }]],
    })
    assert.deepEqual(next.windows.get(1)?.layout?.pos_in_scrolling_layout, [2, 3])
  })

  test('returns the same state when no window matches', () => {
    const state = withWindows(window(1))
    const next = reduce(state, {
      kind: 'WindowLayoutsChanged',
      changes: [[99, { pos_in_scrolling_layout: [0, 0] }]],
    })
    assert.equal(next, state)
  })
})

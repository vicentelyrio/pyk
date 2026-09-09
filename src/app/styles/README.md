# Design tokens

## Layout

| File | Emits CSS | Purpose |
|---|---|---|
| `_config.scss` | – | App-level knobs (`!default`). The only file you normally edit. |
| `_tokens.scss` | – | Raw scales + semantic maps, built from `_config`. |
| `_functions.scss` | – | Fail-loud accessors: `color()`, `space()`, `radius()`, … + `gtk()`. |
| `_mixins.scss` | – | Component clusters: `popout()`, `icon-button()`, `numeric`, … |
| `_theme.scss` | ✅ | Palette → GTK `@define-color` names (runtime-swappable). |
| `_reset.scss` | ✅ | Base typography + shared `@keyframes`. |
| `index.scss` | – | What widgets `@use`. Forwards config + tokens + functions + mixins. |
| `widgets/*.scss` | ✅ | Per-widget rules. `@use '../index' as s;` |

`src/app/style.scss` is the bundle entry ags compiles and passes to
`app.start({ css })`. It pulls in `_theme`, `_reset` and every `widgets/*`.

## Using tokens in a widget

```scss
// src/app/styles/widgets/_launcher.scss
@use '../index' as s;

.Launcher {
  @include s.popout(raised);
  min-width: s.panel-width(launcher);
  padding: s.space(sm);

  .row {
    @include s.hover-fill(s.radius(sm), $on: hover-soft);
    padding: s.space(md);
  }
  .count { @include s.caps-label; }
}
```

Then add `@use 'styles/widgets/launcher';` to `src/app/style.scss`.

A bad key is a build error, not a dropped line:

```
color(): no such token `accnt`. Valid: base page surface raised …
```

## Redefining at app level

### Compile time — any token

Override knobs **before** anything pulls the layer in. First lines of
`src/app/style.scss`:

```scss
@use 'styles/config' with (
  $accent: #9ecfb0,
  $panel-radius: 12px,
  $surface-opacity: 0.82,
  $bar-height: 40px,
);
```

Derived tokens (`accentWash`, the spacing scale, …) follow automatically.
For deeper changes, edit the maps in `_tokens.scss` directly.

### Runtime — colours only

`_theme.scss` emits every colour as a GTK `@define-color`, so a new palette is
one `apply_css` call away — no recompile. Good for wallpaper-driven theming
(matugen etc.):

```ts
app.apply_css(`
  @define-color accent ${hex};
  @define-color accentWash alpha(${hex}, 0.13);
`, false) // false = merge onto the base sheet, don't reset it
```

# Styles

Three layers, each built only from the one below it.

| Layer | Path | Holds |
|---|---|---|
| Config | `core/config/_config.scss` | User-facing knobs (`!default`): accent, surface opacity, font family, and one base per dimension — `$font-size-base` + `$type-scale`, `$size-base`, `$radius-base`. What a settings UI writes. |
| Tokens | `core/tokens/` | Primitives: raw `$palette`, `$alpha` ladder, and every dimension scale generated from a config base. |
| Theme | `core/theme/_roles.scss` | Semantic colors derived from palette primitives (`accentWash`, `lineSubtle`, `indicator`, …). `_theme.scss` emits palette + roles as GTK `@define-color`. |

Components, features and modules (`@use 'styles' as s;`) consume layers through accessors only.

## Color

- Components use `s.gtk(name)`, nothing else. `name` must be a palette or role key — a typo fails the build.
- `$palette` and `$alpha` are hidden from components; there is no `rgba()` / `color()` at feature level.
- Roles are GTK expressions over palette names (`alpha(@light, 0.08)`, `mix(@accent, @light, 0.32)`), so redefining a primitive at runtime restyles every role that derives from it:

```ts
app.apply_css(`@define-color accent ${hex};`, false)
```

- Need a new tint? Add a role to `_roles.scss` with `alpha-of(<palette>, <alpha step>)` or `mix-of(<a>, <b>, <step>)`. Steps must exist in `$alpha`.

## Dimensions

No dimension token holds a raw length. Each map is a list of factors over a config base, built by `core/helpers/_scale.scss`:

| Scale | Base | Build |
|---|---|---|
| `font-size` | `$font-size-base` | `geometric`: base × `$type-scale` ^ step, rounded to 0.5px |
| `space`, `size`, `panel-width`, `shadow`, `shadow-room` | `$size-base` | `linear`: base × factor, rounded to 1px |
| `radius` | `$radius-base` | `linear`: base × factor |

Factors may be lists (`shadow: 0 4.5 12.5`) and non-numeric values pass through (`full: 50%`). `stroke` stays absolute — hairlines don't scale.

## Adding a token

1. Knob a user should change → `_config.scss`.
2. Raw value → a factor in the matching `core/tokens/_*.scss` map.
3. Color meaning → a role in `core/theme/_roles.scss`.
4. New map → accessor in `core/helpers/_functions.scss`.

## Compile-time override

```scss
@use 'styles/core/config' with (
  $accent: #9ecfb0,
  $font-size-base: 13px,
  $type-scale: 1.125,
  $size-base: 5px,
  $radius-base: 6px,
);
```

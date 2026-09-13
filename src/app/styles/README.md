# Styles

Three layers, each built only from the one below it.

| Layer | Path | Holds |
|---|---|---|
| Config | `core/config/_config.scss` | The runtime contract: `var(--*)` references and the runtime colors (`$colors`). No values — those come from `config.json` via `src/app/appearance.ts`. |
| Tokens | `core/tokens/` | Primitives: raw `$palette`, `$alpha` ladder, font stacks, and every dimension scale as factors over a config variable. |
| Theme | `core/theme/_roles.scss` | Semantic colors derived from palette primitives (`accentWash`, `lineSubtle`, `indicator`, …). `_theme.scss` emits palette + roles as GTK `@define-color`. |

Components, features and modules (`@use 'styles' as s;`) consume layers through accessors only.

## Runtime appearance

`appearance` in `$XDG_CONFIG_HOME/pyk/config.json` is applied live: `applyAppearance()` owns a CSS provider one priority above the app sheet and reloads it whenever the section changes.

| Config key | Emitted as |
|---|---|
| `fontFamily`, `fontFamilyMono`, `fontSize`, `typeScale`, `sizeBase`, `radiusBase` | `:root { --font-family … --radius-base }` |
| `accent` | `@define-color accent` |
| `surfaceOpacity` | `@define-color surfaceGlass alpha(@surface, …)` |

GTK accepts `var()` inside properties and `calc()`, but not inside `@define-color` — so anything feeding a named color is emitted as a color by the provider, and listed in `$colors`.

Adding a knob: add it to `configSpec.appearance`, emit it in `appearance.ts`, reference it in `_config.scss`.

## Color

- Components use `s.gtk(name)`, nothing else. `name` must be a palette, runtime or role key — a typo fails the build.
- `$palette` and `$alpha` are hidden from components; there is no `rgba()` / `color()` at feature level.
- Roles are GTK expressions over palette names (`alpha(@light, 0.08)`, `mix(@accent, @light, 0.32)`), so a runtime `@accent` restyles every role derived from it.
- Need a new tint? Add a role to `_roles.scss` with `alpha-of(<color>, <alpha step>)` or `mix-of(<a>, <b>, <step>)`. Steps must exist in `$alpha`.

## Dimensions

No dimension token holds a raw length. Each map is a list of factors over a config variable, built by `core/helpers/_scale.scss` into `calc()`:

| Scale | Variable | Build |
|---|---|---|
| `font-size` | `--font-size-base`, `--type-scale` | `geometric`: base × scale per step up, base ÷ scale per step down |
| `space`, `size`, `panel-width`, `shadow`, `shadow-room` | `--size-base` | `linear`: `calc(var(--size-base) * factor)` |
| `radius` | `--radius-base` | `linear` |

Factors may be lists (`shadow: 0 4.5 12.5`) and non-numeric values pass through (`full: 50%`). `stroke` stays absolute — hairlines don't scale.

## Adding a token

1. Knob a user should change → `configSpec` + `appearance.ts` + `_config.scss`.
2. Raw value → a factor in the matching `core/tokens/_*.scss` map.
3. Color meaning → a role in `core/theme/_roles.scss`.
4. New map → accessor in `core/helpers/_functions.scss`.

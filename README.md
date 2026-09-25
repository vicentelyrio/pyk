# pyk

A desktop shell for [niri](https://github.com/YaLTeR/niri), built with AGS v3 and GTK 4.

It provides a top bar, launcher, control center, notifications, OSD, wallpaper picker, settings window and desktop widgets (media player, weather, agenda, todos, system meters).

## Requirements

Runtime:

- niri
- [AGS](https://github.com/Aylur/ags) v3 and the Astal libraries: apps, battery, bluetooth, mpris, network, notifd, wireplumber
- NetworkManager, libical, libsoup 3
- ddcutil (optional, for external monitor brightness)

Build only:

- Node.js and pnpm

## Install

```sh
git clone https://github.com/vicentelyrio/pyk.git
cd pyk
pnpm install
pnpm build
```

This produces `dist/pyk`. Start it from your niri config:

```kdl
spawn-at-startup "/path/to/pyk/dist/pyk"
```

To run from source without building: `pnpm start`.

## Configuration

Settings are stored in `~/.config/pyk/config.json` and can be edited from the settings window (`ags request -i pyk settings`). Only values that differ from the defaults are written.

Global shortcuts are written to `~/.config/niri/pyk-binds.kdl`. Include it from your niri config:

```kdl
include optional=true "pyk-binds.kdl"
```

Other data sources:

- Calendars: `.ics` files in `~/.local/share/calendars` (e.g. synced by vdirsyncer)
- Todos: `~/.config/pyk/todo.txt`, one item per line, `x ` prefix marks it done
- Weather: [Open-Meteo](https://open-meteo.com), location set by city name

## Development

```sh
pnpm typecheck
pnpm test
pnpm watch    # reloads on change
pnpm icons    # rebuild icons after editing src/app/icons/raw/, needs inkscape
```

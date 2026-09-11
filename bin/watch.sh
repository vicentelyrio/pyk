#!/usr/bin/env bash
# Dev watch mode for the pyk shell.
#
#   *.scss        recompiled with `sass` and hot-applied to the running
#                 instance via `ags request` — no restart
#   *.ts / *.tsx  the instance is quit and `ags run` relaunched
#
# Events are debounced, so one editor save (which fires a burst) is one reload.
# Meant to run inside the nested niri dev session — see bin/dev.sh.
set -euo pipefail

cd "$(dirname "$0")/.."

INSTANCE=pyk
ENTRY=src/app/app.ts
STYLE=src/app/style.scss
WATCH_DIR=src
CSS_OUT="${XDG_RUNTIME_DIR:-/tmp}/pyk-dev.css"

app_pid=""

# The nested niri dev session (winit) churns its Vulkan surface on every resize,
# which makes GTK's Vulkan renderer spam `VK_ERROR_OUT_OF_DATE_KHR`. Harmless,
# but noisy — the GL renderer doesn't do it. Override by exporting GSK_RENDERER.
export GSK_RENDERER="${GSK_RENDERER:-gl}"

start() {
  ags run "$ENTRY" &
  app_pid=$!
}

stop() {
  ags request -i "$INSTANCE" quit >/dev/null 2>&1 || ags quit -i "$INSTANCE" >/dev/null 2>&1 || true
  [ -n "$app_pid" ] && wait "$app_pid" 2>/dev/null || true
  app_pid=""
}

restart() {
  echo "↻ restart"
  stop
  start
}

reload_css() {
  if sass --no-source-map --load-path="$(dirname "$STYLE")" "$STYLE" "$CSS_OUT" 2>&1; then
    ags request -i "$INSTANCE" css "$CSS_OUT" >/dev/null 2>&1 || true
    echo "🎨 css reloaded"
  else
    echo "✗ sass error — css not reloaded"
  fi
}

trap stop EXIT INT TERM

start
echo "watching $WATCH_DIR/ …"

inotifywait -m -r -q \
  -e close_write -e create -e delete -e move \
  --format '%w%f' "$WATCH_DIR" |
while read -r path; do
  changed="$path"
  # coalesce anything that lands in the next 300ms into this batch
  while read -r -t 0.3 more; do changed+=$'\n'"$more"; done

  if grep -qE '\.tsx?$' <<<"$changed"; then
    restart
  elif grep -qE '\.scss$' <<<"$changed"; then
    reload_css
  fi
done

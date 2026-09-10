#!/usr/bin/env bash
# Bake stroke-based SVGs (Lucide et al) into GTK symbolic icons.
#
# GTK's symbolic pipeline fills every <path> with the theme colour and discards
# stroke entirely, so a stroke-only icon renders as a solid blob. Converting the
# stroke to a filled outline up front is the only way to keep the shape *and*
# keep recolouring — see `object-stroke-to-path` below.
#
#   src/app/icons/raw/<name>.svg
#     -> src/app/icons/hicolor/scalable/actions/pyk-<name>-symbolic.svg
#
# Only files newer than their output are rebuilt. One Inkscape process handles
# the whole batch; process startup dominates otherwise.
set -euo pipefail
cd "$(dirname "$0")/.."

RAW=src/app/icons/raw
OUT=src/app/icons/hicolor/scalable/actions
PREFIX=pyk

command -v inkscape >/dev/null || { echo "inkscape not found" >&2; exit 1; }
mkdir -p "$OUT"

tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT

actions=""
names=()
for src in "$RAW"/*.svg; do
  [ -e "$src" ] || continue
  name=$(basename "$src" .svg)
  dest="$OUT/$PREFIX-$name-symbolic.svg"
  [ -e "$dest" ] && [ "$dest" -nt "$src" ] && continue
  names+=("$name")
  actions+="file-open:$PWD/$src;select-all;object-stroke-to-path;"
  actions+="export-plain-svg;export-filename:$tmp/$name.svg;export-do;file-close;"
done

if [ ${#names[@]} -eq 0 ]; then
  echo "icons up to date"
  exit 0
fi

inkscape --actions="$actions" >/dev/null 2>&1

for name in "${names[@]}"; do
  [ -s "$tmp/$name.svg" ] || { echo "✗ $name — inkscape produced nothing" >&2; exit 1; }
  python3 - "$tmp/$name.svg" "$OUT/$PREFIX-$name-symbolic.svg" <<'PY'
import sys, xml.etree.ElementTree as ET

NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", NS)
root = ET.parse(sys.argv[1]).getroot()

# Keep only geometry. Inkscape emits its own ids, <defs>, sodipodi/inkscape
# namespaces and a fat `style` on every path; GTK needs none of it, and a bare
# path with no fill declared inherits the symbolic colour.
paths = [p.get("d") for p in root.iter(f"{{{NS}}}path") if p.get("d")]
if not paths:
    sys.exit(f"no paths in {sys.argv[1]}")

view = root.get("viewBox", "0 0 24 24")
w, h = root.get("width", "24"), root.get("height", "24")
body = "\n".join(f'  <path d="{d}"/>' for d in paths)
# width/height are required: GTK warns "Symbolic icon has no intrinsic size".
open(sys.argv[2], "w").write(
    f'<svg xmlns="{NS}" width="{w}" height="{h}" viewBox="{view}">\n{body}\n</svg>\n'
)
PY
  echo "✓ $PREFIX-$name-symbolic.svg"
done

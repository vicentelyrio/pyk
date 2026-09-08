#!/usr/bin/env bash
# AGS and gnim ship their runtime as raw .ts, not .d.ts — so `tsc` would pull
# their internals into the program and type-check them (and they don't pass
# `strict`). Snapshot them as .d.ts once; `skipLibCheck` then ignores them and
# `tsconfig.json` maps `ags`/`gnim` imports here via `paths`.
#
# Regenerated on every install (see `prepare`). Output is git-ignored.
set -euo pipefail
cd "$(dirname "$0")/.."

ags_root=$(readlink -f node_modules/ags)          # the linked AGS package
gnim_root="$ags_root/node_modules/gnim"           # ags bundles its own version-matched gnim
out=types/vendor

[ -d "$gnim_root" ] || { echo "gnim not found under $ags_root" >&2; exit 1; }

cfg=$(mktemp); trap 'rm -f "$cfg"' EXIT
cat > "$cfg" <<JSON
{
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "$PWD/$out",
    "rootDir": "$ags_root",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "target": "ES2023",
    "lib": ["ES2023"],
    "skipLibCheck": true,
    "strict": false,
    "types": [],
    "paths": { "@girs/*": ["$PWD/@girs/*"] }
  },
  "include": ["$ags_root/lib/**/*.ts", "$gnim_root/dist/**/*.ts"]
}
JSON

rm -rf "$out"
# tsc emits every .d.ts even though the upstream source has type errors.
node_modules/.bin/tsc -p "$cfg" >/dev/null 2>&1 || true

test -f "$out/lib/gtk4/app.d.ts" || { echo "vendor type generation failed" >&2; exit 1; }
echo "vendor types → $out ($(find "$out" -name '*.d.ts' | wc -l | tr -d ' ') files)"

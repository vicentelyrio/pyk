import { Gdk, Gtk } from 'ags/gtk4'
import { config, type AppearanceConfig } from '@/infrastructure/config'

function family(name: string): string {
  return `"${name.replace(/["\\]/g, '')}"`
}

function stylesheet(appearance: AppearanceConfig): string {
  return `
:root {
  --font-family: ${family(appearance.fontFamily)};
  --font-family-mono: ${family(appearance.fontFamilyMono)};
  --font-size-base: ${appearance.fontSize}px;
  --type-scale: ${appearance.typeScale};
  --size-base: ${appearance.sizeBase}px;
  --radius-base: ${appearance.radiusBase}px;
}

@define-color accent ${appearance.accent};
@define-color surfaceGlass alpha(@surface, ${appearance.surfaceOpacity});
`
}

export function applyAppearance(): () => void {
  const display = Gdk.Display.get_default()
  if (!display) throw new Error('no display to apply appearance to')

  const provider = new Gtk.CssProvider()

  provider.connect('parsing-error', (_provider, section, error) => {
    console.error(`appearance css ${section.to_string()}: ${error.message}`)
  })

  Gtk.StyleContext.add_provider_for_display(display, provider, Gtk.STYLE_PROVIDER_PRIORITY_USER + 1)

  const load = () => provider.load_from_string(stylesheet(config.appearance()))
  load()

  const dispose = config.appearance.subscribe(load)

  return () => {
    dispose()
    Gtk.StyleContext.remove_provider_for_display(display, provider)
  }
}

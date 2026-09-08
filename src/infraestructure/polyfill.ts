// GJS's JS engine has no global `URL`. Effect touches `URL` internally
// (e.g. `instanceof URL` while hashing values for its metrics), which throws
// `ReferenceError: URL is not defined` before app code ever runs.
// Polyfill it on top of GLib.Uri so effect (and any app code) can use it.
import GLib from 'gi://GLib'

class URLPolyfill {
  #uri: GLib.Uri

  constructor(url: string, base?: string | URLPolyfill) {
    const flags = GLib.UriFlags.HAS_PASSWORD
    if (base !== undefined) {
      const baseStr = base instanceof URLPolyfill ? base.href : base
      this.#uri = GLib.Uri.parse_relative(GLib.Uri.parse(baseStr, flags), url, flags)
    } else {
      this.#uri = GLib.Uri.parse(url, flags)
    }
  }

  get href() { return this.#uri.to_string() }
  get protocol() { return `${this.#uri.get_scheme()}:` }
  get username() { return this.#uri.get_user() ?? '' }
  get password() { return this.#uri.get_password() ?? '' }
  get host() {
    const port = this.#uri.get_port()
    return port === -1 ? this.hostname : `${this.hostname}:${port}`
  }
  get hostname() { return this.#uri.get_host() ?? '' }
  get port() { const p = this.#uri.get_port(); return p === -1 ? '' : String(p) }
  get pathname() { return this.#uri.get_path() }
  get search() { const q = this.#uri.get_query(); return q ? `?${q}` : '' }
  get hash() { const f = this.#uri.get_fragment(); return f ? `#${f}` : '' }
  get origin() { return `${this.protocol}//${this.host}` }

  toString() { return this.href }
  toJSON() { return this.href }
}

if (typeof globalThis.URL === 'undefined') {
  // @ts-expect-error - minimal polyfill, not a full URL implementation
  globalThis.URL = URLPolyfill
}

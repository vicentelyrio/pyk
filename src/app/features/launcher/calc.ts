type Token =
  | { readonly kind: 'number'; readonly value: number }
  | { readonly kind: 'name'; readonly value: string }
  | { readonly kind: 'op'; readonly value: string }

const OPERATORS = '+-*/%^()×÷,'

const CONSTANTS: Readonly<Record<string, number>> = {
  pi: Math.PI,
  π: Math.PI,
  e: Math.E,
  tau: Math.PI * 2,
}

const FUNCTIONS: Readonly<Record<string, (...args: number[]) => number>> = {
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  abs: Math.abs,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  ln: Math.log,
  log: Math.log10,
  log2: Math.log2,
  exp: Math.exp,
  min: Math.min,
  max: Math.max,
  pow: Math.pow,
}

function tokenize(source: string): Token[] | null {
  const tokens: Token[] = []
  let at = 0

  while (at < source.length) {
    const char = source[at]!

    if (/\s/.test(char)) {
      at++
      continue
    }

    const number = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(source.slice(at))
    if (number) {
      tokens.push({ kind: 'number', value: Number(number[0]) })
      at += number[0].length
      continue
    }

    const name = /^[a-z\u03c0][a-z0-9]*/i.exec(source.slice(at))
    if (name) {
      tokens.push({ kind: 'name', value: name[0].toLowerCase() })
      at += name[0].length
      continue
    }

    if (OPERATORS.includes(char)) {
      tokens.push({ kind: 'op', value: char === '×' ? '*' : char === '÷' ? '/' : char })
      at++
      continue
    }

    return null
  }

  return tokens
}

class Parser {
  private at = 0
  literal = true

  constructor(private readonly tokens: readonly Token[]) {}

  parse(): number {
    const value = this.sum()
    if (this.at < this.tokens.length) throw new Error('trailing input')
    return value
  }

  private peek(): Token | undefined {
    return this.tokens[this.at]
  }

  private eat(op: string): boolean {
    const token = this.peek()
    if (token?.kind !== 'op' || token.value !== op) return false
    this.at++
    return true
  }

  private expect(op: string): void {
    if (!this.eat(op)) throw new Error(`expected ${op}`)
  }

  private sum(): number {
    let value = this.product()

    for (;;) {
      if (this.eat('+')) value += this.operand(() => this.product())
      else if (this.eat('-')) value -= this.operand(() => this.product())
      else return value
    }
  }

  private product(): number {
    let value = this.unary()

    for (;;) {
      if (this.eat('*')) value *= this.operand(() => this.unary())
      else if (this.eat('/')) value /= this.operand(() => this.unary())
      else if (this.eat('%')) value %= this.operand(() => this.unary())
      else if (this.implicit()) value *= this.operand(() => this.unary())
      else return value
    }
  }

  private implicit(): boolean {
    const token = this.peek()
    return token?.kind === 'name' || (token?.kind === 'op' && token.value === '(')
  }

  private unary(): number {
    if (this.eat('-')) return -this.unary()
    if (this.eat('+')) return this.unary()
    return this.power()
  }

  private power(): number {
    const base = this.atom()
    return this.eat('^') ? base ** this.operand(() => this.unary()) : base
  }

  private operand(read: () => number): number {
    this.literal = false
    return read()
  }

  private atom(): number {
    const token = this.peek()
    if (!token) throw new Error('unexpected end')
    this.at++

    if (token.kind === 'number') return token.value

    if (token.kind === 'op') {
      if (token.value !== '(') throw new Error(`unexpected ${token.value}`)
      const value = this.sum()
      this.expect(')')
      return value
    }

    const fn = FUNCTIONS[token.value]
    if (fn) {
      this.literal = false
      this.expect('(')
      const args = [this.sum()]
      while (this.eat(',')) args.push(this.sum())
      this.expect(')')
      return fn(...args)
    }

    const constant = CONSTANTS[token.value]
    if (constant === undefined) throw new Error(`unknown ${token.value}`)
    return constant
  }
}

export function evaluate(expression: string): number | null {
  const source = expression.trim().replace(/^=/, '')
  const tokens = tokenize(source)
  if (!tokens?.length) return null

  const parser = new Parser(tokens)

  try {
    const value = parser.parse()
    return !parser.literal && Number.isFinite(value) ? value : null
  }
  catch {
    return null
  }
}

export function formatResult(value: number): string {
  const rounded = Number(value.toPrecision(12))
  return Object.is(rounded, -0) ? '0' : String(rounded)
}

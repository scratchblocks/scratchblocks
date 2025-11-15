function assert(bool, message) {
  if (!bool) {
    throw new Error(`Assertion failed! ${message || ""}`)
  }
}

function indent(text) {
  return text
    .split("\n")
    .map(line => {
      return `  ${line}`
    })
    .join("\n")
}

// Compute display width of a string, counting common CJK / fullwidth
// characters as width 2 so alignment in mixed-language text looks correct.
function displayWidth(str) {
  if (!str) {
    return 0
  }
  str = String(str)
  let w = 0
  // Rough classification: common CJK ranges and fullwidth block
  const wideRe =
    /[\u2E80-\u2EFF\u2F00-\u2FDF\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF]/u
  for (const ch of str) {
    w += wideRe.test(ch) ? 2 : 1
  }
  return w
}

import {
  parseSpec,
  inputPat,
  parseInputNumber,
  iconPat,
  rtlLanguages,
  unicodeIcons,
} from "./blocks.js"

export class Label {
  constructor(value, cls) {
    this.value = value
    this.cls = cls || ""
    this.el = null
    this.height = 12
    this.metrics = null
    this.x = 0
  }
  get isLabel() {
    return true
  }

  stringify() {
    if (this.value === "<" || this.value === ">") {
      return this.value
    }
    return this.value.replace(/([<>[\](){}])/g, "\\$1")
  }
}

export class Icon {
  constructor(name) {
    this.name = name
    this.isArrow = name === "loopArrow"

    assert(Icon.icons[name], `no info for icon ${name}`)
  }
  get isIcon() {
    return true
  }

  static get icons() {
    return {
      greenFlag: true,
      stopSign: true,
      turnLeft: true,
      turnRight: true,
      loopArrow: true,
      addInput: true,
      delInput: true,
      list: true,
    }
  }

  stringify() {
    return unicodeIcons[`@${this.name}`] || ""
  }
}

export class Matrix {
  constructor(rows) {
    // rows should already be 2D array of booleans from parsing
    const inputRows = Array.isArray(rows) ? rows : []
    // Make shallow copies and coerce non-array entries into arrays
    this.rows = inputRows.map(row => (Array.isArray(row) ? row.slice() : [row]))

    // Determine maximum row length
    const maxLen = this.rows.reduce((m, r) => Math.max(m, r.length), 0)

    // Pad short rows with false to make all rows the same length
    for (let i = 0; i < this.rows.length; i++) {
      const r = this.rows[i]
      while (r.length < maxLen) {
        r.push(false)
      }
    }
  }

  get isMatrix() {
    return true
  }

  stringify() {
    // Format as {row1,row2,row3,...} where each cell is 0 or 1
    const rowStrings = this.rows.map(row =>
      row.map(cell => (cell ? "1" : "0")).join(""),
    )
    return `{${rowStrings.join(",")}}`
  }

  translate() {
    // Matrix doesn't need translation
  }
}

export class Input {
  constructor(shape, value, menu) {
    this.shape = shape
    this.value = value
    this.menu = menu || null

    this.isRound = shape === "number" || shape === "number-dropdown"
    this.isBoolean = shape === "boolean"
    this.isStack = shape === "stack"
    this.isInset =
      shape === "boolean" || shape === "stack" || shape === "reporter"
    this.isColor = shape === "color"
    this.isMatrix = shape === "matrix"
    this.hasArrow = shape === "dropdown" || shape === "number-dropdown"
    this.isDarker =
      shape === "boolean" || shape === "stack" || shape === "dropdown"
    this.isSquare =
      shape === "string" || shape === "color" || shape === "dropdown"

    // Check if value is a Matrix object
    const isMatrixValue = value && typeof value === "object" && value.isMatrix

    this.hasLabel = !(
      this.isColor ||
      this.isInset ||
      this.isMatrix ||
      isMatrixValue
    )
    this.label = this.hasLabel
      ? new Label(value, `literal-${this.shape}`)
      : null
    this.x = 0
  }
  get isInput() {
    return true
  }

  stringify(parentPrefix = "") {
    if (this.isColor) {
      assert(this.value[0] === "#")
      return `[${this.value}]`
    }

    // Handle Matrix values
    if (this.value && typeof this.value === "object" && this.value.isMatrix) {
      const matrixStr = this.value.stringify()
      // Calculate the indentation needed for alignment
      // parentPrefix is the text before this input on the same line
      // We need to account for: parentPrefix + "(" + "{"
      const indentSpaces = Math.max(0, displayWidth(parentPrefix) + 2)
      const indent = " ".repeat(indentSpaces)

      // Split matrix string and add indentation to each line after the first
      const parts = matrixStr.slice(1, -1).split(",") // Remove outer braces and split by comma
      const formattedMatrix = parts
        .map((part, index) => {
          if (index === 0) {
            return part
          }
          return `\n${indent}${part}`
        })
        .join(",")

      return `({${formattedMatrix}} v)`
    }

    // Order sensitive; see #439
    let text = (this.value ? String(this.value) : "")
      .replace(/([\]\\])/g, "\\$1")
      .replace(/ v$/, " \\v")
    if (this.hasArrow) {
      text += " v"
    }
    return this.isRound
      ? `(${text})`
      : this.isSquare
        ? `[${text}]`
        : this.isBoolean
          ? "<>"
          : this.isStack
            ? "{}"
            : text
  }

  translate(_lang) {
    if (this.hasArrow) {
      const value = this.menu || this.value
      // Don't create label for Matrix values
      if (value && typeof value === "object" && value.isMatrix) {
        return
      }
      this.value = value // TODO translate dropdown value
      this.label = new Label(this.value, `literal-${this.shape}`)
    }
  }
}

export class Block {
  constructor(info, children, comment) {
    assert(info)
    this.info = { ...info }
    this.children = children
    this.comment = comment || null
    this.diff = null

    const shape = this.info.shape
    this.isHat = shape === "hat" || shape === "cat" || shape === "define-hat"
    this.hasPuzzle =
      shape === "stack" ||
      shape === "hat" ||
      shape === "cat" ||
      shape === "c-block" ||
      shape === "define-hat"
    this.isFinal = /cap/.test(shape)
    this.isCommand = shape === "stack" || shape === "cap" || /block/.test(shape)
    this.isOutline = shape === "outline"
    this.isReporter = shape === "reporter"
    this.isBoolean = shape === "boolean"

    this.isRing = shape === "ring"
    this.hasScript = /block/.test(shape)
    this.isElse = shape === "celse"
    this.isEnd = shape === "cend"
  }
  get isBlock() {
    return true
  }

  stringify(extras) {
    let firstInput = null
    let checkAlias = false
    let currentLinePrefix = ""
    const parts = []

    for (const child of this.children) {
      if (child.isIcon) {
        checkAlias = true
      }
      if (!firstInput && !(child.isLabel || child.isIcon)) {
        firstInput = child
      }

      if (child.isScript) {
        parts.push(`\n${indent(child.stringify())}\n`)
        currentLinePrefix = ""
      } else {
        // Pass the current line prefix to child's stringify for alignment
        const childStr = child.isInput
          ? child.stringify(currentLinePrefix)
          : child.stringify()

        const trimmed = childStr.trim()
        parts.push(trimmed)

        // Update prefix for next child
        if (!childStr.includes("\n")) {
          currentLinePrefix += trimmed + " "
        } else {
          // If there's a newline, extract the last line as new prefix
          const lines = childStr.split("\n")
          currentLinePrefix = lines[lines.length - 1].trim() + " "
        }
      }
    }

    let text = parts.join(" ").trim().replace(/ +\n/g, "\n")

    const lang = this.info.language
    if (checkAlias && lang && this.info.selector) {
      const aliases = lang.nativeAliases[this.info.id]
      if (aliases && aliases.length) {
        let alias = aliases[0]
        // TODO make translate() not in-place, and use that
        if (inputPat.test(alias) && firstInput) {
          alias = alias.replace(inputPat, firstInput.stringify())
        }
        return alias
      }
    }

    let overrides = extras || ""
    if (
      this.info.categoryIsDefault === false ||
      (this.info.category === "custom-arg" &&
        (this.isReporter || this.isBoolean)) ||
      (this.info.category === "custom" && this.info.shape === "stack")
    ) {
      if (overrides) {
        overrides += " "
      }
      if (this.info.isReset && this.info.category === "obsolete") {
        overrides += "reset"
      } else {
        overrides += this.info.category
      }
    }
    if (this.info.shapeIsDefault === false) {
      if (overrides) {
        overrides += " "
      }
      overrides += this.info.shape
    }
    if (overrides) {
      text += ` :: ${overrides}`
    }
    return this.hasScript
      ? text +
          "\n" +
          (Object.keys(lang.aliases).find(
            key => lang.aliases[key] === "scratchblocks:end",
          ) || "end")
      : this.info.shape === "reporter"
        ? `(${text})`
        : this.info.shape === "boolean"
          ? `<${text}>`
          : text
  }

  translate(lang, isShallow) {
    if (!lang) {
      throw new Error("Missing language")
    }

    const id = this.info.id
    if (!id) {
      return
    }

    if (id === "PROCEDURES_DEFINITION") {
      // Find the first 'outline' child (there should be exactly one).
      const outline = this.children.find(child => child.isOutline)

      this.children = []
      for (const word of lang.definePrefix) {
        this.children.push(new Label(word))
      }
      this.children.push(outline)
      for (const word of lang.defineSuffix) {
        this.children.push(new Label(word))
      }
      return
    } else if (id === "PROCEDURES_CALL") {
      this.children.forEach(child => {
        if (!child.isLabel && !child.isIcon) {
          child.translate(lang)
        }
      })
      return
    }

    const oldSpec = this.info.language.commands[id]

    const nativeSpec = lang.commands[id]
    if (!nativeSpec) {
      return
    }
    const nativeInfo = parseSpec(nativeSpec)

    const rawArgs = this.children.filter(
      child => !child.isLabel && !child.isIcon,
    )

    if (!isShallow) {
      rawArgs.forEach(child => child.translate(lang))
    }

    // Work out indexes of existing children
    const oldParts = parseSpec(oldSpec).parts
    const oldInputOrder = oldParts
      .map(part => parseInputNumber(part))
      .filter(x => x)

    let highestNumber = 0
    const args = oldInputOrder.map(number => {
      highestNumber = Math.max(highestNumber, number)
      return rawArgs[number - 1]
    })
    const remainingArgs = rawArgs.slice(highestNumber)

    // Get new children by index
    this.children = nativeInfo.parts
      .map(part => {
        part = part.trim()
        if (!part) {
          return
        }
        const number = parseInputNumber(part)
        if (number) {
          return args[number - 1]
        }
        return iconPat.test(part) ? new Icon(part.slice(1)) : new Label(part)
      })
      .filter(x => x)

    // Push any remaining children, so we pick up C block bodies
    remainingArgs.forEach((arg, index) => {
      if (index === 1 && this.info.id === "CONTROL_IF") {
        this.children.push(new Label(lang.commands.CONTROL_ELSE))
      }
      this.children.push(arg)
    })

    this.info.language = lang
    this.info.isRTL = rtlLanguages.includes(lang.code)
    this.info.categoryIsDefault = true
  }
}

export class Comment {
  constructor(value, hasBlock) {
    this.label = new Label(value, "comment-label")
    this.width = null
    this.hasBlock = hasBlock
  }
  get isComment() {
    return true
  }

  stringify() {
    return `// ${this.label.value.trim()}`
  }
}

export class Glow {
  constructor(child) {
    assert(child)
    this.child = child
    if (child.isBlock) {
      this.shape = child.info.shape
      this.info = child.info
    } else {
      this.shape = "stack"
    }
  }
  get isGlow() {
    return true
  }

  stringify() {
    if (this.child.isBlock) {
      return this.child.stringify("+")
    }
    const lines = this.child.stringify().split("\n")
    return lines.map(line => `+ ${line}`).join("\n")
  }

  translate(lang) {
    this.child.translate(lang)
  }
}

export class Script {
  constructor(blocks) {
    this.blocks = blocks
    this.isEmpty = !blocks.length
    this.isFinal = !this.isEmpty && blocks[blocks.length - 1].isFinal
  }
  get isScript() {
    return true
  }

  stringify() {
    return this.blocks
      .map(block => {
        let line = block.stringify()
        if (block.comment) {
          // If this block contains a script (multi-line), insert the
          // comment on the first line (the opening line) instead of
          // appending it after the whole multi-line block (which would
          // place it after the trailing "end").
          if (block.isBlock && block.hasScript) {
            const commentText = ` ${block.comment.stringify()}`
            const nl = line.indexOf("\n")
            if (nl !== -1) {
              line = line.slice(0, nl) + commentText + line.slice(nl)
            } else {
              line += commentText
            }
          } else {
            line += ` ${block.comment.stringify()}`
          }
        }
        return line
      })
      .join("\n")
  }

  translate(lang) {
    this.blocks.forEach(block => block.translate && block.translate(lang))
  }
}

export class Document {
  constructor(scripts) {
    this.scripts = scripts
  }

  stringify() {
    return this.scripts.map(script => script.stringify()).join("\n\n")
  }

  translate(lang) {
    this.scripts.forEach(script => script.translate(lang))
  }
}

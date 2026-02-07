class Editor {
    // notes:
    // -- preserving BackQuote (`) and shift BracketLeft ({) and shift BracketRight (}) for special use
    // -- using shift+alt combo for CBM (and some special chars) to avoid diacritical combo option sequences on Mac
    // -- using ctrl+alt (and shift+ctrl+alt) for CTRL (and SHIFT-CTRL) to avoid collisions with CTRL-key editor combos on Windows
    static baseKeyMappings = {
        'shift': {
            'Digit6' : 0x5E, // up arrow
            'Backquote': 0x5F, // left arrow
            'Backslash': 0x7D, // centered vertical bar
            'KeyA': 0x61, 'KeyB': 0x62, 'KeyC': 0x63, 'KeyD': 0x64, 'KeyE': 0x65, 'KeyF': 0x66, // shifted petscii
            'KeyG': 0x67, 'KeyH': 0x68, 'KeyI': 0x69, 'KeyJ': 0x6A, 'KeyK': 0x6B, 'KeyL': 0x6C,
            'KeyM': 0x6D, 'KeyN': 0x6E, 'KeyO': 0x6F, 'KeyP': 0x70, 'KeyQ': 0x71, 'KeyR': 0x72,
            'KeyS': 0x73, 'KeyT': 0x74, 'KeyU': 0x75, 'KeyV': 0x76, 'KeyW': 0x77, 'KeyX': 0x78,
            'KeyY': 0x79, 'KeyZ': 0x7A,
            'Minus': 0xA4, // bottom 1 pixel line (underscore)
        },
        'shiftalt': {
            'KeyA': 0xB0, 'KeyB': 0xBF, 'KeyC': 0xBC, 'KeyD': 0xAC, 'KeyE': 0xB1, 'KeyF': 0xBB,
            'KeyG': 0xA5, 'KeyH': 0xB4, 'KeyI': 0xA2, 'KeyJ': 0xB5, 'KeyK': 0xA1, 'KeyL': 0xB6,
            'KeyM': 0xA7, 'KeyN': 0xAA, 'KeyO': 0xB9, 'KeyP': 0xAF, 'KeyQ': 0xAB, 'KeyR': 0xB2,
            'KeyS': 0xAE, 'KeyT': 0xA3, 'KeyU': 0xB8, 'KeyV': 0xBE, 'KeyW': 0xB3, 'KeyX': 0xBD,
            'KeyY': 0xB7, 'KeyZ': 0xAD,
            'Equal': 0x7B, // heavy cross
            'Semicolon': 0xBA, // lower right large border
            'BracketLeft': 0xA8, // horitozontal half checkerboard
            'BracketRight': 0x7C, // vertical half checkerboard
            'Backslash': 0xA6, // full checkerboard
            'Quote': 0x7E, // pi
            'Slash': 0x5C, // gb-pound
            'Comma': 0xA9, // top-left triangle
            'Period': 0x7F, // bottom-right triangle
        },
        'ctrlalt': { // lower control set
            'KeyA': 0x01, 'KeyB': 0x02, 'KeyC': 0x03, 'KeyD': 0x04, 'KeyE': 0x05, 'KeyF': 0x06, 
            'KeyG': 0x07, 'KeyH': 0x08, 'KeyI': 0x09, 'KeyJ': 0x0A, 'KeyK': 0x0B, 'KeyL': 0x0C, 
            /* no CTRL-M */ 'KeyN': 0x0E, 'KeyO': 0x0F, 'KeyP': 0x10, 'KeyQ': 0x11, 'KeyR': 0x12, 
            'KeyS': 0x13, /* No CTRL-T */ 'KeyU': 0x15, 'KeyV': 0x16, 'KeyW': 0x17, 'KeyX': 0x18, 
            'KeyY': 0x19, 'KeyZ': 0x1A,
            'BracketLeft': 0x1B,
            'Slash': 0x1C,
            'BracketRight': 0x1D,
            'Minus': 0x1E,
            'Equal': 0x1F,
            'ArrowDown': 0x11,
            'ArrowUp': 0x91,
            'ArrowRight': 0x1D,
            'ArrowLeft': 0x9D,
        },
        'shiftctrlalt': { // upper control set
            'KeyA': 0x81, 'KeyB': 0x82, 'KeyC': 0x83, 'KeyD': 0x84, 'KeyE': 0x85, 'KeyF': 0x86, 
            'KeyG': 0x87, 'KeyH': 0x88, 'KeyI': 0x89, 'KeyJ': 0x8A, 'KeyK': 0x8B, 'KeyL': 0x8C, 
            /* No CTRL-M */ 'KeyN': 0x8E, 'KeyO': 0x8F, 'KeyP': 0x90, 'KeyQ': 0x91, 'KeyR': 0x92, 
            'KeyS': 0x93, /* No CTRL-T */ 'KeyU': 0x95, 'KeyV': 0x96, 'KeyW': 0x97, 'KeyX': 0x98, 
            'KeyY': 0x99, 'KeyZ': 0x9A,
            'BracketLeft': 0x9B,
            'Slash': 0x9C,
            'BracketRight': 0x9D,
            'Minus': 0x9E,
            'Equal': 0x9F
        },
    }
    static hostIgnoreKeys = {
        'macOS': { 'alt': 'ALL' }
    }
    static invalidChars = 'àèìòùáéíóúäëïöüÿâêîôûãõñ' // these are all of them according to Gemini
    static diacriticals = [ 0x60, 0xB4, 0xA8, 0x02C6, 0x02DC ]

    static petsciiKeymap = { }

    static editorConfig = {
        brackets: [ [ '(', ')' ] ],
    }

    static languageRoot  = [
        [ /^\d+/, 'linenumber' ],
        // NOTE: known bug means look-behind doesn't work (see: https://github.com/microsoft/monaco-editor/issues/3441)
        [ /(?<=go *(to|sub) *)\d+/, 'linenumber' ],
        [ /(?<=then *)\d+/, 'linenumber' ],
        [ /(`|rem).*/, 'comment' ],
        [ new RegExp('(\\+|\\-|\\/|\\*|\uE01E|\\<|\\=|\\>|AND|OR|NOT)'), 'operator' ],
        // we will insert keywords here
        [ /[a-z][a-z0-9]*[$%]?/, {
            cases: {
                '@keywords' : 'keyword',
                '@default': 'variable'
            }
        } ],
        // we will insert reserved variables here
        [ /[+-]?\d*\.?\d+(e?[+-]?\d+)?/, 'number' ],
        [ /\uE05E/, 'number' ], // pi
        [ /".*?("|$)/, 'string' ],
        [ /[\(\)]/, 'paren' ],
    ]

    static headerStart = '`` EPRG HEADER START'
    static headerEnd = '`` EPRG HEADER END'
    static themes = {}

    static {
        this.petsciiKeymap['pet-g'] = this.baseKeyMappings
        this.petsciiKeymap['pet-b'] = {
            'none': {
                'Tab': 0x09, 
                'Backslash': 0x5C, // backslash (or gp-pound on cbm2)
            },
            'shift': { ...this.baseKeyMappings.shift },
            'shiftalt': { ...this.baseKeyMappings.shiftalt },
            'ctrlalt': { ...this.baseKeyMappings.ctrlalt },
            'shiftctrlalt': { ...this.baseKeyMappings.shiftctrlalt },
        }
        this.petsciiKeymap['cbm2'] = this.petsciiKeymap['pet-b']
        this.petsciiKeymap['vic20'] = {
            'none': {
                'Backslash': 0x6D, // diagonal top-left to bottom-right
                'F1': 0x85, 'F3': 0x86, 'F5': 0x87, 'F7': 0x88,
                'F2': 0x89, 'F4': 0x8A, 'F6': 0x8B, 'F8': 0x8C,
            },
            'shift': { ...this.baseKeyMappings.shift },
            'shiftalt': { ...this.baseKeyMappings.shiftalt },
            'ctrlalt': { 
                ...this.baseKeyMappings.ctrlalt,
                'Digit1': 0x90, 'Digit2': 0x05, 'Digit3': 0x1C, 'Digit4': 0x9F, // control colors
                'Digit5': 0x9C, 'Digit6': 0x1E, 'Digit7': 0x1F, 'Digit8': 0x9E,
                'Digit9': 0x12, 'Digit0': 0x92, // reverse on/off
            },
            'shiftctrlalt': { ...this.baseKeyMappings.shiftctrlalt },
        }
        this.petsciiKeymap['c64'] = {
            'none': { ...this.petsciiKeymap['vic20'].none },
            'shift': { ...this.petsciiKeymap['vic20'].shift },
            'shiftalt': { 
                ...this.petsciiKeymap['vic20'].shiftalt,
                'Digit1': 0x81, 'Digit2': 0x95, 'Digit3': 0x96, 'Digit4': 0x97, // cbm colors
                'Digit5': 0x98, 'Digit6': 0x99, 'Digit7': 0x9A, 'Digit8': 0x9B,
            },
            'ctrlalt': { ...this.petsciiKeymap['vic20'].ctrlalt },
            'shiftctrlalt': { ...this.baseKeyMappings.shiftctrlalt },
        }
        this.petsciiKeymap['c128'] = this.petsciiKeymap['c64']
        this.petsciiKeymap['c128-80'] = this.petsciiKeymap['c64']
        this.petsciiKeymap['c16'] = this.petsciiKeymap['c64']
        this.petsciiKeymap['plus-4'] = this.petsciiKeymap['c64']

        this.language = {}
        for (const version in Tokenizer.keywords) {
            this.language[version] = {
                keywords: Tokenizer.keywords[version],
                ignoreCase: true,
                tokenizer: { root: [] }
            }
            for (const def of this.languageRoot) {
                this.language[version].tokenizer.root.push(def)
            }
            this.language[version].tokenizer.root.splice(5, 0, [ new RegExp(Tokenizer.keywordRegex[version]), 'keyword' ])
            const reserved = Tokenizer.reserved[version].map((r) => r.replace('$', '\\$'))
            this.language[version].tokenizer.root.splice(6, 0, [ new RegExp(`(${reserved.join('|')})`), 'reserved' ])
        }

        this.ignoreKeys = this.hostIgnoreKeys[window.navigator.userAgentData.platform] || {}
    }
    static monacoSetUp = false

    setUpMonaco() {
        if (Editor.monacoSetUp) { return }
        Editor.monacoSetUp = true
        for (const version in Editor.language) {
            const id = `${version}basic`
            monaco.languages.register({ id })
            monaco.languages.setLanguageConfiguration(id, Editor.editorConfig)
            monaco.languages.setMonarchTokensProvider(id, Editor.language[version])
        }
    }

    constructor() {
        this.setUpMonaco()
        this.container = document.getElementById('container')
        this.editor = monaco.editor.create(this.container, {
            language: 'v7basic',
            theme: 'vs-dark',
            fontFamily: 'cbmthick-40',
            fontSize: 16,
            automaticLayout: true,
            lineNumbers: false,
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            minimap: {enabled: false},
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            renderLineHighlight: 'none',
            letterSpacing: `${this.letterSpacing}px`,
            scrollBeyondLastLine: false,
            scrollBar: {horizontal: "hidden"},
            wordWrap: 'on',
            value: '',
            bracketPairColorization: { enabled: false },
            cursorStyle: 'block',
        })
        document.fonts.ready.then(() => {
            monaco.editor.remeasureFonts()
        })

        this.maximumLineLength = 160
        this.editor.onKeyDown((key) => { this.keyDown(key) })

        //this.editor.onDidChangeModelContent((e) => { this.modelChanged(e) })
        this.editor.addCommand(monaco.KeyCode.Enter, (accessor) => {
            this.processLine()
        })
        this.newCursorLocation = null
        this.editor.onDidFocusEditorWidget(() => { this.restoreCursor() })
        this.editor.onDidBlurEditorWidget(() => { this.newCursorLocation = this.editor.getPosition() })
        this.editor.onDidChangeModelContent((event) => { this.checkInsertions(event) })

        this.lineDecorations = []
        this.variableReferences = {}
        this.notations = {}
        this.checksumAlgorithm = null
        this.charSet = 'UPPER/Graphics'
        this.fontOffset = 0
        this.charSetOffset = 0
        this.minFontChar = '\uE000'
        this.maxFontChar = '\uE1FF'

        this.hostMachine = window.navigator.userAgentData.platform

        this.petscii = new Petscii()
        this.enableEditor(false)
    }

    restoreCursor() {
        if (this.newCursorLocation) {
            setTimeout(() => {
                this.editor.setPosition(this.newCursorLocation)
                this.newCursorLocation = null
            }, 20)
        }
    }

    checkInsertions(event) {
        if (event.changes.length !== 1) { return }
        const change = event.changes[0]
        let range = change.range
        const text = change.text
        if (Editor.diacriticals.includes(text.codePointAt(0))) {
            if (text.length === 2) {
                range.startColumn -= 1
                setTimeout(() => { this.editor.executeEdits("", [{ range, text: '', forceMoveMarkers: true }]) }, 10)
            }
        } else if (Editor.invalidChars.includes(text.charAt(0))) {
                this.editor.executeEdits("", [{ range, text: '', forceMoveMarkers: true }]) 
        }
    }

    generateEditorTheme(name, colors) {
        const theme = {
            base: colors.base,
            inherit: true,
            rules: [
                { token: 'linenumber', foreground: colors.linenumber },
                { token: 'operator', foreground: colors.operator },
                { token: 'reserved', foreground: colors.reserved },
                { token: 'special', foreground: colors.special },
                { token: 'keyword', foreground: colors.keyword },
                { token: 'variable', foreground: colors.variable },
                { token: 'string', foreground: colors.string },
                { token: 'comment', foreground: colors.comment },
                { token: 'number', foreground: colors.number },
                { token: 'parens', foreground: colors.parens },
            ],
            colors: {
                'editor.background': colors.background,
                'editor.foreground': colors.foreground,
                'editorCursor.foreground': colors.foreground,
                'editorBracketHighlight.foreground1': colors.foreground,
                'editorBracketHighlight.foreground2': colors.foreground,
                'editorBracketHighlight.foreground3': colors.foreground,
                'editorBracketHighlight.foreground4': colors.foreground,
                'editorBracketHighlight.foreground5': colors.foreground,
                'editorBracketHighlight.foreground6': colors.foreground,
            }
        }
        monaco.editor.defineTheme(`${name}theme`, theme)
    }

    setMachine(machine, charSet = 'default') {
        const version = `${machine.language || 'v2'}basic`
        monaco.editor.setModelLanguage(this.editor.getModel(), version)
        // TODO: theme returns char set and maybe a control?
        this.machine = machine
        this.petsciiKeymap = Editor.petsciiKeymap[machine.name]
        this.setCharSet(charSet ?? 'default')
    }

    setCharSet(charSet = 'default') {
        this.petscii.setMachine(this.machine, charSet)
    }

    setTheme(name, font) {
        monaco.editor.setTheme(`${name}theme`)
        this.editor.updateOptions({ fontFamily: font || 'cbmthick-40' })
        setTimeout(() => { monaco.editor.remeasureFonts() }, 25)
    }

    enableEditor(enable = true) {
        this.container.classList.toggle('read-only-mode', !enable)
        this.editor.updateOptions({ readOnly: !enable })
        if (enable) { 
            this.editor.focus() 
            setTimeout(() => { this.editor.setPosition({ lineNumber: 1, column: 1 }) })
        }
    }

    setProgram(program) {
        program = this.parseNotationsHeader(program)
        this.editor.setValue(program)
        this.parseLines()
        this.notateLines()
    }

    setHelpText(text) {
        this.editor.setValue(text)
    }

    getProgram(withNotations = true) {
        return (withNotations ? this.notationsHeader() : '') + this.editor.getValue()
    }

    writeWord(val, array, idx = 0) {
        const h = Math.floor(val / 256)
        const l = val - h * 256
        array.set([ l, h ], idx)
    }

    getProgramBytes(startAddr) {
        let saBytes = new Uint8Array(2)
        this.writeWord(startAddr, saBytes)
        let arrayOfArrays = [ saBytes ]
        let totalBytes = 2
        let lineAddr = startAddr
        let lineIndex = 1
        for (const line of this.editor.getValue().split('\n')) {
            const {  byteArray, lineNumber } = window.tokenizer.tokenizeLine(line)
            if (byteArray.length > 0) {
                if (lineIndex > 0) {
                    this.writeWord(lineAddr, arrayOfArrays[lineIndex - 1])
                }
                let lineByteArray = new Uint8Array(byteArray.length + 3)
                lineByteArray.set(byteArray, 2) // open space for next line number
                arrayOfArrays.push(lineByteArray)
                lineIndex += 1
                totalBytes += lineByteArray.length
                lineAddr += lineByteArray.length
            }
        }
        this.writeWord(lineAddr, arrayOfArrays[lineIndex - 1])
        let fileBytes = new Uint8Array(totalBytes + 3) // two bytes to end program, 1 additional byte for BASIC EOF
        let fileIndex = 0
        for (const lb of arrayOfArrays) {
            fileBytes.set(lb, fileIndex)
            fileIndex += lb.length
        }
        return fileBytes
    }

    keyDown(key) {
        const event = key.event;
        if (key.metaKey) { return }
        const model = this.editor.getModel()
        const position = this.editor.getPosition()
        const lineValue = model.getLineContent(position.lineNumber)
        if (lineValue.length >= this.maximumLineLength - 1) {
            key.preventDefault()
            key.stopPropagation()
            const trimmedLineValue = lineValue.substring(0, this.maximumLineLength - 1)
            this.editor.executeEdits("", [{
                range: new monaco.Range(position.lineNumber, 1, position.lineNumber, lineValue.length + 1),
                text: trimmedLineValue
            }])
            return
        }
        let modifier = (key.shiftKey ? 'shift' : '') + (key.ctrlKey ? 'ctrl' : '') + (key.altKey ? 'alt' : '')
        if (modifier.length === 0) { modifier = 'none' }
        const ignoreKeys = Editor.ignoreKeys[modifier] || []
        if (ignoreKeys === 'ALL' || ignoreKeys.includes(key.code)) {
            key.preventDefault()
            key.stopPropagation()
            return
        }
        const lookup = this.petsciiKeymap[modifier] || {}
        let petscii = lookup[key.code]
        if (petscii) {
            key.preventDefault()
            key.stopPropagation()
            if (petscii === 0x00) { return }
            const petsciiChar = this.petscii.table[petscii]
            console.log('petscii', petscii.toString(16), 'gets char', petsciiChar.codePointAt(0).toString(16))
            this.editor.executeEdits("", [{
                range: new monaco.Range(
                    position.lineNumber,
                    position.column,
                    position.lineNumber,
                    position.column
                ),
                text: petsciiChar,
                forceMoveMarkers: true
            }]);
            return
        } else if (modifier === 'none' && key.code.startsWith('Key')) {
            key.preventDefault()
            key.stopPropagation()
            let write = key.code.substring(3)
            if (this.charSet === 'lower/UPPER') {
                write = write.toLowerCase()
            }
            this.editor.executeEdits("", [{
                range: new monaco.Range(
                    position.lineNumber,
                    position.column,
                    position.lineNumber,
                    position.column
                ),
                text: write,
                forceMoveMarkers: true
            }]);
            return
        } else {
            console.log('no code for', modifier, key.code)
        }
    }

    parseSpecialComment(specialComment, lineNumber, lineContent) {
        let notationChanged = false
        if (specialComment && specialComment.startsWith("`")) {
            const notationInfo = specialComment.substring(1).match(/ *(\d+|[A-Z][A-Z0-9]*(\$|\%|\(|\$\(|\%\()?) *\= *(.*)/)
            if (notationInfo && notationInfo.length >= 2) {
                const notated = notationInfo[1].trim()
                const notation = (notationInfo.length > 2) ? notationInfo[3].trim() : ''
                if (notation.length === 0) {
                    delete this.notations[notated]
                } else {
                    this.notations[notated] = notation
                }
                notationChanged = true
            }
            const commentPos = lineContent.indexOf("`" + specialComment)
            if (commentPos >= 0) {
                const endLine = (commentPos === 0) ? lineNumber + 1 : lineNumber
                const endCol = (commentPos === 0) ? 1 : lineContent.length
                this.editor.executeEdits("", [{
                    range: new monaco.Range(lineNumber, commentPos + 1, endLine, endCol),
                    text: ''
                }])
            }
        }

        this.notateLines(lineNumber)
    }

    notateLine(lineNumber, lineContent, basicLine = null, variables = null) {
        if (!basicLine) {
            let lineNo = lineContent.match(/^ *(\d+)/)
            if (lineNo && lineNo.length === 2) {
                lineNo = lineNo[1]
            }
            if (!lineNo) { return }
            basicLine = parseInt(lineNo)
        }
        variables = variables || this.variableReferences[basicLine] || {}
        const lineDecorations = []
        if (this.lineDecorations[basicLine]) {
            this.lineDecorations[basicLine].clear()
            this.lineDecorations[basicLine] = 0
        }
        const lineNotation = this.notations[basicLine]
        if (lineNotation) {
            lineDecorations.push({
                range: new monaco.Range(lineNumber, 1, lineNumber, basicLine.toString().length + 1),
                options: {
                    after: {
                        content: lineNotation,
                        inlineClassName: 'special-variable',
                        inlineClassNameAffectsLetterSpacing: true
                    }
                }
            })
        }

        for (const variable in variables) {
            const varNotation = this.notations[variable]
            if (!varNotation) { continue }
            for (const varLocation of variables[variable]) {
                lineDecorations.push( {
                    range: new monaco.Range(lineNumber, varLocation + 1, lineNumber, varLocation + variable.length + 1),
                    options: {
                        after: {
                            content: varNotation,
                            inlineClassName: 'special-variable',
                            inlineClassNameAffectsLetterSpacing: true,
                            // stickiness? (DecorationRangeBehavior)
                        }
                    }
                })
            }
        }

        if (lineDecorations.length > 0) {
            this.lineDecorations[basicLine] = this.editor.createDecorationsCollection(lineDecorations)
        }
    }

    notateLines(ignoreLine = -1) {
        // apply to every line (other than this one)
        const lines = this.editor.getValue().split('\n')
        for (let line = 1; line <= lines.length; line++) {
            if (line === ignoreLine) continue
            this.notateLine(line, lines[line-1])
        }
    }

    processLine() {
        const model = this.editor.getModel()
        const position = this.editor.getPosition()
        const lineNumber = position.lineNumber
        const lines = this.editor.getValue().split('\n')
        let lineContent = lines[lineNumber - 1]
        if (lineNumber < lines.length + 1 && position.column === 1) {
            this.editor.trigger('keyboard', 'type', { text: '\n' })
            // TODO shuffle decorations list for all lines below this one
            return
        } else if (position.column - 1 < lineContent.length) {
            lineContent = lineContent.substring(0, position.column - 1)
            this.editor.trigger('keyboard', 'type', { text: '\n' })
        } else if (lineNumber === lines.length) {
            this.editor.trigger('keyboard', 'type', { text: '\n' })
        } else {
            this.editor.setPosition({ column: 1, lineNumber: lineNumber + 1 })
        }

        const {  byteArray, lineNumber: basicLine, variables, specialComment } = window.tokenizer.tokenizeLine(lineContent)
        if (byteArray.length > 0) {
            this.variableReferences[basicLine] = variables
        }
        this.parseSpecialComment(specialComment, lineNumber, lineContent)
        this.notateLine(lineNumber, lineContent, basicLine, variables)
    }

    parseLines() {
        const lines = this.editor.getValue().split('\n')
        for (const line of lines) {
            const { byteArray, lineNumber, variables } = window.tokenizer.tokenizeLine(line)
            if (byteArray.length > 0) {
                this.variableReferences[lineNumber] = variables
            }
        }
    }

    cleanProgram() {
        const programLines = {}
        let precedingLines = []
        for (const line of this.editor.getValue().split('\n')) {
            let lineNumber = line.match(/^ *(\d+)/)
            if (lineNumber && lineNumber.length === 2) {
                lineNumber = parseInt(lineNumber[1])

                const existingLine = programLines[lineNumber]
                if (existingLine) {
                    programLines[lineNumber].precedingLines.push(existingLine)
                } else {
                    programLines[lineNumber] = { preceding: precedingLines || [] }
                    precedingLines = []
                }
                programLines[lineNumber].line = line
            } else {
                precedingLines.push(line)
            }
        }
        let program = ''
        for (const pline of Object.keys(programLines).sort((a,b) => { return parseInt(a) - parseInt(b) })) {
            const plineContent = programLines[pline]
            for (const precede of plineContent.preceding) {
                program += precede + '\n'
            }
            program += plineContent.line + '\n'
        }
        this.editor.setValue(program)
        this.parseLines()
        this.notateLines()
    }

    notationsHeader() {
        if (Object.keys(this.notations).length === 0) {
            return ''
        }

        let header = Editor.headerStart + '\n'
        for (const notation in this.notations) {
            header += '`` ' + notation + '=' + this.notations[notation] + '\n'
        }
        header += Editor.headerEnd + '\n'
        return header
    }

    parseNotationsHeader(program) {
        this.notations = {}
        const headerStart = program.indexOf(Editor.headerStart)
        if (headerStart >= 0) {
            const headerEnd = program.indexOf(Editor.headerEnd)
            const header = program.substring(headerStart + Editor.headerStart.length, headerEnd).trim()
            for (const headerLine of header.split('\n')) {
                const notation = headerLine.match(/`` (.*)\=(.*)/)
                let notated = notation[1]
                if (/^\d+/.test(notated)) {
                    notated = parseInt(notated)
                }
                this.notations[notated] = notation[2]
            }

            return program.substring(headerEnd + Editor.headerEnd.length).trim()
        }
        return program
    }

    setChecksumAlgorithm(algorithm) {
        this.checksumAlgorithm = algorithm
        if (algorithm === null) {
            this.editor.updateOptions({ lineNumbers: false })
        } else {
            this.editor.updateOptions({ 
                lineNumbers: (lineNumber) => {
                    const lineContent = this.editor.getModel().getLineContent(lineNumber)
                    if (lineContent.trim().length === 0) { return '' }
                    return this.checksumAlgorithm(lineContent) + '&nbsp;'
                },
                lineNumbersMinChars: 3
            })
        }
    }

    insertInto(str) {
        var position = this.editor.getSelection()
        var range = new monaco.Range(position.selectionStartLineNumber, position.selectionStartColumn, position.positionLineNumber, position.positionColumn)
        var id = { major: 1, minor: 1 }
        var op = {identifier: id, range, text: str, forceMoveMarkers: true}
        this.editor.executeEdits("", [op])
        this.newCursorLocation = { lineNumber: position.positionLineNumber, column: position.selectionStartColumn + str.length }
    }
}

window.addEventListener('load', () => {
    require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }});
    require(['vs/editor/editor.main'], () => {
        window.editor = new Editor()
        window.editor.disabled = true
    })
})

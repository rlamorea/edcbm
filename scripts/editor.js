class Editor {
    static petsciiKeymap = {
        'none' : {
            'Backslash': Petscii.named['shift-@]'],
        },
        'shift': {
            'Digit6': Petscii.named['up-arrow'],
            'Backquote': Petscii.named['left-arrow'],
            'BracketLeft': Petscii.named['£'],
            'BracketRight': Petscii.named['pi'],
            'Backslash': Petscii.named['shift--'],
            'Minus': Petscii.named['cbm-@'],
            'KeyA': Petscii.named['shift-A'],
            'KeyB': Petscii.named['shift-B'],
            'KeyC': Petscii.named['shift-C'],
            'KeyD': Petscii.named['shift-D'],
            'KeyE': Petscii.named['shift-E'],
            'KeyF': Petscii.named['shift-F'],
            'KeyG': Petscii.named['shift-G'],
            'KeyH': Petscii.named['shift-H'],
            'KeyI': Petscii.named['shift-I'],
            'KeyJ': Petscii.named['shift-J'],
            'KeyK': Petscii.named['shift-K'],
            'KeyL': Petscii.named['shift-L'],
            'KeyM': Petscii.named['shift-M'],
            'KeyN': Petscii.named['shift-N'],
            'KeyO': Petscii.named['shift-O'],
            'KeyP': Petscii.named['shift-P'],
            'KeyQ': Petscii.named['shift-Q'],
            'KeyR': Petscii.named['shift-R'],
            'KeyS': Petscii.named['shift-S'],
            'KeyT': Petscii.named['shift-T'],
            'KeyU': Petscii.named['shift-U'],
            'KeyV': Petscii.named['shift-V'],
            'KeyW': Petscii.named['shift-W'],
            'KeyX': Petscii.named['shift-X'],
            'KeyY': Petscii.named['shift-Y'],
            'KeyZ': Petscii.named['shift-Z'],
        },
        'alt': {
            'Minus': Petscii.named['shift-*'],
            'Equal': Petscii.named['shift-+'],
            'BracketLeft': Petscii.named['cbm--'],
            'BracketRight': Petscii.named['cbm-£'],
            'Backslash': Petscii.named['cbm-+'],
            'Semicolon': Petscii.named['shift-£'],
            'Quote': Petscii.named['cbm-*'], 
            'Comma': '\x00', // ignore
            'Period': '\x00', // ignore
            'Slash': '\x00', // ignore
            'KeyA': Petscii.named['cbm-A'],
            'KeyB': Petscii.named['cbm-B'],
            'KeyC': Petscii.named['cbm-C'],
            'KeyD': Petscii.named['cbm-D'],
            'KeyE': Petscii.named['cbm-E'],
            'KeyF': Petscii.named['cbm-F'],
            'KeyG': Petscii.named['cbm-G'],
            'KeyH': Petscii.named['cbm-H'],
            'KeyI': Petscii.named['cbm-I'],
            'KeyJ': Petscii.named['cbm-J'],
            'KeyK': Petscii.named['cbm-K'],
            'KeyL': Petscii.named['cbm-L'],
            'KeyM': Petscii.named['cbm-M'],
            'KeyN': Petscii.named['cbm-N'],
            'KeyO': Petscii.named['cbm-O'],
            'KeyP': Petscii.named['cbm-P'],
            'KeyQ': Petscii.named['cbm-Q'],
            'KeyR': Petscii.named['cbm-R'],
            'KeyS': Petscii.named['cbm-S'],
            'KeyT': Petscii.named['cbm-T'],
            'KeyU': Petscii.named['cbm-U'],
            'KeyV': Petscii.named['cbm-V'],
            'KeyW': Petscii.named['cbm-W'],
            'KeyX': Petscii.named['cbm-X'],
            'KeyY': Petscii.named['cbm-Y'],
            'KeyZ': Petscii.named['cbm-Z'],
            'Digit1': Petscii.named['orange'],
            'Digit2': Petscii.named['brown'],
            'Digit3': Petscii.named['lt-red'],
            'Digit4': Petscii.named['dk-gray'],
            'Digit5': Petscii.named['med-gray'],
            'Digit6': Petscii.named['lt-green'],
            'Digit7': Petscii.named['lt-blue'],
            'Digit8': Petscii.named['lt-gray'],
        },
        'ctrlalt': {
            'ArrowLeft': Petscii.named['left'],
            'ArrowRight': Petscii.named['right'],
            'ArrowUp': Petscii.named['up'],
            'ArrowDown': Petscii.named['down'],
            'KeyB': Petscii.named['underline-on'],
            'KeyC': Petscii.named['stop'],
            'KeyE': Petscii.named['cbm-E'], 
            'KeyF': Petscii.named['cbm-I'], 
            'KeyG': Petscii.named['bell'],
            // 'KeyH': Petscii.named['lock-case'],
            'KeyI': Petscii.named['tab'],
            'KeyJ': Petscii.named['linefeed'],
            'KeyK': Petscii.named['lock-case'],
            'KeyL': Petscii.named['unlock-case'],
            'KeyM': Petscii.named['cbm-N'],
            'KeyN': Petscii.named['lower-case'],
            'KeyO': Petscii.named['flash-on'],
            'KeyS': Petscii.named['home'],
            'KeyT': Petscii.named['delete'],
            'KeyU': Petscii.named['cbm-U'],
            'KeyX': Petscii.named['toggle-tab'],
            'BracketLeft': Petscii.named['esc'],
            'Digit1': Petscii.named['f1'],
            'Digit2': Petscii.named['f2'],
            'Digit3': Petscii.named['f3'],
            'Digit4': Petscii.named['f4'],
            'Digit5': Petscii.named['f5'],
            'Digit6': Petscii.named['f6'],
            'Digit7': Petscii.named['f7'],
            'Digit8': Petscii.named['f8'],
        },
        'shiftctrlalt': {
            // 'KeyB': '\uE0C2',
            'KeyE': Petscii.named['f1'],
            'KeyF': Petscii.named['f3'],
            'KeyG': Petscii.named['f5'],
            'KeyH': Petscii.named['f7'],
            'KeyI': Petscii.named['f2'],
            'KeyJ': Petscii.named['f4'],
            'KeyK': Petscii.named['f6'],
            'KeyL': Petscii.named['f8'],
            'KeyM': Petscii.named['shift-return'],
            'KeyN': Petscii.named['upper-case'],
            // 'KeyO': '\uE0CF',
            'KeyS': Petscii.named['clear'],
            'KeyT': Petscii.named['insert'],
        },
        'ctrl': {
            'Digit1': Petscii.named['black'],
            'Digit2': Petscii.named['white'],
            'Digit3': Petscii.named['red'],
            'Digit4': Petscii.named['cyan'],
            'Digit5': Petscii.named['purple'],
            'Digit6': Petscii.named['green'],
            'Digit7': Petscii.named['blue'],
            'Digit8': Petscii.named['yellow'],
            'Digit9': Petscii.named['reverse-on'],
            'Digit0': Petscii.named['reverse-off'],
        }
    }

    static diacriticals = [
        0xa8,
        0xb4,
        0x2c6,
        0x2d6,
        0x60,
    ]

    static editorConfig = {
        brackets: [ [ '(', ')' ] ],
    }

    static reserved = {
        'v2': [ 'ST', 'TI', 'TI$' ],
        'v3.5': [ 'DS', 'DS$', 'EL', 'ER' ],
        'v4': [ 'DS', 'DS$' ],
        'v4+': [ 'EL' ],
        'v7': [ 'DS', 'DS$', 'EL', 'ER' ]
    }

    static keywords = {
        'v2': [
            'ABS', 'ASC', 'ATN', 
            'CHR$', 'CLOSE', 'CLR', 'CMD', 'CONT', 'COS', 
            'DATA', 'DEF', 'DIM', 
            'END', 'EXP', 
            'FN', 'FOR', 'FRE', 
            'GET', 'GET#', 'GOTO', 'GO TO', 'GOSUB', 
            'IF', 'INPUT', 'INPUT#', 'INT', 
            'LEFT$', 'LEN', 'LET', 'LIST', 'LOAD', 'LOG',
            'MID$',
            'NEW', 'NEXT',
            'ON', 'OPEN',
            'PEEK', 'POKE', 'POS', 'PRINT', 'PRINT#', 
            'READ', 'REM', 'RESTORE', 'RETURN', 'RIGHT$', 'RND', 'RUN', 
            'SAVE', 'SGN', 'SIN', 'SPC', 'SQR', 'STEP', 'STOP', 'STR$', 'SYS',
            'TAB', 'TAN', 'THEN', 'TO',
            'USR',
            'VAL', 'VERIFY',
            'WAIT',
        ],
        'v3.5': [
            'AUTO', 
            'BACKUP', 'BOX',
            'CHAR', 'CIRCLE', 'COLLECT', 'COLOR', 'COPY', 
            'DEC', 'DELETE', 'DIRECTORY', 'DLOAD', 'DO', 'DRAW', 'DSAVE', 
            'ELSE', 'ERR$', 'EXIT', 
            'GETKEY', 'GRAPHIC', 'GSHAPE', 
            'HEADER', 'HELP', 'HEX$',
            'INSTR', 
            'JOY', 
            'KEY',
            'LOCATE', 'LOOP',
            'MONITOR', 
            'PAINT', 'PUDEF',
            'RCLR', 'RDOT', 'RENAME', 'RENUMBER', 'RESUME', 'RGR', 'RLUM', 
            'SCALE', 'SCNCLR', 'SOUND', 'SSHAPE',
            'TRAP', 'TROFF', 'TRON',
            'UNTIL', 'USING',
            'VOL',
            'WHILE',
        ],
        'v4': [
            'APPEND', 
            'BACKUP', 
            'CATALOG', 'COLLECT', 'CONCAT', 'COPY', 
            'DCLOSE', 'DIRECTORY', 'DLOAD', 'DOPEN', 'DSAVE', 
            'RECORD', 'RENAME', 
            'SCRATCH', 
        ],
        'v4+': [
            'BANK', 'BLOAD', 'BSAVE', 
            'DCLEAR', 'DELETE', 'DISPOSE', 
            'ELSE', 'ERR$', 'ESC', 
            'INSTR', 
            'KEY', 
            'PUDEF', 
            'RESUME', 
            'TRAP', 
            'USING', 
        ],
        'v7': [
            'APPEND', 'AUTO', 
            'BACKUP', 'BANK', 'BEGIN', 'BEND', 'BLOAD', 'BOOT', 'BOX', 'BSAVE', 'BUMP',
            'CATALOG', 'CHAR', 'CIRCLE', 'COLLECT', 'COLLISION', 'COLOR', 'CONCAT', 'COPY', 
            'DCLEAR', 'DCLOSE', 'DEC', 'DELETE', 'DIRECTORY', 'DLOAD', 'DO', 'DOPEN', 'DRAW', 'DSAVE', 'DVERIFY', 
            'ELSE', 'ENVELOPE', 'ERR$', 'EXIT', 
            'FAST', 'FETCH', 'FILTER', 
            'GETKEY', 'GO64', 'GRAPHIC', 'GSHAPE', 
            'HEADER', 'HELP', 'HEX$', 
            'INSTR', 
            'JOY', 
            'KEY', 
            'LOCATE', 'LOOP', 
            'MONITOR', 'MOVSPR', 
            'PAINT', 'PEN', 'PLAY', 'POINTER', 'POT', 'PUDEF', 
            'RCLR', 'RDOT', 'RECORD', 'RENAME', 'RENUMBER', 'RESUME', 'RGR', 'REG', 'RSPCOLOR', 'RSPPOS', 'RSPRITE', 'RWINDOW',
            'SCALE', 'SCNCLR', 'SCRATCH', 'SLEEP', 'SLOW', 'SOUND', 'SPRCOLOR', 'SPRDEF', 'SPRITE', 'SPREAD', 'SSHAPE', 'STASH', 'SWAP',
            'TEMPO', 'TRAP', 'TROF', 'TRON', 
            'UNTIL', 'USING', 
            'VOL', 
            'WHILE', 'WIDTH', 'WINDOW',
            'XOR'
        ]
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
        this.reserved['v3.5'] = [ ...this.reserved['v2'], ...this.reserved['v3.5'] ]
        this.reserved['v7'] = [ ...this.reserved['v2'], ...this.reserved['v7'] ]
        this.keywords['v7'] = [ ...this.keywords['v2'], ...this.keywords['v7'] ]
        this.reserved['v4'] = [ ...this.reserved['v2'], ...this.reserved['v4'] ]
        this.reserved['v4+'] = [ ...this.reserved['v4'], ...this.reserved['v4+'] ]

        this.language = {}
        for (const version in this.keywords) {
            this.language[version] = {
                keywords: this.keywords[version],
                ignoreCase: true,
                tokenizer: { root: [] }
            }
            for (const def of this.languageRoot) {
                this.language[version].tokenizer.root.push(def)
            }
            const keywords = this.keywords[version].map((k) => k.replace('$', '\\$'))
            this.language[version].tokenizer.root.splice(5, 0, [ new RegExp(`(${keywords.join('|')})`), 'keyword' ])
            const reserved = this.reserved[version].map((r) => r.replace('$', '\\$'))
            this.language[version].tokenizer.root.splice(6, 0, [ new RegExp(`(${reserved.join('|')})`), 'reserved' ])
        }
    }
    static monacoSetUp = false

    setUpMonaco() {
        if (Editor.monacoSetUp) { return }
        Editor.monacoSetUp = true
        for (const version in Editor.keywords) {
            const id = `${version}basic`
            monaco.languages.register({ id })
            monaco.languages.setLanguageConfiguration(id, Editor.editorConfig)
            monaco.languages.setMonarchTokensProvider(id, Editor.language[version])
        }
    }

    constructor() {
        this.setUpMonaco()
        this.editor = monaco.editor.create(document.getElementById('container'), {
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

        this.lineDecorations = []
        this.variableReferences = {}
        this.notations = {}
        this.checksumAlgorithm = null
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

    setMachine(machine) {
        const version = `${machine.language || 'v2'}basic`
        monaco.editor.setModelLanguage(this.editor.getModel(), version)
    }

    setTheme(name, font) {
        monaco.editor.setTheme(`${name}theme`)
        this.editor.updateOptions({ fontFamily: font || 'cbmthick-40' })
        setTimeout(() => { monaco.editor.remeasureFonts() }, 25)
    }

    setProgram(program) {
        program = this.parseNotationsHeader(program)
        this.editor.setValue(program)
        this.parseLines()
        this.notateLines()
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
        const lookup = Editor.petsciiKeymap[modifier] || {}
        const petscii = lookup[key.code]
        if (petscii) {
            key.preventDefault()
            key.stopPropagation()
            if (petscii === '\x00') { return }
            this.editor.executeEdits("", [{
                range: new monaco.Range(
                    position.lineNumber,
                    position.column,
                    position.lineNumber,
                    position.column
                ),
                text: petscii,
                forceMoveMarkers: true
            }]);
            return
        } else if (modifier === 'none' && key.code.startsWith('Key')) {
            key.preventDefault()
            key.stopPropagation()
            const write = key.code.substring(3)
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
            // console.log('no code for', modifier, key.code)
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
}

window.addEventListener('load', () => {
    require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }});
    require(['vs/editor/editor.main'], () => {
        window.editor = new Editor()
        window.editor.disabled = true
    })
})

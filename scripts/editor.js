class Editor {
    static petsciiKeymap = { }

    static commonEditorConfig = {
        brackets: [ [ '(', ')' ] ],
        comments: { lineComment: "`" }
    }

    // always combined with control
    static menuHotkeys = [ 'KeyQ', 'KeyP', 'KeyD', 'KeyK', 'KeyL' ]

    static languageTokenizerRoot = [
        [ /^\d+/, 'linenumber' ],
        // insert line-no-follows commands here
        [ /then/, 'keyword', '@then' ],
        [ /data/, 'keyword', '@data' ],
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
        [ /"/, 'string', '@string' ],
        [ /(\(|\)]BEGIN|BEND)/, 'paren' ],
    ]
    static languageTokenizerCommon = {
        string: [
            [ /"/, 'string', '@pop' ],
            [ /^ *\d+/, 'linenumber', '@pop' ],
            [ /[^"]+/, 'string' ]
        ],
        goto: [
            [ /:/, '', '@pop' ],
            [ /^ *\d+/, 'linenumber', '@pop' ],
            [ /\d+/, 'linenumber' ],
        ],
        then: [
            [ /:/, '', '@pop' ], 
            [ /^ *\d+/, 'linenumber', '@pop' ],
            [ /[a-z][a-z0-9]*[$%]?/, { 
                cases: {
                    '@keywords' : 'keyword',
                    '@default': 'variable'
                },
                next: '@pop' 
            } ],
            [ /\d+/, 'linenumber' ]
        ],
        data: [
            [ /"/, 'string', '@string' ],
            [ /,/, 'keyword' ],
            [ /^ *\d+/, 'linenumber', '@pop' ],
            [ /:/, 'keyword', '@pop' ],
            [ /\d+/, 'number' ],
            [ /[^,:"]+/, 'string' ]
        ]
    }

    static headerStart = '`` EPRG HEADER START'
    static headerEnd = '`` EPRG HEADER END'
    static themes = {}

    static {
        this.language = {}
        this.editorConfig = {}
        for (const version in Tokenizer.keywords) {
            this.editorConfig[version] = {
                ...this.commonEditorConfig,
                ...Tokenizer.editorConfig[version] || {}
            }

            this.language[version] = {
                keywords: Tokenizer.keywords[version],
                ignoreCase: true,
                tokenizer: {
                    root: [ ...this.languageTokenizerRoot ],
                    ...this.languageTokenizerCommon
                }
            }
            this.language[version].tokenizer.root.splice(5, 0, [ new RegExp(Tokenizer.keywordRegex[version]), 'keyword' ])
            const reserved = Tokenizer.reserved[version].map((r) => r.replace('$', '\\$'))
            this.language[version].tokenizer.root.splice(6, 0, [ new RegExp(`(${reserved.join('|')})`), 'reserved' ])
            const lineNumbered = Tokenizer.lineNumberTokens[version].map((r) => r.replace('$', '\\$'))
            this.language[version].tokenizer.root.splice(1, 0, [ new RegExp(`(${lineNumbered.join('|')})`), 'keyword', '@goto' ])
            for (const additionalTokenizing of (Tokenizer.additionalTokenizing[version] || [])) {
                this.language[version].tokenizer.root.splice(
                    additionalTokenizing.rootInsertLocation, 0, additionalTokenizing.rootInsert
                )
                this.language[version].tokenizer = {
                    ...this.language[version].tokenizer,
                    ...additionalTokenizing.tokenizerInsert
                }
            }
        }
    }
    static monacoSetUp = false

    setUpMonaco() {
        if (Editor.monacoSetUp) { return }
        Editor.monacoSetUp = true
        for (const version in Editor.language) {
            const id = `${version}basic`
            monaco.languages.register({ id })
            monaco.languages.setLanguageConfiguration(id, Editor.editorConfig[version])
            monaco.languages.setMonarchTokensProvider(id, Editor.language[version])
        }
    }

    getKeyBindingsToRemove() {
        return [
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.AltCmd | monaco.KeyCode.LeftArrow,
            monaco.KeyMod.ShiftCmd | monaco.KeyMod.CtrlCmd | monaco.KeyMod.AltCmd | monaco.KeyCode.LeftArrow,
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.AltCmd | monaco.KeyCode.RightArrow,
            monaco.KeyMod.ShiftCmd | monaco.KeyMod.CtrlCmd | monaco.KeyMod.AltCmd | monaco.KeyCode.RightArrow,
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.AltCmd | monaco.KeyCode.Backspace,
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.AltCmd | monaco.KeyCode.Delete,
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            monaco.KeyMod.MetaCmd | monaco.KeyCode.Enter,
            monaco.KeyMod.AltCmd | monaco.KeyCode.Escape,
            monaco.KeyCode.F1,
            monaco.KeyCode.F2,
            monaco.KeyMod.MetaCmd | monaco.KeyCode.F2,
            monaco.KeyMod.ShiftCmd | monaco.KeyMod.MetaCmd | monaco.KeyCode.F2,
            monaco.KeyCode.F4,
            monaco.KeyMod.ShiftCmd | monaco.KeyCode.F4,
            monaco.KeyCode.F7,
            monaco.KeyMod.ShiftCmd | monaco.KeyCode.F7,
            monaco.KeyCode.F8,
            monaco.KeyMod.AltCmd | monaco.KeyCode.F8,
            monaco.KeyMod.ShiftCmd | monaco.KeyCode.F8,
            monaco.KeyMod.ShiftCmd | monaco.KeyMod.AltCmd | monaco.KeyCode.F8,
            monaco.KeyCode.F12,
            monaco.KeyMod.AltCmd | monaco.KeyCode.F12,
            monaco.KeyMod.ShiftCmd | monaco.KeyCode.F12,
            monaco.KeyMod.MetaCmd | monaco.KeyCode.F12,
            monaco.KeyMod.ShiftCmd | monaco.KeyMod.MetaCmd | monaco.KeyCode.F12,
            monaco.KeyMod.AltCmd | monaco.KeyCode.BracketLeft,
            monaco.KeyMod.AltCmd | monaco.KeyMod.MetaCmd | monaco.KeyCode.BracketLeft,
            monaco.KeyMod.AltCmd | monaco.KeyCode.BracketRight,
            monaco.KeyMod.AltCmd | monaco.KeyMod.MetaCmd | monaco.KeyCode.BracketRight,
            monaco.KeyMod.MetaCmd | monaco.KeyCode.Period,
            monaco.KeyMod.AltCmd | monaco.KeyMod.MetaCmd | monaco.KeyCode.Period,
            monaco.KeyMod.ShiftCmd | monaco.KeyMod.MetaCmd | monaco.KeyCode.Period,
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space,
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.AltCmd | monaco.KeyCode.Space,
            monaco.KeyMod.ShiftCmd | monaco.KeyMod.MetaCmd | monaco.KeyCode.Space,
            monaco.KeyMod.ShiftCmd | monaco.KeyMod.AltCmd | monaco.KeyCode.KeyA,
            monaco.KeyMod.ShiftCmd | monaco.KeyMod.AltCmd | monaco.KeyCode.KeyF,
            monaco.KeyMod.MetaCmd | monaco.KeyCode.KeyI,
            monaco.KeyMod.MetaCmd | monaco.KeyCode.KeyK,
            monaco.KeyMod.ShiftCmd | monaco.KeyMod.MetaCmd | monaco.KeyCode.KeyL,
            monaco.KeyMod.ShiftCmd | monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM,
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyN,
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO,
            monaco.KeyMod.ShiftCmd | monaco.KeyMod.AltCmd | monaco.KeyCode.KeyO,
            monaco.KeyMod.ShiftCmd | monaco.KeyMod.MetaCmd | monaco.KeyCode.KeyO,
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP,
            monaco.KeyMod.ShiftCmd | monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR,
            monaco.KeyMod.AltCmd | monaco.KeyMod.MetaCmd | monaco.KeyCode.KeyP,
        ]
    }

    constructor() {
        this.initialized = false
        this.setUpMonaco()
        this.container = document.getElementById('container')
        this.editor = monaco.editor.create(this.container, {
            language: 'v7basic',
            theme: 'vs-dark',
            fontFamily: 'cbmthick-40',
            fontSize: 16,
            automaticLayout: true,
            quickSuggestions: false,                // get rid of autocomplete for now
            parameterHints: { enabled: false },
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
            contextmenu: false
        })
        document.fonts.ready.then(() => {
            monaco.editor.remeasureFonts()
        })

        // remove undesirable keybindings (?)
        const keyBindingsToRemove = this.getKeyBindingsToRemove()
        for (const kb of keyBindingsToRemove) {
            monaco.editor.addKeybindingRule({ keybinding: kb, command: null })            
        }

        this.maximumLineLength = 160
        this.editor.onKeyDown((key) => { this.keyDown(key) })

        this.newCursorLocation = null
        this.editor.onDidFocusEditorWidget(() => { this.restoreCursor() })
        this.editor.onDidBlurEditorWidget(() => { this.loseEditorFocus() })
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
        window.petscii.registerRerenderHandler(this)

        this.bufferedProgram = null

        this.debuggerBox = null

        this.enabled = false
        this.enableEditor(false)
    }

    init() {
        const editorText = window.localStorage.getItem('currentProgram')
        if (editorText) {
            this.editor.setValue(editorText)
        }
        const cursorPos = window.localStorage.getItem('currentCursor')
        if (cursorPos) {
            this.newCursorLocation = JSON.parse(cursorPos)
            this.editor.setPosition(this.newCursorLocation)
            this.editor.revealPosition(this.newCursorLocation, monaco.editor.ScrollType.Immediate)            
        }
        this.initialized = true
    }

    preFontChange() {
        this.newCursorLocation = this.editor.getPosition()
        this.bufferedProgram = this.getProgram()
    }

    postFontChange() {
        // temporarily disable init to ensure resetting the program doesn't accidentially clear stored program
        const init = this.initialized
        this.initialized = false
        this.setProgram(this.bufferedProgram)
        this.initialized = init
        
        this.editor.setPosition(this.newCursorLocation)
        this.bufferedProgram = null
    }

    loseEditorFocus() {
        this.newCursorLocation = this.editor.getPosition()
        window.localStorage.setItem('currentProgram', this.editor.getValue())
        window.localStorage.setItem('currentCursor', JSON.stringify(this.newCursorLocation))
    }

    restoreCursor() {
        if (this.newCursorLocation) {
            setTimeout(() => {
                this.editor.setPosition(this.newCursorLocation)
                this.editor.revealPosition(this.newCursorLocation, monaco.editor.ScrollType.Immediate)
                this.newCursorLocation = null
            }, 20)
        }
        window.menu.activateMenuBar(false, true)
    }

    checkInsertions(event) {
        if (event.changes.length !== 1) { return }
        const change = event.changes[0]
        let range = change.range
        const text = change.text
        if (text.length === 0) { return }
        if (Keymap.diacriticals.includes(text.codePointAt(0))) {
            if (text.length === 2) {
                range.startColumn -= 1
                setTimeout(() => { this.editor.executeEdits("", [{ range, text: '', forceMoveMarkers: true }]) }, 10)
            }
        } else if (Keymap.diacriticalChars.includes(text.charAt(0))) {
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

    setMachine(machine) {
        const version = `${machine.language || 'v2'}basic`
        monaco.editor.setModelLanguage(this.editor.getModel(), version)
        // TODO: theme returns char set and maybe a control?
        this.machine = machine
        this.petsciiKeymap = Editor.petsciiKeymap[machine.name]
    }

    setTheme(name, font) {
        this.editor.updateOptions({ fontFamily: font || 'cbmthick-40' })
        monaco.editor.setTheme(`${name}theme`)
        setTimeout(() => { monaco.editor.remeasureFonts() }, 50) // bumping up to see if hiccups stop happening
    }

    enableEditor(enable = true) {
        this.container.classList.toggle('read-only-mode', !enable)
        this.editor.updateOptions({ readOnly: !enable })
        this.enabled = enable
        if (enable) { 
            // this.editor.setPosition({ lineNumber: 1, column: 1 })
            setTimeout(() => this.editor.focus(), 100) // delay focus until extraneous keypresses settle out and are ignored
            if (this.debuggerBox) {
                this.editor.deltaDecorations(this.debuggerBox, [])
                this.debuggerBox = null
            }
        }
        document.getElementById('edit-actions').style.display = enable ? 'inline' : 'none'
    }

    setProgram(program, machineReady = false) {
        program = this.parseNotationsHeader(program)
        if (!machineReady) { program = window.petscii.petsciiStringToString(program) }
        this.editor.setValue(program)
        if (this.initialized) {
            window.localStorage.setItem('currentProgram', this.editor.getValue())
        }
        this.parseLines()
        this.notateLines()
    }

    setProgramBytes(bytes) {
        this.editor.setValue(window.petscii.petsciiBytesToString(bytes))
        if (this.initialized) {
            window.localStorage.setItem('currentProgram', this.editor.getValue())
        }
        this.parseLines()
    }

    setHelpText(text) {
        this.editor.setValue(text)
    }

    getProgram(withNotations = true) {
        return (withNotations ? this.notationsHeader() : '') + window.petscii.stringToPetsciiString(this.editor.getValue())
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
        if (key.code === 'Enter') {
            this.processLine(key.shiftKey)
            key.preventDefault()
            key.stopPropagation()
            return
        }
        const petscii = window.keymap.getPetsciiForKey(key)
        if (petscii === 0) {
            key.preventDefault()
            key.stopPropagation()
            return
        }
        const model = this.editor.getModel()
        const position = this.editor.getPosition()
        const lineValue = model.getLineContent(position.lineNumber)
        if (lineValue.length >= this.maximumLineLength) {
            key.preventDefault()
            key.stopPropagation()
            const trimmedLineValue = lineValue.substring(0, this.maximumLineLength - 1)
            this.editor.executeEdits("", [{
                range: new monaco.Range(position.lineNumber, 1, position.lineNumber, lineValue.length + 1),
                text: trimmedLineValue
            }])
            return
        }
        if (petscii === Keymap.PASSTHROUGH) { 
            if (key.ctrlKey && Editor.menuHotkeys.includes(key.code)) {
                window.menu.activateMenuBar(true)
                window.menu.keyPressed(key)
            }
            return 
        }
        key.preventDefault()
        key.stopPropagation()
        if (petscii === 0x00) { return }
        
        const petsciiChar = window.petscii.table[petscii]
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

    processLine(forceProcess = false) {
        const model = this.editor.getModel()
        const position = this.editor.getPosition()
        const lineNumber = position.lineNumber
        const lines = this.editor.getValue().split('\n')
        let lineContent = lines[lineNumber - 1]
        if (lineNumber < lines.length + 1 && position.column === 1 && !forceProcess) {
            this.editor.trigger('keyboard', 'type', { text: '\n' })
            // TODO shuffle decorations list for all lines below this one
            return
        } else if (position.column - 1 < lineContent.length && !forceProcess) {
            lineContent = lineContent.substring(0, position.column - 1)
            this.editor.trigger('keyboard', 'type', { text: '\n' })
        } else if (forceProcess || position.column - 1 < lineContent.length) {
            this.editor.setPosition({ column: 1, lineNumber: lineNumber + 1 })
        } else {
            this.editor.trigger('keyboard', 'type', { text: '\n' })
        }

        const { byteArray, lineNumber: basicLine, variables, specialComment } = window.tokenizer.tokenizeLine(lineContent)
        if (basicLine == null && !lineContent.trim().startsWith("`")) {
            const newLineContent = "` " + lineContent
            this.editor.executeEdits("", [{
                range: new monaco.Range(lineNumber, 1, lineNumber, lineContent.length + 1),
                text: newLineContent,
                forceMoveMarkers: true
            }])
            return
        }
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

    debuggerMode(enable = true) {
        if (enable) {
            this.editor.updateOptions({ 
                glyphMargin: true
            })
        } else {
            this.editor.updateOptions({ glyphMargin: false })
        }
    }

    debuggerLineNumber(lineNo, show = true) {
        if (lineNo == null) {
            if (this.debuggerBox) {
                this.editor.deltaDecorations(this.debuggerBox, [])
                this.debuggerBox = null
            }
            return
        }
        const prevDebug = this.debuggerBox ?? []
        // find editor line starting with line number
        const lines = this.editor.getValue().split('\n')
        let highlightLine = -1
        let lineLength = 0
        for (let editorLine = 1; editorLine <= lines.length; editorLine++) {
            const line = lines[editorLine - 1]
            const { byteArray, lineNumber } = window.tokenizer.tokenizeLine(line)
            if (lineNumber == null) { continue }
            if (lineNumber === lineNo) {
                highlightLine = editorLine
                lineLength = line.length + 1
                break
            }
        }
        let newDebug = []
        this.debuggerLineNo = highlightLine
        if (highlightLine >= 0) {
            const range = new monaco.Range(highlightLine, 1, highlightLine, lineLength)
            newDebug.push({ 
                range, options: { 
                    glyphMarginClassName: 'executionPoint',
                    inlineClassName: 'debugHighlight'
                }
            })
            this.editor.revealLine(highlightLine)
        }
        this.debuggerBox = this.editor.deltaDecorations(prevDebug, newDebug)
    }
}

window.addEventListener('load', () => {
    require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }});
    require(['vs/editor/editor.main'], () => {
        window.editor = new Editor()
        window.editor.disabled = true
    })
})

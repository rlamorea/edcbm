class Debugger {
    constructor(server) {
        this.socket = null
        this.port = server.port

        this.debugModeButton = document.getElementById('debug-mode')
        this.debugModeButton.addEventListener('click', () => { this.toggleDebugMode() })
        this.debugModeButton.style.display = 'none'
        this.inDebugMode = window.localStorage.getItem('debugMode') ?? false

        this.lastExecLineNo = null

        this.runButton = document.getElementById('run')
        this.runButton.addEventListener('click', () => this.runProgram())

        this.debugButton = document.getElementById('debug')
        this.debugButton.addEventListener('click', () => { this.startDebug() })

        this.pauseContButton = document.getElementById('debug-pause-cont')
        this.pauseContButton.addEventListener('click', () => { this.pauseContinue() })

        this.stepButton = document.getElementById('debug-step')
        this.stepButton.addEventListener('click', () => { this.step() })

        this.stopButton = document.getElementById('run-stop')
        this.stopButton.addEventListener('click', () => this.stopProgram())

        this.runColumnsButton = document.getElementById('run-columns')
        this.runColumnsButton.addEventListener('click', () => { this.toggleRunColumns() })
        this.runColumnsButton.style.displa = 'none'

        this.runStatusIcon = document.getElementById('run-status-icon')
        this.runStatusText = document.getElementById('run-status')

        this.debugAddresses = null
        this.runMode = 'stopped'
        this.setState('disconnected')

        this.editor = null
        this.machine = null
        this.setBreakPoints = {}
        this.breakPointLocations = null
        this.debuggerLine = null
        this.debuggerLineDecoration = null
    }

    setMachine(machine) {
        this.machine = machine
        if (machine.name.startsWith('c128')) {
            this.runColumnsButton.style.display = 'inline'
            this.toggleRunColumns(machine.name === 'c128-80' ? 'col-80' : 'col-40')
        } else {
            this.runColumnsButton.style.display = 'none'
        }
        this.setBreakPointLocations(true)
    }

    static states = {
        connected: false, // no message or icon
        starting: {},
        running: {},
        debugging: { icon: 'running', message: 'running' },
        paused: {},
        continued: { icon: 'running', message: 'running' },
        stepping: { icon: 'running', message: 'running' },
        ended: { icon: 'stopped', message: 'program ended' },
        stopped: {},
        alert: {},
        disconnected: false
    }
    static buttonDisabledStates = {
        'run': [ 'disconnected', 'starting', 'running', 'debugging', 'ended', 'paused', 'continued', 'stepping' ],
        'debug': [ 'disconnected', 'starting', 'running', 'debugging', 'ended', 'paused', 'continued', 'stepping' ],
        'pause': [ 'disconnected', 'connected', 'starting', 'running', 'ended', 'stopped', 'alert', ],
        'step': [ 'disconnected', 'connected', 'starting', 'running', 'continued', 'ended', 'stepping', 'stopped', 'alert' ],
        'stop': [ 'disconnected', 'connected', 'starting', 'stopped', 'alert' ],
        'cols': [ 'disconnected', 'starting', 'running', 'debugging', 'paused', 'continued', 'stepping', 'ended' ]
    }
    setState(newState, message) {
        // debug mode
        this.debugModeButton.style.display = (newState === 'disconnected') ? 'none' : 'inline'
        // disable debug mode state on disconnect / restore prior on connect
        if ((newState === 'connected' && this.inDebugMode) || newState === 'disconnected') {
            this.toggleDebugMode((newState === 'disconnected') ? false : this.inDebugMode)
        }
        // button states
        this.runButton.disabled = Debugger.buttonDisabledStates.run.includes(newState)
        this.debugButton.disabled = Debugger.buttonDisabledStates.debug.includes(newState)
        this.pauseContButton.disabled = Debugger.buttonDisabledStates.pause.includes(newState)
        this.stepButton.disabled = Debugger.buttonDisabledStates.step.includes(newState)
        this.stopButton.disabled = Debugger.buttonDisabledStates.stop.includes(newState)
        this.runColumnsButton.disabled = Debugger.buttonDisabledStates.cols.includes(newState)

        // now deal with pause/continue
        this.pauseContButton.classList.toggle('cont', newState === 'paused')

        const stateInfo = Debugger.states[newState]
        if (stateInfo === false) {
            this.runStatusIcon.className = ''
            this.runStatusText.innerText = ''
        } else {
            this.runStatusIcon.className = stateInfo.icon ?? newState
            this.runStatusText.innerText = message ?? stateInfo.message ?? newState
        } 

        // enable/disable editor
        if (newState === 'running' || newState === 'debugging') {
            window.editor.enableEditor(false)
        } else if (newState === 'stopped') {
            window.editor.enableEditor()
            if (this.debuggerLineDecoration) {
                this.editor.deltaDecorations(this.debuggerLineDecoration, [])
                this.debuggerLineDecoration = null
            }
        }
    }

    toggleDebugMode(newMode = 'toggle') {
        if (newMode === 'toggle') {
            newMode = !this.inDebugMode
            this.inDebugMode = newMode
            window.localStorage.setItem('debugMode', this.inDebugMode)
        }
        document.body.dataset.debug = newMode
        this.debugModeButton.classList.toggle('enabled', newMode)
        this.setEditorToDebuggerMode(newMode)
    }

    toggleRunColumns(newCols = 'toggle') {
        if (newCols === 'toggle') {
            newCols = (this.runColumns === 'col-80') ? 'col-40' : 'col-80'
        }
        this.runColumns = newCols
        this.runColumnsButton.className = newCols
    }

    setEditorToDebuggerMode(newMode) {
        if (this.editor) {
            this.editor.updateOptions({ glyphMargin: newMode })
            return
        }
        if (window.editor) {
            this.editor = window.editor.editor // ugly, but efficient
            this.editor.onMouseDown((e) => { this.editorMouseDown(e) })
            window.editor.setDebugger(this)
            this.setEditorToDebuggerMode(newMode)
            this.setBreakPointLocations(true)
        } else if (newMode) {
            setTimeout(() => { this.setEditorToDebuggerMode(newMode)}, 50)
        }
    }

    showExecutionPoint(lineIndex, lineNumber, lineLength, breakPoint) {
        if (lineIndex == null) {
            if (this.debuggerLineDecoration) {
                this.editor.deltaDecorations(this.debuggerLineDecoration, [])
                this.debuggerLineDecoration = null
            }
            this.restoreBreakpointMarker()
            this.debuggerLine = null
            return
        }
        const prevDebug = this.debuggerLineDecoration ?? []
        let colStart = (breakPoint ?? {}).start || 1
        let colEnd = (breakPoint ?? {}).end
        if (colEnd == null) { colEnd = lineLength }
        const range = new monaco.Range(lineIndex, colStart, lineIndex, colEnd)
        let glyphClass = 'executionPoint'
        const existingBreakpoint = this.setBreakPoints[lineNumber]
        if (existingBreakpoint) {
            this.toggleBreakPointMarker(lineNumber, existingBreakpoint.lineIndex, existingBreakpoint.lineLength, 'hide')
            glyphClass = 'executionBreakPoint'
        }
        let newDebug = []
        newDebug.push({ 
            range, options: { 
                glyphMarginClassName: glyphClass,
                inlineClassName: 'debugHighlight'
            }
        })
        this.editor.revealLine(lineIndex)
        this.debuggerLineDecoration = this.editor.deltaDecorations(prevDebug, newDebug)
        if (this.debuggerLine) { this.restoreBreakpointMarker() }
        this.debuggerLine = lineNumber
    }

    restoreBreakpointMarker() {
        const existingBreakPoint = this.setBreakPoints[this.debuggerLine]
        if (existingBreakPoint) {
            this.toggleBreakPointMarker(this.debuggerLine, existingBreakPoint.lineIndex, existingBreakPoint.lineLength, 'set')
        }
    }

    toggleBreakPointMarker(lineNumber, lineIndex, lineLength, state = 'toggle') {
        const range = new monaco.Range(lineIndex, 1, lineIndex, lineLength)
        const breakPoint = this.setBreakPoints[lineNumber]
        const disable = (state === 'toggle') ? (breakPoint != null) : (state === 'clear')
        if (disable || state === 'hide') {   
            this.editor.deltaDecorations(breakPoint.decoration, [])
            if (state === 'hide') { 
                breakPoint.decoration = null
            } else {
                delete this.setBreakPoints[lineNumber] 
            }
        } else {
            const decoration = this.editor.deltaDecorations([], [ { range, options: { glyphMarginClassName: 'breakPoint' } } ])
            this.setBreakPoints[lineNumber] = { lineNumber, lineIndex, lineLength, decoration }
        }
    }

    async runProgram() {
        if (this.runMode !== 'stopped') { return }
        this.setState('starting')
        this.runMode = 'running'
        
        const startAddress = this.machine.startAddress
        const payload = {
            executeMachine: this.machine.executeMachine || this.machine.name,
            startAddress: startAddress,
            programBytes: window.editor.getProgramBytes(startAddress).toBase64(),
            columns: this.runColumns
        }
        try {
            const response = await window.fetch(`http://localhost:${this.port}/vice/run`, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json; charset=UTF-8' }
            })
            const result = await response.json()
            if (result.status === 'running') {
                this.setState('running')
            } else {
                console.log('invalid run response from server:', result)
                this.setState('alert', 'Error: unexpected run response')
                this.runMode = 'stopped'
            }
        } catch (error) {
            console.log('error running program')
            console.error(error)
            this.setState('alert', `Error: ${error.message}`)
            this.runMode = 'stopped'
        }
    }

    async stopProgram() {
        if (this.socket) {
            this.stopDebug()
            return
        }
        try {
            const response = await window.fetch(`http://localhost:${this.port}/vice/stop`, { method: 'POST' })
            const result = await response.json()
            if (result.status !== 'stopped') {
                console.log('invalid stop response from server:', result)
                this.setState('alert', 'Error: unexpected stop response')
            }
        } catch (error) {
            console.log('error stopping program')
            console.error(error)
            this.setState('alert', `Error: ${error.message}`)
        }
        this.setState('stopped')
        this.runMode = 'stopped'
    }

    getLineDebugAddresses(lineAddr, lineLength, tokens) {
        lineAddr += 4 // skip next address and line number
        let breakPoints = { }
        let lastBreakPoint = null
        for (const token of tokens) {
            if (![ 'line-number', 'colon', 'then-split', 'else-split' ].includes(token.token)) { continue }
            const addr = lineAddr + token.byteOffset
            if (lastBreakPoint) { 
                if (token.token === 'else-split') { // destroy the breakpoint for the preceding colon
                    delete breakPoints[lastBreakPoint.address]
                } else {
                    lastBreakPoint.end = token.start + 1 
                }
            }
            breakPoints[addr] = { address: addr, start: token.end + 2 } // +1 to move past token, +1 due to 1-based column indexes in editor
            lastBreakPoint = breakPoints[addr]
        }
        lastBreakPoint.end = lineLength + 1
        return breakPoints
    }

    setBreakPointLocations(skipIfSet) {
        if (!this.editor || !this.machine) { return }
        if (skipIfSet && this.breakPointLocations) { return }
        this.breakPointLocations = {}
        let lineAddr = this.machine.startAddress
        let lineIndex = 1
        for (const line of this.editor.getValue().split('\n')) {
            const {  byteArray, lineNumber, tokens } = window.tokenizer.tokenizeLine(line)
            if (byteArray.length > 0) {
                const breakPoints = this.getLineDebugAddresses(lineAddr, line.length, tokens)
                this.breakPointLocations[lineNumber] = { lineIndex, lineLength: line.length, breakPoints }
                lineAddr += byteArray.length + 3 // I think this should be 3
            }
            lineIndex += 1
        }
        console.log(this.breakPointLocations)
    }

    startDebug() {
        if (this.runMode !== 'ended' && this.runMode !== 'stopped') { return }
        if (!this.port) { return }
        this.runMode = 'debugging'
        
        if (this.socket) {
            this.setState('starting')
            this.socket.send(JSON.stringify({ command: 'start', restart: true }))
            return
        }
        this.setState('starting')
        this.setBreakPointLocations(true)

        const breakPointLines = Object.values(this.setBreakPoints).map((b) => b.lineNumber)

        this.socket = new WebSocket(`ws://localhost:${this.port}`, 'JSON')
        this.socket.addEventListener('open', (event) => {
            this.socket.send('ping')
        })
        this.socket.addEventListener('end', () => {
            this.socket.end()
        })
        this.socket.addEventListener('close', (e) => {
            console.log('socket closed', e)
            this.socket = null
            if (this.runMode !== 'stopped') {
                this.setState('stopped')
                this.runMode = 'stopped'
                this.debugAddresses = null
            }
        })
        this.socket.addEventListener('message', (event) => {
            console.log('from socket:', event.data)
            if (event.data === 'pong') { // handshake complete, let's get running!
                const startAddress = this.machine.startAddress
                console.log(window.editor.getProgramBytes(startAddress))
                const payload = {
                    command: 'start',
                    executeMachine: this.machine.executeMachine || this.machine.name,
                    startAddress: startAddress,
                    programBytes: window.editor.getProgramBytes(startAddress).toBase64(),
                    breakPoints: breakPointLines,
                    columns: this.runColumns
                }
                this.socket.send(JSON.stringify(payload))
                return
            }
            const data = JSON.parse(event.data)
            switch (data.status) {
                case 'running': this.setState('debugging'); break;
                case 'ended': this.ended(data); break;
                case 'checkpoint': this.hitCheckpoint(data); break;
            }
        })
        this.socket.addEventListener('error', (e) => { 
            console.log('websocket error', e)
            this.setState('alert', `Error: ${e}`) 
            this.runMode = 'stopped'
        })
    }

    stopped() {
        this.setState('stopped')
        this.runMode = 'stopped'
    }

    pauseContinue() {
        if (!this.socket) { return }
        const isPaused = this.pauseContButton.classList.contains('cont')
        const command =  isPaused ? 'continue' : 'pause'
        this.setState(command + 'd')
        this.socket.send(JSON.stringify({ command }))
    }

    step() {
        if (!this.socket) { return }
        this.setState('stepping')
        this.stepButton.disabled = true
        this.socket.send(JSON.stringify({ command: 'step' }))
    }

    ended() {
        if (!this.socket) { return }
        this.showExecutionPoint()
        this.setState('ended')
        this.runMode = 'ended'
    }

    stopDebug() {
        if (!this.socket) { return }
        this.setState('stopped')
        this.runMode = 'stopped'
        this.socket.send(JSON.stringify({ command: 'stop' }))
    }

    hitCheckpoint(data) {
        console.log('on line', data.lineNo, 'at address', data.address)
        const debug = this.breakPointLocations[data.lineNo]
        if (debug == null) {
            console.log('unknown line number', data.lineNo)
            return
        }
        const breakPoint = debug.breakPoints[data.address]
        this.showExecutionPoint(debug.lineIndex, data.lineNo, debug.lineLength, breakPoint)
        if (!data.info) { this.setState('paused') }
    }

    editorMouseDown(event) {
        if (event.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
            const lineIndex = event.target.position.lineNumber
            const model = this.editor.getModel()
            const lineValue = model.getLineContent(lineIndex).trim()
            
            const lno = lineValue.match(/^(\d+)/)
            if (lno) {
                const lineNumber = parseInt(lno[1])
                this.toggleBreakPointMarker(lineNumber, lineIndex, lineValue.length)
            }
        }
    }

    contentReplaced() {
        // clear all breakpoints
        for (const breakPoint of Object.values(this.setBreakPoints)) {
            this.editor.deltaDecorations(breakPoint.decoration)
        }
        this.setBreakPoints = []
        this.setBreakPointLocations()
    }

    lineChanged(lineIndex, lineNumber, content, tokens, bytes) {
        // do nothing for now, use contentChanged
    }

    deleteBreakPoint(breakPoint) {
        this.editor.deltaDecorations(breakPoint.decoration, [])
        delete this.setBreakPoints[breakPoint.lineNumber]
    }

    checkBreakPointLine(lineIndex, doDelete = null) {
        if (this.setBreakPoints.length === 0) { return }
        const breakPoint = Object.values(this.setBreakPoints).find((e) => e.lineIndex === lineIndex)
        if (!breakPoint) { return }
        if (doDelete === null) {
            const model = this.editor.getModel()
            const lineValue = model.getLineContent(lineIndex).trim()
            const lno = lineValue.match(/^(\d+)/)
            if (lno) {
                const lineNumber = parseInt(lno[1])
                if (breakPoint.lineNumber !== lineNumber) {
                    doDelete = true
                }
            }
        }
        if (doDelete) { this.deleteBreakPoint(breakPoint) }
    }

    contentChanged(event) {
        const breakLines = Object.keys(this.setBreakPoints)
        if (breakLines.length === 0) { return }
        let anyMultilineChanges = false
        for (const change of event.changes) {
            let range = change.range
            let nlCount = (change.text.indexOf('\n') >= 0) ? change.text.match(/\n/g).length : 0
            range.endLineNumber += nlCount
            if (range.startLineNumber === range.endLineNumber) { 
                this.checkBreakPointLine(range.startLineNumber)
                continue 
            }
            anyMultilineChanges = true
        }
        if (!anyMultilineChanges) { return }
        this.setBreakPointLocations()
        const lineNos = Object.keys(this.breakPointLocations)
        const changedLines = breakLines.filter((e) => lineNos.includes(e))
        const removedLines = breakLines.filter((e) => !changedLines.includes(e))
        for (const lineNo of changedLines) {
            let breakPoint = this.setBreakPoints[lineNo]
            breakPoint.lineIndex = this.breakPointLocations[lineNo].lineIndex
            breakPoint.lineLength = this.breakPointLocations[lineNo].lineLength
            const range = new monaco.Range(breakPoint.lineIndex, 1, breakPoint.lineIndex, breakPoint.lineLength)
            breakPoint.decoration = this.editor.deltaDecorations(breakPoint.decoration, [ { range, options: { glyphMarginClassName: 'breakPoint' } } ])
        }
        for (const delLineNo of removedLines) {
            this.deleteBreakPoint(this.setBreakPoints[delLineNo])
        }
    }
}

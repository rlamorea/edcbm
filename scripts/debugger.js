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

        this.warpModeButton = document.getElementById('warp-mode')
        this.warpModeButton.addEventListener('click', () => { this.toggleWarpMode() })
        this.warpMode = false

        this.variablePanel = new VariablePanel()

        this.debugAddresses = null
        this.runMode = 'stopped'
        this.setState('disconnected')

        this.editor = null
        this.machine = null

        this.setBreakpoints = {}
        this.breakpointsSent = false

        this.stepLocations = null
        this.redoStepLocations = false
        this.executionLineDecoration = null

        this.dataLineDecoration = null
    }

    setMachine(machine) {
        this.machine = machine
        if (machine.name.startsWith('c128')) {
            this.runColumnsButton.style.display = 'inline'
            this.toggleRunColumns(machine.name === 'c128-80' ? 'col-80' : 'col-40')
        } else {
            this.runColumnsButton.style.display = 'none'
        }
        this.setStepLocations(true)
        this.variablePanel.clear()
        this.variablePanel.machineChanged(machine)
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
        'cols': [ 'disconnected', 'starting', 'running', 'debugging', 'paused', 'continued', 'stepping', 'ended' ],
        'warp': [ 'disconnected', 'starting', 'running', 'debugging', 'paused', 'continued', 'stepping', 'ended' ],
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
        this.warpModeButton.disabled = Debugger.buttonDisabledStates.warp.includes(newState)

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
            if (this.executionLineDecoration) {
                this.editor.deltaDecorations(this.executionLineDecoration, [])
                this.executionLineDecoration = null
            }
            this.showDataLine()
        }
    }

    toggleWarpMode() {
        this.warpMode = !this.warpMode
        this.warpModeButton.classList.toggle('warp', this.warpMode)
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
            this.setStepLocations(true)
        } else if (newMode) {
            setTimeout(() => { this.setEditorToDebuggerMode(newMode)}, 50)
        }
    }

    showExecutionPoint(lineIndex, lineNumber, lineLength, breakpoint) {
        if (lineIndex == null) {
            if (this.executionLineDecoration) {
                this.editor.deltaDecorations(this.executionLineDecoration, [])
                this.executionLineDecoration = null
            }
            return
        }
        const prevDebug = this.executionLineDecoration ?? []
        let colStart = (breakpoint ?? {}).start || 1
        let colEnd = (breakpoint ?? {}).end
        if (colEnd == null) { colEnd = lineLength }
        let newDebug = [ {  
            range: new monaco.Range(lineIndex, colStart, lineIndex, colEnd), 
            options: { glyphMarginClassName: 'executionPoint', inlineClassName: 'debugHighlight' } 
        } ]
        this.editor.revealLine(lineIndex)
        this.executionLineDecoration = this.editor.deltaDecorations(prevDebug, newDebug)
    }

    showDataLine(lineNumber, dataAddress) {
        if (this.dataLineDecoration) {
            this.editor.deltaDecorations(this.dataLineDecoration, [])
            this.dataLineDecoration = null
        }
        if (lineNumber == null) { return }
        const lineInfo = this.stepLocations[lineNumber]
        if (!lineInfo) { return }
        let dataPoint = lineInfo.dataPoints ? lineInfo.dataPoints[dataAddress] : null
        if (dataPoint == null) { dataPoint = lineInfo.dataPoints ? Object.values(lineInfo.dataPoints)[0] : null }
        let colStart = (dataPoint ?? {}).start || 1
        let colEnd = (dataPoint ?? {}).end
        if (colEnd == null) { colEnd = lineInfo.lineLength }
        const newDataLine = [ {
            range: new monaco.Range(lineInfo.lineIndex, colStart, lineInfo.lineIndex, colEnd),
            options: { 
                glyphMarginClassName: 'dataPoint',
                inlineClassName: 'dataHighlight'
            }
        } ]
        this.dataLineDecoration = this.editor.deltaDecorations([], newDataLine)
    }

    toggleBreakpointMarker(lineNumber, lineIndex, lineLength) {
        const breakpoint = this.setBreakpoints[lineNumber]
        if (breakpoint) {
            if (breakpoint.decoration) { this.editor.deltaDecorations(breakpoint.decoration, []) }
            delete this.setBreakpoints[lineNumber] 
        } else {
            const decoration = this.editor.deltaDecorations([], [ { 
                range: new monaco.Range(lineIndex, 1, lineIndex, lineLength), 
                options: { glyphMarginClassName: 'breakpoint' } 
            } ])
            this.setBreakpoints[lineNumber] = { lineNumber, lineIndex, lineLength, decoration }
        }
        if (this.runMode === 'debugging') {
            const breakpointLines = Object.values(this.setBreakpoints).map((b) => b.lineNumber)
            this.socket.send(JSON.stringify({ command: 'breakpoints', breakpoints: breakpointLines }))
            this.breakpointsSent = true
        } else {
            this.breakpointsSent = false
        }
    }

    async runProgram() {
        if (this.runMode !== 'stopped') { return }
        this.setState('starting')
        this.runMode = 'running'
        window.menu.enableMenu(false)
        
        const startAddress = this.machine.startAddress
        const payload = {
            executeMachine: this.machine.executeMachine || this.machine.name,
            startAddress: startAddress,
            programBytes: window.editor.getProgramBytes(startAddress).toBase64(),
            columns: this.runColumns,
            warp: this.warpMode,
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
                window.menu.enableMenu()
            }
        } catch (error) {
            console.log('error running program')
            console.error(error)
            this.setState('alert', `Error: ${error.message}`)
            this.runMode = 'stopped'
            window.menu.enableMenu()
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
        window.menu.enableMenu()
    }

    getLineStepAddresses(lineAddr, lineLength, tokens) {
        lineAddr += 4 // skip next address and line number
        let breakpoints = { }
        let dataPoints = { }
        let lastBreakpoint = null
        for (const token of tokens) {
            const addr = lineAddr + (token.byteOffset ?? 0)
            if (token.token === 'data-val') {
                dataPoints[addr] = { address: addr, start: token.start, end: token.end }
                continue
            }
            if (![ 'line-number', 'colon', 'then-split', 'else-split' ].includes(token.token)) { continue }
            if (lastBreakpoint) { 
                if (token.token === 'else-split') { // destroy the breakpoint for the preceding colon
                    delete breakpoints[lastBreakpoint.address]
                } else {
                    lastBreakpoint.end = token.start + 1 
                }
            }
            breakpoints[addr] = { address: addr, start: token.end + 2 } // +1 to move past token, +1 due to 1-based column indexes in editor
            lastBreakpoint = breakpoints[addr]
        }
        lastBreakpoint.end = lineLength + 1
        return { breakpoints, dataPoints }
    }

    setStepLocations(skipIfSet) {
        if (!this.editor || !this.machine) { return }
        if (this.redoStepLocations) {
            skipIfSet = false
            this.redoStepLocations = false
        }
        if (skipIfSet && this.stepLocations) { return }
        this.stepLocations = {}
        let lineAddr = this.machine.startAddress
        let lineIndex = 1
        for (const line of this.editor.getValue().split('\n')) {
            const {  byteArray, lineNumber, tokens } = window.tokenizer.tokenizeLine(line)
            if (byteArray.length > 0) {
                const { breakpoints, dataPoints } = this.getLineStepAddresses(lineAddr, line.length, tokens)
                this.stepLocations[lineNumber] = { lineIndex, lineLength: line.length, breakpoints, dataPoints }
                lineAddr += byteArray.length + 3 // I think this should be 3
            }
            lineIndex += 1
        }
    }

    getLineVariables(lineIndex) {
        const model = this.editor.getModel()
        const lineValue = model.getLineContent(lineIndex).trim()
        if (lineValue === '' || lineValue.startsWith("`")) { return [] }
        const { variables } = window.tokenizer.tokenizeLine(lineValue)
        return Object.keys(variables ?? {})
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
        this.setStepLocations(true)
        this.variablePanel.clear()
        window.menu.enableMenu(false)

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
            window.menu.enableMenu()
        })
        this.socket.addEventListener('message', (event) => {
            if (event.data === 'pong') { // handshake complete, let's get running!
                const startAddress = this.machine.startAddress
                const breakpointLines = Object.values(this.setBreakpoints).map((b) => b.lineNumber)
                this.breakpointsSent = true

                const payload = {
                    command: 'start',
                    executeMachine: this.machine.executeMachine || this.machine.name,
                    startAddress: startAddress,
                    programBytes: window.editor.getProgramBytes(startAddress).toBase64(),
                    breakpoints: breakpointLines,
                    columns: this.runColumns,
                    warp: this.warpMode,
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
            window.menu.enableMenu()
        })
    }

    stopped() {
        this.setState('stopped')
        this.runMode = 'stopped'
        window.menu.enableMenu()
    }

    pauseContinue() {
        if (!this.socket) { return }
        const isPaused = this.pauseContButton.classList.contains('cont')
        const command =  isPaused ? 'continue' : 'pause'
        this.setState(command + 'd')
        let payload = { command }
        if (command === 'continue') {
            payload.breakpoints = Object.values(this.setBreakpoints).map((b) => b.lineNumber)
            this.breakpointsSent = true
        }
        this.socket.send(JSON.stringify(payload))
    }

    step() {
        if (!this.socket) { return }
        this.setState('stepping')
        this.stepButton.disabled = true
        const breakpointLines = Object.values(this.setBreakpoints).map((b) => b.lineNumber)
        this.breakpointsSent = true
        this.socket.send(JSON.stringify({ command: 'step', breakpoints: breakpointLines }))
    }

    ended(data) {
        if (!this.socket) { return }
        this.showExecutionPoint()
        this.setState('ended')
        if (data.variables) { this.variablePanel.displayVariables(data.variables) }
        if (data.dataLine) { this.showDataLine(data.dataLine, data.dataAddress) }
        this.runMode = 'ended'
    }

    stopDebug() {
        if (!this.socket) { return }
        this.setState('stopped')
        this.runMode = 'stopped'
        this.socket.send(JSON.stringify({ command: 'stop' }))
    }

    hitCheckpoint(data) {
        const debug = this.stepLocations[data.lineNo]
        if (debug == null) {
            console.log('unknown line number', data.lineNo)
            return
        }
        const breakpoint = debug.breakpoints[data.address]
        this.showExecutionPoint(debug.lineIndex, data.lineNo, debug.lineLength, breakpoint)
        if (!data.info) { this.setState('paused') }
        if (data.variables) { this.variablePanel.displayVariables(data.variables, this.getLineVariables(debug.lineIndex)) }
        if (data.dataLine) { this.showDataLine(data.dataLine, data.dataAddress) }
    }

    editorMouseDown(event) {
        if (event.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
            const lineIndex = event.target.position.lineNumber
            const model = this.editor.getModel()
            const lineValue = model.getLineContent(lineIndex).trim()
            
            const lno = lineValue.match(/^(\d+)/)
            if (lno) {
                const lineNumber = parseInt(lno[1])
                this.toggleBreakpointMarker(lineNumber, lineIndex, lineValue.length)
            }
        } else if (event.target.type === monaco.editor.MouseTargetType.CONTENT_TEXT ||
                   event.target.type === monaco.editor.MouseTargetType.CONTENT_EMPTY)
        {
            const lineIndex = event.target.position.lineNumber
            this.variablePanel.highlightVariables(this.getLineVariables(lineIndex))
        }
    }

    clearBreakpointMarkers(preserve = false) {
        // clear all breakpoints
        const existingDecorationIds = this.editor.getModel().getAllDecorations().map((d) => d.id)
        let removeDecorations = []
        for (const breakpoint of Object.values(this.setBreakpoints)) {
            for (const decId of breakpoint.decoration ?? []) {
                if (existingDecorationIds.includes(decId)) {
                    removeDecorations.push(decId)
                }
            }
            delete breakpoint.decoration
        }
        this.editor.deltaDecorations(removeDecorations, [])
        if (!preserve) { this.setBreakpoints = [] }
    }

    resetBreakpoints(breakLines) {
        breakLines = breakLines ?? Object.keys(this.setBreakpoints)
        if (breakLines.length === 0) { return }
        this.setStepLocations()
        const lineNos = Object.keys(this.stepLocations)
        const changedLines = breakLines.filter((e) => lineNos.includes(e))
        const removedLines = breakLines.filter((e) => !changedLines.includes(e))
        for (const lineNo of changedLines) {
            let breakpoint = this.setBreakpoints[lineNo]
            breakpoint.lineIndex = this.stepLocations[lineNo].lineIndex
            breakpoint.lineLength = this.stepLocations[lineNo].lineLength
            const range = new monaco.Range(breakpoint.lineIndex, 1, breakpoint.lineIndex, breakpoint.lineLength)
            breakpoint.decoration = this.editor.deltaDecorations(breakpoint.decoration ?? [], [ { range, options: { glyphMarginClassName: 'breakpoint' } } ])
        }
        for (const delLineNo of removedLines) {
            this.deleteBreakpoint(this.setBreakpoints[delLineNo])
        }
    }

    contentReplaced(restoreBreakpoints = false) {
        if (restoreBreakpoints) {
            this.resetBreakpoints()
        } else {
            this.setBreakpoints = []
            this.setStepLocations()
            this.variablePanel.clear(true)
        }
    }

    lineChanged(lineIndex, lineNumber, content, tokens, bytes) {
        // do nothing for now, use contentChanged
    }

    deleteBreakpoint(breakpoint) {
        this.editor.deltaDecorations(breakpoint.decoration, [])
        delete this.setBreakpoints[breakpoint.lineNumber]
    }

    checkBreakpointLine(lineIndex, doDelete = null) {
        if (this.setBreakpoints.length === 0) { return }
        const breakpoint = Object.values(this.setBreakpoints).find((e) => e.lineIndex === lineIndex)
        if (!breakpoint) { return }
        if (doDelete === null) {
            const model = this.editor.getModel()
            const lineValue = model.getLineContent(lineIndex).trim()
            const lno = lineValue.match(/^(\d+)/)
            if (lno) {
                const lineNumber = parseInt(lno[1])
                if (breakpoint.lineNumber !== lineNumber) {
                    doDelete = true
                }
            }
        }
        if (doDelete) { this.deleteBreakpoint(breakpoint) }
    }

    contentChanged(event) {
        this.redoStepLocations = true
        const breakLines = Object.keys(this.setBreakpoints)
        if (breakLines.length === 0) { return }
        let anyMultilineChanges = false
        for (const change of event.changes) {
            let range = change.range
            let nlCount = (change.text.indexOf('\n') >= 0) ? change.text.match(/\n/g).length : 0
            range.endLineNumber += nlCount
            if (range.startLineNumber === range.endLineNumber) { 
                this.checkBreakpointLine(range.startLineNumber)
                continue 
            }
            anyMultilineChanges = true
        }
        if (!anyMultilineChanges) { return }
        this.resetBreakpoints(breakLines)
    }
}

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

        this.runStatusIcon = document.getElementById('run-status-icon')
        this.runStatusText = document.getElementById('run-status')

        this.runMode = 'stopped'
        this.setState('disconnected')
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
        'run': [ 'disconnected', 'starting', 'running', 'debugging', 'paused', 'continued', 'stepping' ],
        'debug': [ 'disconnected', 'starting', 'running', 'debugging', 'paused', 'continued', 'stepping' ],
        'pause': [ 'disconnected', 'connected', 'starting', 'running', 'stopped', 'alert', ],
        'step': [ 'disconnected', 'connected', 'starting', 'running', 'continued', 'stepping', 'stopped', 'alert' ],
        'stop': [ 'disconnected', 'connected', 'starting', 'ended', 'stopped', 'alert' ]
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
        } else if (newState === 'ended' || newState === 'stopped') {
            window.editor.enableEditor()
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

    setEditorToDebuggerMode(newMode) {
        if (window.editor) { 
            window.editor.debuggerMode(newMode) 
        } else if (newMode) {
            setTimeout(() => { this.setEditorToDebuggerMode(newMode)}, 50)
        }
    }

    async runProgram() {
        if (this.runMode !== 'stopped') { return }
        this.setState('starting')
        this.runMode = 'running'
        
        const startAddress = window.menu.machine.startAddress
        const payload = {
            executeMachine: window.menu.machine.executeMachine || window.menu.machine.name,
            startAddress: startAddress,
            programBytes: window.editor.getProgramBytes(startAddress).toBase64()
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
                this.setState('stopped')
                // TODO: report error
            }
        } catch (error) {
            console.log('error running program')
            console.error(error)
            this.setState('stopped')
            // TODO: report error
        }
    }

    async stopProgram() {
        if (this.runMode === 'debugging') {
            this.stopDebug()
            return
        }
        try {
            const response = await window.fetch(`http://localhost:${this.port}/vice/stop`, { method: 'POST' })
            const result = await response.json()
            if (result.status !== 'stopped') {
                console.log('invalid stop response from server:', result)
                // TODO: report error
            }
        } catch (error) {
            console.log('error stopping program')
            console.error(error)
            // TODO: report error
        }
        this.setState('stopped')
        this.runMode = 'stopped'
    }

    startDebug() {
        if (this.runMode !== 'stopped') { return }
        if (!this.port) { return }
        this.runMode = 'debugging'
        
        if (this.socket) {
            this.setState('starting')
            this.socket.send(JSON.stringify({ command: 'start', restart: true }))
            return
        }
        this.setState('starting')

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
            }
        })
        this.socket.addEventListener('message', (event) => {
            console.log('from socket:', event.data)
            if (event.data === 'pong') { // handshake complete, let's get running!
                const startAddress = window.menu.machine.startAddress
                const payload = {
                    command: 'start',
                    executeMachine: window.menu.machine.executeMachine || window.menu.machine.name,
                    startAddress: startAddress,
                    programBytes: window.editor.getProgramBytes(startAddress).toBase64()
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
            this.setState('connected') // restore basic buttons
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
        window.editor.debuggerLineNumber()
        this.setState('ended')
    }

    stopDebug() {
        if (!this.socket) { return }
        this.setState('stopped')
        this.runMode = 'stopped'
        this.socket.send(JSON.stringify({ command: 'stop' }))
    }

    hitCheckpoint(data) {
        if (this.lastExecLineNo != null) {
            window.editor.debuggerLineNumber(this.lastExecLineNo, false)
        }
        console.log('on line', data.lineNo)
        window.editor.debuggerLineNumber(data.lineNo)
        this.lastExecLineNo = data.lineNo
        if (!data.info) { this.setState('paused') }
    }
}

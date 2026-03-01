class Debugger {
    constructor(server) {
        this.server = server
        this.socket = null
        this.port = server.port

        this.lastExecLineNo = null

        this.debugButton = document.getElementById('debug')
        this.debugButton.addEventListener('click', () => { this.startDebug() })
        this.debugButton.style.display = 'none'

        this.pauseContButton = document.getElementById('debug-pause-cont')
        this.pauseContButton.addEventListener('click', () => { this.pauseContinue() })
        this.pauseContButton.style.display = 'none'

        this.stepButton = document.getElementById('debug-step')
        this.stepButton.addEventListener('click', () => { this.step() })
        this.stepButton.style.display = 'none'
    }

    // states are:
    // -- connected
    // -- debugging (debugging has just started)
    // -- debugging-restart (debugging after a program ended event)
    // -- paused (debugging has been paused by line stop, breakpoint, or pause)
    // -- continued (debugging continued after a line stop, breakpoint, or pause)
    // -- ended (program stopped/ended on vice)
    // -- stopped (debugging explicitly stopped)
    setState(newState) {
        const isDebugging = (newState !== 'running' && newState !== 'connected' && newState !== 'ended' && newState !== 'stopped')
        this.debugButton.style.display =  (isDebugging || newState === 'running') ? 'none' : 'inline'
        this.stepButton.style.display = isDebugging ? 'inline' : 'none'
        this.pauseContButton.style.display = isDebugging ? 'inline' : 'none'
        if (isDebugging) {
            const isPaused = newState === 'paused'
            this.stepButton.disabled = !isPaused
            this.pauseContButton.classList.toggle('cont', isPaused)

            if (newState === 'debugging') {
                this.server.debugging()
                window.editor.enableEditor(false)
                window.editor.debuggerMode()
            }
        } else if (newState === 'stopped') {
            this.server.debugging(false)
            window.editor.debuggerMode(false)
            window.editor.enableEditor()
        }
    }

    startDebug() {
        if (!this.port) { return }

        this.debugButton.style.display = 'none'
        if (this.socket) {
            this.socket.send(JSON.stringify({ command: 'start', restart: true }))
            this.setState('debugging-restart')
            return
        }

        this.setState('debugging')

        this.socket = new WebSocket(`ws://localhost:${this.port}`, 'JSON')
        this.socket.addEventListener('open', (event) => {
            this.stepButton.style.display = 'inline'
            this.stepButton.disabled = true
            this.socket.send('ping')
        })
        this.socket.addEventListener('end', () => {
            this.socket.end()
        })
        this.socket.addEventListener('close', (e) => {
            console.log('socket closed', e)
            this.socket = null
        })
        this.socket.addEventListener('message', (event) => {
            console.log('from socket:', event.data)
            if (event.data === 'pong') { // handshake complete, let's get running!
                this.start()
                return
            }
            const data = JSON.parse(event.data)
            switch (data.status) {
                case 'running': break; // do nothing
                case 'ended': this.ended(data); break;
                case 'checkpoint': this.hitCheckpoint(data); break;
            }
        })
        this.socket.addEventListener('error', (e) => { 
            console.log('websocket error', e)
            // this.enable()
            // this.server.debugging(false)
            // window.editor.enableEditor()
            // this.socket = null
        })
    }

    start() {
        const startAddress = window.menu.machine.startAddress
        const payload = {
            command: 'start',
            executeMachine: window.menu.machine.executeMachine || window.menu.machine.name,
            startAddress: startAddress,
            programBytes: window.editor.getProgramBytes(startAddress).toBase64()
        }
        this.socket.send(JSON.stringify(payload))
    }

    stopped() {
        this.setState('stopped')
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
        this.setState('continued')
        this.stepButton.disabled = true
        this.socket.send(JSON.stringify({ command: 'step' }))
    }

    ended() {
        if (!this.socket) { return }
        window.editor.debuggerLineNumber()
        this.setState('ended')
    }

    stop() {
        if (!this.socket) { return }
        this.setState('stopped')
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

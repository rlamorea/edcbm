class Server {
    static DEFAULT_PORT = 3129

    constructor() {
        this.button = document.getElementById('server')
        this.menu = document.getElementById('servermenu')
        this.dropMenu = new DropMenu(this.menu, {
            drop: this.button,
            selectHandler: (li) => { this.itemSelected(li) }
        })
        this.connectItem = this.menu.querySelector('li[data-name=connect]')
        this.disconnectItem = this.menu.querySelector('li[data-name=disconnect]')
        this.configureItem = this.menu.querySelector('li[data-name=configure]')

        this.configureDialog = document.getElementById('server-config')
        this.portInput = this.configureDialog.querySelector('#server-port')
        this.portInput.addEventListener('change', (e) => { this.portChanged() })

        this.port = window.localStorage.getItem('serverPort')
        this.portConfigured = (this.port != null)
        this.connected = false

        this.connectButton = this.configureDialog.querySelector('.save')
        this.connectButton.addEventListener('click', () => { this.connectFromConfig() })
        if (this.portConfigured) {
            this.connectButton.disabled = true
            this.connectToServer()
        } else {
            this.port = Server.DEFAULT_PORT
            this.connectItem.classList.remove('disabled')
            this.configureItem.classList.remove('disabled')
        }

        this.portInput.value = this.port

        this.runButton = document.getElementById('run')
        this.runButton.addEventListener('click', () => this.runProgram())
        this.runButton.style.display = 'none'

        this.stopButton = document.getElementById('run-stop')
        this.stopButton.addEventListener('click', () => this.stopProgram())
        this.stopButton.style.display = 'none'

        this.debugger = new Debugger(this)
        this.isRunning = false
    }

    itemSelected(li) {
        if (li.dataset.name === 'configure') {
            this.configureDialog.showModal()
        } else if (li.dataset.name === 'connect') {
            this.connectItem.classList.add('disabled')
            this.configureItem.classList.add('disabled')
            this.connectButton.disabled = true
            this.connectToServer()
        } else if (li.dataset.name === 'disconnect') {
            this.doDisconnect()
        }
    }

    doDisconnect() { // there is no real "disconnect" at this time, just UI changes
        this.connectItem.classList.remove('disabled')
        this.disconnectItem.classList.add('disabled')
        this.configureItem.classList.remove('disabled')
        this.connectButton.disabled = false
        this.connected = false
        this.button.classList.remove('connected')
        window.localStorage.removeItem('serverPort')
    }

    portChanged() {
        this.connectButton.disabled =  (this.connected && this.portInput.value === this.port)
    }

    connectFromConfig() {
        const newPort = this.portInput.value
        if (this.connected && newPort === this.port) { return } // no change
        if (this.connected) { // "disconnect" -- meaning just turn things off before trying again
            this.doDisconnect()
        }
        this.port = newPort
        this.configureDialog.close()
        this.connectToServer()
    }

    async connectToServer() {
        try {
            const response = await window.fetch(`http://localhost:${this.port}/ping`)
            const result = await response.json()
            if (result.status === 'pong') {
                this.button.classList.remove('disconnected')
                this.button.classList.add('connected')
                this.connectItem.classList.add('disabled')
                this.disconnectItem.classList.remove('disabled')
                this.configureItem.classList.remove('disabled')
                window.localStorage.setItem('serverPort', this.port)
                this.runButton.style.display = 'inline'
                this.stopButton.style.display = 'none'
                this.stopButton.disabled = true
                this.debugger.setState('connected')
                this.connected = true
            } else {
                console.log('invalid ping response from server:', result)
                this.disconnectedFromServer()
            }
        } catch (error) {
            console.log('error connecting to server at port', this.port)
            console.error(error)
            this.disconnectedFromServer()
        }
    }

    disconnectedFromServer() {
        this.button.classList.remove('connected')
        this.button.classList.add('disconnected')
        this.connectItem.classList.remove('disabled')
        this.disconnectItem.classList.add('disabled')
        this.configureItem.classList.remove('disabled')
        this.runButton.style.display = 'none'
        this.stopButton.style.display = 'none'
        this.isRunning = false
        this.connectButton.disabled = false
        this.debugger.enable(false)
    }

    debugging(active = true) {
        this.isRunning = active ? 'debugging' : false
        this.runButton.style.display = active ? 'none' : 'inline'
        this.stopButton.style.display = active ? 'inline' : 'none'
        this.stopButton.disabled = false
    }

    async runProgram() {
        if (!this.connected) { return }
        this.runButton.disabled = true
        this.stopButton.style.display = 'inline'
        this.debugger.setState('running')
        window.editor.enableEditor(false)
        
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
                this.stopButton.disabled = false
                this.isRunning = true
            } else {
                console.log('invalid run response from server:', result)
                this.runButton.style.display = 'inline'
                // TODO: report error
            }
        } catch (error) {
            console.log('error running program')
            console.error(error)
            this.runButton.style.display = 'inline'
            // TODO: report error
        }
    }

    async stopProgram() {
        this.stopButton.disabled = true
        this.stopButton.style.display = 'none'
        if (this.isRunning === 'debugging') {
            this.debugger.stop()
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
        this.runButton.disabled = false
        this.debugger.setState('stopped')
        window.editor.enableEditor()
        this.isRunning = false
    }
}

window.addEventListener('load', () => {
    window.edcbmServer = new Server()
})

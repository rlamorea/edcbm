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
        this.connectButton.disabled = false
    }
}

window.addEventListener('load', () => {
    window.edcbmServer = new Server()
})

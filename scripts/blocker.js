class Blocker {
    constructor() {
        this.blockingElement = null

        this.blocker = document.getElementById('blocker')
        this.blocker.addEventListener('click', (e) => { this.hide() })
        this.closeCallback = null
    }

    show(blockingElement, display = 'block', closeCallback = null) {
        this.blockingElement = blockingElement
        this.blockingElement.style.display = display
        this.blocker.style.display = 'block'
        this.closeCallback = closeCallback
    }

    hide() {
        if (this.closeCallback) {
            const keepBlocking = this.closeCallback()
            if (keepBlocking) { return }
            this.closeCallback = null
        }
        if (this.blockingElement) {
            this.blockingElement.style.display = 'none'
            this.blockingElement = null
        }
        this.blocker.style.display = 'none'
    }   
}

this.window.addEventListener('load', () => {
    window.blocker = new Blocker();
})
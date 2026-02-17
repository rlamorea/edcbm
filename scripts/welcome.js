class Welcome {
    constructor() {
        this.dialog = null
        this.selectedMachine = null
    }

    init() {
        this.dialog = document.getElementById('welcome')

        this.dialog.querySelectorAll('.w-actions button').forEach(button => {
            button.addEventListener('click', (e) => { this.takeAction(e) })
        })

        this.dialog.querySelectorAll('.w-machine-list .w-mach').forEach(element => {
            element.addEventListener('click', (e) => { this.selectMachine(e) }) 
        })

        this.focusedMachineLi = null
        this.dialog.querySelectorAll('.w-machine-list li').forEach(li => {
            li.addEventListener('focus', (e) => { this.focusMachine(e) }) 
            li.addEventListener('blur', (e) => { this.focusedMachineLi = null })
        })

        this.dialog.querySelectorAll('.w-helper').forEach(helper => { 
            helper.style.display = 'none'
            document.body.insertAdjacentElement('afterbegin', helper) 
        })

        this.keyListener = null
    }

    async show() {
        if (this.dialog === 'loading') { return }
        if (!this.dialog) {
            this.dialog = 'loading'
            const linkElement = document.createElement('link')
            linkElement.href = `/styles/welcome.css?x=${Math.floor(Math.random()*10000)}`
            linkElement.type = 'text/css'
            linkElement.rel = 'stylesheet'    
            document.head.appendChild(linkElement)
            try {
                const response = await fetch(`/templates/welcome.html?x=${Math.floor(Math.random()*10000)}`)
                document.body.insertAdjacentHTML('beforeend', await response.text())
                this.init()
            } catch (error) {
                console.log(`Unable to load welcome dialog`, error)
                return
            }
        }

        window.menu.setKeyHandler((e) => { this.keyPressed(e) })
        this.dialog.showModal()
    }

    focusMachine(event) {
        this.focusedMachineLi = event.target.closest('li')
        if (this.focusedMachineLi.classList.contains('w-mach')) { return }
        this.focusedMachineLi.querySelector('.w-mach.primary').focus()
    }

    keyPressed(event) {
        if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            return
        }
        if (event.key !== 'Enter' && event.key !== ' ') { return }
        if (this.focusedMachineLi) {
            event.preventDefault()
            event.stopPropagation()
            let mockEvent = { target: this.focusedMachineLi }
            if (!this.focusedMachineLi.classList.contains('w-mach')) {
                mockEvent.target = this.focusedMachineLi.querySelector('.w-mach.primary')
            }
            this.selectMachine(mockEvent)
        }
    }

    selectMachine(event) {
        let machElement = event.target.closest('.w-mach')
        const li = machElement.closest('li')
        if (li.classList.contains('selected')) {
            if (machElement === li) { return } // do nothing
            machElement.classList.remove('primary')
            let nextNonPrimaryElement = machElement.nextElementSibling
            if (!nextNonPrimaryElement) { nextNonPrimaryElement = li.firstElementChild }
            nextNonPrimaryElement.classList.add('primary')
            machElement = nextNonPrimaryElement
        } else {
            this.dialog.querySelectorAll('.w-machine-list li').forEach(el => el.classList.remove('selected'))
            li.classList.add('selected')
        }
        const machine = machElement.dataset.machine
        window.menu.setMachine(machine)
        this.selectedMachine = machine
    }

    takeAction(event) {
        window.menu.setKeyHandler()
        this.dialog.close()
        if (!this.selectedMachine) {
            let selectedMach = this.dialog.querySelector(`.w-machine-list li.selected`)
            if (!selectedMach.classList.contains('w-mach')) {
                selectedMach = selectedMach.querySelector('.w-mach')
            }
            this.selectedMachine = selectedMach.dataset.machine
            window.menu.setMachine(this.selectedMachine) // to make sure 
        }
        window.editor.init()
        const action = event.target.dataset.action
        if (action === 'new-prg') {
            this.showHelper(window.fileControls.fileOptions.input, 'w-file-name-help')
            window.fileControls.newFile()
        } else if (action === 'load-prg') {
            this.dialog.showModal()
        } else if (action === 'load-edcbm') {
            window.fileControls.fileOptions.toggleMenu()
            this.showHelper(window.fileControls.fileOptions.drop, 'w-menu-help', -10, 12)
            this.showHelper(window.fileControls.fileOptions.selections['load-prg'], 'w-menu-item-help', -15, 10, 'EDCBM')
        } else if (action === 'load-disk') {
            window.fileControls.diskOptions.toggleMenu()
            this.showHelper(window.fileControls.diskOptions.drop, 'w-menu-help', -10, 12)
            this.showHelper(window.fileControls.diskOptions.selections['load-d64'], 'w-menu-item-help', -15, 10, 'D64')
        }
    }

    showHelper(refElem, id, leftoff = 0, topoff = 20, spanText = '') {
        const refLoc = refElem.getBoundingClientRect()
        const helper = document.getElementById(id)
        if (spanText) {
            const span = helper.querySelector('span')
            if (span) { span.textContent = spanText }
        }
        helper.style.left = `${refLoc.left + leftoff}px`
        helper.style.top = `${refLoc.bottom + topoff}px`
        helper.style.display = 'block'

        setTimeout(() => { helper.style.display = 'none' }, 3000)
    }
}

window.addEventListener('load', () => {
    window.welcome = new Welcome()
})

const DEFAULT_MACHINE = 'c64'

const Machines = {
    'c64': {
        name: 'c64',
        hotkey: 1,
        language: 'v2',
        startAddress: 0x801,
    },
    'c128' : {
        name: 'c128',
        hotkey: 2,
        language: 'v7',
        startAddress: 0x1c01,
    },
    'c128-80' : {
        name: 'c128-80',
        hotkey: 3,
        display: 'c128',
        menu: 'c128-80 columns',
        language: 'v7',
        kb: 'c128',
        startAddress: 0x1c01,
    },
    'vic20' : {
        name: 'vic20',
        hotkey: 0,
        language: 'v2',
        startAddress: 0x1001, // NOTE: could be 0x1201 if memory expansion in place
        menuPetscii: 'vic20',
    },
    'plus4': {
        name: 'plus4',
        hotkey: 4,
        palette: 'ted',
        language: 'v3.5',
        startAddress: 0x1001,
    },
    'c16': {
        name: 'c16',
        hotkey: 1,
        palette: 'ted',
        language: 'v3.5',
        startAddress: 0x1001,
    },
    'pet-g': {
        name: 'pet-g',
        hotkey: 4,
        display: 'pet',
        menu: 'pet-graphics',
        palette: 'pet-40',
        language: 'v2',
        startAddress: 0x0401,
        menuPetscii: 'pet-g'
    },
    'pet-b': {
        name: 'pet-b',
        hotkey: 0,
        display: 'pet',
        palette: 'pet',
        menu: 'pet-business',
        language: 'v4',
        startAddress: 0x0401,
        menuPetscii: 'pet-g'
    },
    'cbm2': {
        name: 'cbm2',
        hotkey: 0,
        palette: 'pet',
        language: 'v4+',
        startAddress: 0x0003, // bank ram01
        menuPetscii: 'pet-g',
    }
}

class MenuButton {
    constructor(button) {
        this.showingMenu = false
        this.menuWidth = document.getElementById('menu').offsetWidth
        this.menuRight = null

        this.button = button
        button.addEventListener('click', () => { this.toggleMenu() })

        this.menu = document.getElementById(this.button.dataset.menu)
    }

    toggleMenu() {
        this.showingMenu = !this.showingMenu
        if (!this.showingMenu) { return }
        const locRight = this.button.offsetLeft + this.button.offsetWidth
        if (this.menuRight === locRight) { return }
        this.menuRight = this.menuWidth - locRight
        this.menu.style.right = `${this.menuRight}px`
    }
}

class Controls {
    constructor() {
        this.machine = null

        this.machineName = document.getElementById('machine')
        this.machineDrop = document.getElementById('machine-drop')
        this.machineName.addEventListener('click', () => { this.showMenu() })
        this.machineDrop.addEventListener('click', () => { this.showMenu() })
        this.machineDrop.addEventListener('focus', () => { this.showMenu() })

        this.machineMenuHotkeys = {}
        this.machineMenu = document.getElementById('machinemenu')
        for (let key in Machines) {
            const li = document.createElement('li')
            let menuText = Machines[key].menu || key
            let menuHtml = ''
            for (let idx = 0; idx < menuText.length; idx++) {
                const char = menuText[idx]
                if (idx === Machines[key].hotkey) {
                    menuHtml += `<u>${char}</u>`
                    this.machineMenuHotkeys[`Key${char.toUpperCase()}`] = key
                } else {
                    menuHtml += char
                }
            }
            li.innerHTML = menuHtml
            li.dataset.machine = key
            if (key === DEFAULT_MACHINE) { li.classList.add('disabled') }
            li.addEventListener('click', () => this.setMachine(key))
            this.machineMenu.appendChild(li)
        }
        this.machineMenu.style.display = 'none'

        document.getElementById('clean').addEventListener('click', () => this.cleanCode())

        this.title = document.querySelector('#menu h1')
        this.about = document.getElementById('about')
        this.title.addEventListener('click', () => { this.showAbout() })
        this.about.querySelectorAll('button').forEach(b => b.addEventListener('click', (e) => { this.aboutAction(e) }))
        this.about.addEventListener('close', () => { this.menuFocused = false })

        this.currentKeyHandler = null
        this.menuFocused = false

        this.waitToLoad()
    }

    waitToLoad() {
        const ready = (window.editor != null && window.palettes != null && window.fileControls != null && 
                       window.virtualKeyboard != null && window.tokenizer != null && window.petscii != null &&
                       window.keymap != null && window.welcome != null)

        if (ready) {
            const machineName = window.localStorage.getItem('machineName')
            this.keyHandler = document.addEventListener('keydown', (e) => { this.keyPressed(e) })

            let showWelcome = (machineName == null || !(machineName in Machines))
            if (!showWelcome) {
                const progName = window.localStorage.getItem('programName')
                showWelcome = (progName == null || progName === '')
            }
            if (showWelcome) {
                this.setMachine(machineName || DEFAULT_MACHINE)
                window.welcome.show()
            } else {
                this.setMachine(machineName)
                window.fileControls.init()
                window.editor.init()
            }
            return
        }
        setTimeout(() => { this.waitToLoad() }, 100)
    }

    setMachine(machine) {
        this.machineMenu.querySelectorAll('li').forEach(li => {
            li.classList.toggle('disabled', li.dataset.machine === machine)
        })
        this.machine = Machines[machine]
        window.localStorage.setItem('machineName', machine)
        // TODO: maybe set this up as a handler approach, but probably good enough for now
        document.body.className = machine
        this.machineName.textContent = this.machine.display || machine
        window.petscii.setMachine(this.machine)
        window.petscii.enableHandlers = true
        window.keymap.setMachine(this.machine)
        window.tokenizer.setMachine(this.machine)
        window.palettes.setMachine(this.machine)
        window.fileControls.setMachine(machine)
        window.virtualKeyboard.setMachine(this.machine)
        window.editor.setMachine(this.machine)
        
        this.about.className = machine
        window.blocker.hide()
    }

    showMenu() {
        window.blocker.show(this.machineMenu)
        this.setKeyHandler((e) => { this.machineMenuKeypressed(e) })
    }

    hideMenu() {
        this.machineMenu.querySelector('li.keyfocus')?.classList.remove('keyfocus')
        this.setKeyHandler()
        window.blocker.hide()
    }

    machineMenuKeypressed(event) {
        let handled = true
        if (event.code === 'Escape') {
            this.hideMenu()
            this.activateMenuBar(false)
        } else if (event.code === 'ArrowDown' || event.code === 'ArrowUp') {
            const lis = this.machineMenu.querySelectorAll('li:not(.disabled)')
            let focusedLi = this.machineMenu.querySelector('li.keyfocus')
            if (!focusedLi) {
                focusedLi = event.code === 'ArrowDown' ? lis[0] : lis[lis.length - 1]
            } else {
                focusedLi.classList.remove('keyfocus')
                let keepLooking = true
                while (keepLooking) {
                    keepLooking = false
                    focusedLi = event.code === 'ArrowDown' ? focusedLi.nextElementSibling : focusedLi.previousElementSibling
                    if (!focusedLi) {
                        focusedLi = event.code === 'ArrowDown' ? lis[0] : lis[lis.length - 1]
                    } else if (focusedLi.classList.contains('disabled')) {
                        keepLooking = true
                    }
                }
            }
            focusedLi.classList.add('keyfocus')
        } else if (event.code === 'Tab') {
            this.hideMenu()
            handled = false
        } else if (event.code === 'Enter') {
            const focusedLi = this.machineMenu.querySelector('li.keyfocus')
            this.hideMenu()
            if (focusedLi) {
                this.activateMenuBar(false)
                this.setMachine(focusedLi.dataset.machine)
            } else {
                handled = false // treat as TAB to next
            }
        } else if (event.code in this.machineMenuHotkeys) {
            this.hideMenu()
            this.activateMenuBar(false)
            this.setMachine(this.machineMenuHotkeys[event.code])
        } else {
            handled = false
        }
        if (handled) {
            event.preventDefault()
            event.stopPropagation()
        }
    }

    cleanCode() {
        window.editor.cleanProgram()
    }

    showAbout() {
        this.menuFocused = 'about'
        this.about.showModal()
    }

    aboutAction(event) {
        const action = event.target.dataset.action
        this.about.close()
        this.activateMenuBar(false)
        if (action === 'welcome') {
            window.welcome.show()
        }
    }

    setKeyHandler(handler = null) {
        this.currentKeyHandler = handler
    }

    activateMenuBar(activate = 'toggle', skipEditorEnable = false) {
        this.menuFocused = (activate === 'toggle') ? !this.menuFocused : activate
        if (this.menuFocused) {
            this.title.focus()
        } else if (!skipEditorEnable && window.editor && window.editor.initialized) {
            document.activeElement.blur()
            window.editor.enableEditor()
        }
    }

    keyPressed(event) {
        if (this.currentKeyHandler) {
            this.currentKeyHandler(event)
            return
        }
        // activate menu starting with title/about
        if (event.code === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            if (this.menuFocused === 'about') { 
                this.about.close() 
                return
            }
            this.activateMenuBar()
        }
        if (!this.menuFocused) { return }
        if (event.code === 'Enter') {
            const activeElement = document.activeElement
            if (activeElement.tagName === 'H1') {
                this.menuFocused = false
                event.preventDefault()
                event.stopPropagation()
                activeElement.blur()
                activeElement.click()
            }
        } else if (event.code === 'KeyM' && event.ctrlKey) {
            this.activateMenuBar(true)
            event.preventDefault()
            event.stopPropagation()
            this.showMenu()
        }
    }
}

window.addEventListener('load', () => { 
    window.menu = new Controls()
    document.querySelectorAll('.menu-button').forEach((b) => { new MenuButton(b) })
})

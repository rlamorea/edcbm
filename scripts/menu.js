const DEFAULT_MACHINE = 'c64'

const Machines = {
    'c64': {
        name: 'c64',
        hotkey: '6',
        language: 'v2',
        startAddress: 0x801,
    },
    'c128' : {
        name: 'c128',
        hotkey: '2',
        language: 'v7',
        startAddress: 0x1c01,
    },
    'c128-80' : {
        name: 'c128-80',
        hotkey: '8',
        display: 'c128',
        menu: 'c128-80 columns',
        language: 'v7',
        kb: 'c128',
        startAddress: 0x1c01,
    },
    'vic20' : {
        name: 'vic20',
        hotkey: 'v',
        language: 'v2',
        startAddress: 0x1001, // NOTE: could be 0x1201 if memory expansion in place
        menuPetscii: 'vic20',
    },
    'plus4': {
        name: 'plus4',
        hotkey: '4',
        palette: 'ted',
        language: 'v3.5',
        startAddress: 0x1001,
    },
    'c16': {
        name: 'c16',
        hotkey: '1',
        palette: 'ted',
        language: 'v3.5',
        startAddress: 0x1001,
    },
    'pet-g': {
        name: 'pet-g',
        hotkey: 'g',
        display: 'pet',
        menu: 'pet-graphics',
        palette: 'pet-40',
        language: 'v2',
        startAddress: 0x0401,
        menuPetscii: 'pet-g'
    },
    'pet-b': {
        name: 'pet-b',
        hotkey: 'p',
        display: 'pet',
        palette: 'pet',
        menu: 'pet-business',
        language: 'v4',
        startAddress: 0x0401,
        menuPetscii: 'pet-g'
    },
    'cbm2': {
        name: 'cbm2',
        hotkey: 'c',
        palette: 'pet',
        language: 'v4+',
        startAddress: 0x0003, // bank ram01
        menuPetscii: 'pet-g',
    }
}

class DropMenu {
    static setHotKeyText(menu) {
        let hotKeys = {}
        menu.querySelectorAll('li').forEach(li => {
            const label = li.querySelector('label')
            const hotkey = li.dataset.hotkey
            if (hotkey) {
                let textContainer = label || li
                const itemText = textContainer.textContent
                let itemHtml = ''
                for (let i = 0; i < itemText.length; i++) {
                    const char = itemText[i]
                    if (char.toUpperCase() === hotkey.toUpperCase()) {
                        itemHtml += `<u>${char}</u>`
                    } else {
                        itemHtml += char
                    }
                }
                textContainer.innerHTML = itemHtml
                hotKeys[`Key${hotkey.toUpperCase()}`] = li
            }
        })
        return hotKeys
    }

    constructor(menuContainer, options = {}) {
        this.menuBarWidth = document.getElementById('menu').offsetWidth
        this.menuLeft = null

        this.menu = menuContainer
        this.isShowing = false
        this.selectHandler = options.selectHandler
        this.closeHandler = options.closeHandler
        this.itemChangeHandler = options.changeHandler
        this.keepBarFocused = options.keepBarFocused
        this.dropToggle = options.drop

        if (this.dropToggle) {
            this.dropToggle.addEventListener('click', () => { this.toggleMenu() })
            this.dropToggle.addEventListener('focus', () => { this.toggleMenu(true) })
        }
        if (options.activationElements) {
            options.activationElements.forEach(element => {
                element.addEventListener('click', () => { this.toggleMenu() })
            })
        }

        this.hotKeys = {}

        // initialize menu items
        let datasetNameKey = options.nameKey || 'name'
        this.menu.querySelectorAll('li').forEach(li => {
            const label = li.querySelector('label')
            const name = li.dataset[datasetNameKey]
            if (!name) {
                li.dataset[datasetNameKey] = (label ? label.textContent : li.textContent).toLowerCase().replaceAll(' ', '-')
            }
            if (label) {
                li.querySelector('input').addEventListener('change', (e) => { this.itemChanged(e) })
            } else {
                li.addEventListener('click', (e) => { this.itemSelected(li, e) })
            }
        })
        this.hotKeys = DropMenu.setHotKeyText(this.menu)

        this.menu.style.display = 'none'
    }

    toggleMenu(show = 'toggle', fromBlocker = false) {
        this.isShowing = (show === 'toggle') ? !this.isShowing : show
        if (this.dropToggle) {
            this.dropToggle.classList.toggle('active', this.isShowing)
        }
        if (fromBlocker) { return } // avoid infinite loop
        if (this.isShowing) {
            window.blocker.show(this.menu, 'block', () => { this.toggleMenu(false, true) })
            if (this.dropToggle) {
                const locLeft = this.dropToggle.offsetLeft + this.dropToggle.offsetWidth - this.menu.offsetWidth
                if (this.menuLeft !== locLeft) {
                    this.menuLeft = locLeft
                    this.menuLeft = Math.max(this.menuLeft, 0)
                    this.menuLeft = Math.min(this.menuLeft, this.menuBarWidth - this.menu.offsetWidth)
                    this.menu.style.left = `${this.menuLeft}px`
                }
            }
            window.menu.setKeyHandler((e) => { this.keyHandler(e) })
        } else {
            this.menu.querySelector('li.keyfocus')?.classList.remove('keyfocus')
            window.blocker.hide()
            window.menu.setKeyHandler()
        }
    }

    keyHandler(event) {
        let handled = true
        if (event.code === 'Escape') {
            this.closeMenu('escape')
        } else if (event.code === 'Tab') {
            this.closeMenu('tab')
            handled = false // allow default tab behavior to move focus to next element
        } else if (event.code === 'Enter') {
            const focusedLi = this.menu.querySelector('li.keyfocus')
            if (focusedLi) {
                if (focusedLi.querySelector('input')) { 
                    focusedLi.querySelector('label').click()
                } else {
                    this.itemSelected(focusedLi)
                    this.closeMenu('enter')
                }
            } else {
                this.closeMenu('esc')
            }
        } else if (event.code === 'ArrowDown' || event.code === 'ArrowUp') {
            const lis = this.menu.querySelectorAll('li:not(.disabled)')
            let focusedLi = this.menu.querySelector('li.keyfocus')
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
        } else if (event.code in this.hotKeys) {
            this.closeMenu('hotkey')
            this.itemSelected(this.hotKeys[event.code])
        } else {
            handled = false
        }
        if (handled) {
            event.preventDefault()
            event.stopPropagation()
        }
    }

    itemSelected(li) {
        this.toggleMenu(false)
        if (li.classList.contains('disabled')) { return }
        if (!this.selectHandler) { return }
        this.selectHandler(li)
    }

    itemChanged(event) {
        this.toggleMenu(false)
        const li = event.target.closest('li')
        if (li.classList.contains('disabled')) { return }
        if (!this.itemChangeHandler) { return }
        this.itemChangeHandler(li, event)
    }

    closeMenu(reason) {
        if (this.isShowing) { this.toggleMenu(false); }
        if (reason !== 'tab' && !this.keepBarFocused) {
            window.menu.activateMenuBar(false)
        }
        if (!this.closeHandler) { return }
        this.closeHandler(reason)
    }
}

class Controls {
    constructor() {
        this.machine = null

        this.machineName = document.getElementById('machine')

        this.machineMenuHotkeys = {}
        this.machineMenu = document.getElementById('machinemenu')
        for (let key in Machines) {
            const li = document.createElement('li')
            li.textContent = Machines[key].menu || key
            li.dataset.hotkey = Machines[key].hotkey
            li.dataset.machine = key
            if (key === DEFAULT_MACHINE) { li.classList.add('disabled') }
            li.addEventListener('click', () => this.setMachine(key))
            this.machineMenu.appendChild(li)
        }
        this.machineDropMenu = new DropMenu(this.machineMenu, {
            drop: document.getElementById('machine-drop'),
            activationElements: [ this.machineName ],
            selectHandler: (li) => { this.setMachine(li.dataset.machine) }
        })

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

    activateMenuBar(activate = 'toggle', skipEditorEnable = false, focusElement = null) {
        this.menuFocused = (activate === 'toggle') ? !this.menuFocused : activate
        if (this.menuFocused) {
            const focusEl = focusElement || this.title
            focusEl.focus()
        } else if (!skipEditorEnable && window.editor && window.editor.initialized) {
            document.activeElement.blur()
            window.editor.enableEditor()
        }
    }

    handleHotkey(event, newFocus) {
        event.preventDefault()
        event.stopPropagation()
        if (newFocus) { this.activateMenuBar(true, false, newFocus) }
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
            if (activeElement.tagName === 'H1' || activeElement.tagName === 'button') {
                this.menuFocused = false
                this.handleHotkey(event, activeElement)
                activeElement.blur()
                activeElement.click()
            }
        } else if (event.code === 'KeyM' && event.ctrlKey) {
            this.handleHotkey(event, thisthis.machineDropMenu.dropToggle)
            this.machineDropMenu.toggleMenu(true)
        } else if (event.code === 'KeyP' && event.ctrlKey) {
            this.handleHotkey(event, window.fileControls.fileOptions.drop)
            window.fileControls.fileOptions.dropMenu.toggleMenu(true)
        } else if (event.code === 'KeyD' && event.ctrlKey) {
            this.handleHotkey(event, window.fileControls.diskOptions.drop)
            window.fileControls.diskOptions.dropMenu.toggleMenu(true)
        } else if (event.code === 'KeyL' && event.ctrlKey) {
            this.handleHotkey(event)
            this.activateMenuBar(false)
            window.virtualKeyboard.charsetButton.click()
        } else if (event.code === 'KeyK' && event.ctrlKey) {
            this.handleHotkey(event)
            this.activateMenuBar(false)
            window.virtualKeyboard.toggleKeyboard()
        }
    }
}

window.addEventListener('load', () => { 
    window.menu = new Controls()
})

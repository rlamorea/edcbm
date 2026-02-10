const DEFAULT_MACHINE = 'c64'

const Machines = {
    'c64': {
        name: 'c64',
        language: 'v2',
        startAddress: 0x801,
    },
    'c128' : {
        name: 'c128',
        language: 'v7',
        startAddress: 0x1c01,
    },
    'c128-80' : {
        name: 'c128-80',
        display: 'c128',
        menu: 'c128-80 columns',
        language: 'v7',
        kb: 'c128',
        startAddress: 0x1c01,
    },
    'vic20' : {
        name: 'vic20',
        language: 'v2',
        fontOffset: 0x0200,
        startAddress: 0x1001, // NOTE: could be 0x1201 if memory expansion in place
        menuPetscii: 'vic20'
    },
    'plus4': {
        name: 'plus4',
        palette: 'ted',
        language: 'v3.5',
        startAddress: 0x1001,
    },
    'c16': {
        name: 'c16',
        palette: 'ted',
        language: 'v3.5',
        startAddress: 0x1001,
    },
    'pet-g': {
        name: 'pet-g',
        display: 'pet',
        menu: 'pet-graphics',
        palette: 'pet-40',
        language: 'v2',
        startAddress: 0x0401,
        menuPetscii: 'pet-g'
    },
    'pet-b': {
        name: 'pet-b',
        display: 'pet',
        palette: 'pet',
        menu: 'pet-business',
        language: 'v4',
        startAddress: 0x0401,
        menuPetscii: 'pet-g'
    },
    'cbm2': {
        name: 'cbm2',
        palette: 'pet',
        language: 'v4+',
        startAddress: 0x0003, // bank ram01
        menuPetscii: 'pet-g'
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
        this.machine = Machines[DEFAULT_MACHINE]

        this.machineName = document.getElementById('machine')
        this.machineDrop = document.getElementById('machine-drop')
        this.machineName.addEventListener('click', () => { this.showMenu() })
        this.machineDrop.addEventListener('click', () => { this.showMenu() })
        this.machineDrop.addEventListener('focus', () => { this.showMenu() })

        this.machineMenu = document.getElementById('machinemenu')
        for (let key in Machines) {
            const li = document.createElement('li')
            li.textContent = Machines[key].menu || key
            li.dataset.machine = key
            if (key === DEFAULT_MACHINE) { li.classList.add('disabled') }
            li.addEventListener('click', () => this.setMachine(key))
            this.machineMenu.appendChild(li)
        }
        this.machineMenu.style.display = 'none'

        document.getElementById('clean').addEventListener('click', () => this.cleanCode())
        this.waitToLoad()
    }

    waitToLoad() {
        const ready = (window.editor != null && window.palettes != null && window.fileControls != null && 
                       window.virtualKeyboard != null && window.tokenizer != null && window.petscii != null &&
                       window.keymap != null)

        if (ready) {
            this.setMachine(DEFAULT_MACHINE)
            return
        }
        setTimeout(() => { this.waitToLoad() }, 100)
    }

    setMachine(machine) {
        this.machineMenu.querySelectorAll('li').forEach(li => {
            li.classList.toggle('disabled', li.dataset.machine === machine)
        })
        this.machine = Machines[machine]
        document.body.className = machine
        this.machineName.textContent = this.machine.display || machine
        window.petscii.setMachine(this.machine)
        window.keymap.setMachine(this.machine)
        window.palettes.setMachine(this.machine)
        window.fileControls.setMachine(machine)
        window.editor.setMachine(this.machine)
        window.virtualKeyboard.setMachine(this.machine)
        window.tokenizer.setMachine(this.machine)
        
        window.blocker.hide()
    }

    showMenu() {
        window.blocker.show(this.machineMenu)
    } 

    cleanCode() {
        window.editor.cleanProgram()
    }
}

window.addEventListener('load', () => { 
    new Controls()
    document.querySelectorAll('.menu-button').forEach((b) => { new MenuButton(b) })
})

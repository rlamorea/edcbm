const DEFAULT_MACHINE = 'c128'

const Machines = {
    'c64': {
        name: 'c64',
        language: 'v2',
    },
    'c128' : {
        name: 'c128',
        language: 'v7',
    },
    'c128-80' : {
        name: 'c128-80',
        display: 'c128',
        menu: 'c128-80 columns',
        language: 'v7',
        kb: 'c128',
    },
    'vic20' : {
        name: 'vic20',
        language: 'v2',
    },
    'plus4': {
        name: 'plus4',
        palette: 'ted',
        language: 'v3.5',
    },
    'c16': {
        name: 'c16',
        palette: 'ted',
        language: 'v3.5',
    },
    'pet-g': {
        name: 'pet-g',
        display: 'pet',
        menu: 'pet-graphics',
        palette: 'pet-40',
        language: 'v2',
    },
    'pet-b': {
        name: 'pet-b',
        display: 'pet',
        palette: 'pet',
        menu: 'pet-business',
        language: 'v4',
    },
    'cbm2': {
        name: 'cbm2',
        palette: 'pet',
        language: 'v4+',
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
        this.setMachine(DEFAULT_MACHINE)

        if (window.editor) { window.editor.disabled = true }
    }

    setMachine(machine) {
        this.machineMenu.querySelectorAll('li').forEach(li => {
            li.classList.toggle('disabled', li.dataset.machine === machine)
        })
        this.machine = Machines[machine]
        document.body.className = machine
        this.machineName.textContent = this.machine.display || machine
        if (window.editor) { window.editor.setMachine(this.machine) }
        if (window.palettes) { window.palettes.setMachine(this.machine) }
        if (window.fileControls) { window.fileControls.setMachine(machine) }
        if (window.virtualKeyboard) { window.virtualKeyboard.setMachine(this.machine) }
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
})

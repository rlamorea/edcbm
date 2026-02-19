class Palette {
    static BASE_STEP_PCT = 9.05
    static BRIGHTNESS_RED = 0.299
    static BRIGHTNESS_GREEN = 0.587
    static BRIGHTNESS_BLUE = 0.114
    static BRIGHTNESS_MIDDLE = 128
    static CSS_ROOT_ID = 'edcbm-palette'

    static rgb(c) {
        const r = parseInt(c.substring(1, 3), 16)
        const g = parseInt(c.substring(3, 5), 16)
        const b = parseInt(c.substring(5), 16)
        return { r, g, b }
    }

    static colorBlend(c1, c2, step) {
        const stepPct = (Palette.BASE_STEP_PCT * step) / 100
        const oppStepPct = 1 - stepPct

        const { r: r1, g: g1, b: b1 } = Palette.rgb(c1)
        const { r: r2, g: g2, b: b2 } = Palette.rgb(c2)
        const rc = Math.min(255, Math.round(r1 * oppStepPct + r2 * stepPct))
        const gc = Math.min(255, Math.round(g1 * oppStepPct + g2 * stepPct))
        const bc = Math.min(255, Math.round(b1 * oppStepPct + b2 * stepPct))
        return `#${rc.toString(16).padStart(2, '0')}${gc.toString(16).padStart(2, '0')}${bc.toString(16).padStart(2, '0')}` 
    }

    static brightness({ r, g, b }) {
        return 0.299 * r + 0.587 * g + 0.114 * b
    }

    static colorStrength(c, step, dir = 'stronger') {
        const { r, g, b } = Palette.rgb(c)
        const br = Palette.BRIGHTNESS_RED * r + Palette.BRIGHTNESS_GREEN * g + Palette.BRIGHTNESS_BLUE * b
        let c2 = (br >= 128) ? [ '#ffffff', '#000000' ] : [ '#000000', '#ffffff' ]
        c2 = c2[dir === 'weaker' ? 1 : 0]
        return Palette.colorBlend(c, c2, step)
    }

    static editorThemes = { }

    constructor(name, background, foreground, options = {}) {
        this.name = name
        const border = options['--menu-border'] || Palette.colorStrength(background, 4, 'weaker')
        const menufg = options['--menu-foreground'] || Palette.colorStrength(border, 6, 'weaker') // foreground
        this.editorFont = options.font || 'cbmthick-40'
        let menuFont = options.menuFont || options.font || 'cbmthick-40'
        if (!this.editorFont.endsWith('-40')) {
            menuFont = menuFont.replace(/\-(22|80)$/, '-40')
        }
        if (menuFont.startsWith('monocode')) { menuFont = 'cbmthick-40' }

        this.cssRoot = {
            '--menu-border': border,
            '--menu-border-strong': options['--menu-border-strong'] || Palette.colorStrength(border, 5, 'stronger'),
            '--menu-foreground': menufg,
            '--menu-foreground-strong': options['--menu-foreground-strong'] || Palette.colorStrength(menufg, 4),
            '--menu-foreground-weak': options['--menu-foreground-weak'] || Palette.colorStrength(menufg, 2, 'weaker'),
            '--menu-placeholder': options['--menu-placeholder'] || Palette.colorStrength(menufg, 5, 'weaker'),
            '--dialog-border': border,
            '--dialog-foreground': foreground,
            '--dialog-background': background,
            '--menu-font': menuFont,
            '--editor-font': `${this.editorFont}, monospace`,
            '--button-background': options.buttonBackground || '#dddddd',
            '--button-background-hover': options.buttonBackgroundHover || Palette.colorStrength(options.buttonBackground || '#dddddd', 7),
            // for now these are constants
            '--blocker-color' : 'rgba(0,0,0,0.25)',
            '--special-background': '#222222',
            '--special-foreground': 'darkgoldenrod'
        }
        this.editorColors = {
            base: options.editorBase || 'vs',
            background,
            foreground,
            linenumber: options.linenumber || Palette.colorBlend(foreground, '#FF8f00', 8),
            operator: options.operator || Palette.colorStrength(foreground, 2, 'weaker'),
            reserved: options.reserved || Palette.colorBlend(foreground, '#ff0000', 8),
            keyword: foreground,
            variable: options.variable || Palette.colorStrength(foreground, 5),
            string: options.string || Palette.colorBlend(foreground, '#0000ff', 3),
            comment: options.comment || Palette.colorBlend(foreground, background, 5),
            number: options.number || Palette.colorBlend(foreground, '#00ff00', 3),
            parens: options.parens || Palette.colorStrength(foreground, 7)
        }
    }

    cssPalette() {
        return this.cssRoot
    }

    setCssRoot() {
        let style = document.getElementById(Palette.CSS_ROOT_ID)
        if (!style) {
            style = document.createElement('style')
            style.id = Palette.CSS_ROOT_ID
            document.head.appendChild(style)
        }           
        let css = ':root {';
        for (const [key, value] of Object.entries(this.cssRoot)) {
            css += `${key}: ${value};`;
        }
        css += '}';
        style.textContent = css;
    }

    editorPalette() {
        return this.editorColors
    }

    setEditorTheme() {
        if (!window.editor) {
            setTimeout(() => { this.setEditorTheme() }, 50)
            return
        }
        if (!Palette.editorThemes[this.name] || this.name === 'custom') {
            window.editor.generateEditorTheme(this.name, this.editorColors)
            Palette.editorThemes[this.name] = `${this.name}theme`
        }
        const font = this.editorFont
        window.editor.setTheme(this.name, font)
    }
}

const PaletteDefinitions = {
    'dark-thick': new Palette('dark', '#222222', '#dddddd', { editorBase: 'vs-dark', font: 'monocode-thick', menuFont: 'cbmthick-40' }),
    'lite-thick' : new Palette('lite', '#f4f4f4', '#333333', { font: 'monocode-thick', menuFont: 'cbmthick-40' }),
    'dark-thin': new Palette('dark', '#222222', '#dddddd', { editorBase: 'vs-dark', font: 'monocode-thin', menuFont: 'cbmthin-40' }),
    'lite-thin' : new Palette('lite', '#dddddd', '#333333', { font: 'monocode-thin', menuFont: 'cbmthin-40' }),
    'c128' : new Palette('c128', '#777777', '#cdffac', { '--menu-border': '#cdffac', '--menu-foreground': '#777777', operator: '#8fd1bb', string: '#a8d5e1', reserved: '#ee536a' }),
    'c128-80' : new Palette('c128-80', '#000000', '#00ffff', { '--menu-border': '#444444', '--menu-foreground': '#00ffff', editorBase: 'vs-dark', font: 'cbmthick-80', menuFont: 'cbmthick-40', variable: '#03d3d3' }),
    'c64' : new Palette('c64', '#4555d6', '#8e9aff', { '--menu-border': '#8e9aff', '--menu-foreground': '#4555d6', string: '#9985ff', operator: '#8fc9db', comment: '#958fbc' }),
    'vic20' : new Palette('vic20', '#ffffff', '#5800FC', { '--menu-border': '#80ffff', font: 'cbmthin-22', menuFont: 'cbmthin-40', string: '#408cfd', number: '#257e74', operator: '#30bb83', comment: '#ac9ec7' }), // slightly darker menu color than text color
    'ted' : new Palette('ted', '#ffffff', '#000000', { '--menu-border': '#ff9bd8', '--menu-foreground': '#202020', variable: '#606060', string: '#0000a0', number: '#007800', operator: '#05888a' }), 
    'pet-40' : new Palette('pet-40', '#000000', '#65D045', { '--menu-border': '#444444', '--menu-foreground': '#65D045', editorBase: 'vs-dark', font: 'cbmthin-40', variable: '#499933', string: '#4c7cdc', number: '#61b392', operator: '#4fadc4', comment: '#72836d' }),
    'pet' : new Palette('pet', '#000000', '#65D045', { '--menu-border': '#444444', '--menu-foreground': '#65D045', editorBase: 'vs-dark', font: 'cbmthin-80', menuFont: 'cbmthin-40', variable: '#499933', string: '#4c7cdc', number: '#61b392', operator: '#4fadc4', comment: '#72836d' }),
}

const Palettes = [
    'dark',
    'lite',
    'cbm',
    'custom',
]

const DEFAULT_PALETTE = 'cbm'

class PaletteEditor {
    constructor(parent) {
        this.parent = parent
        this.paletteEditor = document.getElementById('paletteeditor')
        this.paletteEditor.style.display = 'none'

        this.paletteEditor.querySelector('.close').addEventListener('click', () => { window.blocker.hide() })

        this.saveButton = this.paletteEditor.querySelector('button.action')
        this.saveButton.addEventListener('click', () => { this.savePalette() })

        this.cancelButton = this.paletteEditor.querySelector('button.cancel')
        this.cancelButton.addEventListener('click', () => { window.blocker.hide() })

        this.resetButton = this.paletteEditor.querySelector('button.reset')
        this.resetButton.addEventListener('click', () => { this.resetPalette() })
        this.resetButton.disabled = true

        this.defaultButton = this.paletteEditor.querySelector('button.default')
        this.defaultButton.addEventListener('click', () => { this.setToDefaults() })

        const elements = this.paletteEditor.querySelectorAll('.elem')
        elements.forEach((el) => { el.addEventListener('click', (ev) => { this.activateElement(ev) })})

        const fontSelectors = this.paletteEditor.querySelectorAll('select')
        fontSelectors.forEach((el) => { el.addEventListener('change', (ev) => { this.fontSelected(ev) })})

        const colorSelectors = this.paletteEditor.querySelectorAll('input[type=color]')
        colorSelectors.forEach((el) => { el.addEventListener('change', (ev) => { this.colorSelected(ev) }) })

        this.paletteEditor.addEventListener('click', (e) => {
            if (this.editingColor) { this.editingColor = false }
        })

        this.editorGrid = this.paletteEditor.querySelector('.grid.editor')
        this.highlightGrid = this.paletteEditor.querySelector('.grid.highlight')
        this.menuGrid = this.paletteEditor.querySelector('.grid.menu')
    }

    savePalette() {
        this.parent.updateCustomPalette(this.paletteDefinition, this.paletteDirectEdits)
        window.blocker.hide()
    }

    showPaletteEditor() {
        this.savedPaletteDefinition = this.paletteDefinition
        this.paletteDefinition = JSON.parse(JSON.stringify(this.paletteDefinition))
        this.paletteDirectEdits = {}
    }

    editPalette(paletteDef, paletteEdits) {
        this.savedPaletteDefinition = paletteDef
        this.savedPaletteEdits = paletteEdits
        
        this.ignoreNextActivate = false
        this.editingColor = false

        window.blocker.show(this.paletteEditor, 'block', () => { return this.clickOffEditor() })
        this.setPaletteDefinition(paletteDef, paletteEdits)
    }

    setPaletteDefinition(paletteDef, paletteEdits) {
        this.paletteDefinition = JSON.parse(JSON.stringify(paletteDef))
        this.paletteDirectEdits = paletteEdits
        if (!this.paletteDirectEdits) {
            this.paletteDirectEdits = {
                font: this.paletteDefinition.editorFont
            }
        }
        this.setColors()
        this.setFonts()
    }

    resetPalette() {
        this.setPaletteDefinition(this.savedPaletteDefinition, this.savedPaletteEdits)
        this.resetButton.disabled = true
    }

    setToDefaults() {
        const machine = window.palettes.machine
        const palette = machine.palette || machine.name
        const deafultPaletteDef = PaletteDefinitions[palette]
        this.setPaletteDefinition(deafultPaletteDef, null)
        this.generateNewPaletteDefinition()
        this.setColors()
        this.setFonts()
        this.resetButton.disabled = false
    }

    setColors() {
        const bg = this.paletteDefinition.editorColors.background
        this.editorGrid.style.background = bg
        this.editorGrid.querySelector('.elem[data-elem=background] input').value = bg

        const fg = this.paletteDefinition.editorColors.foreground
        this.editorGrid.style.color = fg
        this.editorGrid.querySelector('.elem[data-elem=foreground] input').value = fg
        this.editorGrid.querySelector('select').color = fg

        this.highlightGrid.style.background = this.paletteDefinition.editorColors.background
        this.highlightGrid.style.color = this.paletteDefinition.editorColors.foreground
        for (const elem of this.highlightGrid.querySelectorAll('.elem')) {
            const elemType = elem.dataset.elem
            if (elemType.endsWith('font')) { continue }
            const color = this.paletteDefinition.editorColors[elemType]
            elem.style.color = color
            elem.querySelector('input').value = color
        }

        this.menuGrid.style.background = this.paletteDefinition.cssRoot['--menu-border']
        this.menuGrid.style.color = this.paletteDefinition.cssRoot['--menu-foreground']
        this.menuGrid.querySelector('h3').style.borderColor = this.paletteDefinition.cssRoot['--menu-foreground']
        this.menuGrid.querySelector('select').style.color = this.paletteDefinition.cssRoot['--menu-foreground']
        for (const elem of this.menuGrid.querySelectorAll('.elem')) {
            const elemType = elem.dataset.elem
            if (elemType.endsWith('font')) { continue }
            const color = this.paletteDefinition.cssRoot[`--menu-${elemType}`]
            if (elemType.startsWith('border')) {
                elem.style.background = color
            } else {
                elem.style.color = color
            }
            elem.querySelector('input').value = color
        }
    }

    setFonts() {
        const editorFont = this.paletteDefinition.editorFont
        this.editorGrid.style.fontFamily = editorFont
        this.editorGrid.querySelector('select').value = editorFont
        this.highlightGrid.style.fontFamily = editorFont

        const menuFont = this.paletteDefinition.cssRoot['--menu-font']
        this.menuGrid.style.fontFamily = menuFont
        this.menuGrid.querySelector('select').value = menuFont
    }

    clickOffEditor() {
        if (this.editingColor) { 
            this.editingColor = false
            return true 
        }
        this.parent.setPalette('restore')
        return false   
    }

    activateElement(event) {
        const elem = event.target.closest('div.elem')
        const elemType = elem.dataset.elem
        if (this.ignoreNextActivate) {
            this.ignoreNextActivate = false
            return
        }
        if (this.editingColor === elemType) {
            this.editingColor = false
            return
        } else if (this.editingColor) {
            this.editingColor = false
        }
        if (elemType.endsWith('font')) {
            if (event.target.tagName !== 'SELECT') {
                elem.querySelector('select').focus()
            }
        } else {
            this.editingColor = elemType
            this.ignoreNextActivate = true
            elem.querySelector('input').click()
        }
    }

    generateNewPaletteDefinition() {
        const newPaletteDef = new Palette(
            'custom', 
            this.paletteDefinition.editorColors.background,
            this.paletteDefinition.editorColors.foreground,
            this.paletteDirectEdits
        )
        this.paletteDefinition = newPaletteDef
    }

    fontSelected(event) {
        this.ignoreNextActivate = true
        this.resetButton.disabled = false
        
        const elem = event.target.closest('div.elem')
        const elemType = elem.dataset.elem
        const font = elem.querySelector('select').value

        const grid = elem.closest('.grid')
        if (grid.classList.contains('editor')) {
            this.paletteDefinition.editorFont = font
            this.paletteDirectEdits.font = font
            if (!('menuFont' in this.paletteDirectEdits)) {
                this.generateNewPaletteDefinition()
            }
        } else { // menu
            this.paletteDefinition.cssRoot['--menu-font'] = font
            this.paletteDirectEdits.menuFont = font
        }
        this.setFonts()
    }

    colorSelected(event) {
        this.resetButton.disabled = false
        this.editingColor = false

        const elem = event.target.closest('div.elem')
        const elemType = elem.dataset.elem
        const color = elem.querySelector('input').value

        const grid = elem.closest('.grid')
        if (grid.classList.contains('editor')) {
            this.paletteDefinition.editorColors[elemType] = color
        } else if (grid.classList.contains('highlight')) {
            this.paletteDefinition.editorColors[elemType] = color
            this.paletteDirectEdits[elemType] = color
        } else { // menu
            const colorKey = `--menu-${elemType}`
            this.paletteDefinition.cssRoot[colorKey] = color
            this.paletteDirectEdits[colorKey] = color
        }
        this.generateNewPaletteDefinition()

        this.setColors()
    }

    colorEditCanceled(event) {
        this.editingColor = false
    }
}

class PaletteMenu {
    constructor() {
        this.palette = window.localStorage.getItem('currentPalette') || DEFAULT_PALETTE
        this.machine = null

        this.menuButton = document.getElementById('palette')
        this.menu = document.getElementById('palettemenu')
        this.palettes = []
        this.menu.querySelectorAll('li').forEach(li => {
            const paletteName = li.className.split(' ')[0]
            if (paletteName === '') { return }
            li.dataset.palette = paletteName
            this.palettes.push(paletteName)
        })

        this.dropMenu = new DropMenu(this.menu, {
            drop: this.menuButton,
            selectHandler: (li) => { this.paletteSelected(li) }
        })

        const customEntry = this.menu.querySelector('li.custom')
        customEntry.classList.add('disabled')
        let customPalette = window.localStorage.getItem('customPalette')
        if (customPalette) {
            customPalette = JSON.parse(customPalette)
            this.customPalette = {
                paletteDef: new Palette(
                    'custom',
                    customPalette.background,
                    customPalette.foreground,
                    customPalette.options
                ),
                edits: customPalette.options
            }
            customEntry.classList.remove('disabled')
        } else {
            this.customPalette = null
        }

        this.setPalette(this.palette)
        this.paletteEditor = new PaletteEditor(this)
    }

    setPalette(palette) {
        if (palette === 'restore') { palette = this.palette }
        this.palette = palette
        let paletteDef = PaletteDefinitions[palette]
        if (palette === 'cbm') {
            if (this.machine === null) { return }
            paletteDef = PaletteDefinitions[this.machine.palette || this.machine.name]
        } else if (palette === 'dark' || palette === 'lite') {
            if (this.machine === null) { return }
            const paletteVariant = (this.machine.name.startsWith('pet') || this.machine.name === 'cbm2') ? '-thin' : '-thick'
            paletteDef = PaletteDefinitions[`${palette}${paletteVariant}`]
        } else if (palette === 'custom') {
            if (this.customPalette === null) { return }
            if (!this.customPalette.paletteObj) {
                this.customPalette.paletteObj = new Palette(
                    'custom', 
                    this.customPalette.paletteDef.editorColors.background, 
                    this.customPalette.paletteDef.editorColors.foreground,
                    this.customPalette.edits
                )
            }
            paletteDef = this.customPalette.paletteObj
        }
        if (paletteDef === null) { return }
        this.menu.querySelectorAll('li').forEach(li => {
            let disabled = li.dataset.palette === palette
            if (li.dataset.palette === 'custom' && !this.customPalette) { disabled = true }
            li.classList.toggle('disabled', disabled)
        })
        paletteDef.setCssRoot()
        paletteDef.setEditorTheme()
        this.paletteDefinition = paletteDef

        window.localStorage.setItem('currentPalette', palette)
        this.menuButton.classList.remove(...this.palettes)
        this.menuButton.classList.add(palette)
    }

    setMachine(machine) {
        const palette = machine.palette || machine.name
        const paletteDef = PaletteDefinitions[palette]
        if (paletteDef === null) { return }
        this.machine = machine
        this.setPalette(this.palette)
    }

    showMenu() {
        window.blocker.show(this.menu)
    }

    paletteSelected(li) {
        const palette = li.dataset.palette
        if (palette === this.palette) { return }
        if (palette === 'edit') { 
            window.blocker.hide()
            const edits = (this.palette === 'custom') ? this.customPalette.edits : null
            return this.paletteEditor.editPalette(this.paletteDefinition, edits)
        }
        this.setPalette(palette)
        window.blocker.hide()
    }

    updateCustomPalette(paletteDef, edits) {
        this.customPalette = { paletteDef, edits }
        window.localStorage.setItem('currentPalette', 'custom')
        const customPaletteStorage = {
            background: paletteDef.editorColors.background,
            foreground: paletteDef.editorColors.foreground,
            options: edits
        }
        window.localStorage.setItem('customPalette', JSON.stringify(customPaletteStorage))
        this.setPalette('custom')
    }
}

window.addEventListener('load', () => {
    window.palettes = new PaletteMenu();
})

/*
C128-40 & C64 palette is:
    0 - black - #000000
    1 - white - #ffffff
    2 - red - #AF3C58
    3 - cyan - #7EEAD6
    4 - purple - #AA40F5
    5 - green - #62D532
    6 - blue - #2C3DEC
    7 - yellow - #FFFF46
    8 - orange - #B7631E
    9 - brown - #775300
    10 - pink - #EE7B95
    11 - dark gray - #626262
    12 - med gray - #949494
    13 - lt green - #B7FF86
    14 - lt blue - #7385FF
    15 - lt gray - #CDCDCD

C128-80 palette is:
    0 - black - #000000
    1 - dark gray - #555555
    2 - blue - #0000AA
    3 - lt blue - #5555FF
    4 - green - #00AA00
    5 - lt green - #55FF55
    6 - dark cyan - #00AAAA
    7 - cyan - #55FFFF
    8 - red - #AA0000
    9 - lt red - #FF5555
    10 - purple - #AA00AA
    11 - pink - #FF55FF
    12 - brown - #AA5500
    13 - yellow - #FFFF55
    14 - lt gray - #AAAAAA
    15 - white - #FFFFFF

VIC20 palette is:
  colors: [
    0 - black - #000000
    1 - white - #FFFFFF
    2 - red - #C13C0E
    3 - cyan - #80FFFF
    4 - purple - #E747E6
    5 - lt green - #68FF90
    6 - blue - ???
    7 - yellow - #FFFF4E

TED (C16/plus4) palette is:
     0 - black     - [[ #000000]] ...
     1 - white        - #202020, #303030  , #404040  , #505050  , #787878  , #909090  , #c0c0c0,[[ #ffffff]]
     2 - red          - #5e0700, #6e1710  , #7e2720,[[ #8e3730]], #b65f58  , #ce7770  , #fea7a0  , #ffe7e0
     3 - cyan         - #003940, #004950  , #025960  , #126970  , #3a9198  , #52a9b0,[[ #82d9e0]], #c2ffff
     4 - purple       - #56006c, #66067c  , #76168c  , #86269c,[[ #ae4ec4]], #c666dc  , #f696ff  , #ffd6ff
     5 - green        - #003a00, #005a00  , #0a6a00,[[ #1a7a04]], #42a22c  , #5aba44  , #8aea74  , #caffb4
     6 - blue         - #150aae, #251abe  , #352ace  , #453ade,[[ #6d62ff]], #857aff  , #b5aaff  , #f5eaff
     7 - yellow       - #2b3600, #3b4600  , #4b5600  , #5b6600  , #838e00  , #9ba602  , #cbd632,[[ #ffff72]]
     8 - orange       - #541600, #642600  , #743600  , #844600,[[ #ac6e25]], #c4863d  , #f4b66d  , #fff6ad
     9 - brown        - #422600, #523600,[[ #624600]], #725600  , #9a7e00  , #b29616  , #caae40  , #ffff86
    10 - yellow-green - #124300, #225300  , #326300  , #427300  , #6a9b00,[[ #82b304]], #b2e334  , #f2ff74
    11 - pink         - #5f0038, #6f0b48  , #7f1b58  , #8f2b68  , #b75390  , #cf6ba8,[[ #ff9bd8]], #ffdbff
    12 - blue-green   - #004508, #005518  , #016528  , #117538  , #399d60,[[ #51b578]], #81e5a8  , #c1ffe8
    13 - lt-blue      - #001a9a, #0e2aaa  , #1e3aba  , #2e4aca  , #5672f2  , #6e8aff,[[ #9ebaff]], #defaff
    14 - dk-blue      - #2e00ac, #3e0dbc,[[ #4e1dcc]], #5e2ddc  , #8655ff  , #9e6dff  , #ce9dff  , #ffddff
    15 - lt-green     - #004a00, #0b5a00  , #1b6a00  , #2b7a00  , #53a203,[[ #6bba1b]], #9bea4b  , #dbff8b

PET palette is:
    0 - black - #000000
    1 - green - #65D045

*/
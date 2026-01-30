function toPetscii(rawline) {
    let petsciiline = new Uint8Array(rawline.length)
    for (let i = 0; i < rawline.length; i++) {
        petsciiline[i] = D64.petsciiLookup[rawline[i]]
    }
    return petsciiline
}

const algorithms = {
    cg_proofreader_oct83: { 
        name: "Compute!'s Gazette Automatic Proofreader v1 (Oct '83)",
        abbr: "cg1",
        algorithm: (rawline) => {
            const petsciiline = toPetscii(rawline)
            let checksum = 0
            for (let i = 0; i < petsciiline.length; i++) {
                const ch = petsciiline[i]
                if (ch === 32) { continue } // skip spaces
                checksum = (checksum + ch) % 256
            }
            return checksum.toString()
        }
    },

    cg_proofreader_feb86: {
        name: "Compute!'s Gazette Automatic Proofreader v2 (Feb '86)",
        abbr: "cg2",
        algorithm: (rawline) => {
            let inLineNo = true
            let lineNo = null
            let inQuotes = false
            let checksum = 0
            let index = 0
            const petsciiline = toPetscii(rawline)
            for (let i = 0; i < petsciiline.length; i++) {
                const ch = petsciiline[i]
                if (inLineNo && ch >= 0x30 && ch <= 0x39) {
                    lineNo = (lineNo || 0) * 10 + (ch - 0x30)
                } else if (inLineNo && ch === 32) {
                    continue
                } else if (inLineNo) {
                    checksum += lineNo
                    inLineNo = false
                }
                if (!inQuotes && ch === 32) { continue } // skip spaces outside quotes
                if (ch === 0x22) { // quote
                    inQuotes = !inQuotes
                }
                index += 1
                for (let idx = 0; idx < index; idx++) {
                    checksum = (checksum + ch) % 65536
                }
            }
            checksum = ((checksum & 0xFF00) >> 8) ^ (checksum & 0x00FF)

            const chars = 'ABCDEFGHJKMPQRSX'
            let chx = ''
            chx += chars[(checksum >> 4) & 0x0F]
            chx += chars[checksum & 0x0F]
            return chx
        }
    },

    run_typist_sep85: {
        name: "RUN Magazine Perfect Typist v1 (Sep '85)",
        abbr: 'run1',
        algorithm: (rawline) => {
            const { byteArray, lineNumber } = window.tokenizer.tokenizeLine(rawline)
            let index = 0
            let inQuotes = false
            let checksum = 0
            // start at index 2 to skip line number bytes
            for (let i = 2; i < byteArray.length; i++) {
                const tok = byteArray[i]
                if (tok === 0x22) { inQuotes = !inQuotes }
                if (!inQuotes && tok === 32) { continue }
                index += 1
                const rolls = index & 0x07
                let chval = tok
                let add = 0
                for (let r = 0; r <= rolls; r++) {
                    add = (chval > 127) ? 1 : 0
                    chval = ((chval << 1) % 256) + add
                }
                checksum = (checksum + chval + add) % 256
            }
            checksum = (checksum + (lineNumber & 0xff)) % 256
            checksum = (checksum + ((lineNumber >> 8) & 0xff)) % 256
            return checksum.toString()
        }
    },

    run_typist_jan88: {
        name: "RUN Magazine Perfect Typist v2 (Jan '88)",
        abbr: 'run2',
        algorithm: (rawline) => {
            const { byteArray, lineNumber } = window.tokenizer.tokenizeLine(rawline)
            let index = 0
            let inQuotes = false
            let checksum = lineNumber
            // start at index 2 to skip line number bytes
            for (let i = 2; i < byteArray.length; i++) {
                const tok = byteArray[i]
                if (tok === 0x22) { inQuotes = !inQuotes }
                if (!inQuotes && tok === 32) { continue }
                index += 1
                for (let idx = 0; idx < index; idx++) {
                    checksum = (checksum + tok) % 65536
                }
            }
            checksum = ((checksum & 0xFF00) >> 8) ^ (checksum & 0x00FF)
            return checksum.toString()
        }
    },

    ahoy_bugrepellent_apr84: {
        name: "Ahoy! Bug Repellent (Apr '84)",
        abbr: 'ahoy',
        algorithm: (rawline) => {
            const { byteArray, lineNumber } = window.tokenizer.tokenizeLine(rawline)
            let checksum = 0
            // start at index 2 to skip line number bytes
            for (let i = 2; i < byteArray.length; i++) {
                const tok = byteArray[i]
                checksum = (checksum + tok) % 256
                checksum = (checksum << 1) % 256
            }
            const chars = 'ABCDEFGHIJKLMNOP'
            let chx = ''
            chx += chars[(checksum >> 4) & 0x0F]
            chx += chars[checksum & 0x0F]
            return chx
        }
    }
}

class ChecksumMenu {
    constructor() {
        this.button = document.getElementById('checksum')
        this.menu = document.getElementById('checksummenu')
        this.currentAlgorithm = null

        this.button.addEventListener('click', (e) => { this.showMenu() })
        this.menu.querySelector('li').addEventListener('click', (e) => { this.setAlgorithm('checksum-none') })
        for (let algorithm in algorithms) {
            const li = document.createElement('li')
            li.textContent = algorithms[algorithm].name
            li.dataset.checksum = algorithm
            li.addEventListener('click', () => this.setAlgorithm(algorithm))
            this.menu.appendChild(li)
        }
        this.menu.style.display = 'none'
        this.setAlgorithm('checksum-none')
    }

    showMenu() {
        window.blocker.show(this.menu)
    }

    setAlgorithm(algorithm) {
        window.blocker.hide()
        this.button.className = `checksum-${algorithm === 'checksum-none' ? 'none' : 'on'}`
        this.menu.querySelectorAll('li').forEach(li => {
            li.classList.toggle('disabled', li.dataset.checksum === algorithm)
        })
        if (!window.editor) { return }
        window.editor.setChecksumAlgorithm(algorithm === 'checksum-none' ? null : algorithms[algorithm].algorithm)
    }
}

window.addEventListener('load', () => { 
    new ChecksumMenu()
})

// function testIt() {
//     const testLine = '10 PRINT "HELLO WORLD!"'
//     console.log(`Test line: ${testLine}`)

//     let checksum = algorithms.cg_proofreader_oct83(testLine)
//     console.log('Running test for CG Proofreader (Oct 1983) checksum algorithm')
//     console.log(`Checksum: ${checksum} (expected: 79)`)

//     checksum = algorithms.cg_proofreader_feb86(testLine)
//     console.log('Running test for CG Proofreader (Feb 1986) checksum algorithm')
//     console.log(`Checksum: ${checksum} (expected: EE)`)

//     checksum = algorithms.run_typist_sep85(testLine)
//     console.log('Running test for Run Perfect Typist (Sep 1985) checksum algorithm')
//     console.log(`Checksum: ${checksum} (expected: 196)`)

//     checksum = algorithms.run_typist_jan88(testLine)
//     console.log('Running test for Run Perfect Typist (Jan 1988) checksum algorithm')
//     console.log(`Checksum: ${checksum} (expected: 166)`)

//     checksum = algorithms.ahoy_bugrepellent_apr84(testLine)
//     console.log('Running test for Ahoy Bug Repellent (Apr 1984) checksum algorithm')
//     console.log(`Checksum: ${checksum} (expected: FA)`)
// }

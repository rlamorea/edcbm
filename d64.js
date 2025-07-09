// Adapted into a class library from here:
// https://github.com/mborgbrant/c64js/blob/master/src/js/gui/file-load.js

// full D64 documentation here:
// http://unusedino.de/ec64/technical/formats/d64.html

class D64 {
    static petsciiTable = { 
        2: '\uE082', 3: '\uE083', 5: '\uE085', 7: '\uE087',
        8: '\uE088', 9: '\uE089', 10: '\uE08A', 11: '\uE08B',
        12: '\uE08C', 13: '\uE08D', 14: '\uE08E', 15: '\uE08F',
        17: '\uE091', 18: '\uE092', 19: '\uE093', 20: '\uE094',
        24: '\uE098', 27: '\uE09B', 28: '\uE09C', 29: '\uE09D',
        30: '\uE09E', 31: '\uE09F',
        32: ' ', 33: '!', 34: '"', 35: '#', 36: '$', 37: '%', 38: '&', 39: "'", 
        40: '(', 41: ')', 42: '*', 43: '+', 44: ',', 45: '-', 46: '.', 47: '/', 
        48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5', 54: '6', 55: '7', 
        56: '8', 57: '9', 58: ':', 59: ';', 60: '<', 61: '=', 62: '>', 63: '?', 
        64: '@', 65: 'A', 66: 'B', 67: 'C', 68: 'D', 69: 'E', 70: 'F', 71: 'G',
        72: 'H', 73: 'I', 74: 'J', 75: 'K', 76: 'L', 77: 'M', 78: 'N', 79: 'O', 
        80: 'P', 81: 'Q', 82: 'R', 83: 'S', 84: 'T', 85: 'U', 86: 'V', 87: 'W', 
        88: 'X', 89: 'Y', 90: 'Z', 91: '[', 92: '£', 93: ']', 94: '\uE01E', 95: '\uE01F',
        96: '\uE040', 97: '\uE041', 98: '\uE042', 99: '\uE043',
        100: '\uE044', 101: '\uE045', 102: '\uE046', 103: '\uE047',
        104: '\uE048', 105: '\uE049', 106: '\uE04A', 107: '\uE04B',
        108: '\uE04C', 109: '\uE04D', 110: '\uE04E', 111: '\uE04F',
        112: '\uE050', 113: '\uE051', 114: '\uE052', 115: '\uE053',
        116: '\uE054', 117: '\uE055', 118: '\uE056', 119: '\uE057',
        120: '\uE058', 121: '\uE059', 122: '\uE05A', 123: '\uE05B',
        124: '\uE05C', 125: '\uE05D', 126: '\uE05E', 127: '\uE05F',
        129: '\uE0C1', 130: '\uE0C2', 131: '\uE0C3', 133: '\uE0C5',
        134: '\uE0C6', 135: '\uE0C7', 136: '\uE0C8', 137: '\uE0C9',
        138: '\uE0CA', 139: '\uE0CB', 140: '\uE0CC', 141: '\uE0CD',
        142: '\uE0CE', 143: '\uE0CF', 144: '\uE0D0', 145: '\uE0D1',
        146: '\uE0D2', 147: '\uE0D3', 148: '\uE0D4', 149: '\uE0D5',
        150: '\uE0D6', 151: '\uE0D7', 152: '\uE0D8', 153: '\uE0D9',
        154: '\uE0DA', 155: '\uE0DB', 156: '\uE0DC', 157: '\uE0DD',
        158: '\uE0DE', 159: '\uE0DF',
        160: '\uE060', 161: '\uE061', 162: '\uE062', 163: '\uE063',
        164: '\uE064', 165: '\uE065', 166: '\uE066', 167: '\uE067',
        168: '\uE068', 169: '\uE069', 170: '\uE06A', 171: '\uE06B',
        172: '\uE06C', 173: '\uE06D', 174: '\uE06E', 175: '\uE06F',
        176: '\uE070', 177: '\uE071', 178: '\uE072', 179: '\uE073',
        180: '\uE074', 181: '\uE075', 182: '\uE076', 183: '\uE077',
        184: '\uE078', 185: '\uE079', 186: '\uE07A', 187: '\uE07B',
        188: '\uE07C', 189: '\uE07D', 190: '\uE07E', 191: '\uE07F',
        192: '\uE040', 193: '\uE041', 194: '\uE042', 195: '\uE043',
        196: '\uE044', 197: '\uE045', 198: '\uE046', 199: '\uE047',
        200: '\uE048', 201: '\uE049', 202: '\uE04A', 203: '\uE04B',
        204: '\uE04C', 205: '\uE04D', 206: '\uE04E', 207: '\uE04F',
        208: '\uE050', 209: '\uE051', 210: '\uE052', 211: '\uE053',
        212: '\uE054', 213: '\uE055', 214: '\uE056', 215: '\uE057',
        216: '\uE058', 217: '\uE059', 218: '\uE05A', 219: '\uE05B',
        220: '\uE05C', 221: '\uE05D', 222: '\uE05E', 223: '\uE05F',
        224: '\uE060', 225: '\uE061', 226: '\uE062', 227: '\uE063',
        228: '\uE064', 229: '\uE065', 230: '\uE066', 231: '\uE067',
        232: '\uE068', 233: '\uE069', 234: '\uE06A', 235: '\uE06B',
        236: '\uE06C', 237: '\uE06D', 238: '\uE06E', 239: '\uE06F',
        240: '\uE070', 241: '\uE071', 242: '\uE072', 243: '\uE073',
        244: '\uE074', 245: '\uE075', 246: '\uE076', 247: '\uE077',
        248: '\uE078', 249: '\uE079', 250: '\uE07A', 251: '\uE07B',
        252: '\uE07C', 253: '\uE07D', 254: '\uE07E', 255: '\uE07F',
    }
    static {
        this.petsciiLookup = {}
        for (const k in this.petsciiTable) {
            this.petsciiLookup[this.petsciiTable[k]] = k
        }
    }

    static discSize = 174848
    static maxTrack = 35
    static fileInterleave = 10
    static catalogInterleave = 3
    static trackSectors = [
        0, 
        21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
        19, 19, 19, 19, 19, 19, 19, 19,
        18, 18, 18, 18, 18,
        17, 17, 17, 17, 17
    ]
    static trackOffsets = [
        0, 
        0x00000, 0x01500, 0x02A00, 0x03F00, 0x05400, 0x06900, 0x07E00, 0x09300, 0x0AB00, // 21-sector tracks
        0x0BD00, 0x0D200, 0x0E700, 0x0FC00, 0x11100, 0x12600, 0x13B00, 0x15000, 
        0x16500, 0x17800, 0x18B00, 0x19E00, 0x1B100, 0x1C400, 0x1D700, 0x1EA00,  // 19-sector tracks
        0x1FC00, 0x20E00, 0x22000, 0x23200, 0x24400,  // 18-sector tracks
        0x25600, 0x26700, 0x27800, 0x28900, 0x29A00,  // 17-sector tracks
    ]
    static DOSType = [ 50, 65 ] // "2A"
    static fileTypes = ['DEL', 'SEQ', 'PRG', 'USR', 'REL']
    static maxBlocks = 664 // discSize * 256 - 19 (track 18 sectors)
    static idCharacters = [
        // 32, 33, 35, 37, 38, 39, 40, 41, 42, 43, 45, 46, 47, // symbols 
        48, 49, 50, 51, 52, 53, 54, 55, 56, 57, // numbers
        // 58, 59, 60, 61, 62, 63, 64, // more symbols
        65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, // letters
        // 91, 92, 93, // even more symbols
    ]

    constructor(file) {
        this.discImageArray = []

        this.resolve = null
        this.reject = null

        this.discName = null
        this.diskId = null
        this.diskDOS = null
        this.catalog = []
        this.blocksRemaining = D64.maxBlocks
        this.error = null
        this.catalogLoaded = false
        this.loaded = false

        this.loadingPromise = new Promise((resolve, reject) => {
            this.resolve = resolve
            this.reject = reject
        })

        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                this.loaded = true
                try {
                    this.discImageArray = new Uint8Array(reader.result);
                    this.parseBAMData();
                    this.getCatalog();

                    this.loaded = true
                    this.resolve(true)
                } catch (e) {
                    this.error = e
                    this.reject(this.error.toString())
                }
            }
            reader.onerror = () => {
                this.loaded = true
                this.error = result.error
                this.reject(this.error)
            }
            reader.readAsArrayBuffer(file)
        } else {
            this.formatD64('')
            this.loaded = true
            this.resolve(true)
        }
    }

    async discLoaded() {
        return this.loadingPromise
    }

    discBytes() {
        return this.discImageArray
    }

    readName(discPointer, length, skipFiller = true) {
        const nameBytes = this.discImageArray.slice(discPointer, discPointer + length)
        let name = ''
        for (let i = 0; i < length; i++) {
            const byte = nameBytes[i]
            if (skipFiller && byte === 160) continue
            name += D64.petsciiTable[byte] || '?'
        }
        return name
    }

    writeName(name, discPointer, length) {
        for (let i = 0; i < length; i++) {
            const byte = (i < name.length) ? (D64.petsciiLookup[name[i]] || 160) : 160
            this.discImageArray[discPointer++] = byte
        }
    }

    setBAM(track, sector, inUse = true) {
        let offset = D64.trackOffsets[18] + 0x04 * track // track is 1-based!
        const trackSectors = D64.trackSectors[track]
        let sectorsFree = 0
        let sectorIdx = 0
        for (let byte = 1; byte <= 3; byte++) {
            let curMap = this.discImageArray[offset + byte]
            for (let bit = 0; bit < 8; bit++) {
                let newBit = curMap & (2**bit)
                if (sectorIdx === sector) {
                    newBit = inUse ? 0 : 1
                } else if (sectorIdx >= trackSectors) {
                    newBit = 0
                }
                sectorIdx += 1
                sectorsFree += newBit
                if (newBit) {
                    curMap = curMap | (2**bit)
                } else {
                    curMap = curMap & (~(2**bit) & 0xFF)
                }
            }
            this.discImageArray[offset + byte] = curMap
        }
        this.discImageArray[offset] = sectorsFree
    }

    getSector(track, sector) {
        const startAddr = D64.trackOffsets[track] + (sector * 256)
        const data = this.discImageArray.slice(startAddr + 2, startAddr + 256)
        return {
            nextTrack: this.discImageArray[startAddr],
            nextSector: this.discImageArray[startAddr + 1],
            data: data
        }
    }

    writeSector(track, sector, data, nextTrack = 0, nextSector = 0) {
        let writeAddr = D64.trackOffsets[track] + (sector * 256)
        if (data.length < 254) {
            let fullData = new Uint8Array(254)
            fullData.set(data)
            data = fullData
        }
        this.discImageArray[writeAddr++] = nextTrack
        this.discImageArray[writeAddr++] = nextSector
        this.discImageArray.set(data, writeAddr)
        this.setBAM(track, sector)
    }

    // NOTE: we're doing a hard erase, wiping the sector data as well as BAM
    clearSector(track, sector) {
        this.writeSector(track, sector, new Uint8Array(254))
        this.setBAM(track, sector, false)
    }

    getNextOpenSector(currentTrack, currentSector, interleave = D64.fileInterleave, originalTrack = 0) {
        if (originalTrack === 0) { originalTrack = currentTrack }
        const offset = D64.trackOffsets[18] + 0x04 * currentTrack
        const sectorsTried = {}
        let seeks = 0
        const maxSectors = D64.trackSectors[currentTrack]
        while (seeks < maxSectors) {
            // offset by one to deal with 18-track case where interleave overlaps
            if (sectorsTried[currentSector]) { currentSector += 1 }
            seeks += 1
            sectorsTried[currentSector] = true
            const byteOffset = Math.floor(currentSector / 8)
            const bitmask = 2**(currentSector - 8*byteOffset)
            const byte = this.discImageArray[offset + byteOffset + 1]
            if (byte & bitmask) {
                return { track: currentTrack, sector: currentSector }
            }
            currentSector = (currentSector + interleave) % maxSectors
        }
        // track full
        currentTrack += 1
        if (currentTrack === 18) { currentTrack += 1 } // skip catalog track
        if (currentTrack === originalTrack) {
            throw new Error('Out of disc space')
        }
        return this.getNextOpenSector(currentTrack, 0, interleave, originalTrack)
    }

    // NOTE: currently not allowing multi-track catalog
    // NOTE: assuming a file size of 0 means available (because documentation is unclear)
    addCatalogEntry(fileName, sectorsUsed, firstTrack, firstSector, fileType = 'PRG', sector = 1, overwriteDel = false) {
        const offset = D64.trackOffsets[18] + 256 * sector
        let fileOffset = offset
        for (let entry = 0; entry < 8; entry++) {
            const fty = this.discImageArray[fileOffset + 2] & 0x07
            const fs = this.discImageArray[fileOffset + 28] + 256 * this.discImageArray[fileOffset + 29]
            if (fs === 0 || (overwriteDel && fty === 0)) {
                fileOffset += 2 // skip next track/sector (or ignored) first two bytes
                let ft = D64.fileTypes.indexOf(fileType)
                if (ft <= 0) { ft = 0x02 } // assume PRG
                this.discImageArray[fileOffset++] = ft | 0x80
                this.discImageArray[fileOffset++] = firstTrack
                this.discImageArray[fileOffset++] = firstSector
                this.writeName(fileName, fileOffset, 16)
                fileOffset += 16
                for (let o = 19; o < 28; o++) { this.discImageArray[fileOffset++] = 0 }
                const fsh = Math.floor(sectorsUsed / 256)
                const fsl = sectorsUsed - 256 * fsh
                this.discImageArray[fileOffset++] = fsl
                this.discImageArray[fileOffset++] = fsh
                this.catalogLoaded = false
                return
            }
            fileOffset += 32
        }
        let track = this.discImageArray[offset]
        sector = this.discImageArray[offset + 1]
        if (track === 0) {
            ;({ track, sector } = this.getNextOpenSector(18, sector, D64.catalogInterleave))
            if (track === 18 && sector > 0) {
                this.discImageArray[offset] = track
                this.discImageArray[offset + 1] = sector
                this.clearSector(track, sector)
                this.setBAM(track, sector)
            }
        }
        if (track !== 18) {
            throw new Error('Multi-track catalog not supported')
        }
        if (sector === 0 && overwriteDel) {
            throw new Error('Out of catalog space')
        } else if (sector === 0) {
            return this.addCatalogEntry(fileName, sectorsUsed, firstTrack, firstSector, fileType, 1, true)
        }
        return this.addCatalogEntry(fileName, sectorsUsed, firstTrack, firstSector, fileType, sector)
    }

    parseBAMData() {
        let discPointer = D64.trackOffsets[18]
        // get disk name
        this.discName = this.readName(discPointer + 0x90, 16)
        // get disk id
        this.discId = this.readName(discPointer + 0xA2, 2, false)
        // get DOS
        this.discDOS = this.readName(discPointer + 0xA5, 2, false)
    }

    nameDisc(name) {
        const discPointer = D64.trackOffsets[18] + 0x90
        this.writeName(name, discPointer, 16)
        this.discName = this.readName(discPointer, 16)
    }

    getCatalog(sector = 1, track = 18, fileIndex = 0, nextSector = 0, nextTrack = 0) {
        if (this.catalogLoaded) {
            return this.catalog
        }
        let discPointer = D64.trackOffsets[track] + 256 * sector + 32 * fileIndex
        if (track === 0) {
            this.catalogLoaded = true
            return this.catalog
        }
        const nt = this.discImageArray[discPointer++]
        const ns = this.discImageArray[discPointer++]       
        if (fileIndex === 0) {
            nextTrack = nt
            nextSector = ns
        } else if (fileIndex === 8) {
            return this.getCatalog(nextSector, nextTrack)
        }
        const st = this.discImageArray[discPointer++]
        const fileType = D64.fileTypes[st & 0x07]
        if ((st & 0x80) && fileType === 'PRG') {
            const fft = this.discImageArray[discPointer++]
            const ffs = this.discImageArray[discPointer++]
            const name = this.readName(discPointer, 16)
            discPointer += 16 + 9 // 16 for file name, 9 for skippable data
            let fb = this.discImageArray[discPointer++]
            fb = fb + 256 * this.discImageArray[discPointer++]
            this.blocksRemaining -= fb
            
            this.catalog.push({ 
                name: name,
                fileType: fileType,
                firstTrackOfFile: fft,
                firstSectorOfFile: ffs,
                fileSize: fb,
            })
        }
        return this.getCatalog(sector, track, fileIndex + 1, nextSector, nextTrack)
    }

    getFileCount() {
        if (!this.catalogLoaded) {
            this.getCatalog()
        }
        return this.catalog.length
    }

    getFileInfo(catalogIndex) {
        if (catalogIndex < 0 || catalogIndex >= this.catalog.length) { return {} }
        return this.catalog[catalogIndex]
    }

    getFileData(catalogIndex) {
        if (catalogIndex < 0 || catalogIndex >= this.catalog.length) { return null }
        const entry = this.catalog[catalogIndex]

        let nextTrack = entry.firstTrackOfFile
        let nextSector = entry.firstSectorOfFile
        let data = new Uint8Array()
        while(nextTrack != 0) {
            const sectorContent = this.getSector(nextTrack, nextSector)
            nextTrack = sectorContent.nextTrack
            nextSector = sectorContent.nextSector
            let c = new Uint8Array(data.length + sectorContent.data.length)
            c.set(data)
            c.set(sectorContent.data, data.length)
            data = c
        }

        return data
    }

    formatD64(discName = '') {
        if (this.loaded) {
            throw new Error('Cannot reformat a disc!')
        }
        this.discName = discName || ''
        delete this.discImageArray
        this.discImageArray = new Uint8Array(D64.discSize)
        this.blocksRemaining = D64.maxBlocks

        // create BAM
        let discPointer = D64.trackOffsets[18]
        
        this.discImageArray[discPointer++] = 18 // pointer to directory start (track 18/sector 1)
        this.discImageArray[discPointer++] = 1
        this.discImageArray[discPointer++] = 0x41 // DOS version (default)
        discPointer++ // unused
        for (let track = 1; track <= D64.maxTrack; track++) {
            this.discImageArray[discPointer++] = D64.trackSectors[track] - (track === 18) ? 1 : 0
            this.discImageArray[discPointer++] = (track === 18) ? 0xFE : 0xFF
            this.discImageArray[discPointer++] = 0xFF
            this.discImageArray[discPointer++] = 2**((D64.trackSectors[track] - 16) - 1)
        }
        this.writeName(discName, discPointer, 16)
        discPointer += 16
        this.discImageArray[discPointer++] = 0xA0 // padding
        this.discImageArray[discPointer++] = 0xA0
        const id1 = D64.idCharacters[Math.floor(Math.random() * D64.idCharacters.length)]
        const id2 = D64.idCharacters[Math.floor(Math.random() * D64.idCharacters.length)]
        const id = [ id1, id2 ]  // Disk ID
        this.discImageArray[discPointer] = id[0]
        this.discImageArray[discPointer+1] = id[1]
        this.discId = this.readName(discPointer, 2, false)
        discPointer += 2
        this.discImageArray[discPointer++] = 0xA0 // padding
        this.discImageArray[discPointer] = D64.DOSType[0] // DOS type
        this.discImageArray[discPointer+1] = D64.DOSType[1]
        this.discDOS = this.readName(discPointer, 2, false)
        discPointer += 2
        this.discImageArray[discPointer++] = 0xA0 // padding
        this.discImageArray[discPointer++] = 0xA0
        this.discImageArray[discPointer++] = 0xA0
        this.discImageArray[discPointer++] = 0xA0
        // rest is blank
    }

    writeFileData(fileName, fileBytes) {
        if (!this.loaded) {
            throw new Error('Cannot write to unloaded disc')
        }
        // determine if fileName is new or existing
        for (let idx = 0; idx < this.catalog.length; idx++) {
            if (file.name === fileName) {
                return this.overwriteFileData(idx, fileBytes)
            }
        }
        let sectorCount = 0
        let byteIndex = 0
        let { track, sector } = this.getNextOpenSector(1, 0)
        const firstTrack = track
        const firstSector = sector
        while (byteIndex < fileBytes.length) {
            const sectorBytes = fileBytes.slice(byteIndex, Math.min(byteIndex + 254, fileBytes.length))
            byteIndex += 254
            let nextTrack = 0
            let nextSector = 0
            if (byteIndex < fileBytes.length) {
                ;({ nextTrack, nextSector } = this.getNextOpenSector(track, sector))
            }
            this.writeSector(track, sector, sectorBytes, nextTrack, nextSector)
            sectorCount += 1
        }
        this.addCatalogEntry(fileName, sectorCount, firstTrack, firstSector, 'PRG')
    }

    overwriteFileData(catalogIndex, fileBytes) {
        if (!this.loaded) {
            throw new Error('Cannot write to unloaded disc')
        }
        const fileInfo = this.getFileInfo(catalogIndex)
        let byteIndex = 0
        let track = fileInfo.firstTrackOfFile
        let sector = fileInfo.firstSectorOfFile
        let sectorData = this.getSector(track, sector)
        while (byteIndex < fileBytes.length) {
            let nextTrack = sectorData.nextTrack
            let nextSector = sectorData.nextSector
            const sectorBytes = fileBytes.slice(byteIndex, Math.min(byteIndex + 254, fileBytes.length))
            byteIndex += 254
            if (byteIndex >= fileBytes.length) {
                nextTrack = 0
                nextSector = 0
            } else if (nextTrack === 0) {
                ;({ nextTrack, nextSector } = this.getNextOpenSector(track, sector))
                addedSectors = true
                sectorData = { nextTrack, nextSector }
            } else {
                sectorData = this.getSector(nextTrack, nextSector)
            }
            this.writeSector(track, sector, sectorBytes, nextTrack, nextSector)
            track = nextTrack
            sector = nextSector
        }
        if (sectorData.data) {
            track = sectorData.nextTrack
            sector = sectorData.nextSector
            while (track !== 0) {
                sectorData = this.getSector(track, sector)
                this.clearSector(track, sector)
                track = sectorData.nextTrack
                sector = sectorData.nextSector
            }
        }
    }
}

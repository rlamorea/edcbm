// Adapted into a class library from here:
// https://github.com/mborgbrant/c64js/blob/master/src/js/gui/file-load.js

// full D64 documentation here:
// http://unusedino.de/ec64/technical/formats/d64.html

class D64 {
    static discSize = 174848
    static maxTrack = 35
    static fileInterleave = 10
    static catalogInterleave = 3
    static trackSectors = [
        0, 
        21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
        19, 19, 19, 19, 19, 19, 19,
        18, 18, 18, 18, 18, 18,
        17, 17, 17, 17, 17
    ]
    static trackOffsets = [
        0, 
        0x00000, 0x01500, 0x02A00, 0x03F00, 0x05400, 0x06900, 0x07E00, 0x09300, 0x0AB00, // 21-sector tracks
        0x0BD00, 0x0D200, 0x0E700, 0x0FC00, 0x11100, 0x12600, 0x13B00, 0x15000, 
        0x16500, 0x17800, 0x18B00, 0x19E00, 0x1B100, 0x1C400, 0x1D700, // 19-sector tracks
        0x1EA00, 0x1FC00, 0x20E00, 0x22000, 0x23200, 0x24400,  // 18-sector tracks
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
            name += String.fromCodePoint(byte) || '?'
        }
        return name
    }

    writeName(name, discPointer, length) {
        for (let i = 0; i < length; i++) {
            const byte = (i < name.length) ? (name.codePointAt(i) || 160) : 160
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
                let newBit = (curMap & (2**bit)) > 0 ? 1 : 0
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

    dumpBAM() {
        console.log('BAM Dump:')
        console.log('                       1    1    2')
        console.log('Track Free   .1...5....0....5....0xxx')
        for (let track = 1; track <= 35; track++) {
            const offset = D64.trackOffsets[18] + 0x04 * track
            const sectorsFree = this.discImageArray[offset]
            let sectorMap = this.discImageArray[offset + 1].toString(2).padStart(8,'0').split('').reverse().join('')
            sectorMap += this.discImageArray[offset + 2].toString(2).padStart(8,'0').split('').reverse().join('')
            sectorMap += this.discImageArray[offset + 3].toString(2).padStart(8,'0').split('').reverse().join('')
            console.log(`${track.toString().padEnd(6, ' ')}${sectorsFree.toString().padEnd(7)}${sectorMap}`);
        }
        console.log('(done)')
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
        if (nextTrack > 0) {
            this.discImageArray[writeAddr++] = nextTrack
            this.discImageArray[writeAddr++] = nextSector
        } else {
            writeAddr += 2
        }
        this.discImageArray.set(data, writeAddr)
        this.setBAM(track, sector)
    }

    updateNextSector(track, sector, nextTrack, nextSector) {
        let writeAddr = D64.trackOffsets[track] + (sector * 256)
        this.discImageArray[writeAddr++] = nextTrack
        this.discImageArray[writeAddr++] = nextSector
    }

    // NOTE: we're doing a hard erase, wiping the sector data as well as BAM
    clearSector(track, sector) {
        this.writeSector(track, sector, new Uint8Array(254))
        this.setBAM(track, sector, false)
    }

    getNextOpenSector(currentTrack, currentSector, interleave = D64.fileInterleave, originalTrack = 0) {
        if (originalTrack === 0) { originalTrack = currentTrack }
        const maxSectors = D64.trackSectors[currentTrack]
        const offset = D64.trackOffsets[18] + 0x04 * currentTrack
        const sectorsTried = {}
        let seeks = 0
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
                this.catalog = []
                if (sector === 1 && entry === 0) {
                    this.setBAM(18, 1) // special case for very first sector of catalog
                }
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

        this.dumpBAM()
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
                catalogTrack: track,
                catalogSector: sector,
                catalogIndex: fileIndex
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
        console.log('Reading file data for', entry.name)

        let nextTrack = entry.firstTrackOfFile
        let nextSector = entry.firstSectorOfFile
        let data = new Uint8Array()
        while(nextTrack != 0) {
            console.log(` - Track ${nextTrack.toString().padEnd(4, ' ')} Sector ${nextSector.toString().padEnd(4, ' ')}`)
            const sectorContent = this.getSector(nextTrack, nextSector)
            nextTrack = sectorContent.nextTrack
            nextSector = sectorContent.nextSector
            let c = new Uint8Array(data.length + sectorContent.data.length)
            c.set(data)
            c.set(sectorContent.data, data.length)
            data = c
        }
        console.log('(done)')

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
            this.discImageArray[discPointer++] = D64.trackSectors[track] - ((track === 18) ? 1 : 0)
            this.discImageArray[discPointer++] = (track === 18) ? 0xFE : 0xFF
            this.discImageArray[discPointer++] = 0xFF
            this.discImageArray[discPointer++] = (2**(D64.trackSectors[track] - 16) - 1)
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
        this.dumpBAM()
    }

    writeFileData(fileName, fileBytes) {
        if (!this.loaded) {
            throw new Error('Cannot write to unloaded disc')
        }
        // determine if fileName is new or existing
        this.getCatalog()
        for (let idx = 0; idx < this.catalog.length; idx++) {
            const file = this.getFileInfo(idx)
            if (file.name === fileName) {
                return this.overwriteFileData(idx, fileBytes)
            }
        }
        let sectorCount = 0
        let byteIndex = 0
        console.log(`Writing file ${fileName}`)
        let { track, sector } = this.getNextOpenSector(1, 0)
        const firstTrack = track
        const firstSector = sector
        let finalSectorBytes = 0
        while (byteIndex < fileBytes.length) {
            const sectorBytes = fileBytes.slice(byteIndex, Math.min(byteIndex + 254, fileBytes.length))
            finalSectorBytes = sectorBytes.length
            byteIndex += 254
            console.log(` - Track ${track.toString().padEnd(4, ' ')} Sector ${sector.toString().padEnd(4, ' ')}`)
            this.writeSector(track, sector, sectorBytes)
            if (byteIndex < fileBytes.length) {
                const { track: nextTrack, sector: nextSector } = this.getNextOpenSector(track, sector)
                this.updateNextSector(track, sector, nextTrack, nextSector)
                track = nextTrack
                sector = nextSector
            }
            sectorCount += 1
        }
        this.updateNextSector(track, sector, 0, finalSectorBytes)
        console.log('(done)')
        this.addCatalogEntry(fileName, sectorCount, firstTrack, firstSector, 'PRG')
        this.dumpBAM()
    }

    overwriteFileData(catalogIndex, fileBytes) {
        if (!this.loaded) {
            throw new Error('Cannot write to unloaded disc')
        }
        const fileInfo = this.getFileInfo(catalogIndex)
        console.log(`Overwriting file ${fileInfo.name}`)
        let byteIndex = 0
        let track = fileInfo.firstTrackOfFile
        let sector = fileInfo.firstSectorOfFile
        let sectorData = this.getSector(track, sector)
        let addingSectors = false
        let totalSectors = 0
        let finalSectorBytes = 0
        while (byteIndex < fileBytes.length) {
            const sectorBytes = fileBytes.slice(byteIndex, Math.min(byteIndex + 254, fileBytes.length))
            finalSectorBytes = sectorBytes.length
            byteIndex += 254
            console.log(` - Track ${track.toString().padEnd(4, ' ')} Sector ${sector.toString().padEnd(4, ' ')} - ${addingSectors ? 'ADDED' : 'REPLACED'}`)
            this.writeSector(track, sector, sectorBytes, -1, -1) 
            totalSectors += 1
            // determine next track/sector
            let nextTrack = 0
            let nextSector = 0
            if (byteIndex < fileBytes.length) {
                if (addingSectors || sectorData.nextTrack === 0) {
                    addingSectors = true
                    ;({ track: nextTrack, sector: nextSector } = this.getNextOpenSector(track, sector))
                    this.updateNextSector(track, sector, nextTrack, nextSector)
                    sectorData = { nextTrack, nextSector }
                } else {
                    nextTrack = sectorData.nextTrack
                    nextSector = sectorData.nextSector
                    sectorData = this.getSector(nextTrack, nextSector)
                }
            }
            track = nextTrack
            sector = nextSector
        }
        this.updateNextSector(track, sector, 0, finalSectorBytes)
        if (sectorData.data) {
            track = sectorData.nextTrack
            sector = sectorData.nextSector
            while (track !== 0) {
                sectorData = this.getSector(track, sector)
                console.log(` - Track ${track.toString().padEnd(4, ' ')} Sector ${sector.toString().padEnd(4, ' ')} - CLEARED`)
                this.clearSector(track, sector)
                track = sectorData.nextTrack
                sector = sectorData.nextSector
            }
        }
        // update the catalog entry
        let offset = D64.trackOffsets[fileInfo.catalogTrack] + 256 * fileInfo.catalogSector + 32 * fileInfo.catalogIndex + 30
        const fsh = Math.floor(totalSectors / 256)
        const fsl = totalSectors - 256 * fsh
        this.discImageArray[offset++] = fsl
        this.discImageArray[offset++] = fsh
        console.log('(done - total sectors:',totalSectors,')')
        this.catalogLoaded = false
        this.catalog = []
        this.dumpBAM()
    }
}

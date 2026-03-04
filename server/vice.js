import net from 'net'
import { ViceCommand, ViceResponse, boolval } from './viceComm.js'
import { spawn } from 'child_process'
import config from './config.js'

// This sucks, but I am doing everything I can see to gracefully close the socket to
// VICE, but no matter what, we get an ECONNREFUSED error. So fuck it, I'm going to
// eat that exception here and let the app keep going.
process.on('uncaughtException', (err) => {
    if (err.code === 'ECONNREFUSED') { return }

    console.error('Caught unhandled exception:', err)
    process.exit(1)
});

export class ViceConnection {
    static VICE_DEFAULT_PORT = 6502
    static RUN_COMMAND = [ 0x52, 0x55, 0x4E, 0x0d ]

    static IGNORE_RESPONSES = [ 'stopped', 'resumed', 'registers' ] // NOTE: eventually we'll just store the last registers to save time

    static machines = {
        'c128': { 
            launcher: 'x128', 
            startupDelay: 2500,
            check: { addresses: [ 0x41cf, 0x41d2 ], values: [ 0x56, 0x37, 0x2e, 0x30] },
            exec: { break: 0x4b41, lookup: { line: 0x3b, addr: 0x3d } },
            stop: {
                common: 0x4be3,
                runout: 0x4b31, // NOTE: this triggers after every "live" command too, but we don't really care
                reset: 0x4009,
            },
            pointers: {
                startOfBasic: 0x2d,
                startOfVars: 0x2f, // pointing to bank 1
                startOfArrays: 0x31, // pointing to bank 1
                bottomOfStrings: 0x33, // pointing to bank 1
                topOfStrings: 0x35, // pointing to bank 1
                keyboardBuffer: 0x034a,
                keyboardBufferCount: 0xd0,
            },
            basicPrep: false
        },
        'c64': {
            launcher: 'x64sc',
            startupDelay: 2000,
            check: { addresses: [ 0xe488, 0xe489 ], values: [ 0x36, 0x34 ] },
            exec: { break: 0xa7ef, lookup: { line: 0x39, addr: 0x7a } },
            stop: { 
                common: 0xa84f,
                reset: 0xe37b,
            },
            pointers: {
                startOfBasic: 0x2b,
                startOfVars: 0x2d,
                startOfArrays: 0x2f,
                bottomOfStrings: 0x31,
                topOfStrings: 0x33,
                keyboardBuffer: 0x277,
                keyboardBufferCount: 0x00c6,
            },
            basicPrep: { start: 0x2d, end: 0x32 }
        },
        'c16': { 
            launcher: 'xplus4', args: [ '--model', 'c16' ],
            startupDelay: 1000,
            check: { addresses: [ 0x80df, 0x80e3 ], values: [ 0x56, 0x33, 0x2e, 0x35, 0x20 ] },
            exec: { break: 0x8c27, lookup: { line: 0x39, addr: 0x3b } },
            stop: { 
                common: 0x8cdb,
                runout: 0x8c17,
            },
            pointers: {
                startOfBasic: 0x2b,
                startOfVars: 0x2d,
                startOfArrays: 0x2e,
                bottomOfStrings: 0x31,
                topOfStrings: 0x33,
                keyboardBuffer: 0x527,
                keyboardBufferCount: 0xef,
            },
            basicPrep: { start: 0x2d, end: 0x32 }
         },
        'plus4': { 
            launcher: 'xplus4', args: [ '--model', 'plus4' ],
            startupDelay: 1000,
            check: { addresses: [ 0x80df, 0x80e3 ], values: [ 0x56, 0x33, 0x2e, 0x35, 0x20 ] },
            exec: { break: 0x8c27, lookup: { line: 0x39, addr: 0x3c } },
            stop: { 
                common: 0x8cdb,
                runout: 0x8c17,
            },
            pointers: {
                startOfBasic: 0x2b,
                startOfVars: 0x2d,
                startOfArrays: 0x2e,
                bottomOfStrings: 0x31,
                topOfStrings: 0x33,
                keyboardBuffer: 0x527,
                keyboardBufferCount: 0xef,
            },
            basicPrep: { start: 0x2d, end: 0x32 },
        },
        'vic20': {
            launcher: 'xvic',
            startupDelay: 1500,
            check: { addresses: [ 0xe446, 0xe447 ], values: [ 0x56, 0x32 ] },
            exec: { break: 0xc7ef, lookup: { line: 0x39, addr: 0x7b } },
            stop: { 
                common: 0xc84f,
                reset: 0xfed2,
            },
            pointers: {
                startOfBasic: 0x2b,
                startOfVars: 0x2d,
                startOfArrays: 0x2f,
                bottomOfStrings: 0x31,
                topOfStrings: 0x33,
                keyboardBuffer: 0x277,
                keyboardBufferCount: 0xc6,
            },
            basicPrep: { start: 0x2d, end: 0x32 }
        },
        'pet-g': { 
            launcher: 'xpet', args: [ '--model', '3032' ],
            startupDelay: 1500,
            check: { addresses: [ 0xe1d2, 0xe1d4 ], values: [ 0x42, 0x41, 0x53 ] },
            exec: { break: 0xc702, lookup: { line: 0x36, addr: 0x78 } },
            stop: { 
                common: 0xc763
            },
            pointers: {
                startOfBasic: 0x28,
                startOfVars: 0x2a,
                startOfArrays: 0x2c,
                bottomOfStrings: 0x2e,
                topOfStrings: 0x30,
                keyboardBuffer: 0x270,
                keyboardBufferCount: 0x9e,
            },
            basicPrep: { start: 0x2a, end: 0x2f },
            keyboardBufferCountMod: 1,
            keymap: {
                // NOTE: default for mac -- need to see about Windows/Linux
                path: '../VICE.app/Contents/Resources/share/vice/PET/gtk_grus_sym.vkm'
            }
         },
        'pet-b': { 
            launcher: 'xpet', args: [ '--model', '8032' ], 
            startupDelay: 2000,
            check: { addresses: [ 0xdeb8, 0xdeba ], values: [ 0x34, 0x2e, 0x30 ] },
            exec: { break: 0xb787, lookup: { line: 0x36, addr: 0x7b } },
            stop: { 
                common: 0xb7e6,
            },
            pointers: {
                startOfBasic: 0x28,
                startOfVars: 0x2a,
                startOfArrays: 0x2c,
                bottomOfStrings: 0x2e,
                topOfStrings: 0x30,
                keyboardBuffer: 0x270,
                keyboardBufferCount: 0x9e,
            },
            basicPrep: { start: 0x2a, end: 0x2f },
            keyboardBufferCountMod: 1,
            keymap: {
                // NOTE: default for mac -- need to see about Windows/Linux
                path: '../VICE.app/Contents/Resources/share/vice/PET/gtk_buuk_sym.vkm'
            }
        },
        'cbm2': {
            launcher: 'xcbm2',
            startupDelay: 3500,
            check: { addresses: [ 0xbb96, 0xbb98 ], bank: 17, values: [ 0x31, 0x32, 0x38 ] },
            basicProgram: { bank: 1 },
            basicRun: { bank: 17 },
            exec: { break: 0x87aa, lookup: { line: 0x42, addr: 0x86, bank: 17 } },
            stop: { 
                common: 0x8bdc, // pointing to bank cpu
                runout: 0x876c, // pointing to bank cpu
            },
            pointers: {
                startOfBasic: 0x2d, // pointing to bank ram01 (id 1)
                endOfBasic: 0x2f, // pointing to bank ram01 (id 1)
                startOfVars: 0x31, // pointing to bank ram03 (id 3)
                endOfVars: 0x33, // pointing to bank ram03 (id 3)
                startOfArrays: 0x35, // pointing to bank ram02 (id 2)
                endOfArrays: 0x37, // pointing to bank ram02 (id 2)
                bottomOfStrings: 0x3b, // pointing to bank ram04 (id 4)
                topOfStrings: 0x3f, // pointing to bank ram04 (id 4)
                keyboardBuffer: 0x03ab,
                keyboardBufferCount: 0xd1,
            },
            basicPrep: { start: 0x2f, end: 0x30 }
        }
    }

    constructor(viceRoot = config.VICE_PATH, opts = {}) {
        this.viceRoot = viceRoot
        this.viceProcess = null
        this.viceDebug = opts.viceDebug || config.VICE_DEBUG
        this.viceSocket = null

        this.machine = null
        this.machineData = null

        this.port = null
        this.diskPath = null
        this.connected = false
        this.resolve = null
        this.reject = null

        this.viceInfo = {}

        this.bufferedBytes = []
        this.bufferedResponses = []

        this.waitingForCheckpoint = false
        this.checkpointHandler = null
    }

    debug(...message) {
        if (!this.viceDebug) { return }
        let msg = ''
        for (const mp of message) {
            if (mp instanceof Object) {
                msg += JSON.stringify(mp)
            } else {
                msg += mp.toString()
            }
            msg += ' '
        }
        console.log(msg.trim())
    }

    async waitUntilCurrentPromiseCompleted(resolve, reject) {
        let p = null
        if (!resolve) {
            p = new Promise((res, rej) => {
                resolve = res
                reject = rej
            })
        }
        if (this.resolve) {
            setTimeout(() => { this.waitUntilCurrentPromiseCompleted(resolve, reject)}, 50)
        } else {
            resolve('ready')
        }
        return p
    }

    prepPromise(method) {
        if (this.resolve) {
            this.debug('attempt to prep promise before prior is resolved')
            this.doReject('trying to be async')
            return
        }
        let done = new Promise((res, rej) => {
            this.resolve = res
            this.reject = (method === 'alwaysresolve') ? res : rej
        })
        return done
    }

    doResolve(data) {
        if (!this.resolve) {
            console.log('attempt to resolve when no resolve handler, data is', data)
            return
        }
        this.resolve(data)
        this.resolve = null
        this.reject = null
    }

    doReject(data) {
        if (!this.reject) {
            console.log('attempt to reject when no resolve handler, data is', data)
            return
        }
        console.trace()
        this.reject(data)
        this.resolve = null
        this.reject = null
    }

    async launchVice(machine, options = {}) {
        this.quitting = false
        let done = this.prepPromise()

        this.port = config.VICE_PORT
        this.diskPath = options.diskPath
        const machineData = ViceConnection.machines[machine]
        if (!machineData) {
            return this.doReject(`Invalid machine: ${machine}`)
        }
        this.machine = machine
        const launcher = machineData.launcher

        let keymapType = config[`VICE_KEYMAP_${machine.toUpperCase().replace(/\-/g, '_')}`] ?? -1 // default, don't change
        let keymapFile = config[`VICE_KEYMAPFILE_${machine.toUpperCase().replace(/\-/g, '_')}`]
        if (keymapType < 0 && keymapFile != null) {
            keymapType = 2 // default to user-sym map
        }
        if (keymapType === -1 && machineData.keymap) {
            keymapType = machineData.keymap.type ?? 0 // default to symbolic
            keymapFile = `${this.viceRoot}/${machineData.keymap.path}`
        }
        let args = []
        args.push('--binarymonitor')
        if (this.port !== ViceConnection.VICE_DEFAULT_PORT) {
            args.push('--binarymonitoraddress', `ip4://localhost:${this.port}`)
        }
        if (machineData.args) {
            args.push(...machineData.args)
        }
        if (machineData.launcher === 'x128' && (options.columns ?? '').startsWith('col-')) {
            args.push(`--${options.columns.substring(4)}col`)
        }
        if (this.diskPath) {
            args.push('--8', this.diskPath)
        }
        if (keymapType >= 0) {
            args.push('--keymap', keymapType)
        }
        if (keymapFile != null) {
            args.push((keymapType === 2) ? '--symkeymap' : '--poskeymap', keymapFile)
        }
        this.debug('Spawning:', `${this.viceRoot}/${launcher} ${args.join(' ')}`)
        this.viceProcess = spawn(`${this.viceRoot}/${launcher}`, args)

        this.viceProcess.stdout.on('data', (data) => {
            this.debug('process got data on stdout', data)
            this.startupDelay = Math.max(machineData.startupDelay ?? 0, config.STARTUP_DELAY)
            this.commandDelay = Math.max(machineData.commandDelay ?? 0, config.COMMAND_DELAY)
            this.debugDelay = Math.max(machineData.debugDelayt ?? 0, config.DEBUG_DELAY)
            this.maxRetries = Math.max(machineData.retries ?? 0, config.VICE_RETRIES)

            this.establishConnection()
        })
        this.viceProcess.stderr.on('data', (data) => {
            this.debug('process got data on stderr', data)
        })
        this.viceProcess.on('error', (err) => {
            console.log('vice process failed:', err)
            if (this.reject) {
                this.doReject('vice process launch error ' + err)
            }
        })
        this.viceProcess.on('close', (code) => {
            this.debug(`VICE closed with ${code}`)
            this.viceProcess = null
            this.bufferedResponses = []
            if (this.reject && !this.quitting) {
                this.doReject(`vice closed with ${code}`)
            }
        })
        return done
    }

    killSocket() {
        if (!this.viceSocket) { return }
        if (this.viceSocket.destroyed) {
            this.viceSocket = null
            return
        }
        this.viceSocket.destroy()
        this.viceSocket = null
    }

    establishConnection(retry = 0) {
        if (retry > 0) {
            this.viceSocket = net.createConnection({ host: 'localhost', port: this.port }, () => {
                this.debug('vice socket created')
                this.viceSocket.on('data', (data) => { 
                    console.log('vice socket got data', data)
                    this.debug('vice socket got data', data)
                    const { responses, extra } = ViceResponse.responseSplitter([ ...this.bufferedBytes, ...data ])
                    this.debug('split into', responses, 'and', extra)
                    this.bufferedBytes = extra
                    this.newResponses = []
                    for (const responseBytes of responses) {
                        const response = new ViceResponse(responseBytes)
                        if (response.requestId() === 0xffffffff && ViceConnection.IGNORE_RESPONSES.includes(response.responseName)) { continue }
                        this.bufferedResponses.push(response)
                    }
                })
                this.viceSocket.on('end', () => {
                    this.debug('VICE ended socket')
                    this.viceSocket.end()
                })
                this.viceSocket.on('close', () => {
                    this.debug('VICE connection closed')
                    if (this.reject && !this.quitting) {
                        this.doReject('socket status closed')
                    }
                    this.killSocket()
                })
                this.viceSocket.on('error', (err) => {
                    if (!this.viceProcess) { return }
                    console.log('vice socket got error', err)
                    if (err.code === 'ECONNREFUSED' && retry <= this.maxRetries) {
                        console.log('Failed to connect, retry', retry)
                        setTimeout(() => { this.establishConnection(callback, retry + 1) }, this.startupDelay)
                        return
                    }
                    this.killSocket()
                    if (this.reject) {
                        this.doReject('socket creation too many retries')
                    }
                })

                setTimeout(() => { this.checkConnection() }, this.startupDelay)
            })
        } else {
            setTimeout(() => { this.establishConnection(retry + 1) }, this.startupDelay)
        }
    }

    waitForResponse(requestId, retry = 0) {
        console.log('waitForResposne from request id', requestId)
        this.debug('waiting for response to', requestId, 'retry', retry, 'against', this.bufferedResponses.length, 'responses')
        console.log('there are', this.bufferedResponses.length, 'responses buffered', (this.bufferedResponses.map(r => r.responseName)))
        for (let idx = 0; idx < this.bufferedResponses.length; idx++) {
            const response = this.bufferedResponses[idx]
            console.log('checking against', response.responseName, 'for', response.requestId())
            this.debug('...checking against', response)
            if (response.requestId() === requestId) {
                this.bufferedResponses.splice(idx, 1)
                console.log('now there are', this.bufferedResponses.length, 'responses buffered', (this.bufferedResponses.map(r => r.responseName)))
                this.doResolve(response)
                return
            }
        }
        if (retry >= this.maxRetries) {
            this.debug('timed out waiting for request id', requestId)
            this.doReject('request time out')
            return
        }
        setTimeout( () => { this.waitForResponse(requestId, retry + 1) }, this.commandDelay )
    }

    waitForCheckpoint() {
        if (!this.waitingForCheckpoint || !this.checkpointHandler) { return }
        for (let idx = 0; idx < this.bufferedResponses.length; idx++) {
            const response = this.bufferedResponses[idx]
            this.debug('checkpoint checking against', response)
            if (response.responseName === 'checkpoint') {
                this.waitingForCheckpoint = false
                this.bufferedResponses.splice(idx, 1)
                this.checkpointHandler(response.parsed.checkpoint, response)
                return
            }
        }
        setTimeout( () => { this.waitForCheckpoint() }, this.debugDelay )
    }

    startWaiting(handler) {
        if (handler) { this.checkpointHandler = handler }
        this.waitingForCheckpoint = true
        this.waitForCheckpoint()
    }

    stopWaiting(fullStop = false) {
        this.waitingForCheckpoint = false
        if (fullStop) {
            this.checkpointHandler = null
        }
    }

    checkConnection(callback) {
        const ping = new ViceCommand('ping')
        this.debug('ping request id', ping.requestId())
        this.sendCommand(ping, false)
    }

    async sendCommand(command, newPromise = true, wait = true) {
        let done = null
        if (newPromise) {
            done = this.prepPromise()
        }
        this.debug('sending command', command)
        console.log('sending ', command.command, 'as request', command.requestId())
        this.viceSocket.write(Buffer.from(command.bytes()))
        if (wait) {
            this.waitForResponse(command.requestId())
        } else {
            this.doResolve('assumed to succeed')
        }
        return done
    }

    async confirmMachine() {
        let machineGood = false
        const check = ViceConnection.machines[this.machine].check
        this.connected = true
        let response = await this.sendCommand(new ViceCommand('memget', {
            startAddress: check.addresses[0],
            endAddress: check.addresses[1],
            bankId: check.bank || 0
        }))
        const memory = response.response().memory
        if (memory.length !== check.values.length) {
            throw new Error('wrong machine type')
        }
        for (let idx = 0; idx < memory.length; idx++) {
            if (memory[idx] !== check.values[idx]) {
                throw new Error('wrong machine type')
            }
        }
        this.debug(`VICE machine ${this.machine} confirmed`)
        this.machineData = ViceConnection.machines[this.machine]
        const r = await this.sendCommand(new ViceCommand('infobanks'))
        return true
    }

    async shutDown() {
        await this.waitUntilCurrentPromiseCompleted()
        let done = this.prepPromise('alwaysresolve')
        try {
            this.quitting = true
            const exit = new ViceCommand('quit')
            this.sendCommand(exit, false, false)
        } catch (e) {
            this.doReject('quit with error ' + e)
        }
        return done
    }

    // common vice actions
    async launchViceForMachine(machine, options) {
        await this.launchVice(machine, options)
        const isMachine = await this.confirmMachine()
        if (!isMachine) {
            throw(new Error('wrong machine started'))
        }
    }

    async loadBASICProgram(programBytes, startAddress) {
        if (startAddress == null) {
            // TODO: look up from machine itself maybe?
        }
        const endAddress = startAddress + programBytes.length
        // initialize BASIC pointers
        const endLow = endAddress & 0xff
        const endHigh = (endAddress >> 8) & 0xff
        if (this.machineData.basicPrep !== false) {
            const start = this.machineData.basicPrep.start
            const end = this.machineData.basicPrep.end
            const len = end - start + 1
            const bytes = [...Array(len)].map((_, i) => i % 2 === 0 ? endLow : endHigh);
            await this.sendCommand(new ViceCommand('memset', {
                startAddress: start,
                endAddress: end,
                dataBytes: bytes
            }))
        }
        // load in program bytes
        await this.sendCommand(new ViceCommand('memset', {
            startAddress: startAddress,
            endAddress: endAddress - 1, // 0-based count
            dataBytes: programBytes,
            bankId: this.machineData.basicProgram?.bank ?? 0
        }))
    }

    async runBASICProgram(startVice = true) {
        await this.sendCommand(new ViceCommand('memset', {
            startAddress: this.machineData.pointers.keyboardBuffer,
            endAddress: this.machineData.pointers.keyboardBuffer + ViceConnection.RUN_COMMAND.length - 1,
            dataBytes: ViceConnection.RUN_COMMAND,
            bankId: this.machineData.basicRun?.bank ?? 0
        }))
        await this.sendCommand(new ViceCommand('memset', {
            startAddress: this.machineData.pointers.keyboardBufferCount,
            endAddress: this.machineData.pointers.keyboardBufferCount,
            dataBytes: [ ViceConnection.RUN_COMMAND.length + (this.machineData.keyboardBufferCountMod ?? 0) ],
            bankId: this.machineData.basicRun?.bank ?? 0
        }))
        if (startVice) {
            await this.sendCommand(new ViceCommand('execrun'))
        }
    }

    async setUpforBASICBreak() {
        const execResponse = await this.sendCommand(new ViceCommand('chkset', {
            startAddress: this.machineData.exec.break,
            endAddress:  this.machineData.exec.break,
            stopWhenHit: boolval.btrue,
            enabled: boolval.btrue,
            operation: 0x04, // on exec
        }))
        let stopCheckpoints = {}
        for (const stop in this.machineData.stop) {
            const stopBreak = this.machineData.stop[stop]
            let stopAddress = (stopBreak instanceof Object) ? stopBreak.addr : stopBreak
            const stopResponse = await this.sendCommand(new ViceCommand('chkset', {
                startAddress: stopBreak,
                endAddress: stopBreak,
                stopWhenHit: boolval.btrue,
                enabled: boolval.btrue,
                operation: 0x04, // on exec
            }))
            stopCheckpoints[stopResponse.parsed.checkpoint] = stop
        }
        return { execCheckpoint: execResponse.parsed.checkpoint, stopCheckpoints }
    }
}

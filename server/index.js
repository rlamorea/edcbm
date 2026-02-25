import express from 'express'
import { ViceConnection } from './vice.js'
import { ViceCommand } from './viceDebugger.js'
import cors from 'cors'
import config from './config.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const port = config.PORT

//const vice = new ViceConnection()
let currentVice = null

app.get('/', (req, res) => {
    res.send({ edcbm: true })
})

// Define a basic route
app.get('/ping', (req, res) => {
    res.send({ status: 'pong' })
})

// VICE routes
app.post('/vice/run', async (req, res) => {
    if (currentVice) {
        res.status(500).json({ status: 'error', error: 'VICE already running'})
        return
    }
    const machine = req.body.executeMachine
    //const programBytes = Uint8Array.fromBase64(req.body.programBytes) // NOT SUPPORTED BY NODEJS YET!
    const programBytes = [ ...Buffer.from(req.body.programBytes, 'base64') ].splice(2) // cut off the address bytes from the program
    console.log('start', req.body.startAddress, 'programBytes', programBytes)
    currentVice = new ViceConnection()
    try {
        const result = await currentVice.launchVice(machine)
        const isMachine = await currentVice.confirmMachine()
        if (!isMachine) {
            res.status(500).json({ status: 'error', error: 'wrong machine started' })
        }
        await currentVice.sendCommand(new ViceCommand('memset', {
            startAddress: req.body.startAddress,
            endAddress: req.body.startAddress + programBytes.length - 1, // 0-based count
            dataBytes: programBytes
        }))
        await currentVice.sendCommand(new ViceCommand('memset', {
            startAddress: 631,
            endAddress: 634,
            dataBytes: [ 82, 85, 78, 13 ] // RUN<return>
        }))
        await currentVice.sendCommand(new ViceCommand('memset', {
            startAddress: 198,
            endAddress: 198,
            dataBytes: [ 4 ] // 4 bytes in keyboard buffer
        }))
        await currentVice.sendCommand(new ViceCommand('execrun'))
        res.send({ status: 'running' })
    } catch (e) {
        res.status(500).json({ status: 'error', error: e.toString() })
    }
})

app.post('/vice/stop', async (req, res) => {
    console.log('asked to stop')
    if (currentVice) {
        console.log('shutting down')
        try {
            currentVice.shutDown()
            currentVice = null
        } catch (e) {
            console.log('shut down error', e)
        }
    }
    res.send({ status: 'stopped' })
})

if (config.good) {
    // Start the server
    app.listen(port, () => {
        console.log(`EDCBM Server listening at http://localhost:${port}`)
        //vice.launchVice('plus4')
    })
}

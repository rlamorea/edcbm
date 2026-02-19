import express from 'express'
import { ViceConnection } from './vice.js'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

import dotenv from 'dotenv'
dotenv.config({ path: './.edcbmenv'})

const port = process.env['EDCBM_PORT'] ?? 3129

//const vice = new ViceConnection()

app.get('/', (req, res) => {
    res.send({ edcbm: true })
})

// Define a basic route
app.get('/ping', (req, res) => {
    res.send({ status: 'pong' })
})

// Start the server
app.listen(port, () => {
    console.log(`EDCBM Server listening at http://localhost:${port}`)
    //vice.launchVice('plus4')
})
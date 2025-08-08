import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { typeBits, boolval, memSpace, checkpointOperations, resetDevice, toPetsciiCode, ViceCommand } from '../viceDebugger.js'

function getInt32(bytes, startIdx) {
    if (startIdx + 3 >= bytes.length) {
        throw new Error('Invalid start index')
    }
    return (
        bytes[startIdx] +
        bytes[startIdx + 1] * 2**8 +
        bytes[startIdx + 2] * 2**16 +
        bytes[startIdx + 3] * 2**24
    ) 
}

function getInt16(bytes, startIdx) {
    if (startIdx + 1 >= bytes.length) {
        throw new Error('Invalid start index')
    }
    return (
        bytes[startIdx] +
        bytes[startIdx + 1] * 2**8
    )
}

test('exec command payload', () => {
    const cmd = new ViceCommand('exec')
    const bytes = cmd.bytes()
    assert.is(bytes.length, 11)
    assert.is(bytes[10], ViceCommand.commands['exec'])
    assert.is(getInt32(bytes, 2), 0)
    assert.is(getInt32(bytes, 6), cmd.requestId())
})

function stringBytes(str, encoding = 'ascii') {
    return [...str].map(char => char.charCodeAt(0))
}

test('reset command payload', () => {
    const cmd = new ViceCommand('reset', {
        reset: resetDevice.hardReset
    })
    const bytes = cmd.bytes()
    assert.is(bytes.length, 12)
    assert.is(bytes[10], ViceCommand.commands['reset'].commandByte)
    assert.is(getInt32(bytes, 2), 1)
    assert.is(bytes[11], resetDevice.hardReset)
})

test('chkget command payload', () => {
    const cmd = new ViceCommand('chkget', {
        'checkpoint': 500
    })
    const bytes = cmd.bytes()
    assert.is(bytes.length, 15)
    assert.is(bytes[10], ViceCommand.commands['chkget'].commandByte)
    assert.is(getInt32(bytes, 2), 4)
    assert.is(getInt32(bytes, 11), 500)
})

test('chkenable command payload', () => {
    const cmd = new ViceCommand('chkenable', {
        'checkpoint': 500
    })
    const bytes = cmd.bytes()
    assert.is(bytes.length, 16)
    assert.is(bytes[10], ViceCommand.commands['chkenable'].commandByte)
    assert.is(getInt32(bytes, 2), 5)
    assert.is(getInt32(bytes, 11), 500)
    assert.is(bytes[15], 1)
})

test('memget command payload', () => {
    const cmd = new ViceCommand('memget', {
        startAddress: 0x1c01,
        endAddress: 0x1c08
    })
    const bytes = cmd.bytes()
    assert.is(bytes.length, 19)
    assert.is(bytes[10], ViceCommand.commands['memget'].commandByte)
    assert.is(bytes[11], boolval.bfalse, 'sideEffects')
    assert.is(getInt16(bytes, 12), 0x1c01, 'startAddress')
    assert.is(getInt16(bytes, 14), 0x1c08, 'endAddress')
    assert.is(bytes[16], memSpace.mainMemory, 'memSpace')
    assert.is(getInt16(bytes, 17), 0, 'bankId')
})

test('memset command payload', () => {
    const data = [ 1, 2, 3, 4, 5, 6, 7, 8 ]
    const cmd = new ViceCommand('memset', {
        startAddress: 0x1c01,
        endAddress: 0x1c08,
        dataBytes: data
    })
    const bytes = cmd.bytes()
    assert.is(bytes.length, 27)
    assert.is(bytes[10], ViceCommand.commands['memset'].commandByte)
    assert.is(bytes[11], boolval.bfalse, 'sideEffects')
    assert.is(getInt16(bytes, 12), 0x1c01, 'startAddress')
    assert.is(getInt16(bytes, 14), 0x1c08, 'endAddress')
    assert.is(bytes[16], memSpace.mainMemory, 'memSpace')
    assert.is(getInt16(bytes, 17), 0, 'bankId')
    assert.equal([ ...bytes.slice(19) ], data)
})

test('chkcondition command payload', () => {
    const condition = 'A==3a'
    const cmd = new ViceCommand('chkcondition', {
        checkpoint: 500,
        condition
    })
    const bytes = cmd.bytes()
    assert.is(bytes.length, 21)
    assert.is(bytes[10], ViceCommand.commands['chkcondition'].commandByte)
    assert.is(getInt32(bytes, 11), 500, 'checkpointId')
    assert.is(bytes[15], 5, 'condition length')
    assert.equal([ ...bytes.slice(16) ], stringBytes(condition), 'condition')
})

test('regset command payload', () => {
    const cmd = new ViceCommand('regset', {
        values: [
            { register: 1, value: { value: 0x1c01, bits: 16 } },
            { register: 2, value: { value: 10, bits: 8 } }
        ]
    })
    const bytes = cmd.bytes()
    assert.is(bytes.length, 21)
    assert.is(bytes[10], ViceCommand.commands['regset'].commandByte)
    assert.is(bytes[11], memSpace.mainMemory, 'memSpace')
    assert.is(getInt16(bytes, 12), 2, 'register values count')
    assert.is(bytes[14], 3, 'value 1 size')
    assert.is(bytes[15], 1, 'value 1 register id')
    assert.is(getInt16(bytes, 16), 0x1c01, 'value 1 value')
    assert.is(bytes[18], 2, 'value 2 size')
    assert.is(bytes[19], 2, 'value 2 register id')
    assert.is(bytes[20], 10, 'value 2 value')
})

test('type command payload', () => {
    const run = 'RUN\n'
    const cmd = new ViceCommand('type', {
        'text': run
    })
    const bytes = cmd.bytes()
    assert.is(bytes.length, 16)
    assert.is(bytes[10], ViceCommand.commands['type'].commandByte)
    assert.is(bytes[11], 4, 'length')
    assert.equal([ ...bytes.slice(12) ], toPetsciiCode(run), 'text')
})

test.run()
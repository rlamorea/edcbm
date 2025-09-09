import { test } from 'uvu'
import * as assert from 'uvu/assert'

import { typeBits, boolval, memSpace, checkpointOperations, resetDevice, toPetsciiCode, ViceResponse } from '../viceDebugger.js'

test('memset response parsing', () => {
    const data = new Uint8Array([ 
        0x02, 0x02, // stx, ver
        0x00, 0x00, 0x00, 0x00, // length
        ViceResponse.responses['memset'],
        0x00, // OK
        0x01, 0x00, 0x00, 0x00, // request id
    ])

    const resp = new ViceResponse(data)
    assert.is(resp.type(), 'memset')
    assert.is(resp.length(), 0)
    assert.is(resp.requestId(), 1)
})

test('chklist response parsing', () => {
    const data = new Uint8Array([
        0x02, 0x02, // stx, ver
        0x04, 0x00, 0x00, 0x00, // length
        ViceResponse.responses['chklist'].responseByte,
        0x00, // OK
        0x01, 0x00, 0x00, 0x00, // request id
        0x02, 0x00, 0x00, 0x00
    ])

    const resp = new ViceResponse(data)
    assert.is(resp.type(), 'chklist')
    assert.is(resp.length(), 4)
    assert.is(resp.status(), 'OK')
    const parsed = resp.response()
    assert.is(parsed.count, 2)
})

test('checkpoint response parsing', () => {
    const data = new Uint8Array([
        0x02, 0x02, // stx, ver
        23, 0x00, 0x00, 0x00, // length
        ViceResponse.responses['checkpoint'].responseByte,
        0x00, // OK
        0x01, 0x00, 0x00, 0x00, // request id
        0x01, 0x00, 0x00, 0x00, // checkpoint
        0x00, // currentlyHit
        0x01, 0x1c, // startAddress
        0x02, 0x1c, // endAddress
        0x01, // stopWhenHit
        0x01, // enabled
        checkpointOperations.exec,
        0x00, // temporary
        0x05, 0x00, 0x00, 0x00, // hit count
        0x04, 0x00, 0x00, 0x00, // ignore count
        0x00, // hasCondition
        memSpace.mainMemory,
    ])

    const resp = new ViceResponse(data)
    assert.is(resp.type(), 'checkpoint')
    assert.is(resp.length(), 23)
    assert.is(resp.status(), 'OK')
    const parsed = resp.response()
    assert.is(parsed.checkpoint, 1, 'checkpoint')
    assert.is(parsed.currentlyHit, boolval.bfalse, 'currentlyHit')
    assert.is(parsed.startAddress, 0x1c01, 'startAddress')
    assert.is(parsed.endAddress, 0x1c02, 'endAddress')
    assert.is(parsed.stopWhenHit, boolval.btrue, 'stopWhenHit')
    assert.is(parsed.enabled, boolval.btrue, 'enabled')
    assert.is(parsed.operation, checkpointOperations.exec, 'operations')
    assert.is(parsed.temporary, boolval.bfalse, 'temporary')
    assert.is(parsed.hitCount, 5, 'hitCount')
    assert.is(parsed.ignoreCount, 4, 'ignoreCount')
    assert.is(parsed.hasCondition, boolval.bfalse, 'hasCondition')
    assert.is(parsed.memSpace, memSpace.mainMemory, 'memSpace')
})

test('memget response parsing', () => {
    const dvals = [ 1, 2, 3, 4, 5, 6, 7, 8 ]
    const data = new Uint8Array([
        0x02, 0x02, // stx, ver
        10, 0x00, 0x00, 0x00, // length
        ViceResponse.responses['memget'].responseByte,
        0x00, // OK
        0x01, 0x00, 0x00, 0x00, // request id
        8, 0x00, // length
        ...dvals // memory
    ])

    const resp = new ViceResponse(data)
    assert.is(resp.type(), 'memget')
    assert.is(resp.length(), 10)
    const parsed = resp.response()
    assert.is(parsed.length, 8, 'length')
    assert.equal(parsed.memory, dvals, 'data')
})

test('infovice response parsing', () => {
    const ver = [ 3, 6, 0, 0 ]
    const rev = [ 0, 1, 2 ]
    const data = new Uint8Array([
        0x02, 0x02, // stx, ver
        9, 0x00, 0x00, 0x00, // length
        ViceResponse.responses['infovice'].responseByte,
        0x00, // OK
        0x01, 0x00, 0x00, 0x00, // request id
        ver.length, // vlength
        ...ver, // version
        rev.length, // slength
        ...rev // svnrev
    ])

    const resp = new ViceResponse(data)
    assert.is(resp.type(), 'infovice')
    assert.is(resp.length(), 9)
    const parsed = resp.response()
    assert.is(parsed.vlength, 4, 'vlength')
    assert.equal(parsed.version, ver, 'version')
    assert.is(parsed.slength, 3, 'slength')
    assert.equal(parsed.svnrev, rev, 'svnrev')
})

test('infobanks response parsing', () => {
    const data = new Uint8Array([
        0x02, 0x02, // stx, ver
        21, 0x00, 0x00, 0x00, // length
        ViceResponse.responses['infobanks'].responseByte,
        0x00, // OK
        0x01, 0x00, 0x00, 0x00, // request id
        2, 0x00, // count
        8, // bank 1 size
        0x01, 0x00, // bank 1 id
        6, // bank 1 name length
        ...[..."bank 0"].map(ch => ch.charCodeAt(0)), // bank 1 name
        9, // bank 2 size
        0x0f, 0x00, // bank 2 id
        7, // bank 2 name length
        ...[..."bank 15"].map(ch => ch.charCodeAt(0)) // bank 2 name
    ])

    const resp = new ViceResponse(data)
    assert.is(resp.type(), 'infobanks')
    assert.is(resp.length(), 21)
    const parsed = resp.response()
    assert.is(parsed.count, 2, 'count')
    assert.is(parsed.banks.length, 2, 'banks length')
    assert.is(parsed.banks[0].bankId, 1, 'bank 1 id')
    assert.is(parsed.banks[0].length, 6, 'bank 1 name length')
    assert.is(parsed.banks[0].name, 'bank 0', 'bank 1 name')
    assert.is(parsed.banks[1].bankId, 15, 'bank 2 id')
    assert.is(parsed.banks[1].length, 7, 'bank 2 name length')
    assert.is(parsed.banks[1].name, 'bank 15', 'bank 2 name')
})

test('registers response parsing', () => {
    const data = new Uint8Array([
        0x02, 0x02, // stx, ver
        9, 0x00, 0x00, 0x00, // length
        ViceResponse.responses['registers'].responseByte,
        0x00, // OK
        0x01, 0x00, 0x00, 0x00, // request id
        2, 0x00, // count
        3, // reg 1 size
        1, // reg 1 index
        0x01, 0x1c, // reg 1 value
        2, // reg 2 size
        2, // reg 2 index
        0xff, // reg 2 value
    ])

    const resp = new ViceResponse(data)
    assert.is(resp.type(), 'registers')
    assert.is(resp.length(), 9)
    const parsed = resp.response()
    assert.is(parsed.count, 2, 'count')
    assert.is(parsed.values.length, 2, 'values length')
    assert.is(parsed.values[0].size, 3, 'value 1 size')
    assert.is(parsed.values[0].register, 1, 'value 1 register')
    assert.is(parsed.values[0].value, 0x1c01, 'value 1 value')
    assert.is(parsed.values[1].size, 2, 'value 1 size')
    assert.is(parsed.values[1].register, 2, 'value 1 register')
    assert.is(parsed.values[1].value, 0xff, 'value 1 value')
})

test.run()
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/base64-js/lib/b64.js","/../../node_modules/base64-js/lib")
},{"buffer":2,"rH1JPG":5}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/buffer/index.js","/../../node_modules/buffer")
},{"base64-js":1,"buffer":2,"ieee754":4,"rH1JPG":5}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){

/**
 * @license
 *
 * chroma.js - JavaScript library for color conversions
 * 
 * Copyright (c) 2011-2015, Gregor Aisch
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. The name Gregor Aisch may not be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

(function() {
  var Color, DEG2RAD, LAB_CONSTANTS, PI, PITHIRD, RAD2DEG, TWOPI, _guess_formats, _guess_formats_sorted, _input, _interpolators, abs, atan2, bezier, blend, blend_f, brewer, burn, chroma, clip_rgb, cmyk2rgb, colors, cos, css2rgb, darken, dodge, each, floor, hex2rgb, hsi2rgb, hsl2css, hsl2rgb, hsv2rgb, interpolate, interpolate_hsx, interpolate_lab, interpolate_num, interpolate_rgb, lab2lch, lab2rgb, lab_xyz, lch2lab, lch2rgb, lighten, limit, log, luminance_x, m, max, multiply, normal, num2rgb, overlay, pow, rgb2cmyk, rgb2css, rgb2hex, rgb2hsi, rgb2hsl, rgb2hsv, rgb2lab, rgb2lch, rgb2luminance, rgb2num, rgb2temperature, rgb2xyz, rgb_xyz, rnd, root, round, screen, sin, sqrt, temperature2rgb, type, unpack, w3cx11, xyz_lab, xyz_rgb,
    slice = [].slice;

  type = (function() {

    /*
    for browser-safe type checking+
    ported from jQuery's $.type
     */
    var classToType, len, name, o, ref;
    classToType = {};
    ref = "Boolean Number String Function Array Date RegExp Undefined Null".split(" ");
    for (o = 0, len = ref.length; o < len; o++) {
      name = ref[o];
      classToType["[object " + name + "]"] = name.toLowerCase();
    }
    return function(obj) {
      var strType;
      strType = Object.prototype.toString.call(obj);
      return classToType[strType] || "object";
    };
  })();

  limit = function(x, min, max) {
    if (min == null) {
      min = 0;
    }
    if (max == null) {
      max = 1;
    }
    if (x < min) {
      x = min;
    }
    if (x > max) {
      x = max;
    }
    return x;
  };

  unpack = function(args) {
    if (args.length >= 3) {
      return [].slice.call(args);
    } else {
      return args[0];
    }
  };

  clip_rgb = function(rgb) {
    var i;
    for (i in rgb) {
      if (i < 3) {
        if (rgb[i] < 0) {
          rgb[i] = 0;
        }
        if (rgb[i] > 255) {
          rgb[i] = 255;
        }
      } else if (i === 3) {
        if (rgb[i] < 0) {
          rgb[i] = 0;
        }
        if (rgb[i] > 1) {
          rgb[i] = 1;
        }
      }
    }
    return rgb;
  };

  PI = Math.PI, round = Math.round, cos = Math.cos, floor = Math.floor, pow = Math.pow, log = Math.log, sin = Math.sin, sqrt = Math.sqrt, atan2 = Math.atan2, max = Math.max, abs = Math.abs;

  TWOPI = PI * 2;

  PITHIRD = PI / 3;

  DEG2RAD = PI / 180;

  RAD2DEG = 180 / PI;

  chroma = function() {
    if (arguments[0] instanceof Color) {
      return arguments[0];
    }
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, arguments, function(){});
  };

  _interpolators = [];

  if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
    module.exports = chroma;
  }

  if (typeof define === 'function' && define.amd) {
    define([], function() {
      return chroma;
    });
  } else {
    root = typeof exports !== "undefined" && exports !== null ? exports : this;
    root.chroma = chroma;
  }

  chroma.version = '1.2.1';


  /**
      chroma.js
  
      Copyright (c) 2011-2013, Gregor Aisch
      All rights reserved.
  
      Redistribution and use in source and binary forms, with or without
      modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright notice, this
        list of conditions and the following disclaimer.
  
      * Redistributions in binary form must reproduce the above copyright notice,
        this list of conditions and the following disclaimer in the documentation
        and/or other materials provided with the distribution.
  
      * The name Gregor Aisch may not be used to endorse or promote products
        derived from this software without specific prior written permission.
  
      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
      AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
      IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
      DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
      INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
      BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
      DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
      OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
      NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
      EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  
      @source: https://github.com/gka/chroma.js
   */

  _input = {};

  _guess_formats = [];

  _guess_formats_sorted = false;

  Color = (function() {
    function Color() {
      var arg, args, chk, len, len1, me, mode, o, w;
      me = this;
      args = [];
      for (o = 0, len = arguments.length; o < len; o++) {
        arg = arguments[o];
        if (arg != null) {
          args.push(arg);
        }
      }
      mode = args[args.length - 1];
      if (_input[mode] != null) {
        me._rgb = clip_rgb(_input[mode](unpack(args.slice(0, -1))));
      } else {
        if (!_guess_formats_sorted) {
          _guess_formats = _guess_formats.sort(function(a, b) {
            return b.p - a.p;
          });
          _guess_formats_sorted = true;
        }
        for (w = 0, len1 = _guess_formats.length; w < len1; w++) {
          chk = _guess_formats[w];
          mode = chk.test.apply(chk, args);
          if (mode) {
            break;
          }
        }
        if (mode) {
          me._rgb = clip_rgb(_input[mode].apply(_input, args));
        }
      }
      if (me._rgb == null) {
        console.warn('unknown format: ' + args);
      }
      if (me._rgb == null) {
        me._rgb = [0, 0, 0];
      }
      if (me._rgb.length === 3) {
        me._rgb.push(1);
      }
    }

    Color.prototype.alpha = function(alpha) {
      if (arguments.length) {
        this._rgb[3] = alpha;
        return this;
      }
      return this._rgb[3];
    };

    Color.prototype.toString = function() {
      return this.name();
    };

    return Color;

  })();

  chroma._input = _input;


  /**
  	ColorBrewer colors for chroma.js
  
  	Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The 
  	Pennsylvania State University.
  
  	Licensed under the Apache License, Version 2.0 (the "License"); 
  	you may not use this file except in compliance with the License.
  	You may obtain a copy of the License at	
  	http://www.apache.org/licenses/LICENSE-2.0
  
  	Unless required by applicable law or agreed to in writing, software distributed
  	under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
  	CONDITIONS OF ANY KIND, either express or implied. See the License for the
  	specific language governing permissions and limitations under the License.
  
      @preserve
   */

  chroma.brewer = brewer = {
    OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
    PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
    BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
    Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
    BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
    YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
    YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
    Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
    RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
    Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
    YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
    Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
    GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
    Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
    YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
    PuRd: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
    Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
    PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
    Spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
    RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
    RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
    PiYG: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
    PRGn: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
    RdYlBu: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
    BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
    RdGy: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
    PuOr: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],
    Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
    Accent: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
    Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
    Set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
    Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
    Paired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],
    Pastel2: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
    Pastel1: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2']
  };


  /**
  	X11 color names
  
  	http://www.w3.org/TR/css3-color/#svg-color
   */

  w3cx11 = {
    indigo: "#4b0082",
    gold: "#ffd700",
    hotpink: "#ff69b4",
    firebrick: "#b22222",
    indianred: "#cd5c5c",
    yellow: "#ffff00",
    mistyrose: "#ffe4e1",
    darkolivegreen: "#556b2f",
    olive: "#808000",
    darkseagreen: "#8fbc8f",
    pink: "#ffc0cb",
    tomato: "#ff6347",
    lightcoral: "#f08080",
    orangered: "#ff4500",
    navajowhite: "#ffdead",
    lime: "#00ff00",
    palegreen: "#98fb98",
    darkslategrey: "#2f4f4f",
    greenyellow: "#adff2f",
    burlywood: "#deb887",
    seashell: "#fff5ee",
    mediumspringgreen: "#00fa9a",
    fuchsia: "#ff00ff",
    papayawhip: "#ffefd5",
    blanchedalmond: "#ffebcd",
    chartreuse: "#7fff00",
    dimgray: "#696969",
    black: "#000000",
    peachpuff: "#ffdab9",
    springgreen: "#00ff7f",
    aquamarine: "#7fffd4",
    white: "#ffffff",
    orange: "#ffa500",
    lightsalmon: "#ffa07a",
    darkslategray: "#2f4f4f",
    brown: "#a52a2a",
    ivory: "#fffff0",
    dodgerblue: "#1e90ff",
    peru: "#cd853f",
    lawngreen: "#7cfc00",
    chocolate: "#d2691e",
    crimson: "#dc143c",
    forestgreen: "#228b22",
    darkgrey: "#a9a9a9",
    lightseagreen: "#20b2aa",
    cyan: "#00ffff",
    mintcream: "#f5fffa",
    silver: "#c0c0c0",
    antiquewhite: "#faebd7",
    mediumorchid: "#ba55d3",
    skyblue: "#87ceeb",
    gray: "#808080",
    darkturquoise: "#00ced1",
    goldenrod: "#daa520",
    darkgreen: "#006400",
    floralwhite: "#fffaf0",
    darkviolet: "#9400d3",
    darkgray: "#a9a9a9",
    moccasin: "#ffe4b5",
    saddlebrown: "#8b4513",
    grey: "#808080",
    darkslateblue: "#483d8b",
    lightskyblue: "#87cefa",
    lightpink: "#ffb6c1",
    mediumvioletred: "#c71585",
    slategrey: "#708090",
    red: "#ff0000",
    deeppink: "#ff1493",
    limegreen: "#32cd32",
    darkmagenta: "#8b008b",
    palegoldenrod: "#eee8aa",
    plum: "#dda0dd",
    turquoise: "#40e0d0",
    lightgrey: "#d3d3d3",
    lightgoldenrodyellow: "#fafad2",
    darkgoldenrod: "#b8860b",
    lavender: "#e6e6fa",
    maroon: "#800000",
    yellowgreen: "#9acd32",
    sandybrown: "#f4a460",
    thistle: "#d8bfd8",
    violet: "#ee82ee",
    navy: "#000080",
    magenta: "#ff00ff",
    dimgrey: "#696969",
    tan: "#d2b48c",
    rosybrown: "#bc8f8f",
    olivedrab: "#6b8e23",
    blue: "#0000ff",
    lightblue: "#add8e6",
    ghostwhite: "#f8f8ff",
    honeydew: "#f0fff0",
    cornflowerblue: "#6495ed",
    slateblue: "#6a5acd",
    linen: "#faf0e6",
    darkblue: "#00008b",
    powderblue: "#b0e0e6",
    seagreen: "#2e8b57",
    darkkhaki: "#bdb76b",
    snow: "#fffafa",
    sienna: "#a0522d",
    mediumblue: "#0000cd",
    royalblue: "#4169e1",
    lightcyan: "#e0ffff",
    green: "#008000",
    mediumpurple: "#9370db",
    midnightblue: "#191970",
    cornsilk: "#fff8dc",
    paleturquoise: "#afeeee",
    bisque: "#ffe4c4",
    slategray: "#708090",
    darkcyan: "#008b8b",
    khaki: "#f0e68c",
    wheat: "#f5deb3",
    teal: "#008080",
    darkorchid: "#9932cc",
    deepskyblue: "#00bfff",
    salmon: "#fa8072",
    darkred: "#8b0000",
    steelblue: "#4682b4",
    palevioletred: "#db7093",
    lightslategray: "#778899",
    aliceblue: "#f0f8ff",
    lightslategrey: "#778899",
    lightgreen: "#90ee90",
    orchid: "#da70d6",
    gainsboro: "#dcdcdc",
    mediumseagreen: "#3cb371",
    lightgray: "#d3d3d3",
    mediumturquoise: "#48d1cc",
    lemonchiffon: "#fffacd",
    cadetblue: "#5f9ea0",
    lightyellow: "#ffffe0",
    lavenderblush: "#fff0f5",
    coral: "#ff7f50",
    purple: "#800080",
    aqua: "#00ffff",
    whitesmoke: "#f5f5f5",
    mediumslateblue: "#7b68ee",
    darkorange: "#ff8c00",
    mediumaquamarine: "#66cdaa",
    darksalmon: "#e9967a",
    beige: "#f5f5dc",
    blueviolet: "#8a2be2",
    azure: "#f0ffff",
    lightsteelblue: "#b0c4de",
    oldlace: "#fdf5e6",
    rebeccapurple: "#663399"
  };

  chroma.colors = colors = w3cx11;

  lab2rgb = function() {
    var a, args, b, g, l, r, x, y, z;
    args = unpack(arguments);
    l = args[0], a = args[1], b = args[2];
    y = (l + 16) / 116;
    x = isNaN(a) ? y : y + a / 500;
    z = isNaN(b) ? y : y - b / 200;
    y = LAB_CONSTANTS.Yn * lab_xyz(y);
    x = LAB_CONSTANTS.Xn * lab_xyz(x);
    z = LAB_CONSTANTS.Zn * lab_xyz(z);
    r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);
    g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
    b = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);
    r = limit(r, 0, 255);
    g = limit(g, 0, 255);
    b = limit(b, 0, 255);
    return [r, g, b, args.length > 3 ? args[3] : 1];
  };

  xyz_rgb = function(r) {
    return round(255 * (r <= 0.00304 ? 12.92 * r : 1.055 * pow(r, 1 / 2.4) - 0.055));
  };

  lab_xyz = function(t) {
    if (t > LAB_CONSTANTS.t1) {
      return t * t * t;
    } else {
      return LAB_CONSTANTS.t2 * (t - LAB_CONSTANTS.t0);
    }
  };

  LAB_CONSTANTS = {
    Kn: 18,
    Xn: 0.950470,
    Yn: 1,
    Zn: 1.088830,
    t0: 0.137931034,
    t1: 0.206896552,
    t2: 0.12841855,
    t3: 0.008856452
  };

  rgb2lab = function() {
    var b, g, r, ref, ref1, x, y, z;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    ref1 = rgb2xyz(r, g, b), x = ref1[0], y = ref1[1], z = ref1[2];
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
  };

  rgb_xyz = function(r) {
    if ((r /= 255) <= 0.04045) {
      return r / 12.92;
    } else {
      return pow((r + 0.055) / 1.055, 2.4);
    }
  };

  xyz_lab = function(t) {
    if (t > LAB_CONSTANTS.t3) {
      return pow(t, 1 / 3);
    } else {
      return t / LAB_CONSTANTS.t2 + LAB_CONSTANTS.t0;
    }
  };

  rgb2xyz = function() {
    var b, g, r, ref, x, y, z;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    r = rgb_xyz(r);
    g = rgb_xyz(g);
    b = rgb_xyz(b);
    x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / LAB_CONSTANTS.Xn);
    y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / LAB_CONSTANTS.Yn);
    z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / LAB_CONSTANTS.Zn);
    return [x, y, z];
  };

  chroma.lab = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['lab']), function(){});
  };

  _input.lab = lab2rgb;

  Color.prototype.lab = function() {
    return rgb2lab(this._rgb);
  };

  bezier = function(colors) {
    var I, I0, I1, c, lab0, lab1, lab2, lab3, ref, ref1, ref2;
    colors = (function() {
      var len, o, results;
      results = [];
      for (o = 0, len = colors.length; o < len; o++) {
        c = colors[o];
        results.push(chroma(c));
      }
      return results;
    })();
    if (colors.length === 2) {
      ref = (function() {
        var len, o, results;
        results = [];
        for (o = 0, len = colors.length; o < len; o++) {
          c = colors[o];
          results.push(c.lab());
        }
        return results;
      })(), lab0 = ref[0], lab1 = ref[1];
      I = function(t) {
        var i, lab;
        lab = (function() {
          var o, results;
          results = [];
          for (i = o = 0; o <= 2; i = ++o) {
            results.push(lab0[i] + t * (lab1[i] - lab0[i]));
          }
          return results;
        })();
        return chroma.lab.apply(chroma, lab);
      };
    } else if (colors.length === 3) {
      ref1 = (function() {
        var len, o, results;
        results = [];
        for (o = 0, len = colors.length; o < len; o++) {
          c = colors[o];
          results.push(c.lab());
        }
        return results;
      })(), lab0 = ref1[0], lab1 = ref1[1], lab2 = ref1[2];
      I = function(t) {
        var i, lab;
        lab = (function() {
          var o, results;
          results = [];
          for (i = o = 0; o <= 2; i = ++o) {
            results.push((1 - t) * (1 - t) * lab0[i] + 2 * (1 - t) * t * lab1[i] + t * t * lab2[i]);
          }
          return results;
        })();
        return chroma.lab.apply(chroma, lab);
      };
    } else if (colors.length === 4) {
      ref2 = (function() {
        var len, o, results;
        results = [];
        for (o = 0, len = colors.length; o < len; o++) {
          c = colors[o];
          results.push(c.lab());
        }
        return results;
      })(), lab0 = ref2[0], lab1 = ref2[1], lab2 = ref2[2], lab3 = ref2[3];
      I = function(t) {
        var i, lab;
        lab = (function() {
          var o, results;
          results = [];
          for (i = o = 0; o <= 2; i = ++o) {
            results.push((1 - t) * (1 - t) * (1 - t) * lab0[i] + 3 * (1 - t) * (1 - t) * t * lab1[i] + 3 * (1 - t) * t * t * lab2[i] + t * t * t * lab3[i]);
          }
          return results;
        })();
        return chroma.lab.apply(chroma, lab);
      };
    } else if (colors.length === 5) {
      I0 = bezier(colors.slice(0, 3));
      I1 = bezier(colors.slice(2, 5));
      I = function(t) {
        if (t < 0.5) {
          return I0(t * 2);
        } else {
          return I1((t - 0.5) * 2);
        }
      };
    }
    return I;
  };

  chroma.bezier = function(colors) {
    var f;
    f = bezier(colors);
    f.scale = function() {
      return chroma.scale(f);
    };
    return f;
  };


  /*
      chroma.js
  
      Copyright (c) 2011-2013, Gregor Aisch
      All rights reserved.
  
      Redistribution and use in source and binary forms, with or without
      modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright notice, this
        list of conditions and the following disclaimer.
  
      * Redistributions in binary form must reproduce the above copyright notice,
        this list of conditions and the following disclaimer in the documentation
        and/or other materials provided with the distribution.
  
      * The name Gregor Aisch may not be used to endorse or promote products
        derived from this software without specific prior written permission.
  
      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
      AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
      IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
      DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
      INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
      BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
      DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
      OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
      NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
      EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  
      @source: https://github.com/gka/chroma.js
   */

  chroma.cubehelix = function(start, rotations, hue, gamma, lightness) {
    var dh, dl, f;
    if (start == null) {
      start = 300;
    }
    if (rotations == null) {
      rotations = -1.5;
    }
    if (hue == null) {
      hue = 1;
    }
    if (gamma == null) {
      gamma = 1;
    }
    if (lightness == null) {
      lightness = [0, 1];
    }
    dl = lightness[1] - lightness[0];
    dh = 0;
    f = function(fract) {
      var a, amp, b, cos_a, g, h, l, r, sin_a;
      a = TWOPI * ((start + 120) / 360 + rotations * fract);
      l = pow(lightness[0] + dl * fract, gamma);
      h = dh !== 0 ? hue[0] + fract * dh : hue;
      amp = h * l * (1 - l) / 2;
      cos_a = cos(a);
      sin_a = sin(a);
      r = l + amp * (-0.14861 * cos_a + 1.78277 * sin_a);
      g = l + amp * (-0.29227 * cos_a - 0.90649 * sin_a);
      b = l + amp * (+1.97294 * cos_a);
      return chroma(clip_rgb([r * 255, g * 255, b * 255]));
    };
    f.start = function(s) {
      if (s == null) {
        return start;
      }
      start = s;
      return f;
    };
    f.rotations = function(r) {
      if (r == null) {
        return rotations;
      }
      rotations = r;
      return f;
    };
    f.gamma = function(g) {
      if (g == null) {
        return gamma;
      }
      gamma = g;
      return f;
    };
    f.hue = function(h) {
      if (h == null) {
        return hue;
      }
      hue = h;
      if (type(hue) === 'array') {
        dh = hue[1] - hue[0];
        if (dh === 0) {
          hue = hue[1];
        }
      } else {
        dh = 0;
      }
      return f;
    };
    f.lightness = function(h) {
      if (h == null) {
        return lightness;
      }
      lightness = h;
      if (type(lightness) === 'array') {
        dl = lightness[1] - lightness[0];
        if (dl === 0) {
          lightness = lightness[1];
        }
      } else {
        dl = 0;
      }
      return f;
    };
    f.scale = function() {
      return chroma.scale(f);
    };
    f.hue(hue);
    return f;
  };

  chroma.random = function() {
    var code, digits, i, o;
    digits = '0123456789abcdef';
    code = '#';
    for (i = o = 0; o < 6; i = ++o) {
      code += digits.charAt(floor(Math.random() * 16));
    }
    return new Color(code);
  };

  chroma.average = function(colors) {
    var a, b, c, g, l, len, o, r, rgba;
    r = g = b = a = 0;
    l = colors.length;
    for (o = 0, len = colors.length; o < len; o++) {
      c = colors[o];
      rgba = chroma(c).rgba();
      r += rgba[0];
      g += rgba[1];
      b += rgba[2];
      a += rgba[3];
    }
    return new Color(r / l, g / l, b / l, a / l);
  };

  _input.rgb = function() {
    var k, ref, results, v;
    ref = unpack(arguments);
    results = [];
    for (k in ref) {
      v = ref[k];
      results.push(v);
    }
    return results;
  };

  chroma.rgb = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['rgb']), function(){});
  };

  Color.prototype.rgb = function() {
    return this._rgb.slice(0, 3);
  };

  Color.prototype.rgba = function() {
    return this._rgb;
  };

  _guess_formats.push({
    p: 15,
    test: function(n) {
      var a;
      a = unpack(arguments);
      if (type(a) === 'array' && a.length === 3) {
        return 'rgb';
      }
      if (a.length === 4 && type(a[3]) === "number" && a[3] >= 0 && a[3] <= 1) {
        return 'rgb';
      }
    }
  });

  hex2rgb = function(hex) {
    var a, b, g, r, rgb, u;
    if (hex.match(/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
      if (hex.length === 4 || hex.length === 7) {
        hex = hex.substr(1);
      }
      if (hex.length === 3) {
        hex = hex.split("");
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      u = parseInt(hex, 16);
      r = u >> 16;
      g = u >> 8 & 0xFF;
      b = u & 0xFF;
      return [r, g, b, 1];
    }
    if (hex.match(/^#?([A-Fa-f0-9]{8})$/)) {
      if (hex.length === 9) {
        hex = hex.substr(1);
      }
      u = parseInt(hex, 16);
      r = u >> 24 & 0xFF;
      g = u >> 16 & 0xFF;
      b = u >> 8 & 0xFF;
      a = round((u & 0xFF) / 0xFF * 100) / 100;
      return [r, g, b, a];
    }
    if ((_input.css != null) && (rgb = _input.css(hex))) {
      return rgb;
    }
    throw "unknown color: " + hex;
  };

  rgb2hex = function(channels, mode) {
    var a, b, g, hxa, r, str, u;
    if (mode == null) {
      mode = 'rgb';
    }
    r = channels[0], g = channels[1], b = channels[2], a = channels[3];
    u = r << 16 | g << 8 | b;
    str = "000000" + u.toString(16);
    str = str.substr(str.length - 6);
    hxa = '0' + round(a * 255).toString(16);
    hxa = hxa.substr(hxa.length - 2);
    return "#" + (function() {
      switch (mode.toLowerCase()) {
        case 'rgba':
          return str + hxa;
        case 'argb':
          return hxa + str;
        default:
          return str;
      }
    })();
  };

  _input.hex = function(h) {
    return hex2rgb(h);
  };

  chroma.hex = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['hex']), function(){});
  };

  Color.prototype.hex = function(mode) {
    if (mode == null) {
      mode = 'rgb';
    }
    return rgb2hex(this._rgb, mode);
  };

  _guess_formats.push({
    p: 10,
    test: function(n) {
      if (arguments.length === 1 && type(n) === "string") {
        return 'hex';
      }
    }
  });

  hsl2rgb = function() {
    var args, b, c, g, h, i, l, o, r, ref, s, t1, t2, t3;
    args = unpack(arguments);
    h = args[0], s = args[1], l = args[2];
    if (s === 0) {
      r = g = b = l * 255;
    } else {
      t3 = [0, 0, 0];
      c = [0, 0, 0];
      t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
      t1 = 2 * l - t2;
      h /= 360;
      t3[0] = h + 1 / 3;
      t3[1] = h;
      t3[2] = h - 1 / 3;
      for (i = o = 0; o <= 2; i = ++o) {
        if (t3[i] < 0) {
          t3[i] += 1;
        }
        if (t3[i] > 1) {
          t3[i] -= 1;
        }
        if (6 * t3[i] < 1) {
          c[i] = t1 + (t2 - t1) * 6 * t3[i];
        } else if (2 * t3[i] < 1) {
          c[i] = t2;
        } else if (3 * t3[i] < 2) {
          c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6;
        } else {
          c[i] = t1;
        }
      }
      ref = [round(c[0] * 255), round(c[1] * 255), round(c[2] * 255)], r = ref[0], g = ref[1], b = ref[2];
    }
    if (args.length > 3) {
      return [r, g, b, args[3]];
    } else {
      return [r, g, b];
    }
  };

  rgb2hsl = function(r, g, b) {
    var h, l, min, ref, s;
    if (r !== void 0 && r.length >= 3) {
      ref = r, r = ref[0], g = ref[1], b = ref[2];
    }
    r /= 255;
    g /= 255;
    b /= 255;
    min = Math.min(r, g, b);
    max = Math.max(r, g, b);
    l = (max + min) / 2;
    if (max === min) {
      s = 0;
      h = Number.NaN;
    } else {
      s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
    }
    if (r === max) {
      h = (g - b) / (max - min);
    } else if (g === max) {
      h = 2 + (b - r) / (max - min);
    } else if (b === max) {
      h = 4 + (r - g) / (max - min);
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
    return [h, s, l];
  };

  chroma.hsl = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['hsl']), function(){});
  };

  _input.hsl = hsl2rgb;

  Color.prototype.hsl = function() {
    return rgb2hsl(this._rgb);
  };

  hsv2rgb = function() {
    var args, b, f, g, h, i, p, q, r, ref, ref1, ref2, ref3, ref4, ref5, s, t, v;
    args = unpack(arguments);
    h = args[0], s = args[1], v = args[2];
    v *= 255;
    if (s === 0) {
      r = g = b = v;
    } else {
      if (h === 360) {
        h = 0;
      }
      if (h > 360) {
        h -= 360;
      }
      if (h < 0) {
        h += 360;
      }
      h /= 60;
      i = floor(h);
      f = h - i;
      p = v * (1 - s);
      q = v * (1 - s * f);
      t = v * (1 - s * (1 - f));
      switch (i) {
        case 0:
          ref = [v, t, p], r = ref[0], g = ref[1], b = ref[2];
          break;
        case 1:
          ref1 = [q, v, p], r = ref1[0], g = ref1[1], b = ref1[2];
          break;
        case 2:
          ref2 = [p, v, t], r = ref2[0], g = ref2[1], b = ref2[2];
          break;
        case 3:
          ref3 = [p, q, v], r = ref3[0], g = ref3[1], b = ref3[2];
          break;
        case 4:
          ref4 = [t, p, v], r = ref4[0], g = ref4[1], b = ref4[2];
          break;
        case 5:
          ref5 = [v, p, q], r = ref5[0], g = ref5[1], b = ref5[2];
      }
    }
    r = round(r);
    g = round(g);
    b = round(b);
    return [r, g, b, args.length > 3 ? args[3] : 1];
  };

  rgb2hsv = function() {
    var b, delta, g, h, min, r, ref, s, v;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    min = Math.min(r, g, b);
    max = Math.max(r, g, b);
    delta = max - min;
    v = max / 255.0;
    if (max === 0) {
      h = Number.NaN;
      s = 0;
    } else {
      s = delta / max;
      if (r === max) {
        h = (g - b) / delta;
      }
      if (g === max) {
        h = 2 + (b - r) / delta;
      }
      if (b === max) {
        h = 4 + (r - g) / delta;
      }
      h *= 60;
      if (h < 0) {
        h += 360;
      }
    }
    return [h, s, v];
  };

  chroma.hsv = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['hsv']), function(){});
  };

  _input.hsv = hsv2rgb;

  Color.prototype.hsv = function() {
    return rgb2hsv(this._rgb);
  };

  num2rgb = function(num) {
    var b, g, r;
    if (type(num) === "number" && num >= 0 && num <= 0xFFFFFF) {
      r = num >> 16;
      g = (num >> 8) & 0xFF;
      b = num & 0xFF;
      return [r, g, b, 1];
    }
    console.warn("unknown num color: " + num);
    return [0, 0, 0, 1];
  };

  rgb2num = function() {
    var b, g, r, ref;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    return (r << 16) + (g << 8) + b;
  };

  chroma.num = function(num) {
    return new Color(num, 'num');
  };

  Color.prototype.num = function(mode) {
    if (mode == null) {
      mode = 'rgb';
    }
    return rgb2num(this._rgb, mode);
  };

  _input.num = num2rgb;

  _guess_formats.push({
    p: 10,
    test: function(n) {
      if (arguments.length === 1 && type(n) === "number" && n >= 0 && n <= 0xFFFFFF) {
        return 'num';
      }
    }
  });

  css2rgb = function(css) {
    var aa, ab, hsl, i, m, o, rgb, w;
    css = css.toLowerCase();
    if ((chroma.colors != null) && chroma.colors[css]) {
      return hex2rgb(chroma.colors[css]);
    }
    if (m = css.match(/rgb\(\s*(\-?\d+),\s*(\-?\d+)\s*,\s*(\-?\d+)\s*\)/)) {
      rgb = m.slice(1, 4);
      for (i = o = 0; o <= 2; i = ++o) {
        rgb[i] = +rgb[i];
      }
      rgb[3] = 1;
    } else if (m = css.match(/rgba\(\s*(\-?\d+),\s*(\-?\d+)\s*,\s*(\-?\d+)\s*,\s*([01]|[01]?\.\d+)\)/)) {
      rgb = m.slice(1, 5);
      for (i = w = 0; w <= 3; i = ++w) {
        rgb[i] = +rgb[i];
      }
    } else if (m = css.match(/rgb\(\s*(\-?\d+(?:\.\d+)?)%,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*\)/)) {
      rgb = m.slice(1, 4);
      for (i = aa = 0; aa <= 2; i = ++aa) {
        rgb[i] = round(rgb[i] * 2.55);
      }
      rgb[3] = 1;
    } else if (m = css.match(/rgba\(\s*(\-?\d+(?:\.\d+)?)%,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)/)) {
      rgb = m.slice(1, 5);
      for (i = ab = 0; ab <= 2; i = ++ab) {
        rgb[i] = round(rgb[i] * 2.55);
      }
      rgb[3] = +rgb[3];
    } else if (m = css.match(/hsl\(\s*(\-?\d+(?:\.\d+)?),\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*\)/)) {
      hsl = m.slice(1, 4);
      hsl[1] *= 0.01;
      hsl[2] *= 0.01;
      rgb = hsl2rgb(hsl);
      rgb[3] = 1;
    } else if (m = css.match(/hsla\(\s*(\-?\d+(?:\.\d+)?),\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)/)) {
      hsl = m.slice(1, 4);
      hsl[1] *= 0.01;
      hsl[2] *= 0.01;
      rgb = hsl2rgb(hsl);
      rgb[3] = +m[4];
    }
    return rgb;
  };

  rgb2css = function(rgba) {
    var mode;
    mode = rgba[3] < 1 ? 'rgba' : 'rgb';
    if (mode === 'rgb') {
      return mode + '(' + rgba.slice(0, 3).map(round).join(',') + ')';
    } else if (mode === 'rgba') {
      return mode + '(' + rgba.slice(0, 3).map(round).join(',') + ',' + rgba[3] + ')';
    } else {

    }
  };

  rnd = function(a) {
    return round(a * 100) / 100;
  };

  hsl2css = function(hsl, alpha) {
    var mode;
    mode = alpha < 1 ? 'hsla' : 'hsl';
    hsl[0] = rnd(hsl[0] || 0);
    hsl[1] = rnd(hsl[1] * 100) + '%';
    hsl[2] = rnd(hsl[2] * 100) + '%';
    if (mode === 'hsla') {
      hsl[3] = alpha;
    }
    return mode + '(' + hsl.join(',') + ')';
  };

  _input.css = function(h) {
    return css2rgb(h);
  };

  chroma.css = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['css']), function(){});
  };

  Color.prototype.css = function(mode) {
    if (mode == null) {
      mode = 'rgb';
    }
    if (mode.slice(0, 3) === 'rgb') {
      return rgb2css(this._rgb);
    } else if (mode.slice(0, 3) === 'hsl') {
      return hsl2css(this.hsl(), this.alpha());
    }
  };

  _input.named = function(name) {
    return hex2rgb(w3cx11[name]);
  };

  _guess_formats.push({
    p: 20,
    test: function(n) {
      if (arguments.length === 1 && (w3cx11[n] != null)) {
        return 'named';
      }
    }
  });

  Color.prototype.name = function(n) {
    var h, k;
    if (arguments.length) {
      if (w3cx11[n]) {
        this._rgb = hex2rgb(w3cx11[n]);
      }
      this._rgb[3] = 1;
      this;
    }
    h = this.hex();
    for (k in w3cx11) {
      if (h === w3cx11[k]) {
        return k;
      }
    }
    return h;
  };

  lch2lab = function() {

    /*
    Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
    These formulas were invented by David Dalrymple to obtain maximum contrast without going
    out of gamut if the parameters are in the range 0-1.
    
    A saturation multiplier was added by Gregor Aisch
     */
    var c, h, l, ref;
    ref = unpack(arguments), l = ref[0], c = ref[1], h = ref[2];
    h = h * DEG2RAD;
    return [l, cos(h) * c, sin(h) * c];
  };

  lch2rgb = function() {
    var L, a, args, b, c, g, h, l, r, ref, ref1;
    args = unpack(arguments);
    l = args[0], c = args[1], h = args[2];
    ref = lch2lab(l, c, h), L = ref[0], a = ref[1], b = ref[2];
    ref1 = lab2rgb(L, a, b), r = ref1[0], g = ref1[1], b = ref1[2];
    return [limit(r, 0, 255), limit(g, 0, 255), limit(b, 0, 255), args.length > 3 ? args[3] : 1];
  };

  lab2lch = function() {
    var a, b, c, h, l, ref;
    ref = unpack(arguments), l = ref[0], a = ref[1], b = ref[2];
    c = sqrt(a * a + b * b);
    h = (atan2(b, a) * RAD2DEG + 360) % 360;
    if (round(c * 10000) === 0) {
      h = Number.NaN;
    }
    return [l, c, h];
  };

  rgb2lch = function() {
    var a, b, g, l, r, ref, ref1;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    ref1 = rgb2lab(r, g, b), l = ref1[0], a = ref1[1], b = ref1[2];
    return lab2lch(l, a, b);
  };

  chroma.lch = function() {
    var args;
    args = unpack(arguments);
    return new Color(args, 'lch');
  };

  chroma.hcl = function() {
    var args;
    args = unpack(arguments);
    return new Color(args, 'hcl');
  };

  _input.lch = lch2rgb;

  _input.hcl = function() {
    var c, h, l, ref;
    ref = unpack(arguments), h = ref[0], c = ref[1], l = ref[2];
    return lch2rgb([l, c, h]);
  };

  Color.prototype.lch = function() {
    return rgb2lch(this._rgb);
  };

  Color.prototype.hcl = function() {
    return rgb2lch(this._rgb).reverse();
  };

  rgb2cmyk = function(mode) {
    var b, c, f, g, k, m, r, ref, y;
    if (mode == null) {
      mode = 'rgb';
    }
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    r = r / 255;
    g = g / 255;
    b = b / 255;
    k = 1 - Math.max(r, Math.max(g, b));
    f = k < 1 ? 1 / (1 - k) : 0;
    c = (1 - r - k) * f;
    m = (1 - g - k) * f;
    y = (1 - b - k) * f;
    return [c, m, y, k];
  };

  cmyk2rgb = function() {
    var alpha, args, b, c, g, k, m, r, y;
    args = unpack(arguments);
    c = args[0], m = args[1], y = args[2], k = args[3];
    alpha = args.length > 4 ? args[4] : 1;
    if (k === 1) {
      return [0, 0, 0, alpha];
    }
    r = c >= 1 ? 0 : round(255 * (1 - c) * (1 - k));
    g = m >= 1 ? 0 : round(255 * (1 - m) * (1 - k));
    b = y >= 1 ? 0 : round(255 * (1 - y) * (1 - k));
    return [r, g, b, alpha];
  };

  _input.cmyk = function() {
    return cmyk2rgb(unpack(arguments));
  };

  chroma.cmyk = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['cmyk']), function(){});
  };

  Color.prototype.cmyk = function() {
    return rgb2cmyk(this._rgb);
  };

  _input.gl = function() {
    var i, k, o, rgb, v;
    rgb = (function() {
      var ref, results;
      ref = unpack(arguments);
      results = [];
      for (k in ref) {
        v = ref[k];
        results.push(v);
      }
      return results;
    }).apply(this, arguments);
    for (i = o = 0; o <= 2; i = ++o) {
      rgb[i] *= 255;
    }
    return rgb;
  };

  chroma.gl = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['gl']), function(){});
  };

  Color.prototype.gl = function() {
    var rgb;
    rgb = this._rgb;
    return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, rgb[3]];
  };

  rgb2luminance = function(r, g, b) {
    var ref;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    r = luminance_x(r);
    g = luminance_x(g);
    b = luminance_x(b);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  luminance_x = function(x) {
    x /= 255;
    if (x <= 0.03928) {
      return x / 12.92;
    } else {
      return pow((x + 0.055) / 1.055, 2.4);
    }
  };

  _interpolators = [];

  interpolate = function(col1, col2, f, m) {
    var interpol, len, o, res;
    if (f == null) {
      f = 0.5;
    }
    if (m == null) {
      m = 'rgb';
    }

    /*
    interpolates between colors
    f = 0 --> me
    f = 1 --> col
     */
    if (type(col1) !== 'object') {
      col1 = chroma(col1);
    }
    if (type(col2) !== 'object') {
      col2 = chroma(col2);
    }
    for (o = 0, len = _interpolators.length; o < len; o++) {
      interpol = _interpolators[o];
      if (m === interpol[0]) {
        res = interpol[1](col1, col2, f, m);
        break;
      }
    }
    if (res == null) {
      throw "color mode " + m + " is not supported";
    }
    res.alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
    return res;
  };

  chroma.interpolate = interpolate;

  Color.prototype.interpolate = function(col2, f, m) {
    return interpolate(this, col2, f, m);
  };

  chroma.mix = interpolate;

  Color.prototype.mix = Color.prototype.interpolate;

  interpolate_rgb = function(col1, col2, f, m) {
    var xyz0, xyz1;
    xyz0 = col1._rgb;
    xyz1 = col2._rgb;
    return new Color(xyz0[0] + f * (xyz1[0] - xyz0[0]), xyz0[1] + f * (xyz1[1] - xyz0[1]), xyz0[2] + f * (xyz1[2] - xyz0[2]), m);
  };

  _interpolators.push(['rgb', interpolate_rgb]);

  Color.prototype.luminance = function(lum, mode) {
    var cur_lum, eps, max_iter, test;
    if (mode == null) {
      mode = 'rgb';
    }
    if (!arguments.length) {
      return rgb2luminance(this._rgb);
    }
    if (lum === 0) {
      this._rgb = [0, 0, 0, this._rgb[3]];
    } else if (lum === 1) {
      this._rgb = [255, 255, 255, this._rgb[3]];
    } else {
      eps = 1e-7;
      max_iter = 20;
      test = function(l, h) {
        var lm, m;
        m = l.interpolate(h, 0.5, mode);
        lm = m.luminance();
        if (Math.abs(lum - lm) < eps || !max_iter--) {
          return m;
        }
        if (lm > lum) {
          return test(l, m);
        }
        return test(m, h);
      };
      cur_lum = rgb2luminance(this._rgb);
      this._rgb = (cur_lum > lum ? test(chroma('black'), this) : test(this, chroma('white'))).rgba();
    }
    return this;
  };

  temperature2rgb = function(kelvin) {
    var b, g, r, temp;
    temp = kelvin / 100;
    if (temp < 66) {
      r = 255;
      g = -155.25485562709179 - 0.44596950469579133 * (g = temp - 2) + 104.49216199393888 * log(g);
      b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b = temp - 10) + 115.67994401066147 * log(b);
    } else {
      r = 351.97690566805693 + 0.114206453784165 * (r = temp - 55) - 40.25366309332127 * log(r);
      g = 325.4494125711974 + 0.07943456536662342 * (g = temp - 50) - 28.0852963507957 * log(g);
      b = 255;
    }
    return clip_rgb([r, g, b]);
  };

  rgb2temperature = function() {
    var b, eps, g, maxTemp, minTemp, r, ref, rgb, temp;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    minTemp = 1000;
    maxTemp = 40000;
    eps = 0.4;
    while (maxTemp - minTemp > eps) {
      temp = (maxTemp + minTemp) * 0.5;
      rgb = temperature2rgb(temp);
      if ((rgb[2] / rgb[0]) >= (b / r)) {
        maxTemp = temp;
      } else {
        minTemp = temp;
      }
    }
    return round(temp);
  };

  chroma.temperature = chroma.kelvin = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['temperature']), function(){});
  };

  _input.temperature = _input.kelvin = _input.K = temperature2rgb;

  Color.prototype.temperature = function() {
    return rgb2temperature(this._rgb);
  };

  Color.prototype.kelvin = Color.prototype.temperature;

  chroma.contrast = function(a, b) {
    var l1, l2, ref, ref1;
    if ((ref = type(a)) === 'string' || ref === 'number') {
      a = new Color(a);
    }
    if ((ref1 = type(b)) === 'string' || ref1 === 'number') {
      b = new Color(b);
    }
    l1 = a.luminance();
    l2 = b.luminance();
    if (l1 > l2) {
      return (l1 + 0.05) / (l2 + 0.05);
    } else {
      return (l2 + 0.05) / (l1 + 0.05);
    }
  };

  Color.prototype.get = function(modechan) {
    var channel, i, me, mode, ref, src;
    me = this;
    ref = modechan.split('.'), mode = ref[0], channel = ref[1];
    src = me[mode]();
    if (channel) {
      i = mode.indexOf(channel);
      if (i > -1) {
        return src[i];
      } else {
        return console.warn('unknown channel ' + channel + ' in mode ' + mode);
      }
    } else {
      return src;
    }
  };

  Color.prototype.set = function(modechan, value) {
    var channel, i, me, mode, ref, src;
    me = this;
    ref = modechan.split('.'), mode = ref[0], channel = ref[1];
    if (channel) {
      src = me[mode]();
      i = mode.indexOf(channel);
      if (i > -1) {
        if (type(value) === 'string') {
          switch (value.charAt(0)) {
            case '+':
              src[i] += +value;
              break;
            case '-':
              src[i] += +value;
              break;
            case '*':
              src[i] *= +(value.substr(1));
              break;
            case '/':
              src[i] /= +(value.substr(1));
              break;
            default:
              src[i] = +value;
          }
        } else {
          src[i] = value;
        }
      } else {
        console.warn('unknown channel ' + channel + ' in mode ' + mode);
      }
    } else {
      src = value;
    }
    me._rgb = chroma(src, mode).alpha(me.alpha())._rgb;
    return me;
  };

  Color.prototype.darken = function(amount) {
    var lab, me;
    if (amount == null) {
      amount = 1;
    }
    me = this;
    lab = me.lab();
    lab[0] -= LAB_CONSTANTS.Kn * amount;
    return chroma.lab(lab).alpha(me.alpha());
  };

  Color.prototype.brighten = function(amount) {
    if (amount == null) {
      amount = 1;
    }
    return this.darken(-amount);
  };

  Color.prototype.darker = Color.prototype.darken;

  Color.prototype.brighter = Color.prototype.brighten;

  Color.prototype.saturate = function(amount) {
    var lch, me;
    if (amount == null) {
      amount = 1;
    }
    me = this;
    lch = me.lch();
    lch[1] += amount * LAB_CONSTANTS.Kn;
    if (lch[1] < 0) {
      lch[1] = 0;
    }
    return chroma.lch(lch).alpha(me.alpha());
  };

  Color.prototype.desaturate = function(amount) {
    if (amount == null) {
      amount = 1;
    }
    return this.saturate(-amount);
  };

  Color.prototype.premultiply = function() {
    var a, rgb;
    rgb = this.rgb();
    a = this.alpha();
    return chroma(rgb[0] * a, rgb[1] * a, rgb[2] * a, a);
  };

  blend = function(bottom, top, mode) {
    if (!blend[mode]) {
      throw 'unknown blend mode ' + mode;
    }
    return blend[mode](bottom, top);
  };

  blend_f = function(f) {
    return function(bottom, top) {
      var c0, c1;
      c0 = chroma(top).rgb();
      c1 = chroma(bottom).rgb();
      return chroma(f(c0, c1), 'rgb');
    };
  };

  each = function(f) {
    return function(c0, c1) {
      var i, o, out;
      out = [];
      for (i = o = 0; o <= 3; i = ++o) {
        out[i] = f(c0[i], c1[i]);
      }
      return out;
    };
  };

  normal = function(a, b) {
    return a;
  };

  multiply = function(a, b) {
    return a * b / 255;
  };

  darken = function(a, b) {
    if (a > b) {
      return b;
    } else {
      return a;
    }
  };

  lighten = function(a, b) {
    if (a > b) {
      return a;
    } else {
      return b;
    }
  };

  screen = function(a, b) {
    return 255 * (1 - (1 - a / 255) * (1 - b / 255));
  };

  overlay = function(a, b) {
    if (b < 128) {
      return 2 * a * b / 255;
    } else {
      return 255 * (1 - 2 * (1 - a / 255) * (1 - b / 255));
    }
  };

  burn = function(a, b) {
    return 255 * (1 - (1 - b / 255) / (a / 255));
  };

  dodge = function(a, b) {
    if (a === 255) {
      return 255;
    }
    a = 255 * (b / 255) / (1 - a / 255);
    if (a > 255) {
      return 255;
    } else {
      return a;
    }
  };

  blend.normal = blend_f(each(normal));

  blend.multiply = blend_f(each(multiply));

  blend.screen = blend_f(each(screen));

  blend.overlay = blend_f(each(overlay));

  blend.darken = blend_f(each(darken));

  blend.lighten = blend_f(each(lighten));

  blend.dodge = blend_f(each(dodge));

  blend.burn = blend_f(each(burn));

  chroma.blend = blend;

  chroma.analyze = function(data) {
    var len, o, r, val;
    r = {
      min: Number.MAX_VALUE,
      max: Number.MAX_VALUE * -1,
      sum: 0,
      values: [],
      count: 0
    };
    for (o = 0, len = data.length; o < len; o++) {
      val = data[o];
      if ((val != null) && !isNaN(val)) {
        r.values.push(val);
        r.sum += val;
        if (val < r.min) {
          r.min = val;
        }
        if (val > r.max) {
          r.max = val;
        }
        r.count += 1;
      }
    }
    r.domain = [r.min, r.max];
    r.limits = function(mode, num) {
      return chroma.limits(r, mode, num);
    };
    return r;
  };

  chroma.scale = function(colors, positions) {
    var _classes, _colorCache, _colors, _correctLightness, _domain, _fixed, _max, _min, _mode, _nacol, _out, _padding, _pos, _spread, classifyValue, f, getClass, getColor, resetCache, setColors, tmap;
    _mode = 'rgb';
    _nacol = chroma('#ccc');
    _spread = 0;
    _fixed = false;
    _domain = [0, 1];
    _pos = [];
    _padding = [0, 0];
    _classes = false;
    _colors = [];
    _out = false;
    _min = 0;
    _max = 1;
    _correctLightness = false;
    _colorCache = {};
    setColors = function(colors) {
      var c, col, o, ref, ref1, ref2, w;
      if (colors == null) {
        colors = ['#fff', '#000'];
      }
      if ((colors != null) && type(colors) === 'string' && (((ref = chroma.brewer) != null ? ref[colors] : void 0) != null)) {
        colors = chroma.brewer[colors];
      }
      if (type(colors) === 'array') {
        colors = colors.slice(0);
        for (c = o = 0, ref1 = colors.length - 1; 0 <= ref1 ? o <= ref1 : o >= ref1; c = 0 <= ref1 ? ++o : --o) {
          col = colors[c];
          if (type(col) === "string") {
            colors[c] = chroma(col);
          }
        }
        _pos.length = 0;
        for (c = w = 0, ref2 = colors.length - 1; 0 <= ref2 ? w <= ref2 : w >= ref2; c = 0 <= ref2 ? ++w : --w) {
          _pos.push(c / (colors.length - 1));
        }
      }
      resetCache();
      return _colors = colors;
    };
    getClass = function(value) {
      var i, n;
      if (_classes != null) {
        n = _classes.length - 1;
        i = 0;
        while (i < n && value >= _classes[i]) {
          i++;
        }
        return i - 1;
      }
      return 0;
    };
    tmap = function(t) {
      return t;
    };
    classifyValue = function(value) {
      var i, maxc, minc, n, val;
      val = value;
      if (_classes.length > 2) {
        n = _classes.length - 1;
        i = getClass(value);
        minc = _classes[0] + (_classes[1] - _classes[0]) * (0 + _spread * 0.5);
        maxc = _classes[n - 1] + (_classes[n] - _classes[n - 1]) * (1 - _spread * 0.5);
        val = _min + ((_classes[i] + (_classes[i + 1] - _classes[i]) * 0.5 - minc) / (maxc - minc)) * (_max - _min);
      }
      return val;
    };
    getColor = function(val, bypassMap) {
      var c, col, i, k, o, p, ref, t;
      if (bypassMap == null) {
        bypassMap = false;
      }
      if (isNaN(val)) {
        return _nacol;
      }
      if (!bypassMap) {
        if (_classes && _classes.length > 2) {
          c = getClass(val);
          t = c / (_classes.length - 2);
          t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));
        } else if (_max !== _min) {
          t = (val - _min) / (_max - _min);
          t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));
          t = Math.min(1, Math.max(0, t));
        } else {
          t = 1;
        }
      } else {
        t = val;
      }
      if (!bypassMap) {
        t = tmap(t);
      }
      k = Math.floor(t * 10000);
      if (_colorCache[k]) {
        col = _colorCache[k];
      } else {
        if (type(_colors) === 'array') {
          for (i = o = 0, ref = _pos.length - 1; 0 <= ref ? o <= ref : o >= ref; i = 0 <= ref ? ++o : --o) {
            p = _pos[i];
            if (t <= p) {
              col = _colors[i];
              break;
            }
            if (t >= p && i === _pos.length - 1) {
              col = _colors[i];
              break;
            }
            if (t > p && t < _pos[i + 1]) {
              t = (t - p) / (_pos[i + 1] - p);
              col = chroma.interpolate(_colors[i], _colors[i + 1], t, _mode);
              break;
            }
          }
        } else if (type(_colors) === 'function') {
          col = _colors(t);
        }
        _colorCache[k] = col;
      }
      return col;
    };
    resetCache = function() {
      return _colorCache = {};
    };
    setColors(colors);
    f = function(v) {
      var c;
      c = chroma(getColor(v));
      if (_out && c[_out]) {
        return c[_out]();
      } else {
        return c;
      }
    };
    f.classes = function(classes) {
      var d;
      if (classes != null) {
        if (type(classes) === 'array') {
          _classes = classes;
          _domain = [classes[0], classes[classes.length - 1]];
        } else {
          d = chroma.analyze(_domain);
          if (classes === 0) {
            _classes = [d.min, d.max];
          } else {
            _classes = chroma.limits(d, 'e', classes);
          }
        }
        return f;
      }
      return _classes;
    };
    f.domain = function(domain) {
      var c, d, k, len, o, ref, w;
      if (!arguments.length) {
        return _domain;
      }
      _min = domain[0];
      _max = domain[domain.length - 1];
      _pos = [];
      k = _colors.length;
      if (domain.length === k && _min !== _max) {
        for (o = 0, len = domain.length; o < len; o++) {
          d = domain[o];
          _pos.push((d - _min) / (_max - _min));
        }
      } else {
        for (c = w = 0, ref = k - 1; 0 <= ref ? w <= ref : w >= ref; c = 0 <= ref ? ++w : --w) {
          _pos.push(c / (k - 1));
        }
      }
      _domain = [_min, _max];
      return f;
    };
    f.mode = function(_m) {
      if (!arguments.length) {
        return _mode;
      }
      _mode = _m;
      resetCache();
      return f;
    };
    f.range = function(colors, _pos) {
      setColors(colors, _pos);
      return f;
    };
    f.out = function(_o) {
      _out = _o;
      return f;
    };
    f.spread = function(val) {
      if (!arguments.length) {
        return _spread;
      }
      _spread = val;
      return f;
    };
    f.correctLightness = function(v) {
      if (v == null) {
        v = true;
      }
      _correctLightness = v;
      resetCache();
      if (_correctLightness) {
        tmap = function(t) {
          var L0, L1, L_actual, L_diff, L_ideal, max_iter, pol, t0, t1;
          L0 = getColor(0, true).lab()[0];
          L1 = getColor(1, true).lab()[0];
          pol = L0 > L1;
          L_actual = getColor(t, true).lab()[0];
          L_ideal = L0 + (L1 - L0) * t;
          L_diff = L_actual - L_ideal;
          t0 = 0;
          t1 = 1;
          max_iter = 20;
          while (Math.abs(L_diff) > 1e-2 && max_iter-- > 0) {
            (function() {
              if (pol) {
                L_diff *= -1;
              }
              if (L_diff < 0) {
                t0 = t;
                t += (t1 - t) * 0.5;
              } else {
                t1 = t;
                t += (t0 - t) * 0.5;
              }
              L_actual = getColor(t, true).lab()[0];
              return L_diff = L_actual - L_ideal;
            })();
          }
          return t;
        };
      } else {
        tmap = function(t) {
          return t;
        };
      }
      return f;
    };
    f.padding = function(p) {
      if (p != null) {
        if (type(p) === 'number') {
          p = [p, p];
        }
        _padding = p;
        return f;
      } else {
        return _padding;
      }
    };
    f.colors = function() {
      var dd, dm, i, numColors, o, out, ref, results, samples, w;
      numColors = 0;
      out = 'hex';
      if (arguments.length === 0) {
        return _colors.map(function(c) {
          return c[out]();
        });
      }
      if (arguments.length === 1) {
        if (type(arguments[0]) === 'string') {
          out = arguments[0];
        } else {
          numColors = arguments[0];
        }
      }
      if (arguments.length === 2) {
        numColors = arguments[0], out = arguments[1];
      }
      if (numColors) {
        dm = _domain[0];
        dd = _domain[1] - dm;
        return (function() {
          results = [];
          for (var o = 0; 0 <= numColors ? o < numColors : o > numColors; 0 <= numColors ? o++ : o--){ results.push(o); }
          return results;
        }).apply(this).map(function(i) {
          return f(dm + i / (numColors - 1) * dd)[out]();
        });
      }
      colors = [];
      samples = [];
      if (_classes && _classes.length > 2) {
        for (i = w = 1, ref = _classes.length; 1 <= ref ? w < ref : w > ref; i = 1 <= ref ? ++w : --w) {
          samples.push((_classes[i - 1] + _classes[i]) * 0.5);
        }
      } else {
        samples = _domain;
      }
      return samples.map(function(v) {
        return f(v)[out]();
      });
    };
    return f;
  };

  if (chroma.scales == null) {
    chroma.scales = {};
  }

  chroma.scales.cool = function() {
    return chroma.scale([chroma.hsl(180, 1, .9), chroma.hsl(250, .7, .4)]);
  };

  chroma.scales.hot = function() {
    return chroma.scale(['#000', '#f00', '#ff0', '#fff'], [0, .25, .75, 1]).mode('rgb');
  };

  chroma.analyze = function(data, key, filter) {
    var add, k, len, o, r, val, visit;
    r = {
      min: Number.MAX_VALUE,
      max: Number.MAX_VALUE * -1,
      sum: 0,
      values: [],
      count: 0
    };
    if (filter == null) {
      filter = function() {
        return true;
      };
    }
    add = function(val) {
      if ((val != null) && !isNaN(val)) {
        r.values.push(val);
        r.sum += val;
        if (val < r.min) {
          r.min = val;
        }
        if (val > r.max) {
          r.max = val;
        }
        r.count += 1;
      }
    };
    visit = function(val, k) {
      if (filter(val, k)) {
        if ((key != null) && type(key) === 'function') {
          return add(key(val));
        } else if ((key != null) && type(key) === 'string' || type(key) === 'number') {
          return add(val[key]);
        } else {
          return add(val);
        }
      }
    };
    if (type(data) === 'array') {
      for (o = 0, len = data.length; o < len; o++) {
        val = data[o];
        visit(val);
      }
    } else {
      for (k in data) {
        val = data[k];
        visit(val, k);
      }
    }
    r.domain = [r.min, r.max];
    r.limits = function(mode, num) {
      return chroma.limits(r, mode, num);
    };
    return r;
  };

  chroma.limits = function(data, mode, num) {
    var aa, ab, ac, ad, ae, af, ag, ah, ai, aj, ak, al, am, assignments, best, centroids, cluster, clusterSizes, dist, i, j, kClusters, limits, max_log, min, min_log, mindist, n, nb_iters, newCentroids, o, p, pb, pr, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, repeat, sum, tmpKMeansBreaks, value, values, w;
    if (mode == null) {
      mode = 'equal';
    }
    if (num == null) {
      num = 7;
    }
    if (type(data) === 'array') {
      data = chroma.analyze(data);
    }
    min = data.min;
    max = data.max;
    sum = data.sum;
    values = data.values.sort(function(a, b) {
      return a - b;
    });
    limits = [];
    if (mode.substr(0, 1) === 'c') {
      limits.push(min);
      limits.push(max);
    }
    if (mode.substr(0, 1) === 'e') {
      limits.push(min);
      for (i = o = 1, ref = num - 1; 1 <= ref ? o <= ref : o >= ref; i = 1 <= ref ? ++o : --o) {
        limits.push(min + (i / num) * (max - min));
      }
      limits.push(max);
    } else if (mode.substr(0, 1) === 'l') {
      if (min <= 0) {
        throw 'Logarithmic scales are only possible for values > 0';
      }
      min_log = Math.LOG10E * log(min);
      max_log = Math.LOG10E * log(max);
      limits.push(min);
      for (i = w = 1, ref1 = num - 1; 1 <= ref1 ? w <= ref1 : w >= ref1; i = 1 <= ref1 ? ++w : --w) {
        limits.push(pow(10, min_log + (i / num) * (max_log - min_log)));
      }
      limits.push(max);
    } else if (mode.substr(0, 1) === 'q') {
      limits.push(min);
      for (i = aa = 1, ref2 = num - 1; 1 <= ref2 ? aa <= ref2 : aa >= ref2; i = 1 <= ref2 ? ++aa : --aa) {
        p = values.length * i / num;
        pb = floor(p);
        if (pb === p) {
          limits.push(values[pb]);
        } else {
          pr = p - pb;
          limits.push(values[pb] * pr + values[pb + 1] * (1 - pr));
        }
      }
      limits.push(max);
    } else if (mode.substr(0, 1) === 'k') {

      /*
      implementation based on
      http://code.google.com/p/figue/source/browse/trunk/figue.js#336
      simplified for 1-d input values
       */
      n = values.length;
      assignments = new Array(n);
      clusterSizes = new Array(num);
      repeat = true;
      nb_iters = 0;
      centroids = null;
      centroids = [];
      centroids.push(min);
      for (i = ab = 1, ref3 = num - 1; 1 <= ref3 ? ab <= ref3 : ab >= ref3; i = 1 <= ref3 ? ++ab : --ab) {
        centroids.push(min + (i / num) * (max - min));
      }
      centroids.push(max);
      while (repeat) {
        for (j = ac = 0, ref4 = num - 1; 0 <= ref4 ? ac <= ref4 : ac >= ref4; j = 0 <= ref4 ? ++ac : --ac) {
          clusterSizes[j] = 0;
        }
        for (i = ad = 0, ref5 = n - 1; 0 <= ref5 ? ad <= ref5 : ad >= ref5; i = 0 <= ref5 ? ++ad : --ad) {
          value = values[i];
          mindist = Number.MAX_VALUE;
          for (j = ae = 0, ref6 = num - 1; 0 <= ref6 ? ae <= ref6 : ae >= ref6; j = 0 <= ref6 ? ++ae : --ae) {
            dist = abs(centroids[j] - value);
            if (dist < mindist) {
              mindist = dist;
              best = j;
            }
          }
          clusterSizes[best]++;
          assignments[i] = best;
        }
        newCentroids = new Array(num);
        for (j = af = 0, ref7 = num - 1; 0 <= ref7 ? af <= ref7 : af >= ref7; j = 0 <= ref7 ? ++af : --af) {
          newCentroids[j] = null;
        }
        for (i = ag = 0, ref8 = n - 1; 0 <= ref8 ? ag <= ref8 : ag >= ref8; i = 0 <= ref8 ? ++ag : --ag) {
          cluster = assignments[i];
          if (newCentroids[cluster] === null) {
            newCentroids[cluster] = values[i];
          } else {
            newCentroids[cluster] += values[i];
          }
        }
        for (j = ah = 0, ref9 = num - 1; 0 <= ref9 ? ah <= ref9 : ah >= ref9; j = 0 <= ref9 ? ++ah : --ah) {
          newCentroids[j] *= 1 / clusterSizes[j];
        }
        repeat = false;
        for (j = ai = 0, ref10 = num - 1; 0 <= ref10 ? ai <= ref10 : ai >= ref10; j = 0 <= ref10 ? ++ai : --ai) {
          if (newCentroids[j] !== centroids[i]) {
            repeat = true;
            break;
          }
        }
        centroids = newCentroids;
        nb_iters++;
        if (nb_iters > 200) {
          repeat = false;
        }
      }
      kClusters = {};
      for (j = aj = 0, ref11 = num - 1; 0 <= ref11 ? aj <= ref11 : aj >= ref11; j = 0 <= ref11 ? ++aj : --aj) {
        kClusters[j] = [];
      }
      for (i = ak = 0, ref12 = n - 1; 0 <= ref12 ? ak <= ref12 : ak >= ref12; i = 0 <= ref12 ? ++ak : --ak) {
        cluster = assignments[i];
        kClusters[cluster].push(values[i]);
      }
      tmpKMeansBreaks = [];
      for (j = al = 0, ref13 = num - 1; 0 <= ref13 ? al <= ref13 : al >= ref13; j = 0 <= ref13 ? ++al : --al) {
        tmpKMeansBreaks.push(kClusters[j][0]);
        tmpKMeansBreaks.push(kClusters[j][kClusters[j].length - 1]);
      }
      tmpKMeansBreaks = tmpKMeansBreaks.sort(function(a, b) {
        return a - b;
      });
      limits.push(tmpKMeansBreaks[0]);
      for (i = am = 1, ref14 = tmpKMeansBreaks.length - 1; am <= ref14; i = am += 2) {
        if (!isNaN(tmpKMeansBreaks[i])) {
          limits.push(tmpKMeansBreaks[i]);
        }
      }
    }
    return limits;
  };

  hsi2rgb = function(h, s, i) {

    /*
    borrowed from here:
    http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
     */
    var args, b, g, r;
    args = unpack(arguments);
    h = args[0], s = args[1], i = args[2];
    h /= 360;
    if (h < 1 / 3) {
      b = (1 - s) / 3;
      r = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
      g = 1 - (b + r);
    } else if (h < 2 / 3) {
      h -= 1 / 3;
      r = (1 - s) / 3;
      g = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
      b = 1 - (r + g);
    } else {
      h -= 2 / 3;
      g = (1 - s) / 3;
      b = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
      r = 1 - (g + b);
    }
    r = limit(i * r * 3);
    g = limit(i * g * 3);
    b = limit(i * b * 3);
    return [r * 255, g * 255, b * 255, args.length > 3 ? args[3] : 1];
  };

  rgb2hsi = function() {

    /*
    borrowed from here:
    http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
     */
    var b, g, h, i, min, r, ref, s;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    TWOPI = Math.PI * 2;
    r /= 255;
    g /= 255;
    b /= 255;
    min = Math.min(r, g, b);
    i = (r + g + b) / 3;
    s = 1 - min / i;
    if (s === 0) {
      h = 0;
    } else {
      h = ((r - g) + (r - b)) / 2;
      h /= Math.sqrt((r - g) * (r - g) + (r - b) * (g - b));
      h = Math.acos(h);
      if (b > g) {
        h = TWOPI - h;
      }
      h /= TWOPI;
    }
    return [h * 360, s, i];
  };

  chroma.hsi = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['hsi']), function(){});
  };

  _input.hsi = hsi2rgb;

  Color.prototype.hsi = function() {
    return rgb2hsi(this._rgb);
  };

  interpolate_hsx = function(col1, col2, f, m) {
    var dh, hue, hue0, hue1, lbv, lbv0, lbv1, res, sat, sat0, sat1, xyz0, xyz1;
    if (m === 'hsl') {
      xyz0 = col1.hsl();
      xyz1 = col2.hsl();
    } else if (m === 'hsv') {
      xyz0 = col1.hsv();
      xyz1 = col2.hsv();
    } else if (m === 'hsi') {
      xyz0 = col1.hsi();
      xyz1 = col2.hsi();
    } else if (m === 'lch' || m === 'hcl') {
      m = 'hcl';
      xyz0 = col1.hcl();
      xyz1 = col2.hcl();
    }
    if (m.substr(0, 1) === 'h') {
      hue0 = xyz0[0], sat0 = xyz0[1], lbv0 = xyz0[2];
      hue1 = xyz1[0], sat1 = xyz1[1], lbv1 = xyz1[2];
    }
    if (!isNaN(hue0) && !isNaN(hue1)) {
      if (hue1 > hue0 && hue1 - hue0 > 180) {
        dh = hue1 - (hue0 + 360);
      } else if (hue1 < hue0 && hue0 - hue1 > 180) {
        dh = hue1 + 360 - hue0;
      } else {
        dh = hue1 - hue0;
      }
      hue = hue0 + f * dh;
    } else if (!isNaN(hue0)) {
      hue = hue0;
      if ((lbv1 === 1 || lbv1 === 0) && m !== 'hsv') {
        sat = sat0;
      }
    } else if (!isNaN(hue1)) {
      hue = hue1;
      if ((lbv0 === 1 || lbv0 === 0) && m !== 'hsv') {
        sat = sat1;
      }
    } else {
      hue = Number.NaN;
    }
    if (sat == null) {
      sat = sat0 + f * (sat1 - sat0);
    }
    lbv = lbv0 + f * (lbv1 - lbv0);
    return res = chroma[m](hue, sat, lbv);
  };

  _interpolators = _interpolators.concat((function() {
    var len, o, ref, results;
    ref = ['hsv', 'hsl', 'hsi', 'hcl', 'lch'];
    results = [];
    for (o = 0, len = ref.length; o < len; o++) {
      m = ref[o];
      results.push([m, interpolate_hsx]);
    }
    return results;
  })());

  interpolate_num = function(col1, col2, f, m) {
    var n1, n2;
    n1 = col1.num();
    n2 = col2.num();
    return chroma.num(n1 + (n2 - n1) * f, 'num');
  };

  _interpolators.push(['num', interpolate_num]);

  interpolate_lab = function(col1, col2, f, m) {
    var res, xyz0, xyz1;
    xyz0 = col1.lab();
    xyz1 = col2.lab();
    return res = new Color(xyz0[0] + f * (xyz1[0] - xyz0[0]), xyz0[1] + f * (xyz1[1] - xyz0[1]), xyz0[2] + f * (xyz1[2] - xyz0[2]), m);
  };

  _interpolators.push(['lab', interpolate_lab]);

}).call(this);

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/chroma-js/chroma.js","/../../node_modules/chroma-js")
},{"buffer":2,"rH1JPG":5}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/ieee754/index.js","/../../node_modules/ieee754")
},{"buffer":2,"rH1JPG":5}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/process/browser.js","/../../node_modules/process")
},{"buffer":2,"rH1JPG":5}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decToBin = decToBin;
exports.eliminateTerms = eliminateTerms;
exports.solveGroup = solveGroup;
exports.binaryTermToVarTerm = binaryTermToVarTerm;
exports.getExpansionFormula = getExpansionFormula;
exports.getMintermExpansionFormula = getMintermExpansionFormula;
exports.getMaxtermExpansionFormula = getMaxtermExpansionFormula;
/*
* Returns the binary representation of the number left padded to the number of vars
* @param {number} num -  a number to be converted
* @param {number} vars - the amount of vars the number should be represented in
* @return {string} the binary representation of the number
*/
function decToBin(num, vars) {
  if (num > Math.pow(2, vars) - 1 || num < 0) throw new Error('Invalid Number');

  var num = '' + num.toString(2);
  var pad = '0'.repeat(vars); // its just 5 0's for the max var nums

  return pad.substring(0, pad.length - num.length) + num;
}

/*
* Returns the result of applying Elimination Theorem to the two terms
* @param {string} term1 - the first term
* @param {string} term2 - the second term
* @return {string} the result of Elimination Theorem
*/
function eliminateTerms(term1, term2) {
  term1 = term1.split('');
  term2 = term2.split('');

  var numDiff = 0;

  for (var i = 0; i < term1.length; i++) {
    if (term1[i] != term2[i]) {
      term1[i] = '-';
      numDiff++;
      if (numDiff > 1) throw new Error('Unsimplifiable Terms Given');
    }
  }

  return term1.join('');
}

/*
* Returns a group of terms solved using Elimination Theorem, represented as a string
* @param {Array.Cell}  group - group to simplify
* @param {number} vars - number of vars for the kmap
* @return {string} the simplified group
*/
function solveGroup(group, vars) {
  if (group.length & group.length - 1 && group.length != 1 || group.length > Math.pow(2, vars)) throw new Error("Invalid Group");

  var term1;
  var term2;

  if (group.length > 2) {
    term1 = solveGroup(group.slice(0, group.length / 2), vars);
    term2 = solveGroup(group.slice(group.length / 2), vars);
    return eliminateTerms(term1, term2);
  } else if (group.length < 2) {
    return decToBin(group[0].val, vars);
  }

  term1 = group[0].val;
  term2 = group[1].val;

  return eliminateTerms(decToBin(term1, vars), decToBin(term2, vars));
}

/*
* Returns a variable representation of a term
* @param {string} term
* @return {string} the converted term
*/
function binaryTermToVarTerm(term) {
  if (term === "") return "Undefined Term";
  term = term.split('');
  var string = "";

  for (var i = 0; i < term.length; i++) {
    if (term[i] === "-") continue;
    string += String.fromCharCode(65 + i);
    if (term[i] === "0") string += "'";
  }

  return string;
}

/*
* Returns the expansion formula for the array of groups
* @param {Array.Array.Cell} groups - groups to expand
* @param {number} vars - number of vars in the map
* @return {string} the expansionFormula
*/
function getExpansionFormula(groups, vars, expansionType) {
  switch (expansionType) {
    case 1:
      return getMintermExpansionFormula(groups, vars);
      break;
    case 0:
      return getMaxtermExpansionFormula(groups, vars);
      break;
    default:
      return "Undefined Formula";
      break;
  }
}

function getMintermExpansionFormula(groups, vars) {
  var formula = "F = ";

  for (var i = 0; i < groups.length; i++) {
    var term;

    if (groups[i].cellArray.length > 1) {
      term = solveGroup(groups[i].cellArray, vars);
    } else {
      term = decToBin(groups[i].cellArray[0].val, vars);
    }

    formula += binaryTermToVarTerm(term);

    if (i != groups.length - 1) formula += " + ";
  }

  return formula;
}

function getMaxtermExpansionFormula(groups, vars) {
  var formula = "F = ";

  for (var i = 0; i < groups.length; i++) {
    formula += "(";
    var term;

    if (groups[i].cellArray.length > 1) {
      term = solveGroup(groups[i].cellArray, vars);
    } else {
      term = decToBin(groups[i].cellArray[0].val, vars);
    }

    term = binaryTermToVarTerm(term).split('');

    for (var j = 0; j < term.length; j++) {
      formula += term[j];
      if (term[j + 1] === "'") {
        formula += term[j + 1];
        j++;
      }
      console.log(term[j]);
      if (j != term.length - 1) formula += " + ";
    }

    formula += ")";
  }

  return formula;
}
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/classes/BinaryFunctions.js","/classes")
},{"buffer":2,"rH1JPG":5}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Point2 = require('./Point');

var _Point3 = _interopRequireDefault(_Point2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Cell class
var Cell = function (_Point) {
  _inherits(Cell, _Point);

  function Cell(val, x, y) {
    _classCallCheck(this, Cell);

    if (typeof val !== 'number' || val % 1 !== 0 || val < 0) throw new Error('val must be a valid positive integer.');

    var _this = _possibleConstructorReturn(this, (Cell.__proto__ || Object.getPrototypeOf(Cell)).call(this, x, y));

    _this.val = Number(val);
    _this.status = '';
    return _this;
  }

  return Cell;
}(_Point3.default);

exports.default = Cell;
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/classes/Cell.js","/classes")
},{"./Point":11,"buffer":2,"rH1JPG":5}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Cell = require('./Cell');

var _Cell2 = _interopRequireDefault(_Cell);

var _Point = require('./Point');

var _Point2 = _interopRequireDefault(_Point);

var _Group = require('./Group');

var _Group2 = _interopRequireDefault(_Group);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CellArray = function () {
  function CellArray(vars, expansionType) {
    _classCallCheck(this, CellArray);

    this.vars = vars;
    this.expansionType = expansionType;
    this.cells = new Array();

    this.cells[0] = new Array();
    this.cells[0].push(new _Cell2.default(0, 0, 0));
    this.cells[0].push(new _Cell2.default(4, 1, 0));

    this.cells[1] = new Array();
    this.cells[1].push(new _Cell2.default(1, 0, 1));
    this.cells[1].push(new _Cell2.default(5, 1, 1));

    this.cells[2] = new Array();
    this.cells[2].push(new _Cell2.default(3, 0, 2));
    this.cells[2].push(new _Cell2.default(7, 1, 2));

    this.cells[3] = new Array();
    this.cells[3].push(new _Cell2.default(2, 0, 3));
    this.cells[3].push(new _Cell2.default(6, 1, 3));

    if (this.vars > 3) {

      this.cells[0].push(new _Cell2.default(12, 2, 0));
      this.cells[0].push(new _Cell2.default(8, 3, 0));

      this.cells[1].push(new _Cell2.default(13, 2, 1));
      this.cells[1].push(new _Cell2.default(9, 3, 1));

      this.cells[2].push(new _Cell2.default(15, 2, 2));
      this.cells[2].push(new _Cell2.default(11, 3, 2));

      this.cells[3].push(new _Cell2.default(14, 2, 3));
      this.cells[3].push(new _Cell2.default(10, 3, 3));
    }
    // holds all marked groups
  }

  _createClass(CellArray, [{
    key: 'mark',
    value: function mark(terms) {
      for (var i = 0; i < terms.length; i++) {
        // for each term
        for (var j = 0; j < this.cells.length; j++) {
          for (var k = 0; k < this.cells[j].length; k++) {
            if (this.cells[j][k].val === i) {
              this.cells[j][k].status = terms[i];
            }
          }
        }
      }
    }
  }, {
    key: 'reset',
    value: function reset() {
      for (var i = 0; i < this.cells.length; i++) {
        for (var j = 0; j < this.cells[i].length; j++) {
          this.cells[i][j].status = '';
        }
      }
    }

    //Writing this near midnight
    // TODO: write it better later

  }, {
    key: 'getGroups',
    value: function getGroups() {
      var marked = [];
      // used to skip some group checks
      var numActive = 0;

      // TODO: refractor to work with maxterms
      for (var i = 0; i < this.cells.length; i++) {
        for (var j = 0; j < this.cells[i].length; j++) {
          if (this.cells[i][j].status != !this.expansionType) numActive++;
        }
      }

      // marks every cell and returns early to save proccessing time
      if (numActive >= Math.pow(2, this.vars)) {
        // draws if all are on
        var group = [];

        for (var _i = 0; _i < this.cells.length; _i++) {
          for (var _j = 0; _j < this.cells[_i].length; _j++) {
            group.push(this.cells[_i][_j]);
          }
        }

        marked.push(new _Group2.default(group, "full"));

        return marked; // all are marked
      }

      if (numActive >= 8 && this.vars > 3) {
        //mark 2x4's
        for (var _i2 = 0; _i2 < Math.pow(2, this.vars - 2); _i2++) {
          var rootPoint = this.get(_i2, 0);
          var secondPoint = this.get(_i2, 1);
          var thirdPoint = this.get(_i2, 2);
          var fourthPoint = this.get(_i2, 3);
          var fifthPoint = this.get(_i2 + 1, 0);
          var sixthPoint = this.get(_i2 + 1, 1);
          var seventhPoint = this.get(_i2 + 1, 2);
          var eighthPoint = this.get(_i2 + 1, 3);

          if (rootPoint.status != !this.expansionType && secondPoint.status != !this.expansionType && thirdPoint.status != !this.expansionType && fourthPoint.status != !this.expansionType && fifthPoint.status != !this.expansionType && sixthPoint.status != !this.expansionType && seventhPoint.status != !this.expansionType && eighthPoint.status != !this.expansionType && (rootPoint.status == this.expansionType || secondPoint.status == this.expansionType || thirdPoint.status == this.expansionType || fourthPoint.status == this.expansionType || fifthPoint.status == this.expansionType || sixthPoint.status == this.expansionType || seventhPoint.status == this.expansionType || eighthPoint.status == this.expansionType)) {
            var _group = [];

            _group.push(rootPoint);
            _group.push(secondPoint);
            _group.push(thirdPoint);
            _group.push(fourthPoint);
            _group.push(fifthPoint);
            _group.push(sixthPoint);
            _group.push(seventhPoint);
            _group.push(eighthPoint);

            var wrapper = new _Group2.default(_group, "2x4");
            if (this.isGroupUnique(marked, wrapper)) marked.push(wrapper);
          }
        }

        //mark 4x2's
        for (var _i3 = 0; _i3 < Math.pow(2, this.vars - 2); _i3++) {
          var _rootPoint = this.get(0, _i3);
          var _secondPoint = this.get(1, _i3);
          var _thirdPoint = this.get(2, _i3);
          var _fourthPoint = this.get(3, _i3);
          var _fifthPoint = this.get(0, _i3 + 1);
          var _sixthPoint = this.get(1, _i3 + 1);
          var _seventhPoint = this.get(2, _i3 + 1);
          var _eighthPoint = this.get(3, _i3 + 1);

          if (_rootPoint.status != !this.expansionType && _secondPoint.status != !this.expansionType && _thirdPoint.status != !this.expansionType && _fourthPoint.status != !this.expansionType && _fifthPoint.status != !this.expansionType && _sixthPoint.status != !this.expansionType && _seventhPoint.status != !this.expansionType && _eighthPoint.status != !this.expansionType && (_rootPoint.status == this.expansionType || _secondPoint.status == this.expansionType || _thirdPoint.status == this.expansionType || _fourthPoint.status == this.expansionType || _fifthPoint.status == this.expansionType || _sixthPoint.status == this.expansionType || _seventhPoint.status == this.expansionType || _eighthPoint.status == this.expansionType)) {
            var _group2 = [];

            _group2.push(_rootPoint);
            _group2.push(_secondPoint);
            _group2.push(_thirdPoint);
            _group2.push(_fourthPoint);
            _group2.push(_fifthPoint);
            _group2.push(_sixthPoint);
            _group2.push(_seventhPoint);
            _group2.push(_eighthPoint);

            var _wrapper = new _Group2.default(_group2, "4x2");
            if (this.isGroupUnique(marked, _wrapper)) marked.push(_wrapper);
          }
        }
      }

      if (numActive >= 4) {
        //marks horizontal 'quads'
        if (this.vars > 3) {
          for (var _i4 = 0; _i4 < Math.pow(2, this.vars - 2); _i4++) {
            var _rootPoint2 = this.get(0, _i4);
            var _secondPoint2 = this.get(1, _i4);
            var _thirdPoint2 = this.get(2, _i4);
            var _fourthPoint2 = this.get(3, _i4);

            if (_rootPoint2.status != !this.expansionType && _secondPoint2.status != !this.expansionType && _thirdPoint2.status != !this.expansionType && _fourthPoint2.status != !this.expansionType && (_rootPoint2.status == this.expansionType || _secondPoint2.status == this.expansionType || _thirdPoint2.status == this.expansionType || _fourthPoint2.status == this.expansionType)) {
              var _group3 = [];

              _group3.push(_rootPoint2);
              _group3.push(_secondPoint2);
              _group3.push(_thirdPoint2);
              _group3.push(_fourthPoint2);

              var _wrapper2 = new _Group2.default(_group3, "4x1");
              if (this.isGroupUnique(marked, _wrapper2)) marked.push(_wrapper2);
            }
          }
        }

        //marks vertical 'quads'
        for (var _i5 = 0; _i5 < Math.pow(2, this.vars - 2); _i5++) {
          var _rootPoint3 = this.get(_i5, 0);
          var _secondPoint3 = this.get(_i5, 1);
          var _thirdPoint3 = this.get(_i5, 2);
          var _fourthPoint3 = this.get(_i5, 3);

          if (_rootPoint3.status != !this.expansionType && _secondPoint3.status != !this.expansionType && _thirdPoint3.status != !this.expansionType && _fourthPoint3.status != !this.expansionType && (_rootPoint3.status == this.expansionType || _secondPoint3.status == this.expansionType || _thirdPoint3.status == this.expansionType || _fourthPoint3.status == this.expansionType)) {
            var _group4 = [];

            _group4.push(_rootPoint3);
            _group4.push(_secondPoint3);
            _group4.push(_thirdPoint3);
            _group4.push(_fourthPoint3);

            var _wrapper3 = new _Group2.default(_group4, "1x4");
            if (this.isGroupUnique(marked, _wrapper3)) marked.push(_wrapper3);
          }
        }

        //marks 'boxes'
        for (var _i6 = 0; _i6 < 4; _i6++) {
          // TODO: MAKE MATH.POW STUFF A CONSTANT
          for (var _j2 = 0; _j2 < Math.pow(2, this.vars - 2); _j2++) {
            var _rootPoint4 = this.get(_j2, _i6);
            var _secondPoint4 = this.get(_j2 + 1, _i6);
            var _thirdPoint4 = this.get(_j2, _i6 + 1);
            var _fourthPoint4 = this.get(_j2 + 1, _i6 + 1);

            if (_rootPoint4.status != !this.expansionType && _secondPoint4.status != !this.expansionType && _thirdPoint4.status != !this.expansionType && _fourthPoint4.status != !this.expansionType && (_rootPoint4.status == this.expansionType || _secondPoint4.status == this.expansionType || _thirdPoint4.status == this.expansionType || _fourthPoint4.status == this.expansionType)) {
              var _group5 = [];

              _group5.push(_rootPoint4);
              _group5.push(_secondPoint4);
              _group5.push(_thirdPoint4);
              _group5.push(_fourthPoint4);

              var _wrapper4 = new _Group2.default(_group5, "2x2");
              if (this.isGroupUnique(marked, _wrapper4)) marked.push(_wrapper4);
            }
          }
        }
      }

      // TODO: remove verbose searches
      if (numActive >= 2) {
        for (var _i7 = 0; _i7 < Math.pow(2, this.vars - 2); _i7++) {
          for (var _j3 = 0; _j3 < 4; _j3++) {
            var _rootPoint5 = this.get(_i7, _j3);

            //horizontal
            var _secondPoint5 = this.get(_i7 + 1, _j3);
            if (_rootPoint5.status != !this.expansionType && _secondPoint5.status != !this.expansionType && (_rootPoint5.status == this.expansionType || _secondPoint5.status == this.expansionType)) {
              var _group6 = [];
              _group6.push(_rootPoint5);
              _group6.push(_secondPoint5);

              var _wrapper5 = new _Group2.default(_group6, "2x1");
              if (this.isGroupUnique(marked, _wrapper5)) marked.push(_wrapper5);
            }

            //vertical
            var secondPointV = this.get(_i7, _j3 + 1);
            if (_rootPoint5.status != !this.expansionType && secondPointV.status != !this.expansionType && (_rootPoint5.status == this.expansionType || secondPointV.status == this.expansionType)) {
              var _group7 = [];
              _group7.push(_rootPoint5);
              _group7.push(secondPointV);

              var _wrapper6 = new _Group2.default(_group7, "1x2");
              if (this.isGroupUnique(marked, _wrapper6)) marked.push(_wrapper6);
            }
          }
        }
      }

      if (numActive >= 1) {
        for (var _i8 = 0; _i8 < Math.pow(2, this.vars - 2); _i8++) {
          for (var _j4 = 0; _j4 < 4; _j4++) {
            var _group8 = [];
            var point = this.get(_i8, _j4);
            _group8.push(point);

            var _wrapper7 = new _Group2.default(_group8, "1x1");
            if (point.status == this.expansionType && this.isGroupUnique(marked, _wrapper7)) marked.push(_wrapper7);
          }
        }
      }

      return marked;
    }

    // mods coords for overflow and swaps them because array xy and map xy are flipped

  }, {
    key: 'get',
    value: function get(x, y) {
      return this.cells[y % 4][x % Math.pow(2, this.vars - 2)];
    }
  }, {
    key: 'isGroupUnique',
    value: function isGroupUnique(marked, group) {
      if (typeof marked === 'undefined' || marked === null) {
        console.log('marked is empty');
        return true;
      }

      for (var i = 0; i < marked.length; i++) {
        //for each marked group
        var matches = [];

        for (var j = 0; j < group.cellArray.length; j++) {
          // for each point in the group
          for (var k = 0; k < marked[i].cellArray.length; k++) {
            // for each point in the marked group
            if (marked[i].cellArray[k].x == group.cellArray[j].x && marked[i].cellArray[k].y == group.cellArray[j].y) {
              matches.push(group[j]);
            }
          }
        }

        if (matches.length > group.cellArray.length / 2) return false;
      }

      return true;
    }
  }, {
    key: 'simplifyGroups',
    value: function simplifyGroups(groups) {
      for (var i = groups.length - 1; i >= 0; i--) {
        // for each group
        var numberOfOnes = 0;
        var matches = 0;

        for (var j = 0; j < groups[i].cellArray.length; j++) {
          // for each point in the group
          // if it is a 1 increment number of ones otherwise skip this loop
          if (groups[i].cellArray[j].status != this.expansionType) continue;

          numberOfOnes++;

          // check every 1 in the array of groups for matching (x & y's) and
          // increment matches if it is in a different group than the current group
          pairing: for (var k = 0; k < groups.length; k++) {
            for (var l = 0; l < groups[k].cellArray.length; l++) {
              if (groups[k].cellArray[l].status == this.expansionType && groups[i].cellArray[j].x === groups[k].cellArray[l].x && groups[i].cellArray[j].y === groups[k].cellArray[l].y && i !== k) {
                matches++;
                break pairing; // used to break out of both loops
              }
            }
          }
        }

        // removes the group and decrements the count by 1
        if (matches && numberOfOnes && numberOfOnes === matches) {
          groups.splice(i, 1);
          i--;
        }
      }
      //TODO: ask professor if this is good
      return groups;
    }
  }, {
    key: 'cellsToPoints',
    value: function cellsToPoints(groups) {
      return groups.map(function (group) {
        return group.map(function (cell) {
          return new _Point2.default(cell.x, cell.y);
        });
      });
    }
  }]);

  return CellArray;
}();

exports.default = CellArray;
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/classes/CellArray.js","/classes")
},{"./Cell":7,"./Group":10,"./Point":11,"buffer":2,"rH1JPG":5}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.drawPoints = drawPoints;
exports.drawTerms = drawTerms;
exports.mark = mark;
exports.hexToRGB = hexToRGB;

var _chromaJs = require('chroma-js');

var _chromaJs2 = _interopRequireDefault(_chromaJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function drawPoints(ctx, scale, points) {
  var colors = _chromaJs2.default.scale(['#f44336', '#9c27b0', '#3f51b5', '#03a9f4', '#009688', '#8bc34a', '#ffeb3b', '#ff9800']).colors(12);

  for (var i = 0; i < points.length; i++) {
    var color = colors.splice(Math.floor(Math.random() * colors.length - 1), 1);
    var rgb = hexToRGB(color[0], 0.5);

    switch (points[i].type) {
      case "2x2":
        draw2x2(ctx, scale, points[i], rgb);
        continue;
        break;
      case "2x4":
        draw2x4(ctx, scale, points[i], rgb);
        continue;
        break;
      case "1x2":
        draw1x2(ctx, scale, points[i], rgb);
        continue;
        break;
      case "1x4":
        draw1x4(ctx, scale, points[i], rgb);
        continue;
        break;
      case "2x1":
        draw2x1(ctx, scale, points[i], rgb);
        continue;
        break;
      case "4x1":
        draw4x1(ctx, scale, points[i], rgb);ctx, scale, points[i], rgb;
        continue;
        break;
      case "1x1":
        mark(ctx, scale, points[i].cellArray[0].x, points[i].cellArray[0].y, 0, rgb);
        continue;
        break;
      default:
        console.log("error");
        break;
    }

    for (var j = 0; j < points[i].cellArray.length; j++) {
      console.log(rgb);
      mark(ctx, scale, points[i].cellArray[j].x, points[i].cellArray[j].y, 0, rgb);
    }
  }
}

function drawTerms(ctx, scale, cells) {
  ctx.font = '20pt Roboto';

  for (var i = 0; i < cells.length; i++) {
    for (var j = 0; j < cells[i].length; j++) {
      ctx.fillText(cells[i][j].status, scale * (cells[i][j].x + 1) + scale / 2, scale * (cells[i][j].y + 1) + scale / 2);
    }
  }
}

//draws a color on the matching cell
function mark(ctx, scale, x, y, rotation, color) {
  // saves current context state
  ctx.save();

  // translates the origin of the context
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  // rotates around the origin
  ctx.rotate(rotation * Math.PI / 180);

  //draws match color
  ctx.beginPath();

  ctx.fillStyle = color;
  // subtracts to center the match color
  ctx.fillRect(-scale / 2, -scale / 2, scale, scale);
  ctx.fillStyle = '#000';

  ctx.restore();
}

function markTL(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale / 10, -scale / 2 + scale / 10, scale - scale / 10, scale - scale / 10);

  ctx.stroke();
  ctx.restore();
}

function markTM(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2 + scale / 10, scale, scale - scale / 10);

  ctx.stroke();
  ctx.restore();
}

function markBM(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2, scale, scale - scale / 10);

  ctx.stroke();
  ctx.restore();
}

function markBL(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale / 10, -scale / 2, scale - scale / 10, scale - scale / 10);

  ctx.stroke();
  ctx.restore();
}

function markTR(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2 + scale / 10, scale - scale / 10, scale - scale / 10);

  ctx.stroke();
  ctx.restore();
}

function markLM(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale / 10, -scale / 2, scale - scale / 10, scale);

  ctx.stroke();
  ctx.restore();
}

function markRM(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2, scale - scale / 10, scale);

  ctx.stroke();
  ctx.restore();
}

function markBR(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2, scale - scale / 10, scale - scale / 10);

  ctx.stroke();
  ctx.restore();
}

function markT(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale / 5, -scale / 2 + scale / 10, scale - scale / 2.5, scale - scale / 10);

  ctx.stroke();
  ctx.restore();
}

function markB(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale / 5, -scale / 2, scale - scale / 2.5, scale - scale / 10);

  ctx.stroke();
  ctx.restore();
}

function markMV(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale / 5, -scale / 2, scale - scale / 2.5, scale);

  ctx.stroke();
  ctx.restore();
}

function markMH(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2 + scale / 5, scale, scale - scale / 2.5);

  ctx.stroke();
  ctx.restore();
}

function markL(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2 + scale / 10, -scale / 2 + scale / 5, scale - scale / 10, scale - scale / 2.5);

  ctx.stroke();
  ctx.restore();
}

function markR(ctx, scale, x, y, color) {
  ctx.save();
  ctx.translate((x + 1) * scale + scale / 2, (y + 1) * scale + scale / 2);
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.fillRect(-scale / 2, -scale / 2 + scale / 5, scale - scale / 10, scale - scale / 2.5);

  ctx.stroke();
  ctx.restore();
}

function draw2x2(ctx, scale, group, color) {
  markTL(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markTR(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);
  markBL(ctx, scale, group.cellArray[2].x, group.cellArray[2].y, color);
  markBR(ctx, scale, group.cellArray[3].x, group.cellArray[3].y, color);
}

function draw2x4(ctx, scale, group, color) {
  markTL(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markLM(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);

  markLM(ctx, scale, group.cellArray[2].x, group.cellArray[2].y, color);
  markBL(ctx, scale, group.cellArray[3].x, group.cellArray[3].y, color);

  markTR(ctx, scale, group.cellArray[4].x, group.cellArray[4].y, color);
  markRM(ctx, scale, group.cellArray[5].x, group.cellArray[5].y, color);

  markRM(ctx, scale, group.cellArray[6].x, group.cellArray[6].y, color);
  markBR(ctx, scale, group.cellArray[7].x, group.cellArray[7].y, color);
}

function draw1x2(ctx, scale, group, color) {
  markT(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markB(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);
}

function draw1x4(ctx, scale, group, color) {
  markT(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markMV(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);
  markMV(ctx, scale, group.cellArray[2].x, group.cellArray[2].y, color);
  markB(ctx, scale, group.cellArray[3].x, group.cellArray[3].y, color);
}

function draw4x1(ctx, scale, group, color) {
  markL(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markMH(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);
  markMH(ctx, scale, group.cellArray[2].x, group.cellArray[2].y, color);
  markR(ctx, scale, group.cellArray[3].x, group.cellArray[3].y, color);
}

function draw2x1(ctx, scale, group, color) {
  markL(ctx, scale, group.cellArray[0].x, group.cellArray[0].y, color);
  markR(ctx, scale, group.cellArray[1].x, group.cellArray[1].y, color);
}

function hexToRGB(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
}

// export function randomRGB(length) {
//   var color = Math.floor(Math.random() * length);
//   var colors = chroma.scale(['#f44336', '#9c27b0', '#3f51b5', '#03a9f4', '#009688', '#8bc34a', '#ffeb3b', '#ff9800']).colors(length);
//   var hex = colors[color];
//   return hexToRGB(hex, 0.5);
// }
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/classes/DrawingFunctions.js","/classes")
},{"buffer":2,"chroma-js":3,"rH1JPG":5}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Group class used for drawing
var Group = function Group(cellArray, type) {
  _classCallCheck(this, Group);

  this.cellArray = cellArray;
  this.type = type;
};

exports.default = Group;
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/classes/Group.js","/classes")
},{"buffer":2,"rH1JPG":5}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Point class
var Point = function Point(x, y) {
  _classCallCheck(this, Point);

  if (x < 0 || y < 0) throw new Error('Coordinates must be positive');
  this.x = x;
  this.y = y;
};

exports.default = Point;
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/classes/Point.js","/classes")
},{"buffer":2,"rH1JPG":5}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

var _CellArray = require('./classes/CellArray');

var _CellArray2 = _interopRequireDefault(_CellArray);

var _DrawingFunctions = require('./classes/DrawingFunctions');

var drawer = _interopRequireWildcard(_DrawingFunctions);

var _BinaryFunctions = require('./classes/BinaryFunctions');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var c = document.getElementById('canvas');
var ctx = c.getContext('2d');

// c.height = window.innerHeight / 8 * 5;
// c.width = window.innerHeight / 8 * 5;

var scale = c.width / 5; //scale of the cells;

// fixes problem with browsers making my canvas look bad
var devicePixelRatio = window.devicePixelRatio || 1,
    backingStoreRatio = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1,
    ratio = devicePixelRatio / backingStoreRatio;

var oldWidth = c.width;
var oldHeight = c.height;

c.width = oldWidth * ratio + 1;
c.height = oldHeight * ratio + 1;

c.style.width = oldWidth + 'px';
c.style.height = oldHeight + 'px';

// now scale the context to counter
// the fact that we've manually scaled
// our c element
ctx.scale(ratio, ratio);

//kmap stuff
var minterms = [];
var numVars = 3;
var expansionType = 1;

var cellArray = new _CellArray2.default(numVars, expansionType);

draw3varkmap();

function getMinterms() {
  var temp = [];
  //TODO: change it to work for more minterms instead of hardcoding the 8
  //gets minterms from html form
  for (var i = 0; i < Math.pow(2, numVars); i++) {
    var formGroup = document.getElementsByName('group' + i);

    for (var j = 0; j < formGroup.length; j++) {
      if (formGroup[j].checked == true) {
        temp[i] = formGroup[j].value;
      }
    }
  }

  return temp;
}

function resetkmap() {
  ctx.clearRect(0, 0, c.width, c.width);
}

var slider = document.getElementById('num-vars');
var expansionTypeSwitch = document.getElementById('expansionType');

expansionTypeSwitch.addEventListener('change', function (event) {
  expansionType = Number(!event.target.checked);
  cellArray.expansionType = expansionType;
  render();
});

document.addEventListener('keypress', function (event) {
  if (event.keyCode == 13) {
    render();
  }
});

noUiSlider.create(slider, {
  start: 3,
  connect: [true, false],
  step: 1,
  range: {
    'min': [3],
    'max': [4]
  },
  pips: {
    mode: 'steps',
    density: 30
  }
});

slider.noUiSlider.on('update', function () {
  var truthTable = document.getElementById('truth-table');

  while (truthTable.firstChild) {
    truthTable.removeChild(truthTable.firstChild);
  }

  var tbl = document.createElement('table');

  var thead = document.createElement('thead');

  var superHeadRow = document.createElement('tr');

  var input = document.createElement('th');
  input.appendChild(document.createTextNode('Input'));
  input.setAttribute('colspan', slider.noUiSlider.get());

  var output = document.createElement('th');
  output.setAttribute('colspan', 3);
  output.appendChild(document.createTextNode('Output'));

  superHeadRow.appendChild(input);
  superHeadRow.appendChild(output);

  thead.appendChild(superHeadRow);

  var tr = document.createElement('tr');
  // Creates headers for the truth table
  for (var i = 0; i < slider.noUiSlider.get(); i++) {
    var th = document.createElement('th');
    th.appendChild(document.createTextNode(String.fromCharCode(65 + i)));
    tr.appendChild(th);
  }

  var off = document.createElement('th');
  off.appendChild(document.createTextNode('0'));
  var on = document.createElement('th');
  on.appendChild(document.createTextNode('1'));
  var dontCare = document.createElement('th');
  dontCare.appendChild(document.createTextNode('X'));

  tr.appendChild(off);
  tr.appendChild(on);
  tr.appendChild(dontCare);

  thead.appendChild(tr);
  tbl.appendChild(thead);

  var tbody = document.createElement('tbody');
  for (var _i = 0; _i < Math.pow(2, slider.noUiSlider.get()); _i++) {
    var _tr = document.createElement('tr');

    var num = '' + _i.toString(2);
    var pad = '0'.repeat(slider.noUiSlider.get()); // its just 5 0's for the max var nums
    var bin = pad.substring(0, pad.length - num.length) + num;

    var binArray = bin.split('');

    for (var _i2 = 0; _i2 < binArray.length; _i2++) {
      var _td = document.createElement('td');
      _td.appendChild(document.createTextNode(binArray[_i2]));
      _tr.appendChild(_td);
    }

    var td = document.createElement('td');
    var input1 = document.createElement('input');
    input1.setAttribute('name', 'group' + _i);
    input1.setAttribute('type', 'radio');
    input1.setAttribute('id', 'OFF' + _i);
    input1.setAttribute('value', '0');
    input1.setAttribute('checked', 'checked');
    var label1 = document.createElement('label');
    label1.setAttribute('for', 'OFF' + _i);
    td.appendChild(input1);
    td.appendChild(label1);

    var td2 = document.createElement('td');
    var input2 = document.createElement('input');
    input2.setAttribute('name', 'group' + _i);
    input2.setAttribute('type', 'radio');
    input2.setAttribute('id', 'ON' + _i);
    input2.setAttribute('value', '1');
    var label2 = document.createElement('label');
    label2.setAttribute('for', 'ON' + _i);
    td2.appendChild(input2);
    td2.appendChild(label2);

    var td3 = document.createElement('td');
    var input3 = document.createElement('input');
    input3.setAttribute('name', 'group' + _i);
    input3.setAttribute('type', 'radio');
    input3.setAttribute('id', 'DONTCARE' + _i);
    input3.setAttribute('value', 'X');
    var label3 = document.createElement('label');
    label3.setAttribute('for', 'DONTCARE' + _i);
    td3.appendChild(input3);
    td3.appendChild(label3);

    _tr.appendChild(td);
    _tr.appendChild(td2);
    _tr.appendChild(td3);

    tbody.appendChild(_tr);
  }

  // tbody.style.overflowY = 'scroll';
  tbl.appendChild(tbody);
  truthTable.appendChild(tbl);

  numVars = Number(slider.noUiSlider.get());
  cellArray = new _CellArray2.default(numVars, expansionType);

  //rewdraws map
  resetkmap();
  var formulaBox = document.getElementById('expansion');
  formulaBox.innerHTML = "F =";
  switch (numVars) {
    case 3:
      draw3varkmap();
      break;
    case 4:
      draw4varkmap();
      break;
    default:
      console.log('You did it Professor.');
      break;
  }

  $('input:radio').click(function () {
    render();
  });
});

function render() {
  var formulaBox = document.getElementById('expansion');
  //grabs minterms on enter key
  //resets the canvas
  resetkmap();

  switch (numVars) {
    case 3:
      draw3varkmap();
      break;
    case 4:
      draw4varkmap();
      console.log('4 vars');
      break;
    case 5:
      console.log('5 vars');
      break;
    case 6:
      console.log('6 vars');
      break;
    default:
      console.log('You did it Professor.');
      break;
  }

  //resets cell array
  cellArray.reset();

  // marks the values from the truth table
  minterms = getMinterms();
  cellArray.mark(minterms);

  //TODO: make simplify groups just part of the get groups function
  // marks the groups
  var groups = cellArray.simplifyGroups(cellArray.getGroups());
  console.log(groups);
  drawer.drawPoints(ctx, scale, groups);
  drawer.drawTerms(ctx, scale, cellArray.cells);

  //draw formula
  formulaBox.innerHTML = (0, _BinaryFunctions.getExpansionFormula)(groups, numVars, cellArray.expansionType);
}

function draw4varkmap() {
  ctx.beginPath();

  ctx.moveTo(0, 0);
  ctx.lineTo(scale, scale); //

  ctx.moveTo(scale, scale);
  ctx.lineTo(scale, c.width); //

  ctx.moveTo(scale * 2, scale);
  ctx.lineTo(scale * 2, c.width); //

  ctx.moveTo(scale, scale);
  ctx.lineTo(c.width, scale); //

  ctx.moveTo(scale * 3, scale);
  ctx.lineTo(scale * 3, c.width);

  ctx.moveTo(scale * 4, scale);
  ctx.lineTo(scale * 4, c.width); //

  ctx.moveTo(scale * 5, scale);
  ctx.lineTo(scale * 5, c.width); //

  ctx.moveTo(scale, scale * 2);
  ctx.lineTo(c.width, scale * 2);

  ctx.moveTo(scale, scale * 3);
  ctx.lineTo(c.width, scale * 3);

  ctx.moveTo(scale, scale * 4);
  ctx.lineTo(c.width, scale * 4);

  ctx.moveTo(scale, scale * 5);
  ctx.lineTo(c.width, scale * 5);

  ctx.stroke();

  //draws vars and numbers
  ctx.font = '20pt Roboto';

  //vars
  ctx.fillText('AB', scale * 0.6, scale * 0.4);

  ctx.fillText('CD', scale * 0.1, scale * 0.9);

  //numbers
  ctx.fillText('00', scale * 1.5 - 5, scale - 5);
  ctx.fillText('01', scale * 2.5 - 5, scale - 5);
  ctx.fillText('11', scale * 3.5 - 5, scale - 5);
  ctx.fillText('10', scale * 4.5 - 5, scale - 5);

  ctx.fillText('00', scale * 0.5 + 5, scale * 1.6);
  ctx.fillText('01', scale * 0.5 + 5, scale * 2.6);
  ctx.fillText('11', scale * 0.5 + 5, scale * 3.6);
  ctx.fillText('10', scale * 0.5 + 5, scale * 4.6);
}

function draw3varkmap() {
  //draws table
  ctx.beginPath();

  ctx.moveTo(0, 0);
  ctx.lineTo(scale, scale);

  ctx.moveTo(scale, scale);
  ctx.lineTo(scale, c.width);

  ctx.moveTo(scale * 2, scale);
  ctx.lineTo(scale * 2, c.width);

  ctx.moveTo(scale, scale);
  ctx.lineTo(scale * 3, scale);

  ctx.moveTo(scale * 3, scale);
  ctx.lineTo(scale * 3, c.width);

  ctx.moveTo(scale, scale * 2);
  ctx.lineTo(scale * 3, scale * 2);

  ctx.moveTo(scale, scale * 3);
  ctx.lineTo(scale * 3, scale * 3);

  ctx.moveTo(scale, scale * 4);
  ctx.lineTo(scale * 3, scale * 4);

  ctx.moveTo(scale, scale * 5);
  ctx.lineTo(scale * 3, scale * 5);

  ctx.stroke();

  //draws vars and numbers
  ctx.font = '20pt Roboto';

  //vars
  ctx.fillText('A', scale * 0.6, scale * 0.4);

  ctx.fillText('BC', scale * 0.1, scale * 0.9);

  //numbers
  ctx.fillText('0', scale * 1.5 - 5, scale - 5);
  ctx.fillText('1', scale * 2.5 - 5, scale - 5);

  ctx.fillText('00', scale * 0.5 + 5, scale * 1.6);
  ctx.fillText('01', scale * 0.5 + 5, scale * 2.6);
  ctx.fillText('11', scale * 0.5 + 5, scale * 3.6);
  ctx.fillText('10', scale * 0.5 + 5, scale * 4.6);
}
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_c4d4aa04.js","/")
},{"./classes/BinaryFunctions":6,"./classes/CellArray":8,"./classes/DrawingFunctions":9,"buffer":2,"rH1JPG":5}]},{},[12])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9waGlsaXBwZmFyYWVlL1Byb2dyYW1taW5nL0NTMDA2L2ttYXAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9waGlsaXBwZmFyYWVlL1Byb2dyYW1taW5nL0NTMDA2L2ttYXAvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzIiwiL1VzZXJzL3BoaWxpcHBmYXJhZWUvUHJvZ3JhbW1pbmcvQ1MwMDYva21hcC9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwiL1VzZXJzL3BoaWxpcHBmYXJhZWUvUHJvZ3JhbW1pbmcvQ1MwMDYva21hcC9ub2RlX21vZHVsZXMvY2hyb21hLWpzL2Nocm9tYS5qcyIsIi9Vc2Vycy9waGlsaXBwZmFyYWVlL1Byb2dyYW1taW5nL0NTMDA2L2ttYXAvbm9kZV9tb2R1bGVzL2llZWU3NTQvaW5kZXguanMiLCIvVXNlcnMvcGhpbGlwcGZhcmFlZS9Qcm9ncmFtbWluZy9DUzAwNi9rbWFwL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvVXNlcnMvcGhpbGlwcGZhcmFlZS9Qcm9ncmFtbWluZy9DUzAwNi9rbWFwL3B1YmxpYy9idWlsZC9jbGFzc2VzL0JpbmFyeUZ1bmN0aW9ucy5qcyIsIi9Vc2Vycy9waGlsaXBwZmFyYWVlL1Byb2dyYW1taW5nL0NTMDA2L2ttYXAvcHVibGljL2J1aWxkL2NsYXNzZXMvQ2VsbC5qcyIsIi9Vc2Vycy9waGlsaXBwZmFyYWVlL1Byb2dyYW1taW5nL0NTMDA2L2ttYXAvcHVibGljL2J1aWxkL2NsYXNzZXMvQ2VsbEFycmF5LmpzIiwiL1VzZXJzL3BoaWxpcHBmYXJhZWUvUHJvZ3JhbW1pbmcvQ1MwMDYva21hcC9wdWJsaWMvYnVpbGQvY2xhc3Nlcy9EcmF3aW5nRnVuY3Rpb25zLmpzIiwiL1VzZXJzL3BoaWxpcHBmYXJhZWUvUHJvZ3JhbW1pbmcvQ1MwMDYva21hcC9wdWJsaWMvYnVpbGQvY2xhc3Nlcy9Hcm91cC5qcyIsIi9Vc2Vycy9waGlsaXBwZmFyYWVlL1Byb2dyYW1taW5nL0NTMDA2L2ttYXAvcHVibGljL2J1aWxkL2NsYXNzZXMvUG9pbnQuanMiLCIvVXNlcnMvcGhpbGlwcGZhcmFlZS9Qcm9ncmFtbWluZy9DUzAwNi9rbWFwL3B1YmxpYy9idWlsZC9mYWtlX2M0ZDRhYTA0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdmxDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2N0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBsb29rdXAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG5cbjsoZnVuY3Rpb24gKGV4cG9ydHMpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG4gIHZhciBBcnIgPSAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKVxuICAgID8gVWludDhBcnJheVxuICAgIDogQXJyYXlcblxuXHR2YXIgUExVUyAgID0gJysnLmNoYXJDb2RlQXQoMClcblx0dmFyIFNMQVNIICA9ICcvJy5jaGFyQ29kZUF0KDApXG5cdHZhciBOVU1CRVIgPSAnMCcuY2hhckNvZGVBdCgwKVxuXHR2YXIgTE9XRVIgID0gJ2EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFVQUEVSICA9ICdBJy5jaGFyQ29kZUF0KDApXG5cdHZhciBQTFVTX1VSTF9TQUZFID0gJy0nLmNoYXJDb2RlQXQoMClcblx0dmFyIFNMQVNIX1VSTF9TQUZFID0gJ18nLmNoYXJDb2RlQXQoMClcblxuXHRmdW5jdGlvbiBkZWNvZGUgKGVsdCkge1xuXHRcdHZhciBjb2RlID0gZWx0LmNoYXJDb2RlQXQoMClcblx0XHRpZiAoY29kZSA9PT0gUExVUyB8fFxuXHRcdCAgICBjb2RlID09PSBQTFVTX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYyIC8vICcrJ1xuXHRcdGlmIChjb2RlID09PSBTTEFTSCB8fFxuXHRcdCAgICBjb2RlID09PSBTTEFTSF9VUkxfU0FGRSlcblx0XHRcdHJldHVybiA2MyAvLyAnLydcblx0XHRpZiAoY29kZSA8IE5VTUJFUilcblx0XHRcdHJldHVybiAtMSAvL25vIG1hdGNoXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIgKyAxMClcblx0XHRcdHJldHVybiBjb2RlIC0gTlVNQkVSICsgMjYgKyAyNlxuXHRcdGlmIChjb2RlIDwgVVBQRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gVVBQRVJcblx0XHRpZiAoY29kZSA8IExPV0VSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIExPV0VSICsgMjZcblx0fVxuXG5cdGZ1bmN0aW9uIGI2NFRvQnl0ZUFycmF5IChiNjQpIHtcblx0XHR2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxuXG5cdFx0aWYgKGI2NC5sZW5ndGggJSA0ID4gMCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0Jylcblx0XHR9XG5cblx0XHQvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuXHRcdC8vIGlmIHRoZXJlIGFyZSB0d28gcGxhY2Vob2xkZXJzLCB0aGFuIHRoZSB0d28gY2hhcmFjdGVycyBiZWZvcmUgaXRcblx0XHQvLyByZXByZXNlbnQgb25lIGJ5dGVcblx0XHQvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcblx0XHQvLyB0aGlzIGlzIGp1c3QgYSBjaGVhcCBoYWNrIHRvIG5vdCBkbyBpbmRleE9mIHR3aWNlXG5cdFx0dmFyIGxlbiA9IGI2NC5sZW5ndGhcblx0XHRwbGFjZUhvbGRlcnMgPSAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMikgPyAyIDogJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDEpID8gMSA6IDBcblxuXHRcdC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuXHRcdGFyciA9IG5ldyBBcnIoYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxuXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoXG5cblx0XHR2YXIgTCA9IDBcblxuXHRcdGZ1bmN0aW9uIHB1c2ggKHYpIHtcblx0XHRcdGFycltMKytdID0gdlxuXHRcdH1cblxuXHRcdGZvciAoaSA9IDAsIGogPSAwOyBpIDwgbDsgaSArPSA0LCBqICs9IDMpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTgpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgMTIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPDwgNikgfCBkZWNvZGUoYjY0LmNoYXJBdChpICsgMykpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDAwMCkgPj4gMTYpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDApID4+IDgpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0aWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpID4+IDQpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTApIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgNCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA+PiAyKVxuXHRcdFx0cHVzaCgodG1wID4+IDgpICYgMHhGRilcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRyZXR1cm4gYXJyXG5cdH1cblxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0ICh1aW50OCkge1xuXHRcdHZhciBpLFxuXHRcdFx0ZXh0cmFCeXRlcyA9IHVpbnQ4Lmxlbmd0aCAlIDMsIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG5cdFx0XHRvdXRwdXQgPSBcIlwiLFxuXHRcdFx0dGVtcCwgbGVuZ3RoXG5cblx0XHRmdW5jdGlvbiBlbmNvZGUgKG51bSkge1xuXHRcdFx0cmV0dXJuIGxvb2t1cC5jaGFyQXQobnVtKVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG5cdFx0XHRyZXR1cm4gZW5jb2RlKG51bSA+PiAxOCAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiAxMiAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiA2ICYgMHgzRikgKyBlbmNvZGUobnVtICYgMHgzRilcblx0XHR9XG5cblx0XHQvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XG5cdFx0XHR0ZW1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKVxuXHRcdFx0b3V0cHV0ICs9IHRyaXBsZXRUb0Jhc2U2NCh0ZW1wKVxuXHRcdH1cblxuXHRcdC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcblx0XHRzd2l0Y2ggKGV4dHJhQnl0ZXMpIHtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGVtcCA9IHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAyKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9PSdcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0dGVtcCA9ICh1aW50OFt1aW50OC5sZW5ndGggLSAyXSA8PCA4KSArICh1aW50OFt1aW50OC5sZW5ndGggLSAxXSlcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDEwKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wID4+IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCAyKSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPSdcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0XG5cdH1cblxuXHRleHBvcnRzLnRvQnl0ZUFycmF5ID0gYjY0VG9CeXRlQXJyYXlcblx0ZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gdWludDhUb0Jhc2U2NFxufSh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyAodGhpcy5iYXNlNjRqcyA9IHt9KSA6IGV4cG9ydHMpKVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qc1wiLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuQnVmZmVyLnBvb2xTaXplID0gODE5MlxuXG4vKipcbiAqIElmIGBCdWZmZXIuX3VzZVR5cGVkQXJyYXlzYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKGNvbXBhdGlibGUgZG93biB0byBJRTYpXG4gKi9cbkJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgPSAoZnVuY3Rpb24gKCkge1xuICAvLyBEZXRlY3QgaWYgYnJvd3NlciBzdXBwb3J0cyBUeXBlZCBBcnJheXMuIFN1cHBvcnRlZCBicm93c2VycyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLFxuICAvLyBDaHJvbWUgNyssIFNhZmFyaSA1LjErLCBPcGVyYSAxMS42KywgaU9TIDQuMisuIElmIHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgYWRkaW5nXG4gIC8vIHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcywgdGhlbiB0aGF0J3MgdGhlIHNhbWUgYXMgbm8gYFVpbnQ4QXJyYXlgIHN1cHBvcnRcbiAgLy8gYmVjYXVzZSB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gYWRkIGFsbCB0aGUgbm9kZSBCdWZmZXIgQVBJIG1ldGhvZHMuIFRoaXMgaXMgYW4gaXNzdWVcbiAgLy8gaW4gRmlyZWZveCA0LTI5LiBOb3cgZml4ZWQ6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOFxuICB0cnkge1xuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoMClcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiZcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAvLyBDaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59KSgpXG5cbi8qKlxuICogQ2xhc3M6IEJ1ZmZlclxuICogPT09PT09PT09PT09PVxuICpcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgYXJlIGF1Z21lbnRlZFxuICogd2l0aCBmdW5jdGlvbiBwcm9wZXJ0aWVzIGZvciBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgQVBJIGZ1bmN0aW9ucy4gV2UgdXNlXG4gKiBgVWludDhBcnJheWAgc28gdGhhdCBzcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdCByZXR1cm5zXG4gKiBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBCeSBhdWdtZW50aW5nIHRoZSBpbnN0YW5jZXMsIHdlIGNhbiBhdm9pZCBtb2RpZnlpbmcgdGhlIGBVaW50OEFycmF5YFxuICogcHJvdG90eXBlLlxuICovXG5mdW5jdGlvbiBCdWZmZXIgKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpXG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybylcblxuICB2YXIgdHlwZSA9IHR5cGVvZiBzdWJqZWN0XG5cbiAgLy8gV29ya2Fyb3VuZDogbm9kZSdzIGJhc2U2NCBpbXBsZW1lbnRhdGlvbiBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgc3RyaW5nc1xuICAvLyB3aGlsZSBiYXNlNjQtanMgZG9lcyBub3QuXG4gIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcgJiYgdHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBzdWJqZWN0ID0gc3RyaW5ndHJpbShzdWJqZWN0KVxuICAgIHdoaWxlIChzdWJqZWN0Lmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0ICsgJz0nXG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCB0aGUgbGVuZ3RoXG4gIHZhciBsZW5ndGhcbiAgaWYgKHR5cGUgPT09ICdudW1iZXInKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0KVxuICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJylcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QubGVuZ3RoKSAvLyBhc3N1bWUgdGhhdCBvYmplY3QgaXMgYXJyYXktbGlrZVxuICBlbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBuZWVkcyB0byBiZSBhIG51bWJlciwgYXJyYXkgb3Igc3RyaW5nLicpXG5cbiAgdmFyIGJ1ZlxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIC8vIFByZWZlcnJlZDogUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICBidWYgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkobGVuZ3RoKSlcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIFRISVMgaW5zdGFuY2Ugb2YgQnVmZmVyIChjcmVhdGVkIGJ5IGBuZXdgKVxuICAgIGJ1ZiA9IHRoaXNcbiAgICBidWYubGVuZ3RoID0gbGVuZ3RoXG4gICAgYnVmLl9pc0J1ZmZlciA9IHRydWVcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgLy8gU3BlZWQgb3B0aW1pemF0aW9uIC0tIHVzZSBzZXQgaWYgd2UncmUgY29weWluZyBmcm9tIGEgdHlwZWQgYXJyYXlcbiAgICBidWYuX3NldChzdWJqZWN0KVxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkpXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXG4gICAgICBlbHNlXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3RbaV1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgIW5vWmVybykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgYnVmW2ldID0gMFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWZcbn1cblxuLy8gU1RBVElDIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICdyYXcnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiAoYikge1xuICByZXR1cm4gISEoYiAhPT0gbnVsbCAmJiBiICE9PSB1bmRlZmluZWQgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgZW5jb2RpbmcpIHtcbiAgdmFyIHJldFxuICBzdHIgPSBzdHIgKyAnJ1xuICBzd2l0Y2ggKGVuY29kaW5nIHx8ICd1dGY4Jykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoIC8gMlxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSB1dGY4VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdyYXcnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gYmFzZTY0VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAqIDJcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGFzc2VydChpc0FycmF5KGxpc3QpLCAnVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdCwgW3RvdGFsTGVuZ3RoXSlcXG4nICtcbiAgICAgICdsaXN0IHNob3VsZCBiZSBhbiBBcnJheS4nKVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKDApXG4gIH0gZWxzZSBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbGlzdFswXVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB0b3RhbExlbmd0aCAhPT0gJ251bWJlcicpIHtcbiAgICB0b3RhbExlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgdG90YWxMZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcih0b3RhbExlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV1cbiAgICBpdGVtLmNvcHkoYnVmLCBwb3MpXG4gICAgcG9zICs9IGl0ZW0ubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBCVUZGRVIgSU5TVEFOQ0UgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gX2hleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgYXNzZXJ0KHN0ckxlbiAlIDIgPT09IDAsICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYnl0ZSA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBhc3NlcnQoIWlzTmFOKGJ5dGUpLCAnSW52YWxpZCBoZXggc3RyaW5nJylcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBieXRlXG4gIH1cbiAgQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPSBpICogMlxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBfdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2FzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2JpbmFyeVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIF9hc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBTdXBwb3J0IGJvdGggKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKVxuICAvLyBhbmQgdGhlIGxlZ2FjeSAoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpXG4gIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgaWYgKCFpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2UgeyAgLy8gbGVnYWN5XG4gICAgdmFyIHN3YXAgPSBlbmNvZGluZ1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgb2Zmc2V0ID0gbGVuZ3RoXG4gICAgbGVuZ3RoID0gc3dhcFxuICB9XG5cbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgc2VsZiA9IHRoaXNcblxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcbiAgc3RhcnQgPSBOdW1iZXIoc3RhcnQpIHx8IDBcbiAgZW5kID0gKGVuZCAhPT0gdW5kZWZpbmVkKVxuICAgID8gTnVtYmVyKGVuZClcbiAgICA6IGVuZCA9IHNlbGYubGVuZ3RoXG5cbiAgLy8gRmFzdHBhdGggZW1wdHkgc3RyaW5nc1xuICBpZiAoZW5kID09PSBzdGFydClcbiAgICByZXR1cm4gJydcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIHZhciBzb3VyY2UgPSB0aGlzXG5cbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKCF0YXJnZXRfc3RhcnQpIHRhcmdldF9zdGFydCA9IDBcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCBzb3VyY2UubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdzb3VyY2VFbmQgPCBzb3VyY2VTdGFydCcpXG4gIGFzc2VydCh0YXJnZXRfc3RhcnQgPj0gMCAmJiB0YXJnZXRfc3RhcnQgPCB0YXJnZXQubGVuZ3RoLFxuICAgICAgJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSBzb3VyY2UubGVuZ3RoLCAnc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aClcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCA8IGVuZCAtIHN0YXJ0KVxuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgKyBzdGFydFxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmIChsZW4gPCAxMDAgfHwgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0Ll9zZXQodGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLCB0YXJnZXRfc3RhcnQpXG4gIH1cbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiBfdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJlcyA9ICcnXG4gIHZhciB0bXAgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBpZiAoYnVmW2ldIDw9IDB4N0YpIHtcbiAgICAgIHJlcyArPSBkZWNvZGVVdGY4Q2hhcih0bXApICsgU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gICAgICB0bXAgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0bXAgKz0gJyUnICsgYnVmW2ldLnRvU3RyaW5nKDE2KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXMgKyBkZWNvZGVVdGY4Q2hhcih0bXApXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKylcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gX2JpbmFyeVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgcmV0dXJuIF9hc2NpaVNsaWNlKGJ1Ziwgc3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gX2hleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgYnl0ZXNbaSsxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSBjbGFtcChzdGFydCwgbGVuLCAwKVxuICBlbmQgPSBjbGFtcChlbmQsIGxlbiwgbGVuKVxuXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5fYXVnbWVudCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgdmFyIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZCwgdHJ1ZSlcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyBpKyspIHtcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgICByZXR1cm4gbmV3QnVmXG4gIH1cbn1cblxuLy8gYGdldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLmdldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMucmVhZFVJbnQ4KG9mZnNldClcbn1cblxuLy8gYHNldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHYsIG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMud3JpdGVVSW50OCh2LCBvZmZzZXQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgdmFsID0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICB9IGVsc2Uge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV1cbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDJdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgICB2YWwgfD0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0ICsgM10gPDwgMjQgPj4+IDApXG4gIH0gZWxzZSB7XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMV0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMl0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAzXVxuICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0XSA8PCAyNCA+Pj4gMClcbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICB2YXIgbmVnID0gdGhpc1tvZmZzZXRdICYgMHg4MFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQxNihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MzIoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMDAwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZmZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRmxvYXQgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWREb3VibGUgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aCkgcmV0dXJuXG5cbiAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAgICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZmZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgNCk7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2YsIC0weDgwKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICB0aGlzLndyaXRlVUludDgodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICB0aGlzLndyaXRlVUludDgoMHhmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmLCAtMHg4MDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQxNihidWYsIDB4ZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQzMihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MzIoYnVmLCAweGZmZmZmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBmaWxsKHZhbHVlLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDBcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kKSBlbmQgPSB0aGlzLmxlbmd0aFxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS5jaGFyQ29kZUF0KDApXG4gIH1cblxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odmFsdWUpLCAndmFsdWUgaXMgbm90IGEgbnVtYmVyJylcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ2VuZCA8IHN0YXJ0JylcblxuICAvLyBGaWxsIDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgdGhpcy5sZW5ndGgsICdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSB0aGlzLmxlbmd0aCwgJ2VuZCBvdXQgb2YgYm91bmRzJylcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIHRoaXNbaV0gPSB2YWx1ZVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG91dCA9IFtdXG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgb3V0W2ldID0gdG9IZXgodGhpc1tpXSlcbiAgICBpZiAoaSA9PT0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUykge1xuICAgICAgb3V0W2kgKyAxXSA9ICcuLi4nXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIG91dC5qb2luKCcgJykgKyAnPidcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXG4gKiBBZGRlZCBpbiBOb2RlIDAuMTIuIE9ubHkgYXZhaWxhYmxlIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBBcnJheUJ1ZmZlci5cbiAqL1xuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpXG4gICAgICAgIGJ1ZltpXSA9IHRoaXNbaV1cbiAgICAgIHJldHVybiBidWYuYnVmZmVyXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuX2lzQnVmZmVyID0gdHJ1ZVxuXG4gIC8vIHNhdmUgcmVmZXJlbmNlIHRvIG9yaWdpbmFsIFVpbnQ4QXJyYXkgZ2V0L3NldCBtZXRob2RzIGJlZm9yZSBvdmVyd3JpdGluZ1xuICBhcnIuX2dldCA9IGFyci5nZXRcbiAgYXJyLl9zZXQgPSBhcnIuc2V0XG5cbiAgLy8gZGVwcmVjYXRlZCwgd2lsbCBiZSByZW1vdmVkIGluIG5vZGUgMC4xMytcbiAgYXJyLmdldCA9IEJQLmdldFxuICBhcnIuc2V0ID0gQlAuc2V0XG5cbiAgYXJyLndyaXRlID0gQlAud3JpdGVcbiAgYXJyLnRvU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxuICBhcnIuY29weSA9IEJQLmNvcHlcbiAgYXJyLnNsaWNlID0gQlAuc2xpY2VcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxuICBhcnIucmVhZFVJbnQxNkxFID0gQlAucmVhZFVJbnQxNkxFXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxuICBhcnIucmVhZFVJbnQzMkJFID0gQlAucmVhZFVJbnQzMkJFXG4gIGFyci5yZWFkSW50OCA9IEJQLnJlYWRJbnQ4XG4gIGFyci5yZWFkSW50MTZMRSA9IEJQLnJlYWRJbnQxNkxFXG4gIGFyci5yZWFkSW50MTZCRSA9IEJQLnJlYWRJbnQxNkJFXG4gIGFyci5yZWFkSW50MzJMRSA9IEJQLnJlYWRJbnQzMkxFXG4gIGFyci5yZWFkSW50MzJCRSA9IEJQLnJlYWRJbnQzMkJFXG4gIGFyci5yZWFkRmxvYXRMRSA9IEJQLnJlYWRGbG9hdExFXG4gIGFyci5yZWFkRmxvYXRCRSA9IEJQLnJlYWRGbG9hdEJFXG4gIGFyci5yZWFkRG91YmxlTEUgPSBCUC5yZWFkRG91YmxlTEVcbiAgYXJyLnJlYWREb3VibGVCRSA9IEJQLnJlYWREb3VibGVCRVxuICBhcnIud3JpdGVVSW50OCA9IEJQLndyaXRlVUludDhcbiAgYXJyLndyaXRlVUludDE2TEUgPSBCUC53cml0ZVVJbnQxNkxFXG4gIGFyci53cml0ZVVJbnQxNkJFID0gQlAud3JpdGVVSW50MTZCRVxuICBhcnIud3JpdGVVSW50MzJMRSA9IEJQLndyaXRlVUludDMyTEVcbiAgYXJyLndyaXRlVUludDMyQkUgPSBCUC53cml0ZVVJbnQzMkJFXG4gIGFyci53cml0ZUludDggPSBCUC53cml0ZUludDhcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXG4gIGFyci53cml0ZUludDMyTEUgPSBCUC53cml0ZUludDMyTEVcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXG4gIGFyci53cml0ZUZsb2F0QkUgPSBCUC53cml0ZUZsb2F0QkVcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxuICBhcnIuZmlsbCA9IEJQLmZpbGxcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxuXG4gIHJldHVybiBhcnJcbn1cblxuLy8gc2xpY2Uoc3RhcnQsIGVuZClcbmZ1bmN0aW9uIGNsYW1wIChpbmRleCwgbGVuLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgaW5kZXggPSB+fmluZGV4OyAgLy8gQ29lcmNlIHRvIGludGVnZXIuXG4gIGlmIChpbmRleCA+PSBsZW4pIHJldHVybiBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICBpbmRleCArPSBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBjb2VyY2UgKGxlbmd0aCkge1xuICAvLyBDb2VyY2UgbGVuZ3RoIHRvIGEgbnVtYmVyIChwb3NzaWJseSBOYU4pLCByb3VuZCB1cFxuICAvLyBpbiBjYXNlIGl0J3MgZnJhY3Rpb25hbCAoZS5nLiAxMjMuNDU2KSB0aGVuIGRvIGFcbiAgLy8gZG91YmxlIG5lZ2F0ZSB0byBjb2VyY2UgYSBOYU4gdG8gMC4gRWFzeSwgcmlnaHQ/XG4gIGxlbmd0aCA9IH5+TWF0aC5jZWlsKCtsZW5ndGgpXG4gIHJldHVybiBsZW5ndGggPCAwID8gMCA6IGxlbmd0aFxufVxuXG5mdW5jdGlvbiBpc0FycmF5IChzdWJqZWN0KSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoc3ViamVjdCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ViamVjdCkgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgfSkoc3ViamVjdClcbn1cblxuZnVuY3Rpb24gaXNBcnJheWlzaCAoc3ViamVjdCkge1xuICByZXR1cm4gaXNBcnJheShzdWJqZWN0KSB8fCBCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkgfHxcbiAgICAgIHN1YmplY3QgJiYgdHlwZW9mIHN1YmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2Ygc3ViamVjdC5sZW5ndGggPT09ICdudW1iZXInXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYiA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaWYgKGIgPD0gMHg3RilcbiAgICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpKVxuICAgIGVsc2Uge1xuICAgICAgdmFyIHN0YXJ0ID0gaVxuICAgICAgaWYgKGIgPj0gMHhEODAwICYmIGIgPD0gMHhERkZGKSBpKytcbiAgICAgIHZhciBoID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0ci5zbGljZShzdGFydCwgaSsxKSkuc3Vic3RyKDEpLnNwbGl0KCclJylcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaC5sZW5ndGg7IGorKylcbiAgICAgICAgYnl0ZUFycmF5LnB1c2gocGFyc2VJbnQoaFtqXSwgMTYpKVxuICAgIH1cbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShzdHIpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgcG9zXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpXG4gICAgICBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIGRlY29kZVV0ZjhDaGFyIChzdHIpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHN0cilcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKSAvLyBVVEYgOCBpbnZhbGlkIGNoYXJcbiAgfVxufVxuXG4vKlxuICogV2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgdmFsdWUgaXMgYSB2YWxpZCBpbnRlZ2VyLiBUaGlzIG1lYW5zIHRoYXQgaXRcbiAqIGlzIG5vbi1uZWdhdGl2ZS4gSXQgaGFzIG5vIGZyYWN0aW9uYWwgY29tcG9uZW50IGFuZCB0aGF0IGl0IGRvZXMgbm90XG4gKiBleGNlZWQgdGhlIG1heGltdW0gYWxsb3dlZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gdmVyaWZ1aW50ICh2YWx1ZSwgbWF4KSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA+PSAwLCAnc3BlY2lmaWVkIGEgbmVnYXRpdmUgdmFsdWUgZm9yIHdyaXRpbmcgYW4gdW5zaWduZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgaXMgbGFyZ2VyIHRoYW4gbWF4aW11bSB2YWx1ZSBmb3IgdHlwZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmc2ludCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmSUVFRTc1NCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG59XG5cbmZ1bmN0aW9uIGFzc2VydCAodGVzdCwgbWVzc2FnZSkge1xuICBpZiAoIXRlc3QpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdGYWlsZWQgYXNzZXJ0aW9uJylcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2J1ZmZlclwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcblxuLyoqXG4gKiBAbGljZW5zZVxuICpcbiAqIGNocm9tYS5qcyAtIEphdmFTY3JpcHQgbGlicmFyeSBmb3IgY29sb3IgY29udmVyc2lvbnNcbiAqIFxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTUsIEdyZWdvciBBaXNjaFxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqIFxuICogMS4gUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gKiAgICBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqIFxuICogMi4gUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvblxuICogICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKiBcbiAqIDMuIFRoZSBuYW1lIEdyZWdvciBBaXNjaCBtYXkgbm90IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzXG4gKiAgICBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqIFxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCJcbiAqIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEVcbiAqIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRVxuICogRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgR1JFR09SIEFJU0NIIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsXG4gKiBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORyxcbiAqIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsXG4gKiBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZXG4gKiBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElOR1xuICogTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLFxuICogRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICB2YXIgQ29sb3IsIERFRzJSQUQsIExBQl9DT05TVEFOVFMsIFBJLCBQSVRISVJELCBSQUQyREVHLCBUV09QSSwgX2d1ZXNzX2Zvcm1hdHMsIF9ndWVzc19mb3JtYXRzX3NvcnRlZCwgX2lucHV0LCBfaW50ZXJwb2xhdG9ycywgYWJzLCBhdGFuMiwgYmV6aWVyLCBibGVuZCwgYmxlbmRfZiwgYnJld2VyLCBidXJuLCBjaHJvbWEsIGNsaXBfcmdiLCBjbXlrMnJnYiwgY29sb3JzLCBjb3MsIGNzczJyZ2IsIGRhcmtlbiwgZG9kZ2UsIGVhY2gsIGZsb29yLCBoZXgycmdiLCBoc2kycmdiLCBoc2wyY3NzLCBoc2wycmdiLCBoc3YycmdiLCBpbnRlcnBvbGF0ZSwgaW50ZXJwb2xhdGVfaHN4LCBpbnRlcnBvbGF0ZV9sYWIsIGludGVycG9sYXRlX251bSwgaW50ZXJwb2xhdGVfcmdiLCBsYWIybGNoLCBsYWIycmdiLCBsYWJfeHl6LCBsY2gybGFiLCBsY2gycmdiLCBsaWdodGVuLCBsaW1pdCwgbG9nLCBsdW1pbmFuY2VfeCwgbSwgbWF4LCBtdWx0aXBseSwgbm9ybWFsLCBudW0ycmdiLCBvdmVybGF5LCBwb3csIHJnYjJjbXlrLCByZ2IyY3NzLCByZ2IyaGV4LCByZ2IyaHNpLCByZ2IyaHNsLCByZ2IyaHN2LCByZ2IybGFiLCByZ2IybGNoLCByZ2IybHVtaW5hbmNlLCByZ2IybnVtLCByZ2IydGVtcGVyYXR1cmUsIHJnYjJ4eXosIHJnYl94eXosIHJuZCwgcm9vdCwgcm91bmQsIHNjcmVlbiwgc2luLCBzcXJ0LCB0ZW1wZXJhdHVyZTJyZ2IsIHR5cGUsIHVucGFjaywgdzNjeDExLCB4eXpfbGFiLCB4eXpfcmdiLFxuICAgIHNsaWNlID0gW10uc2xpY2U7XG5cbiAgdHlwZSA9IChmdW5jdGlvbigpIHtcblxuICAgIC8qXG4gICAgZm9yIGJyb3dzZXItc2FmZSB0eXBlIGNoZWNraW5nK1xuICAgIHBvcnRlZCBmcm9tIGpRdWVyeSdzICQudHlwZVxuICAgICAqL1xuICAgIHZhciBjbGFzc1RvVHlwZSwgbGVuLCBuYW1lLCBvLCByZWY7XG4gICAgY2xhc3NUb1R5cGUgPSB7fTtcbiAgICByZWYgPSBcIkJvb2xlYW4gTnVtYmVyIFN0cmluZyBGdW5jdGlvbiBBcnJheSBEYXRlIFJlZ0V4cCBVbmRlZmluZWQgTnVsbFwiLnNwbGl0KFwiIFwiKTtcbiAgICBmb3IgKG8gPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBvIDwgbGVuOyBvKyspIHtcbiAgICAgIG5hbWUgPSByZWZbb107XG4gICAgICBjbGFzc1RvVHlwZVtcIltvYmplY3QgXCIgKyBuYW1lICsgXCJdXCJdID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICB2YXIgc3RyVHlwZTtcbiAgICAgIHN0clR5cGUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKTtcbiAgICAgIHJldHVybiBjbGFzc1RvVHlwZVtzdHJUeXBlXSB8fCBcIm9iamVjdFwiO1xuICAgIH07XG4gIH0pKCk7XG5cbiAgbGltaXQgPSBmdW5jdGlvbih4LCBtaW4sIG1heCkge1xuICAgIGlmIChtaW4gPT0gbnVsbCkge1xuICAgICAgbWluID0gMDtcbiAgICB9XG4gICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICBtYXggPSAxO1xuICAgIH1cbiAgICBpZiAoeCA8IG1pbikge1xuICAgICAgeCA9IG1pbjtcbiAgICB9XG4gICAgaWYgKHggPiBtYXgpIHtcbiAgICAgIHggPSBtYXg7XG4gICAgfVxuICAgIHJldHVybiB4O1xuICB9O1xuXG4gIHVucGFjayA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPj0gMykge1xuICAgICAgcmV0dXJuIFtdLnNsaWNlLmNhbGwoYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhcmdzWzBdO1xuICAgIH1cbiAgfTtcblxuICBjbGlwX3JnYiA9IGZ1bmN0aW9uKHJnYikge1xuICAgIHZhciBpO1xuICAgIGZvciAoaSBpbiByZ2IpIHtcbiAgICAgIGlmIChpIDwgMykge1xuICAgICAgICBpZiAocmdiW2ldIDwgMCkge1xuICAgICAgICAgIHJnYltpXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJnYltpXSA+IDI1NSkge1xuICAgICAgICAgIHJnYltpXSA9IDI1NTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpID09PSAzKSB7XG4gICAgICAgIGlmIChyZ2JbaV0gPCAwKSB7XG4gICAgICAgICAgcmdiW2ldID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmdiW2ldID4gMSkge1xuICAgICAgICAgIHJnYltpXSA9IDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJnYjtcbiAgfTtcblxuICBQSSA9IE1hdGguUEksIHJvdW5kID0gTWF0aC5yb3VuZCwgY29zID0gTWF0aC5jb3MsIGZsb29yID0gTWF0aC5mbG9vciwgcG93ID0gTWF0aC5wb3csIGxvZyA9IE1hdGgubG9nLCBzaW4gPSBNYXRoLnNpbiwgc3FydCA9IE1hdGguc3FydCwgYXRhbjIgPSBNYXRoLmF0YW4yLCBtYXggPSBNYXRoLm1heCwgYWJzID0gTWF0aC5hYnM7XG5cbiAgVFdPUEkgPSBQSSAqIDI7XG5cbiAgUElUSElSRCA9IFBJIC8gMztcblxuICBERUcyUkFEID0gUEkgLyAxODA7XG5cbiAgUkFEMkRFRyA9IDE4MCAvIFBJO1xuXG4gIGNocm9tYSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBDb2xvcikge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50c1swXTtcbiAgICB9XG4gICAgcmV0dXJuIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpO1xuICAgICAgcmV0dXJuIE9iamVjdChyZXN1bHQpID09PSByZXN1bHQgPyByZXN1bHQgOiBjaGlsZDtcbiAgICB9KShDb2xvciwgYXJndW1lbnRzLCBmdW5jdGlvbigpe30pO1xuICB9O1xuXG4gIF9pbnRlcnBvbGF0b3JzID0gW107XG5cbiAgaWYgKCh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZSAhPT0gbnVsbCkgJiYgKG1vZHVsZS5leHBvcnRzICE9IG51bGwpKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBjaHJvbWE7XG4gIH1cblxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFtdLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjaHJvbWE7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcm9vdCA9IHR5cGVvZiBleHBvcnRzICE9PSBcInVuZGVmaW5lZFwiICYmIGV4cG9ydHMgIT09IG51bGwgPyBleHBvcnRzIDogdGhpcztcbiAgICByb290LmNocm9tYSA9IGNocm9tYTtcbiAgfVxuXG4gIGNocm9tYS52ZXJzaW9uID0gJzEuMi4xJztcblxuXG4gIC8qKlxuICAgICAgY2hyb21hLmpzXG4gIFxuICAgICAgQ29weXJpZ2h0IChjKSAyMDExLTIwMTMsIEdyZWdvciBBaXNjaFxuICAgICAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAgXG4gICAgICBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAgICAgIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICBcbiAgICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICBcbiAgICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgICAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uXG4gICAgICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuICBcbiAgICAgICogVGhlIG5hbWUgR3JlZ29yIEFpc2NoIG1heSBub3QgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHNcbiAgICAgICAgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gIFxuICAgICAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCJcbiAgICAgIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEVcbiAgICAgIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRVxuICAgICAgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgR1JFR09SIEFJU0NIIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsXG4gICAgICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORyxcbiAgICAgIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsXG4gICAgICBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZXG4gICAgICBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElOR1xuICAgICAgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLFxuICAgICAgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAgXG4gICAgICBAc291cmNlOiBodHRwczovL2dpdGh1Yi5jb20vZ2thL2Nocm9tYS5qc1xuICAgKi9cblxuICBfaW5wdXQgPSB7fTtcblxuICBfZ3Vlc3NfZm9ybWF0cyA9IFtdO1xuXG4gIF9ndWVzc19mb3JtYXRzX3NvcnRlZCA9IGZhbHNlO1xuXG4gIENvbG9yID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIENvbG9yKCkge1xuICAgICAgdmFyIGFyZywgYXJncywgY2hrLCBsZW4sIGxlbjEsIG1lLCBtb2RlLCBvLCB3O1xuICAgICAgbWUgPSB0aGlzO1xuICAgICAgYXJncyA9IFtdO1xuICAgICAgZm9yIChvID0gMCwgbGVuID0gYXJndW1lbnRzLmxlbmd0aDsgbyA8IGxlbjsgbysrKSB7XG4gICAgICAgIGFyZyA9IGFyZ3VtZW50c1tvXTtcbiAgICAgICAgaWYgKGFyZyAhPSBudWxsKSB7XG4gICAgICAgICAgYXJncy5wdXNoKGFyZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG1vZGUgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG4gICAgICBpZiAoX2lucHV0W21vZGVdICE9IG51bGwpIHtcbiAgICAgICAgbWUuX3JnYiA9IGNsaXBfcmdiKF9pbnB1dFttb2RlXSh1bnBhY2soYXJncy5zbGljZSgwLCAtMSkpKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIV9ndWVzc19mb3JtYXRzX3NvcnRlZCkge1xuICAgICAgICAgIF9ndWVzc19mb3JtYXRzID0gX2d1ZXNzX2Zvcm1hdHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYi5wIC0gYS5wO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIF9ndWVzc19mb3JtYXRzX3NvcnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh3ID0gMCwgbGVuMSA9IF9ndWVzc19mb3JtYXRzLmxlbmd0aDsgdyA8IGxlbjE7IHcrKykge1xuICAgICAgICAgIGNoayA9IF9ndWVzc19mb3JtYXRzW3ddO1xuICAgICAgICAgIG1vZGUgPSBjaGsudGVzdC5hcHBseShjaGssIGFyZ3MpO1xuICAgICAgICAgIGlmIChtb2RlKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1vZGUpIHtcbiAgICAgICAgICBtZS5fcmdiID0gY2xpcF9yZ2IoX2lucHV0W21vZGVdLmFwcGx5KF9pbnB1dCwgYXJncykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWUuX3JnYiA9PSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUud2FybigndW5rbm93biBmb3JtYXQ6ICcgKyBhcmdzKTtcbiAgICAgIH1cbiAgICAgIGlmIChtZS5fcmdiID09IG51bGwpIHtcbiAgICAgICAgbWUuX3JnYiA9IFswLCAwLCAwXTtcbiAgICAgIH1cbiAgICAgIGlmIChtZS5fcmdiLmxlbmd0aCA9PT0gMykge1xuICAgICAgICBtZS5fcmdiLnB1c2goMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgQ29sb3IucHJvdG90eXBlLmFscGhhID0gZnVuY3Rpb24oYWxwaGEpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuX3JnYlszXSA9IGFscGhhO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9yZ2JbM107XG4gICAgfTtcblxuICAgIENvbG9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMubmFtZSgpO1xuICAgIH07XG5cbiAgICByZXR1cm4gQ29sb3I7XG5cbiAgfSkoKTtcblxuICBjaHJvbWEuX2lucHV0ID0gX2lucHV0O1xuXG5cbiAgLyoqXG4gIFx0Q29sb3JCcmV3ZXIgY29sb3JzIGZvciBjaHJvbWEuanNcbiAgXG4gIFx0Q29weXJpZ2h0IChjKSAyMDAyIEN5bnRoaWEgQnJld2VyLCBNYXJrIEhhcnJvd2VyLCBhbmQgVGhlIFxuICBcdFBlbm5zeWx2YW5pYSBTdGF0ZSBVbml2ZXJzaXR5LlxuICBcbiAgXHRMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyBcbiAgXHR5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gIFx0WW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XHRcbiAgXHRodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAgXG4gIFx0VW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZSBkaXN0cmlidXRlZFxuICBcdHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVCBXQVJSQU5USUVTIE9SXG4gIFx0Q09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGVcbiAgXHRzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICBcbiAgICAgIEBwcmVzZXJ2ZVxuICAgKi9cblxuICBjaHJvbWEuYnJld2VyID0gYnJld2VyID0ge1xuICAgIE9yUmQ6IFsnI2ZmZjdlYycsICcjZmVlOGM4JywgJyNmZGQ0OWUnLCAnI2ZkYmI4NCcsICcjZmM4ZDU5JywgJyNlZjY1NDgnLCAnI2Q3MzAxZicsICcjYjMwMDAwJywgJyM3ZjAwMDAnXSxcbiAgICBQdUJ1OiBbJyNmZmY3ZmInLCAnI2VjZTdmMicsICcjZDBkMWU2JywgJyNhNmJkZGInLCAnIzc0YTljZicsICcjMzY5MGMwJywgJyMwNTcwYjAnLCAnIzA0NWE4ZCcsICcjMDIzODU4J10sXG4gICAgQnVQdTogWycjZjdmY2ZkJywgJyNlMGVjZjQnLCAnI2JmZDNlNicsICcjOWViY2RhJywgJyM4Yzk2YzYnLCAnIzhjNmJiMScsICcjODg0MTlkJywgJyM4MTBmN2MnLCAnIzRkMDA0YiddLFxuICAgIE9yYW5nZXM6IFsnI2ZmZjVlYicsICcjZmVlNmNlJywgJyNmZGQwYTInLCAnI2ZkYWU2YicsICcjZmQ4ZDNjJywgJyNmMTY5MTMnLCAnI2Q5NDgwMScsICcjYTYzNjAzJywgJyM3ZjI3MDQnXSxcbiAgICBCdUduOiBbJyNmN2ZjZmQnLCAnI2U1ZjVmOScsICcjY2NlY2U2JywgJyM5OWQ4YzknLCAnIzY2YzJhNCcsICcjNDFhZTc2JywgJyMyMzhiNDUnLCAnIzAwNmQyYycsICcjMDA0NDFiJ10sXG4gICAgWWxPckJyOiBbJyNmZmZmZTUnLCAnI2ZmZjdiYycsICcjZmVlMzkxJywgJyNmZWM0NGYnLCAnI2ZlOTkyOScsICcjZWM3MDE0JywgJyNjYzRjMDInLCAnIzk5MzQwNCcsICcjNjYyNTA2J10sXG4gICAgWWxHbjogWycjZmZmZmU1JywgJyNmN2ZjYjknLCAnI2Q5ZjBhMycsICcjYWRkZDhlJywgJyM3OGM2NzknLCAnIzQxYWI1ZCcsICcjMjM4NDQzJywgJyMwMDY4MzcnLCAnIzAwNDUyOSddLFxuICAgIFJlZHM6IFsnI2ZmZjVmMCcsICcjZmVlMGQyJywgJyNmY2JiYTEnLCAnI2ZjOTI3MicsICcjZmI2YTRhJywgJyNlZjNiMmMnLCAnI2NiMTgxZCcsICcjYTUwZjE1JywgJyM2NzAwMGQnXSxcbiAgICBSZFB1OiBbJyNmZmY3ZjMnLCAnI2ZkZTBkZCcsICcjZmNjNWMwJywgJyNmYTlmYjUnLCAnI2Y3NjhhMScsICcjZGQzNDk3JywgJyNhZTAxN2UnLCAnIzdhMDE3NycsICcjNDkwMDZhJ10sXG4gICAgR3JlZW5zOiBbJyNmN2ZjZjUnLCAnI2U1ZjVlMCcsICcjYzdlOWMwJywgJyNhMWQ5OWInLCAnIzc0YzQ3NicsICcjNDFhYjVkJywgJyMyMzhiNDUnLCAnIzAwNmQyYycsICcjMDA0NDFiJ10sXG4gICAgWWxHbkJ1OiBbJyNmZmZmZDknLCAnI2VkZjhiMScsICcjYzdlOWI0JywgJyM3ZmNkYmInLCAnIzQxYjZjNCcsICcjMWQ5MWMwJywgJyMyMjVlYTgnLCAnIzI1MzQ5NCcsICcjMDgxZDU4J10sXG4gICAgUHVycGxlczogWycjZmNmYmZkJywgJyNlZmVkZjUnLCAnI2RhZGFlYicsICcjYmNiZGRjJywgJyM5ZTlhYzgnLCAnIzgwN2RiYScsICcjNmE1MWEzJywgJyM1NDI3OGYnLCAnIzNmMDA3ZCddLFxuICAgIEduQnU6IFsnI2Y3ZmNmMCcsICcjZTBmM2RiJywgJyNjY2ViYzUnLCAnI2E4ZGRiNScsICcjN2JjY2M0JywgJyM0ZWIzZDMnLCAnIzJiOGNiZScsICcjMDg2OGFjJywgJyMwODQwODEnXSxcbiAgICBHcmV5czogWycjZmZmZmZmJywgJyNmMGYwZjAnLCAnI2Q5ZDlkOScsICcjYmRiZGJkJywgJyM5Njk2OTYnLCAnIzczNzM3MycsICcjNTI1MjUyJywgJyMyNTI1MjUnLCAnIzAwMDAwMCddLFxuICAgIFlsT3JSZDogWycjZmZmZmNjJywgJyNmZmVkYTAnLCAnI2ZlZDk3NicsICcjZmViMjRjJywgJyNmZDhkM2MnLCAnI2ZjNGUyYScsICcjZTMxYTFjJywgJyNiZDAwMjYnLCAnIzgwMDAyNiddLFxuICAgIFB1UmQ6IFsnI2Y3ZjRmOScsICcjZTdlMWVmJywgJyNkNGI5ZGEnLCAnI2M5OTRjNycsICcjZGY2NWIwJywgJyNlNzI5OGEnLCAnI2NlMTI1NicsICcjOTgwMDQzJywgJyM2NzAwMWYnXSxcbiAgICBCbHVlczogWycjZjdmYmZmJywgJyNkZWViZjcnLCAnI2M2ZGJlZicsICcjOWVjYWUxJywgJyM2YmFlZDYnLCAnIzQyOTJjNicsICcjMjE3MWI1JywgJyMwODUxOWMnLCAnIzA4MzA2YiddLFxuICAgIFB1QnVHbjogWycjZmZmN2ZiJywgJyNlY2UyZjAnLCAnI2QwZDFlNicsICcjYTZiZGRiJywgJyM2N2E5Y2YnLCAnIzM2OTBjMCcsICcjMDI4MThhJywgJyMwMTZjNTknLCAnIzAxNDYzNiddLFxuICAgIFNwZWN0cmFsOiBbJyM5ZTAxNDInLCAnI2Q1M2U0ZicsICcjZjQ2ZDQzJywgJyNmZGFlNjEnLCAnI2ZlZTA4YicsICcjZmZmZmJmJywgJyNlNmY1OTgnLCAnI2FiZGRhNCcsICcjNjZjMmE1JywgJyMzMjg4YmQnLCAnIzVlNGZhMiddLFxuICAgIFJkWWxHbjogWycjYTUwMDI2JywgJyNkNzMwMjcnLCAnI2Y0NmQ0MycsICcjZmRhZTYxJywgJyNmZWUwOGInLCAnI2ZmZmZiZicsICcjZDllZjhiJywgJyNhNmQ5NmEnLCAnIzY2YmQ2MycsICcjMWE5ODUwJywgJyMwMDY4MzcnXSxcbiAgICBSZEJ1OiBbJyM2NzAwMWYnLCAnI2IyMTgyYicsICcjZDY2MDRkJywgJyNmNGE1ODInLCAnI2ZkZGJjNycsICcjZjdmN2Y3JywgJyNkMWU1ZjAnLCAnIzkyYzVkZScsICcjNDM5M2MzJywgJyMyMTY2YWMnLCAnIzA1MzA2MSddLFxuICAgIFBpWUc6IFsnIzhlMDE1MicsICcjYzUxYjdkJywgJyNkZTc3YWUnLCAnI2YxYjZkYScsICcjZmRlMGVmJywgJyNmN2Y3ZjcnLCAnI2U2ZjVkMCcsICcjYjhlMTg2JywgJyM3ZmJjNDEnLCAnIzRkOTIyMScsICcjMjc2NDE5J10sXG4gICAgUFJHbjogWycjNDAwMDRiJywgJyM3NjJhODMnLCAnIzk5NzBhYicsICcjYzJhNWNmJywgJyNlN2Q0ZTgnLCAnI2Y3ZjdmNycsICcjZDlmMGQzJywgJyNhNmRiYTAnLCAnIzVhYWU2MScsICcjMWI3ODM3JywgJyMwMDQ0MWInXSxcbiAgICBSZFlsQnU6IFsnI2E1MDAyNicsICcjZDczMDI3JywgJyNmNDZkNDMnLCAnI2ZkYWU2MScsICcjZmVlMDkwJywgJyNmZmZmYmYnLCAnI2UwZjNmOCcsICcjYWJkOWU5JywgJyM3NGFkZDEnLCAnIzQ1NzViNCcsICcjMzEzNjk1J10sXG4gICAgQnJCRzogWycjNTQzMDA1JywgJyM4YzUxMGEnLCAnI2JmODEyZCcsICcjZGZjMjdkJywgJyNmNmU4YzMnLCAnI2Y1ZjVmNScsICcjYzdlYWU1JywgJyM4MGNkYzEnLCAnIzM1OTc4ZicsICcjMDE2NjVlJywgJyMwMDNjMzAnXSxcbiAgICBSZEd5OiBbJyM2NzAwMWYnLCAnI2IyMTgyYicsICcjZDY2MDRkJywgJyNmNGE1ODInLCAnI2ZkZGJjNycsICcjZmZmZmZmJywgJyNlMGUwZTAnLCAnI2JhYmFiYScsICcjODc4Nzg3JywgJyM0ZDRkNGQnLCAnIzFhMWExYSddLFxuICAgIFB1T3I6IFsnIzdmM2IwOCcsICcjYjM1ODA2JywgJyNlMDgyMTQnLCAnI2ZkYjg2MycsICcjZmVlMGI2JywgJyNmN2Y3ZjcnLCAnI2Q4ZGFlYicsICcjYjJhYmQyJywgJyM4MDczYWMnLCAnIzU0Mjc4OCcsICcjMmQwMDRiJ10sXG4gICAgU2V0MjogWycjNjZjMmE1JywgJyNmYzhkNjInLCAnIzhkYTBjYicsICcjZTc4YWMzJywgJyNhNmQ4NTQnLCAnI2ZmZDkyZicsICcjZTVjNDk0JywgJyNiM2IzYjMnXSxcbiAgICBBY2NlbnQ6IFsnIzdmYzk3ZicsICcjYmVhZWQ0JywgJyNmZGMwODYnLCAnI2ZmZmY5OScsICcjMzg2Y2IwJywgJyNmMDAyN2YnLCAnI2JmNWIxNycsICcjNjY2NjY2J10sXG4gICAgU2V0MTogWycjZTQxYTFjJywgJyMzNzdlYjgnLCAnIzRkYWY0YScsICcjOTg0ZWEzJywgJyNmZjdmMDAnLCAnI2ZmZmYzMycsICcjYTY1NjI4JywgJyNmNzgxYmYnLCAnIzk5OTk5OSddLFxuICAgIFNldDM6IFsnIzhkZDNjNycsICcjZmZmZmIzJywgJyNiZWJhZGEnLCAnI2ZiODA3MicsICcjODBiMWQzJywgJyNmZGI0NjInLCAnI2IzZGU2OScsICcjZmNjZGU1JywgJyNkOWQ5ZDknLCAnI2JjODBiZCcsICcjY2NlYmM1JywgJyNmZmVkNmYnXSxcbiAgICBEYXJrMjogWycjMWI5ZTc3JywgJyNkOTVmMDInLCAnIzc1NzBiMycsICcjZTcyOThhJywgJyM2NmE2MWUnLCAnI2U2YWIwMicsICcjYTY3NjFkJywgJyM2NjY2NjYnXSxcbiAgICBQYWlyZWQ6IFsnI2E2Y2VlMycsICcjMWY3OGI0JywgJyNiMmRmOGEnLCAnIzMzYTAyYycsICcjZmI5YTk5JywgJyNlMzFhMWMnLCAnI2ZkYmY2ZicsICcjZmY3ZjAwJywgJyNjYWIyZDYnLCAnIzZhM2Q5YScsICcjZmZmZjk5JywgJyNiMTU5MjgnXSxcbiAgICBQYXN0ZWwyOiBbJyNiM2UyY2QnLCAnI2ZkY2RhYycsICcjY2JkNWU4JywgJyNmNGNhZTQnLCAnI2U2ZjVjOScsICcjZmZmMmFlJywgJyNmMWUyY2MnLCAnI2NjY2NjYyddLFxuICAgIFBhc3RlbDE6IFsnI2ZiYjRhZScsICcjYjNjZGUzJywgJyNjY2ViYzUnLCAnI2RlY2JlNCcsICcjZmVkOWE2JywgJyNmZmZmY2MnLCAnI2U1ZDhiZCcsICcjZmRkYWVjJywgJyNmMmYyZjInXVxuICB9O1xuXG5cbiAgLyoqXG4gIFx0WDExIGNvbG9yIG5hbWVzXG4gIFxuICBcdGh0dHA6Ly93d3cudzMub3JnL1RSL2NzczMtY29sb3IvI3N2Zy1jb2xvclxuICAgKi9cblxuICB3M2N4MTEgPSB7XG4gICAgaW5kaWdvOiBcIiM0YjAwODJcIixcbiAgICBnb2xkOiBcIiNmZmQ3MDBcIixcbiAgICBob3RwaW5rOiBcIiNmZjY5YjRcIixcbiAgICBmaXJlYnJpY2s6IFwiI2IyMjIyMlwiLFxuICAgIGluZGlhbnJlZDogXCIjY2Q1YzVjXCIsXG4gICAgeWVsbG93OiBcIiNmZmZmMDBcIixcbiAgICBtaXN0eXJvc2U6IFwiI2ZmZTRlMVwiLFxuICAgIGRhcmtvbGl2ZWdyZWVuOiBcIiM1NTZiMmZcIixcbiAgICBvbGl2ZTogXCIjODA4MDAwXCIsXG4gICAgZGFya3NlYWdyZWVuOiBcIiM4ZmJjOGZcIixcbiAgICBwaW5rOiBcIiNmZmMwY2JcIixcbiAgICB0b21hdG86IFwiI2ZmNjM0N1wiLFxuICAgIGxpZ2h0Y29yYWw6IFwiI2YwODA4MFwiLFxuICAgIG9yYW5nZXJlZDogXCIjZmY0NTAwXCIsXG4gICAgbmF2YWpvd2hpdGU6IFwiI2ZmZGVhZFwiLFxuICAgIGxpbWU6IFwiIzAwZmYwMFwiLFxuICAgIHBhbGVncmVlbjogXCIjOThmYjk4XCIsXG4gICAgZGFya3NsYXRlZ3JleTogXCIjMmY0ZjRmXCIsXG4gICAgZ3JlZW55ZWxsb3c6IFwiI2FkZmYyZlwiLFxuICAgIGJ1cmx5d29vZDogXCIjZGViODg3XCIsXG4gICAgc2Vhc2hlbGw6IFwiI2ZmZjVlZVwiLFxuICAgIG1lZGl1bXNwcmluZ2dyZWVuOiBcIiMwMGZhOWFcIixcbiAgICBmdWNoc2lhOiBcIiNmZjAwZmZcIixcbiAgICBwYXBheWF3aGlwOiBcIiNmZmVmZDVcIixcbiAgICBibGFuY2hlZGFsbW9uZDogXCIjZmZlYmNkXCIsXG4gICAgY2hhcnRyZXVzZTogXCIjN2ZmZjAwXCIsXG4gICAgZGltZ3JheTogXCIjNjk2OTY5XCIsXG4gICAgYmxhY2s6IFwiIzAwMDAwMFwiLFxuICAgIHBlYWNocHVmZjogXCIjZmZkYWI5XCIsXG4gICAgc3ByaW5nZ3JlZW46IFwiIzAwZmY3ZlwiLFxuICAgIGFxdWFtYXJpbmU6IFwiIzdmZmZkNFwiLFxuICAgIHdoaXRlOiBcIiNmZmZmZmZcIixcbiAgICBvcmFuZ2U6IFwiI2ZmYTUwMFwiLFxuICAgIGxpZ2h0c2FsbW9uOiBcIiNmZmEwN2FcIixcbiAgICBkYXJrc2xhdGVncmF5OiBcIiMyZjRmNGZcIixcbiAgICBicm93bjogXCIjYTUyYTJhXCIsXG4gICAgaXZvcnk6IFwiI2ZmZmZmMFwiLFxuICAgIGRvZGdlcmJsdWU6IFwiIzFlOTBmZlwiLFxuICAgIHBlcnU6IFwiI2NkODUzZlwiLFxuICAgIGxhd25ncmVlbjogXCIjN2NmYzAwXCIsXG4gICAgY2hvY29sYXRlOiBcIiNkMjY5MWVcIixcbiAgICBjcmltc29uOiBcIiNkYzE0M2NcIixcbiAgICBmb3Jlc3RncmVlbjogXCIjMjI4YjIyXCIsXG4gICAgZGFya2dyZXk6IFwiI2E5YTlhOVwiLFxuICAgIGxpZ2h0c2VhZ3JlZW46IFwiIzIwYjJhYVwiLFxuICAgIGN5YW46IFwiIzAwZmZmZlwiLFxuICAgIG1pbnRjcmVhbTogXCIjZjVmZmZhXCIsXG4gICAgc2lsdmVyOiBcIiNjMGMwYzBcIixcbiAgICBhbnRpcXVld2hpdGU6IFwiI2ZhZWJkN1wiLFxuICAgIG1lZGl1bW9yY2hpZDogXCIjYmE1NWQzXCIsXG4gICAgc2t5Ymx1ZTogXCIjODdjZWViXCIsXG4gICAgZ3JheTogXCIjODA4MDgwXCIsXG4gICAgZGFya3R1cnF1b2lzZTogXCIjMDBjZWQxXCIsXG4gICAgZ29sZGVucm9kOiBcIiNkYWE1MjBcIixcbiAgICBkYXJrZ3JlZW46IFwiIzAwNjQwMFwiLFxuICAgIGZsb3JhbHdoaXRlOiBcIiNmZmZhZjBcIixcbiAgICBkYXJrdmlvbGV0OiBcIiM5NDAwZDNcIixcbiAgICBkYXJrZ3JheTogXCIjYTlhOWE5XCIsXG4gICAgbW9jY2FzaW46IFwiI2ZmZTRiNVwiLFxuICAgIHNhZGRsZWJyb3duOiBcIiM4YjQ1MTNcIixcbiAgICBncmV5OiBcIiM4MDgwODBcIixcbiAgICBkYXJrc2xhdGVibHVlOiBcIiM0ODNkOGJcIixcbiAgICBsaWdodHNreWJsdWU6IFwiIzg3Y2VmYVwiLFxuICAgIGxpZ2h0cGluazogXCIjZmZiNmMxXCIsXG4gICAgbWVkaXVtdmlvbGV0cmVkOiBcIiNjNzE1ODVcIixcbiAgICBzbGF0ZWdyZXk6IFwiIzcwODA5MFwiLFxuICAgIHJlZDogXCIjZmYwMDAwXCIsXG4gICAgZGVlcHBpbms6IFwiI2ZmMTQ5M1wiLFxuICAgIGxpbWVncmVlbjogXCIjMzJjZDMyXCIsXG4gICAgZGFya21hZ2VudGE6IFwiIzhiMDA4YlwiLFxuICAgIHBhbGVnb2xkZW5yb2Q6IFwiI2VlZThhYVwiLFxuICAgIHBsdW06IFwiI2RkYTBkZFwiLFxuICAgIHR1cnF1b2lzZTogXCIjNDBlMGQwXCIsXG4gICAgbGlnaHRncmV5OiBcIiNkM2QzZDNcIixcbiAgICBsaWdodGdvbGRlbnJvZHllbGxvdzogXCIjZmFmYWQyXCIsXG4gICAgZGFya2dvbGRlbnJvZDogXCIjYjg4NjBiXCIsXG4gICAgbGF2ZW5kZXI6IFwiI2U2ZTZmYVwiLFxuICAgIG1hcm9vbjogXCIjODAwMDAwXCIsXG4gICAgeWVsbG93Z3JlZW46IFwiIzlhY2QzMlwiLFxuICAgIHNhbmR5YnJvd246IFwiI2Y0YTQ2MFwiLFxuICAgIHRoaXN0bGU6IFwiI2Q4YmZkOFwiLFxuICAgIHZpb2xldDogXCIjZWU4MmVlXCIsXG4gICAgbmF2eTogXCIjMDAwMDgwXCIsXG4gICAgbWFnZW50YTogXCIjZmYwMGZmXCIsXG4gICAgZGltZ3JleTogXCIjNjk2OTY5XCIsXG4gICAgdGFuOiBcIiNkMmI0OGNcIixcbiAgICByb3N5YnJvd246IFwiI2JjOGY4ZlwiLFxuICAgIG9saXZlZHJhYjogXCIjNmI4ZTIzXCIsXG4gICAgYmx1ZTogXCIjMDAwMGZmXCIsXG4gICAgbGlnaHRibHVlOiBcIiNhZGQ4ZTZcIixcbiAgICBnaG9zdHdoaXRlOiBcIiNmOGY4ZmZcIixcbiAgICBob25leWRldzogXCIjZjBmZmYwXCIsXG4gICAgY29ybmZsb3dlcmJsdWU6IFwiIzY0OTVlZFwiLFxuICAgIHNsYXRlYmx1ZTogXCIjNmE1YWNkXCIsXG4gICAgbGluZW46IFwiI2ZhZjBlNlwiLFxuICAgIGRhcmtibHVlOiBcIiMwMDAwOGJcIixcbiAgICBwb3dkZXJibHVlOiBcIiNiMGUwZTZcIixcbiAgICBzZWFncmVlbjogXCIjMmU4YjU3XCIsXG4gICAgZGFya2toYWtpOiBcIiNiZGI3NmJcIixcbiAgICBzbm93OiBcIiNmZmZhZmFcIixcbiAgICBzaWVubmE6IFwiI2EwNTIyZFwiLFxuICAgIG1lZGl1bWJsdWU6IFwiIzAwMDBjZFwiLFxuICAgIHJveWFsYmx1ZTogXCIjNDE2OWUxXCIsXG4gICAgbGlnaHRjeWFuOiBcIiNlMGZmZmZcIixcbiAgICBncmVlbjogXCIjMDA4MDAwXCIsXG4gICAgbWVkaXVtcHVycGxlOiBcIiM5MzcwZGJcIixcbiAgICBtaWRuaWdodGJsdWU6IFwiIzE5MTk3MFwiLFxuICAgIGNvcm5zaWxrOiBcIiNmZmY4ZGNcIixcbiAgICBwYWxldHVycXVvaXNlOiBcIiNhZmVlZWVcIixcbiAgICBiaXNxdWU6IFwiI2ZmZTRjNFwiLFxuICAgIHNsYXRlZ3JheTogXCIjNzA4MDkwXCIsXG4gICAgZGFya2N5YW46IFwiIzAwOGI4YlwiLFxuICAgIGtoYWtpOiBcIiNmMGU2OGNcIixcbiAgICB3aGVhdDogXCIjZjVkZWIzXCIsXG4gICAgdGVhbDogXCIjMDA4MDgwXCIsXG4gICAgZGFya29yY2hpZDogXCIjOTkzMmNjXCIsXG4gICAgZGVlcHNreWJsdWU6IFwiIzAwYmZmZlwiLFxuICAgIHNhbG1vbjogXCIjZmE4MDcyXCIsXG4gICAgZGFya3JlZDogXCIjOGIwMDAwXCIsXG4gICAgc3RlZWxibHVlOiBcIiM0NjgyYjRcIixcbiAgICBwYWxldmlvbGV0cmVkOiBcIiNkYjcwOTNcIixcbiAgICBsaWdodHNsYXRlZ3JheTogXCIjNzc4ODk5XCIsXG4gICAgYWxpY2VibHVlOiBcIiNmMGY4ZmZcIixcbiAgICBsaWdodHNsYXRlZ3JleTogXCIjNzc4ODk5XCIsXG4gICAgbGlnaHRncmVlbjogXCIjOTBlZTkwXCIsXG4gICAgb3JjaGlkOiBcIiNkYTcwZDZcIixcbiAgICBnYWluc2Jvcm86IFwiI2RjZGNkY1wiLFxuICAgIG1lZGl1bXNlYWdyZWVuOiBcIiMzY2IzNzFcIixcbiAgICBsaWdodGdyYXk6IFwiI2QzZDNkM1wiLFxuICAgIG1lZGl1bXR1cnF1b2lzZTogXCIjNDhkMWNjXCIsXG4gICAgbGVtb25jaGlmZm9uOiBcIiNmZmZhY2RcIixcbiAgICBjYWRldGJsdWU6IFwiIzVmOWVhMFwiLFxuICAgIGxpZ2h0eWVsbG93OiBcIiNmZmZmZTBcIixcbiAgICBsYXZlbmRlcmJsdXNoOiBcIiNmZmYwZjVcIixcbiAgICBjb3JhbDogXCIjZmY3ZjUwXCIsXG4gICAgcHVycGxlOiBcIiM4MDAwODBcIixcbiAgICBhcXVhOiBcIiMwMGZmZmZcIixcbiAgICB3aGl0ZXNtb2tlOiBcIiNmNWY1ZjVcIixcbiAgICBtZWRpdW1zbGF0ZWJsdWU6IFwiIzdiNjhlZVwiLFxuICAgIGRhcmtvcmFuZ2U6IFwiI2ZmOGMwMFwiLFxuICAgIG1lZGl1bWFxdWFtYXJpbmU6IFwiIzY2Y2RhYVwiLFxuICAgIGRhcmtzYWxtb246IFwiI2U5OTY3YVwiLFxuICAgIGJlaWdlOiBcIiNmNWY1ZGNcIixcbiAgICBibHVldmlvbGV0OiBcIiM4YTJiZTJcIixcbiAgICBhenVyZTogXCIjZjBmZmZmXCIsXG4gICAgbGlnaHRzdGVlbGJsdWU6IFwiI2IwYzRkZVwiLFxuICAgIG9sZGxhY2U6IFwiI2ZkZjVlNlwiLFxuICAgIHJlYmVjY2FwdXJwbGU6IFwiIzY2MzM5OVwiXG4gIH07XG5cbiAgY2hyb21hLmNvbG9ycyA9IGNvbG9ycyA9IHczY3gxMTtcblxuICBsYWIycmdiID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGEsIGFyZ3MsIGIsIGcsIGwsIHIsIHgsIHksIHo7XG4gICAgYXJncyA9IHVucGFjayhhcmd1bWVudHMpO1xuICAgIGwgPSBhcmdzWzBdLCBhID0gYXJnc1sxXSwgYiA9IGFyZ3NbMl07XG4gICAgeSA9IChsICsgMTYpIC8gMTE2O1xuICAgIHggPSBpc05hTihhKSA/IHkgOiB5ICsgYSAvIDUwMDtcbiAgICB6ID0gaXNOYU4oYikgPyB5IDogeSAtIGIgLyAyMDA7XG4gICAgeSA9IExBQl9DT05TVEFOVFMuWW4gKiBsYWJfeHl6KHkpO1xuICAgIHggPSBMQUJfQ09OU1RBTlRTLlhuICogbGFiX3h5eih4KTtcbiAgICB6ID0gTEFCX0NPTlNUQU5UUy5abiAqIGxhYl94eXooeik7XG4gICAgciA9IHh5el9yZ2IoMy4yNDA0NTQyICogeCAtIDEuNTM3MTM4NSAqIHkgLSAwLjQ5ODUzMTQgKiB6KTtcbiAgICBnID0geHl6X3JnYigtMC45NjkyNjYwICogeCArIDEuODc2MDEwOCAqIHkgKyAwLjA0MTU1NjAgKiB6KTtcbiAgICBiID0geHl6X3JnYigwLjA1NTY0MzQgKiB4IC0gMC4yMDQwMjU5ICogeSArIDEuMDU3MjI1MiAqIHopO1xuICAgIHIgPSBsaW1pdChyLCAwLCAyNTUpO1xuICAgIGcgPSBsaW1pdChnLCAwLCAyNTUpO1xuICAgIGIgPSBsaW1pdChiLCAwLCAyNTUpO1xuICAgIHJldHVybiBbciwgZywgYiwgYXJncy5sZW5ndGggPiAzID8gYXJnc1szXSA6IDFdO1xuICB9O1xuXG4gIHh5el9yZ2IgPSBmdW5jdGlvbihyKSB7XG4gICAgcmV0dXJuIHJvdW5kKDI1NSAqIChyIDw9IDAuMDAzMDQgPyAxMi45MiAqIHIgOiAxLjA1NSAqIHBvdyhyLCAxIC8gMi40KSAtIDAuMDU1KSk7XG4gIH07XG5cbiAgbGFiX3h5eiA9IGZ1bmN0aW9uKHQpIHtcbiAgICBpZiAodCA+IExBQl9DT05TVEFOVFMudDEpIHtcbiAgICAgIHJldHVybiB0ICogdCAqIHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBMQUJfQ09OU1RBTlRTLnQyICogKHQgLSBMQUJfQ09OU1RBTlRTLnQwKTtcbiAgICB9XG4gIH07XG5cbiAgTEFCX0NPTlNUQU5UUyA9IHtcbiAgICBLbjogMTgsXG4gICAgWG46IDAuOTUwNDcwLFxuICAgIFluOiAxLFxuICAgIFpuOiAxLjA4ODgzMCxcbiAgICB0MDogMC4xMzc5MzEwMzQsXG4gICAgdDE6IDAuMjA2ODk2NTUyLFxuICAgIHQyOiAwLjEyODQxODU1LFxuICAgIHQzOiAwLjAwODg1NjQ1MlxuICB9O1xuXG4gIHJnYjJsYWIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYiwgZywgciwgcmVmLCByZWYxLCB4LCB5LCB6O1xuICAgIHJlZiA9IHVucGFjayhhcmd1bWVudHMpLCByID0gcmVmWzBdLCBnID0gcmVmWzFdLCBiID0gcmVmWzJdO1xuICAgIHJlZjEgPSByZ2IyeHl6KHIsIGcsIGIpLCB4ID0gcmVmMVswXSwgeSA9IHJlZjFbMV0sIHogPSByZWYxWzJdO1xuICAgIHJldHVybiBbMTE2ICogeSAtIDE2LCA1MDAgKiAoeCAtIHkpLCAyMDAgKiAoeSAtIHopXTtcbiAgfTtcblxuICByZ2JfeHl6ID0gZnVuY3Rpb24ocikge1xuICAgIGlmICgociAvPSAyNTUpIDw9IDAuMDQwNDUpIHtcbiAgICAgIHJldHVybiByIC8gMTIuOTI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBwb3coKHIgKyAwLjA1NSkgLyAxLjA1NSwgMi40KTtcbiAgICB9XG4gIH07XG5cbiAgeHl6X2xhYiA9IGZ1bmN0aW9uKHQpIHtcbiAgICBpZiAodCA+IExBQl9DT05TVEFOVFMudDMpIHtcbiAgICAgIHJldHVybiBwb3codCwgMSAvIDMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdCAvIExBQl9DT05TVEFOVFMudDIgKyBMQUJfQ09OU1RBTlRTLnQwO1xuICAgIH1cbiAgfTtcblxuICByZ2IyeHl6ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGIsIGcsIHIsIHJlZiwgeCwgeSwgejtcbiAgICByZWYgPSB1bnBhY2soYXJndW1lbnRzKSwgciA9IHJlZlswXSwgZyA9IHJlZlsxXSwgYiA9IHJlZlsyXTtcbiAgICByID0gcmdiX3h5eihyKTtcbiAgICBnID0gcmdiX3h5eihnKTtcbiAgICBiID0gcmdiX3h5eihiKTtcbiAgICB4ID0geHl6X2xhYigoMC40MTI0NTY0ICogciArIDAuMzU3NTc2MSAqIGcgKyAwLjE4MDQzNzUgKiBiKSAvIExBQl9DT05TVEFOVFMuWG4pO1xuICAgIHkgPSB4eXpfbGFiKCgwLjIxMjY3MjkgKiByICsgMC43MTUxNTIyICogZyArIDAuMDcyMTc1MCAqIGIpIC8gTEFCX0NPTlNUQU5UUy5Zbik7XG4gICAgeiA9IHh5el9sYWIoKDAuMDE5MzMzOSAqIHIgKyAwLjExOTE5MjAgKiBnICsgMC45NTAzMDQxICogYikgLyBMQUJfQ09OU1RBTlRTLlpuKTtcbiAgICByZXR1cm4gW3gsIHksIHpdO1xuICB9O1xuXG4gIGNocm9tYS5sYWIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyk7XG4gICAgICByZXR1cm4gT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCA/IHJlc3VsdCA6IGNoaWxkO1xuICAgIH0pKENvbG9yLCBzbGljZS5jYWxsKGFyZ3VtZW50cykuY29uY2F0KFsnbGFiJ10pLCBmdW5jdGlvbigpe30pO1xuICB9O1xuXG4gIF9pbnB1dC5sYWIgPSBsYWIycmdiO1xuXG4gIENvbG9yLnByb3RvdHlwZS5sYWIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcmdiMmxhYih0aGlzLl9yZ2IpO1xuICB9O1xuXG4gIGJlemllciA9IGZ1bmN0aW9uKGNvbG9ycykge1xuICAgIHZhciBJLCBJMCwgSTEsIGMsIGxhYjAsIGxhYjEsIGxhYjIsIGxhYjMsIHJlZiwgcmVmMSwgcmVmMjtcbiAgICBjb2xvcnMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGVuLCBvLCByZXN1bHRzO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChvID0gMCwgbGVuID0gY29sb3JzLmxlbmd0aDsgbyA8IGxlbjsgbysrKSB7XG4gICAgICAgIGMgPSBjb2xvcnNbb107XG4gICAgICAgIHJlc3VsdHMucHVzaChjaHJvbWEoYykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSkoKTtcbiAgICBpZiAoY29sb3JzLmxlbmd0aCA9PT0gMikge1xuICAgICAgcmVmID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGVuLCBvLCByZXN1bHRzO1xuICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgIGZvciAobyA9IDAsIGxlbiA9IGNvbG9ycy5sZW5ndGg7IG8gPCBsZW47IG8rKykge1xuICAgICAgICAgIGMgPSBjb2xvcnNbb107XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKGMubGFiKCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgfSkoKSwgbGFiMCA9IHJlZlswXSwgbGFiMSA9IHJlZlsxXTtcbiAgICAgIEkgPSBmdW5jdGlvbih0KSB7XG4gICAgICAgIHZhciBpLCBsYWI7XG4gICAgICAgIGxhYiA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgbywgcmVzdWx0cztcbiAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yIChpID0gbyA9IDA7IG8gPD0gMjsgaSA9ICsrbykge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGxhYjBbaV0gKyB0ICogKGxhYjFbaV0gLSBsYWIwW2ldKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9KSgpO1xuICAgICAgICByZXR1cm4gY2hyb21hLmxhYi5hcHBseShjaHJvbWEsIGxhYik7XG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoY29sb3JzLmxlbmd0aCA9PT0gMykge1xuICAgICAgcmVmMSA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGxlbiwgbywgcmVzdWx0cztcbiAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKG8gPSAwLCBsZW4gPSBjb2xvcnMubGVuZ3RoOyBvIDwgbGVuOyBvKyspIHtcbiAgICAgICAgICBjID0gY29sb3JzW29dO1xuICAgICAgICAgIHJlc3VsdHMucHVzaChjLmxhYigpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH0pKCksIGxhYjAgPSByZWYxWzBdLCBsYWIxID0gcmVmMVsxXSwgbGFiMiA9IHJlZjFbMl07XG4gICAgICBJID0gZnVuY3Rpb24odCkge1xuICAgICAgICB2YXIgaSwgbGFiO1xuICAgICAgICBsYWIgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIG8sIHJlc3VsdHM7XG4gICAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvciAoaSA9IG8gPSAwOyBvIDw9IDI7IGkgPSArK28pIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCgoMSAtIHQpICogKDEgLSB0KSAqIGxhYjBbaV0gKyAyICogKDEgLSB0KSAqIHQgKiBsYWIxW2ldICsgdCAqIHQgKiBsYWIyW2ldKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH0pKCk7XG4gICAgICAgIHJldHVybiBjaHJvbWEubGFiLmFwcGx5KGNocm9tYSwgbGFiKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChjb2xvcnMubGVuZ3RoID09PSA0KSB7XG4gICAgICByZWYyID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGVuLCBvLCByZXN1bHRzO1xuICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgIGZvciAobyA9IDAsIGxlbiA9IGNvbG9ycy5sZW5ndGg7IG8gPCBsZW47IG8rKykge1xuICAgICAgICAgIGMgPSBjb2xvcnNbb107XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKGMubGFiKCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgfSkoKSwgbGFiMCA9IHJlZjJbMF0sIGxhYjEgPSByZWYyWzFdLCBsYWIyID0gcmVmMlsyXSwgbGFiMyA9IHJlZjJbM107XG4gICAgICBJID0gZnVuY3Rpb24odCkge1xuICAgICAgICB2YXIgaSwgbGFiO1xuICAgICAgICBsYWIgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIG8sIHJlc3VsdHM7XG4gICAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvciAoaSA9IG8gPSAwOyBvIDw9IDI7IGkgPSArK28pIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCgoMSAtIHQpICogKDEgLSB0KSAqICgxIC0gdCkgKiBsYWIwW2ldICsgMyAqICgxIC0gdCkgKiAoMSAtIHQpICogdCAqIGxhYjFbaV0gKyAzICogKDEgLSB0KSAqIHQgKiB0ICogbGFiMltpXSArIHQgKiB0ICogdCAqIGxhYjNbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfSkoKTtcbiAgICAgICAgcmV0dXJuIGNocm9tYS5sYWIuYXBwbHkoY2hyb21hLCBsYWIpO1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGNvbG9ycy5sZW5ndGggPT09IDUpIHtcbiAgICAgIEkwID0gYmV6aWVyKGNvbG9ycy5zbGljZSgwLCAzKSk7XG4gICAgICBJMSA9IGJlemllcihjb2xvcnMuc2xpY2UoMiwgNSkpO1xuICAgICAgSSA9IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgaWYgKHQgPCAwLjUpIHtcbiAgICAgICAgICByZXR1cm4gSTAodCAqIDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBJMSgodCAtIDAuNSkgKiAyKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIEk7XG4gIH07XG5cbiAgY2hyb21hLmJlemllciA9IGZ1bmN0aW9uKGNvbG9ycykge1xuICAgIHZhciBmO1xuICAgIGYgPSBiZXppZXIoY29sb3JzKTtcbiAgICBmLnNjYWxlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gY2hyb21hLnNjYWxlKGYpO1xuICAgIH07XG4gICAgcmV0dXJuIGY7XG4gIH07XG5cblxuICAvKlxuICAgICAgY2hyb21hLmpzXG4gIFxuICAgICAgQ29weXJpZ2h0IChjKSAyMDExLTIwMTMsIEdyZWdvciBBaXNjaFxuICAgICAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAgXG4gICAgICBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAgICAgIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICBcbiAgICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzXG4gICAgICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICBcbiAgICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICAgICAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uXG4gICAgICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuICBcbiAgICAgICogVGhlIG5hbWUgR3JlZ29yIEFpc2NoIG1heSBub3QgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHNcbiAgICAgICAgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gIFxuICAgICAgVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCJcbiAgICAgIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEVcbiAgICAgIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRVxuICAgICAgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgR1JFR09SIEFJU0NIIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsXG4gICAgICBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORyxcbiAgICAgIEJVVCBOT1QgTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsXG4gICAgICBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZXG4gICAgICBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElOR1xuICAgICAgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLFxuICAgICAgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAgXG4gICAgICBAc291cmNlOiBodHRwczovL2dpdGh1Yi5jb20vZ2thL2Nocm9tYS5qc1xuICAgKi9cblxuICBjaHJvbWEuY3ViZWhlbGl4ID0gZnVuY3Rpb24oc3RhcnQsIHJvdGF0aW9ucywgaHVlLCBnYW1tYSwgbGlnaHRuZXNzKSB7XG4gICAgdmFyIGRoLCBkbCwgZjtcbiAgICBpZiAoc3RhcnQgPT0gbnVsbCkge1xuICAgICAgc3RhcnQgPSAzMDA7XG4gICAgfVxuICAgIGlmIChyb3RhdGlvbnMgPT0gbnVsbCkge1xuICAgICAgcm90YXRpb25zID0gLTEuNTtcbiAgICB9XG4gICAgaWYgKGh1ZSA9PSBudWxsKSB7XG4gICAgICBodWUgPSAxO1xuICAgIH1cbiAgICBpZiAoZ2FtbWEgPT0gbnVsbCkge1xuICAgICAgZ2FtbWEgPSAxO1xuICAgIH1cbiAgICBpZiAobGlnaHRuZXNzID09IG51bGwpIHtcbiAgICAgIGxpZ2h0bmVzcyA9IFswLCAxXTtcbiAgICB9XG4gICAgZGwgPSBsaWdodG5lc3NbMV0gLSBsaWdodG5lc3NbMF07XG4gICAgZGggPSAwO1xuICAgIGYgPSBmdW5jdGlvbihmcmFjdCkge1xuICAgICAgdmFyIGEsIGFtcCwgYiwgY29zX2EsIGcsIGgsIGwsIHIsIHNpbl9hO1xuICAgICAgYSA9IFRXT1BJICogKChzdGFydCArIDEyMCkgLyAzNjAgKyByb3RhdGlvbnMgKiBmcmFjdCk7XG4gICAgICBsID0gcG93KGxpZ2h0bmVzc1swXSArIGRsICogZnJhY3QsIGdhbW1hKTtcbiAgICAgIGggPSBkaCAhPT0gMCA/IGh1ZVswXSArIGZyYWN0ICogZGggOiBodWU7XG4gICAgICBhbXAgPSBoICogbCAqICgxIC0gbCkgLyAyO1xuICAgICAgY29zX2EgPSBjb3MoYSk7XG4gICAgICBzaW5fYSA9IHNpbihhKTtcbiAgICAgIHIgPSBsICsgYW1wICogKC0wLjE0ODYxICogY29zX2EgKyAxLjc4Mjc3ICogc2luX2EpO1xuICAgICAgZyA9IGwgKyBhbXAgKiAoLTAuMjkyMjcgKiBjb3NfYSAtIDAuOTA2NDkgKiBzaW5fYSk7XG4gICAgICBiID0gbCArIGFtcCAqICgrMS45NzI5NCAqIGNvc19hKTtcbiAgICAgIHJldHVybiBjaHJvbWEoY2xpcF9yZ2IoW3IgKiAyNTUsIGcgKiAyNTUsIGIgKiAyNTVdKSk7XG4gICAgfTtcbiAgICBmLnN0YXJ0ID0gZnVuY3Rpb24ocykge1xuICAgICAgaWYgKHMgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gc3RhcnQ7XG4gICAgICB9XG4gICAgICBzdGFydCA9IHM7XG4gICAgICByZXR1cm4gZjtcbiAgICB9O1xuICAgIGYucm90YXRpb25zID0gZnVuY3Rpb24ocikge1xuICAgICAgaWYgKHIgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcm90YXRpb25zO1xuICAgICAgfVxuICAgICAgcm90YXRpb25zID0gcjtcbiAgICAgIHJldHVybiBmO1xuICAgIH07XG4gICAgZi5nYW1tYSA9IGZ1bmN0aW9uKGcpIHtcbiAgICAgIGlmIChnID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGdhbW1hO1xuICAgICAgfVxuICAgICAgZ2FtbWEgPSBnO1xuICAgICAgcmV0dXJuIGY7XG4gICAgfTtcbiAgICBmLmh1ZSA9IGZ1bmN0aW9uKGgpIHtcbiAgICAgIGlmIChoID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGh1ZTtcbiAgICAgIH1cbiAgICAgIGh1ZSA9IGg7XG4gICAgICBpZiAodHlwZShodWUpID09PSAnYXJyYXknKSB7XG4gICAgICAgIGRoID0gaHVlWzFdIC0gaHVlWzBdO1xuICAgICAgICBpZiAoZGggPT09IDApIHtcbiAgICAgICAgICBodWUgPSBodWVbMV07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRoID0gMDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmO1xuICAgIH07XG4gICAgZi5saWdodG5lc3MgPSBmdW5jdGlvbihoKSB7XG4gICAgICBpZiAoaCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBsaWdodG5lc3M7XG4gICAgICB9XG4gICAgICBsaWdodG5lc3MgPSBoO1xuICAgICAgaWYgKHR5cGUobGlnaHRuZXNzKSA9PT0gJ2FycmF5Jykge1xuICAgICAgICBkbCA9IGxpZ2h0bmVzc1sxXSAtIGxpZ2h0bmVzc1swXTtcbiAgICAgICAgaWYgKGRsID09PSAwKSB7XG4gICAgICAgICAgbGlnaHRuZXNzID0gbGlnaHRuZXNzWzFdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkbCA9IDA7XG4gICAgICB9XG4gICAgICByZXR1cm4gZjtcbiAgICB9O1xuICAgIGYuc2NhbGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjaHJvbWEuc2NhbGUoZik7XG4gICAgfTtcbiAgICBmLmh1ZShodWUpO1xuICAgIHJldHVybiBmO1xuICB9O1xuXG4gIGNocm9tYS5yYW5kb20gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29kZSwgZGlnaXRzLCBpLCBvO1xuICAgIGRpZ2l0cyA9ICcwMTIzNDU2Nzg5YWJjZGVmJztcbiAgICBjb2RlID0gJyMnO1xuICAgIGZvciAoaSA9IG8gPSAwOyBvIDwgNjsgaSA9ICsrbykge1xuICAgICAgY29kZSArPSBkaWdpdHMuY2hhckF0KGZsb29yKE1hdGgucmFuZG9tKCkgKiAxNikpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IENvbG9yKGNvZGUpO1xuICB9O1xuXG4gIGNocm9tYS5hdmVyYWdlID0gZnVuY3Rpb24oY29sb3JzKSB7XG4gICAgdmFyIGEsIGIsIGMsIGcsIGwsIGxlbiwgbywgciwgcmdiYTtcbiAgICByID0gZyA9IGIgPSBhID0gMDtcbiAgICBsID0gY29sb3JzLmxlbmd0aDtcbiAgICBmb3IgKG8gPSAwLCBsZW4gPSBjb2xvcnMubGVuZ3RoOyBvIDwgbGVuOyBvKyspIHtcbiAgICAgIGMgPSBjb2xvcnNbb107XG4gICAgICByZ2JhID0gY2hyb21hKGMpLnJnYmEoKTtcbiAgICAgIHIgKz0gcmdiYVswXTtcbiAgICAgIGcgKz0gcmdiYVsxXTtcbiAgICAgIGIgKz0gcmdiYVsyXTtcbiAgICAgIGEgKz0gcmdiYVszXTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBDb2xvcihyIC8gbCwgZyAvIGwsIGIgLyBsLCBhIC8gbCk7XG4gIH07XG5cbiAgX2lucHV0LnJnYiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBrLCByZWYsIHJlc3VsdHMsIHY7XG4gICAgcmVmID0gdW5wYWNrKGFyZ3VtZW50cyk7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoayBpbiByZWYpIHtcbiAgICAgIHYgPSByZWZba107XG4gICAgICByZXN1bHRzLnB1c2godik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIGNocm9tYS5yZ2IgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyk7XG4gICAgICByZXR1cm4gT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCA/IHJlc3VsdCA6IGNoaWxkO1xuICAgIH0pKENvbG9yLCBzbGljZS5jYWxsKGFyZ3VtZW50cykuY29uY2F0KFsncmdiJ10pLCBmdW5jdGlvbigpe30pO1xuICB9O1xuXG4gIENvbG9yLnByb3RvdHlwZS5yZ2IgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fcmdiLnNsaWNlKDAsIDMpO1xuICB9O1xuXG4gIENvbG9yLnByb3RvdHlwZS5yZ2JhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JnYjtcbiAgfTtcblxuICBfZ3Vlc3NfZm9ybWF0cy5wdXNoKHtcbiAgICBwOiAxNSxcbiAgICB0ZXN0OiBmdW5jdGlvbihuKSB7XG4gICAgICB2YXIgYTtcbiAgICAgIGEgPSB1bnBhY2soYXJndW1lbnRzKTtcbiAgICAgIGlmICh0eXBlKGEpID09PSAnYXJyYXknICYmIGEubGVuZ3RoID09PSAzKSB7XG4gICAgICAgIHJldHVybiAncmdiJztcbiAgICAgIH1cbiAgICAgIGlmIChhLmxlbmd0aCA9PT0gNCAmJiB0eXBlKGFbM10pID09PSBcIm51bWJlclwiICYmIGFbM10gPj0gMCAmJiBhWzNdIDw9IDEpIHtcbiAgICAgICAgcmV0dXJuICdyZ2InO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaGV4MnJnYiA9IGZ1bmN0aW9uKGhleCkge1xuICAgIHZhciBhLCBiLCBnLCByLCByZ2IsIHU7XG4gICAgaWYgKGhleC5tYXRjaCgvXiM/KFtBLUZhLWYwLTldezZ9fFtBLUZhLWYwLTldezN9KSQvKSkge1xuICAgICAgaWYgKGhleC5sZW5ndGggPT09IDQgfHwgaGV4Lmxlbmd0aCA9PT0gNykge1xuICAgICAgICBoZXggPSBoZXguc3Vic3RyKDEpO1xuICAgICAgfVxuICAgICAgaWYgKGhleC5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgaGV4ID0gaGV4LnNwbGl0KFwiXCIpO1xuICAgICAgICBoZXggPSBoZXhbMF0gKyBoZXhbMF0gKyBoZXhbMV0gKyBoZXhbMV0gKyBoZXhbMl0gKyBoZXhbMl07XG4gICAgICB9XG4gICAgICB1ID0gcGFyc2VJbnQoaGV4LCAxNik7XG4gICAgICByID0gdSA+PiAxNjtcbiAgICAgIGcgPSB1ID4+IDggJiAweEZGO1xuICAgICAgYiA9IHUgJiAweEZGO1xuICAgICAgcmV0dXJuIFtyLCBnLCBiLCAxXTtcbiAgICB9XG4gICAgaWYgKGhleC5tYXRjaCgvXiM/KFtBLUZhLWYwLTldezh9KSQvKSkge1xuICAgICAgaWYgKGhleC5sZW5ndGggPT09IDkpIHtcbiAgICAgICAgaGV4ID0gaGV4LnN1YnN0cigxKTtcbiAgICAgIH1cbiAgICAgIHUgPSBwYXJzZUludChoZXgsIDE2KTtcbiAgICAgIHIgPSB1ID4+IDI0ICYgMHhGRjtcbiAgICAgIGcgPSB1ID4+IDE2ICYgMHhGRjtcbiAgICAgIGIgPSB1ID4+IDggJiAweEZGO1xuICAgICAgYSA9IHJvdW5kKCh1ICYgMHhGRikgLyAweEZGICogMTAwKSAvIDEwMDtcbiAgICAgIHJldHVybiBbciwgZywgYiwgYV07XG4gICAgfVxuICAgIGlmICgoX2lucHV0LmNzcyAhPSBudWxsKSAmJiAocmdiID0gX2lucHV0LmNzcyhoZXgpKSkge1xuICAgICAgcmV0dXJuIHJnYjtcbiAgICB9XG4gICAgdGhyb3cgXCJ1bmtub3duIGNvbG9yOiBcIiArIGhleDtcbiAgfTtcblxuICByZ2IyaGV4ID0gZnVuY3Rpb24oY2hhbm5lbHMsIG1vZGUpIHtcbiAgICB2YXIgYSwgYiwgZywgaHhhLCByLCBzdHIsIHU7XG4gICAgaWYgKG1vZGUgPT0gbnVsbCkge1xuICAgICAgbW9kZSA9ICdyZ2InO1xuICAgIH1cbiAgICByID0gY2hhbm5lbHNbMF0sIGcgPSBjaGFubmVsc1sxXSwgYiA9IGNoYW5uZWxzWzJdLCBhID0gY2hhbm5lbHNbM107XG4gICAgdSA9IHIgPDwgMTYgfCBnIDw8IDggfCBiO1xuICAgIHN0ciA9IFwiMDAwMDAwXCIgKyB1LnRvU3RyaW5nKDE2KTtcbiAgICBzdHIgPSBzdHIuc3Vic3RyKHN0ci5sZW5ndGggLSA2KTtcbiAgICBoeGEgPSAnMCcgKyByb3VuZChhICogMjU1KS50b1N0cmluZygxNik7XG4gICAgaHhhID0gaHhhLnN1YnN0cihoeGEubGVuZ3RoIC0gMik7XG4gICAgcmV0dXJuIFwiI1wiICsgKGZ1bmN0aW9uKCkge1xuICAgICAgc3dpdGNoIChtb2RlLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgY2FzZSAncmdiYSc6XG4gICAgICAgICAgcmV0dXJuIHN0ciArIGh4YTtcbiAgICAgICAgY2FzZSAnYXJnYic6XG4gICAgICAgICAgcmV0dXJuIGh4YSArIHN0cjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgfVxuICAgIH0pKCk7XG4gIH07XG5cbiAgX2lucHV0LmhleCA9IGZ1bmN0aW9uKGgpIHtcbiAgICByZXR1cm4gaGV4MnJnYihoKTtcbiAgfTtcblxuICBjaHJvbWEuaGV4ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpO1xuICAgICAgcmV0dXJuIE9iamVjdChyZXN1bHQpID09PSByZXN1bHQgPyByZXN1bHQgOiBjaGlsZDtcbiAgICB9KShDb2xvciwgc2xpY2UuY2FsbChhcmd1bWVudHMpLmNvbmNhdChbJ2hleCddKSwgZnVuY3Rpb24oKXt9KTtcbiAgfTtcblxuICBDb2xvci5wcm90b3R5cGUuaGV4ID0gZnVuY3Rpb24obW9kZSkge1xuICAgIGlmIChtb2RlID09IG51bGwpIHtcbiAgICAgIG1vZGUgPSAncmdiJztcbiAgICB9XG4gICAgcmV0dXJuIHJnYjJoZXgodGhpcy5fcmdiLCBtb2RlKTtcbiAgfTtcblxuICBfZ3Vlc3NfZm9ybWF0cy5wdXNoKHtcbiAgICBwOiAxMCxcbiAgICB0ZXN0OiBmdW5jdGlvbihuKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiB0eXBlKG4pID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiAnaGV4JztcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGhzbDJyZ2IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncywgYiwgYywgZywgaCwgaSwgbCwgbywgciwgcmVmLCBzLCB0MSwgdDIsIHQzO1xuICAgIGFyZ3MgPSB1bnBhY2soYXJndW1lbnRzKTtcbiAgICBoID0gYXJnc1swXSwgcyA9IGFyZ3NbMV0sIGwgPSBhcmdzWzJdO1xuICAgIGlmIChzID09PSAwKSB7XG4gICAgICByID0gZyA9IGIgPSBsICogMjU1O1xuICAgIH0gZWxzZSB7XG4gICAgICB0MyA9IFswLCAwLCAwXTtcbiAgICAgIGMgPSBbMCwgMCwgMF07XG4gICAgICB0MiA9IGwgPCAwLjUgPyBsICogKDEgKyBzKSA6IGwgKyBzIC0gbCAqIHM7XG4gICAgICB0MSA9IDIgKiBsIC0gdDI7XG4gICAgICBoIC89IDM2MDtcbiAgICAgIHQzWzBdID0gaCArIDEgLyAzO1xuICAgICAgdDNbMV0gPSBoO1xuICAgICAgdDNbMl0gPSBoIC0gMSAvIDM7XG4gICAgICBmb3IgKGkgPSBvID0gMDsgbyA8PSAyOyBpID0gKytvKSB7XG4gICAgICAgIGlmICh0M1tpXSA8IDApIHtcbiAgICAgICAgICB0M1tpXSArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0M1tpXSA+IDEpIHtcbiAgICAgICAgICB0M1tpXSAtPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICg2ICogdDNbaV0gPCAxKSB7XG4gICAgICAgICAgY1tpXSA9IHQxICsgKHQyIC0gdDEpICogNiAqIHQzW2ldO1xuICAgICAgICB9IGVsc2UgaWYgKDIgKiB0M1tpXSA8IDEpIHtcbiAgICAgICAgICBjW2ldID0gdDI7XG4gICAgICAgIH0gZWxzZSBpZiAoMyAqIHQzW2ldIDwgMikge1xuICAgICAgICAgIGNbaV0gPSB0MSArICh0MiAtIHQxKSAqICgoMiAvIDMpIC0gdDNbaV0pICogNjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjW2ldID0gdDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlZiA9IFtyb3VuZChjWzBdICogMjU1KSwgcm91bmQoY1sxXSAqIDI1NSksIHJvdW5kKGNbMl0gKiAyNTUpXSwgciA9IHJlZlswXSwgZyA9IHJlZlsxXSwgYiA9IHJlZlsyXTtcbiAgICB9XG4gICAgaWYgKGFyZ3MubGVuZ3RoID4gMykge1xuICAgICAgcmV0dXJuIFtyLCBnLCBiLCBhcmdzWzNdXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFtyLCBnLCBiXTtcbiAgICB9XG4gIH07XG5cbiAgcmdiMmhzbCA9IGZ1bmN0aW9uKHIsIGcsIGIpIHtcbiAgICB2YXIgaCwgbCwgbWluLCByZWYsIHM7XG4gICAgaWYgKHIgIT09IHZvaWQgMCAmJiByLmxlbmd0aCA+PSAzKSB7XG4gICAgICByZWYgPSByLCByID0gcmVmWzBdLCBnID0gcmVmWzFdLCBiID0gcmVmWzJdO1xuICAgIH1cbiAgICByIC89IDI1NTtcbiAgICBnIC89IDI1NTtcbiAgICBiIC89IDI1NTtcbiAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKTtcbiAgICBtYXggPSBNYXRoLm1heChyLCBnLCBiKTtcbiAgICBsID0gKG1heCArIG1pbikgLyAyO1xuICAgIGlmIChtYXggPT09IG1pbikge1xuICAgICAgcyA9IDA7XG4gICAgICBoID0gTnVtYmVyLk5hTjtcbiAgICB9IGVsc2Uge1xuICAgICAgcyA9IGwgPCAwLjUgPyAobWF4IC0gbWluKSAvIChtYXggKyBtaW4pIDogKG1heCAtIG1pbikgLyAoMiAtIG1heCAtIG1pbik7XG4gICAgfVxuICAgIGlmIChyID09PSBtYXgpIHtcbiAgICAgIGggPSAoZyAtIGIpIC8gKG1heCAtIG1pbik7XG4gICAgfSBlbHNlIGlmIChnID09PSBtYXgpIHtcbiAgICAgIGggPSAyICsgKGIgLSByKSAvIChtYXggLSBtaW4pO1xuICAgIH0gZWxzZSBpZiAoYiA9PT0gbWF4KSB7XG4gICAgICBoID0gNCArIChyIC0gZykgLyAobWF4IC0gbWluKTtcbiAgICB9XG4gICAgaCAqPSA2MDtcbiAgICBpZiAoaCA8IDApIHtcbiAgICAgIGggKz0gMzYwO1xuICAgIH1cbiAgICByZXR1cm4gW2gsIHMsIGxdO1xuICB9O1xuXG4gIGNocm9tYS5oc2wgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyk7XG4gICAgICByZXR1cm4gT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCA/IHJlc3VsdCA6IGNoaWxkO1xuICAgIH0pKENvbG9yLCBzbGljZS5jYWxsKGFyZ3VtZW50cykuY29uY2F0KFsnaHNsJ10pLCBmdW5jdGlvbigpe30pO1xuICB9O1xuXG4gIF9pbnB1dC5oc2wgPSBoc2wycmdiO1xuXG4gIENvbG9yLnByb3RvdHlwZS5oc2wgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcmdiMmhzbCh0aGlzLl9yZ2IpO1xuICB9O1xuXG4gIGhzdjJyZ2IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncywgYiwgZiwgZywgaCwgaSwgcCwgcSwgciwgcmVmLCByZWYxLCByZWYyLCByZWYzLCByZWY0LCByZWY1LCBzLCB0LCB2O1xuICAgIGFyZ3MgPSB1bnBhY2soYXJndW1lbnRzKTtcbiAgICBoID0gYXJnc1swXSwgcyA9IGFyZ3NbMV0sIHYgPSBhcmdzWzJdO1xuICAgIHYgKj0gMjU1O1xuICAgIGlmIChzID09PSAwKSB7XG4gICAgICByID0gZyA9IGIgPSB2O1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaCA9PT0gMzYwKSB7XG4gICAgICAgIGggPSAwO1xuICAgICAgfVxuICAgICAgaWYgKGggPiAzNjApIHtcbiAgICAgICAgaCAtPSAzNjA7XG4gICAgICB9XG4gICAgICBpZiAoaCA8IDApIHtcbiAgICAgICAgaCArPSAzNjA7XG4gICAgICB9XG4gICAgICBoIC89IDYwO1xuICAgICAgaSA9IGZsb29yKGgpO1xuICAgICAgZiA9IGggLSBpO1xuICAgICAgcCA9IHYgKiAoMSAtIHMpO1xuICAgICAgcSA9IHYgKiAoMSAtIHMgKiBmKTtcbiAgICAgIHQgPSB2ICogKDEgLSBzICogKDEgLSBmKSk7XG4gICAgICBzd2l0Y2ggKGkpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIHJlZiA9IFt2LCB0LCBwXSwgciA9IHJlZlswXSwgZyA9IHJlZlsxXSwgYiA9IHJlZlsyXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIHJlZjEgPSBbcSwgdiwgcF0sIHIgPSByZWYxWzBdLCBnID0gcmVmMVsxXSwgYiA9IHJlZjFbMl07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICByZWYyID0gW3AsIHYsIHRdLCByID0gcmVmMlswXSwgZyA9IHJlZjJbMV0sIGIgPSByZWYyWzJdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgcmVmMyA9IFtwLCBxLCB2XSwgciA9IHJlZjNbMF0sIGcgPSByZWYzWzFdLCBiID0gcmVmM1syXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHJlZjQgPSBbdCwgcCwgdl0sIHIgPSByZWY0WzBdLCBnID0gcmVmNFsxXSwgYiA9IHJlZjRbMl07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICByZWY1ID0gW3YsIHAsIHFdLCByID0gcmVmNVswXSwgZyA9IHJlZjVbMV0sIGIgPSByZWY1WzJdO1xuICAgICAgfVxuICAgIH1cbiAgICByID0gcm91bmQocik7XG4gICAgZyA9IHJvdW5kKGcpO1xuICAgIGIgPSByb3VuZChiKTtcbiAgICByZXR1cm4gW3IsIGcsIGIsIGFyZ3MubGVuZ3RoID4gMyA/IGFyZ3NbM10gOiAxXTtcbiAgfTtcblxuICByZ2IyaHN2ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGIsIGRlbHRhLCBnLCBoLCBtaW4sIHIsIHJlZiwgcywgdjtcbiAgICByZWYgPSB1bnBhY2soYXJndW1lbnRzKSwgciA9IHJlZlswXSwgZyA9IHJlZlsxXSwgYiA9IHJlZlsyXTtcbiAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKTtcbiAgICBtYXggPSBNYXRoLm1heChyLCBnLCBiKTtcbiAgICBkZWx0YSA9IG1heCAtIG1pbjtcbiAgICB2ID0gbWF4IC8gMjU1LjA7XG4gICAgaWYgKG1heCA9PT0gMCkge1xuICAgICAgaCA9IE51bWJlci5OYU47XG4gICAgICBzID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgcyA9IGRlbHRhIC8gbWF4O1xuICAgICAgaWYgKHIgPT09IG1heCkge1xuICAgICAgICBoID0gKGcgLSBiKSAvIGRlbHRhO1xuICAgICAgfVxuICAgICAgaWYgKGcgPT09IG1heCkge1xuICAgICAgICBoID0gMiArIChiIC0gcikgLyBkZWx0YTtcbiAgICAgIH1cbiAgICAgIGlmIChiID09PSBtYXgpIHtcbiAgICAgICAgaCA9IDQgKyAociAtIGcpIC8gZGVsdGE7XG4gICAgICB9XG4gICAgICBoICo9IDYwO1xuICAgICAgaWYgKGggPCAwKSB7XG4gICAgICAgIGggKz0gMzYwO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gW2gsIHMsIHZdO1xuICB9O1xuXG4gIGNocm9tYS5oc3YgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyk7XG4gICAgICByZXR1cm4gT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCA/IHJlc3VsdCA6IGNoaWxkO1xuICAgIH0pKENvbG9yLCBzbGljZS5jYWxsKGFyZ3VtZW50cykuY29uY2F0KFsnaHN2J10pLCBmdW5jdGlvbigpe30pO1xuICB9O1xuXG4gIF9pbnB1dC5oc3YgPSBoc3YycmdiO1xuXG4gIENvbG9yLnByb3RvdHlwZS5oc3YgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcmdiMmhzdih0aGlzLl9yZ2IpO1xuICB9O1xuXG4gIG51bTJyZ2IgPSBmdW5jdGlvbihudW0pIHtcbiAgICB2YXIgYiwgZywgcjtcbiAgICBpZiAodHlwZShudW0pID09PSBcIm51bWJlclwiICYmIG51bSA+PSAwICYmIG51bSA8PSAweEZGRkZGRikge1xuICAgICAgciA9IG51bSA+PiAxNjtcbiAgICAgIGcgPSAobnVtID4+IDgpICYgMHhGRjtcbiAgICAgIGIgPSBudW0gJiAweEZGO1xuICAgICAgcmV0dXJuIFtyLCBnLCBiLCAxXTtcbiAgICB9XG4gICAgY29uc29sZS53YXJuKFwidW5rbm93biBudW0gY29sb3I6IFwiICsgbnVtKTtcbiAgICByZXR1cm4gWzAsIDAsIDAsIDFdO1xuICB9O1xuXG4gIHJnYjJudW0gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYiwgZywgciwgcmVmO1xuICAgIHJlZiA9IHVucGFjayhhcmd1bWVudHMpLCByID0gcmVmWzBdLCBnID0gcmVmWzFdLCBiID0gcmVmWzJdO1xuICAgIHJldHVybiAociA8PCAxNikgKyAoZyA8PCA4KSArIGI7XG4gIH07XG5cbiAgY2hyb21hLm51bSA9IGZ1bmN0aW9uKG51bSkge1xuICAgIHJldHVybiBuZXcgQ29sb3IobnVtLCAnbnVtJyk7XG4gIH07XG5cbiAgQ29sb3IucHJvdG90eXBlLm51bSA9IGZ1bmN0aW9uKG1vZGUpIHtcbiAgICBpZiAobW9kZSA9PSBudWxsKSB7XG4gICAgICBtb2RlID0gJ3JnYic7XG4gICAgfVxuICAgIHJldHVybiByZ2IybnVtKHRoaXMuX3JnYiwgbW9kZSk7XG4gIH07XG5cbiAgX2lucHV0Lm51bSA9IG51bTJyZ2I7XG5cbiAgX2d1ZXNzX2Zvcm1hdHMucHVzaCh7XG4gICAgcDogMTAsXG4gICAgdGVzdDogZnVuY3Rpb24obikge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgdHlwZShuKSA9PT0gXCJudW1iZXJcIiAmJiBuID49IDAgJiYgbiA8PSAweEZGRkZGRikge1xuICAgICAgICByZXR1cm4gJ251bSc7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBjc3MycmdiID0gZnVuY3Rpb24oY3NzKSB7XG4gICAgdmFyIGFhLCBhYiwgaHNsLCBpLCBtLCBvLCByZ2IsIHc7XG4gICAgY3NzID0gY3NzLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKChjaHJvbWEuY29sb3JzICE9IG51bGwpICYmIGNocm9tYS5jb2xvcnNbY3NzXSkge1xuICAgICAgcmV0dXJuIGhleDJyZ2IoY2hyb21hLmNvbG9yc1tjc3NdKTtcbiAgICB9XG4gICAgaWYgKG0gPSBjc3MubWF0Y2goL3JnYlxcKFxccyooXFwtP1xcZCspLFxccyooXFwtP1xcZCspXFxzKixcXHMqKFxcLT9cXGQrKVxccypcXCkvKSkge1xuICAgICAgcmdiID0gbS5zbGljZSgxLCA0KTtcbiAgICAgIGZvciAoaSA9IG8gPSAwOyBvIDw9IDI7IGkgPSArK28pIHtcbiAgICAgICAgcmdiW2ldID0gK3JnYltpXTtcbiAgICAgIH1cbiAgICAgIHJnYlszXSA9IDE7XG4gICAgfSBlbHNlIGlmIChtID0gY3NzLm1hdGNoKC9yZ2JhXFwoXFxzKihcXC0/XFxkKyksXFxzKihcXC0/XFxkKylcXHMqLFxccyooXFwtP1xcZCspXFxzKixcXHMqKFswMV18WzAxXT9cXC5cXGQrKVxcKS8pKSB7XG4gICAgICByZ2IgPSBtLnNsaWNlKDEsIDUpO1xuICAgICAgZm9yIChpID0gdyA9IDA7IHcgPD0gMzsgaSA9ICsrdykge1xuICAgICAgICByZ2JbaV0gPSArcmdiW2ldO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobSA9IGNzcy5tYXRjaCgvcmdiXFwoXFxzKihcXC0/XFxkKyg/OlxcLlxcZCspPyklLFxccyooXFwtP1xcZCsoPzpcXC5cXGQrKT8pJVxccyosXFxzKihcXC0/XFxkKyg/OlxcLlxcZCspPyklXFxzKlxcKS8pKSB7XG4gICAgICByZ2IgPSBtLnNsaWNlKDEsIDQpO1xuICAgICAgZm9yIChpID0gYWEgPSAwOyBhYSA8PSAyOyBpID0gKythYSkge1xuICAgICAgICByZ2JbaV0gPSByb3VuZChyZ2JbaV0gKiAyLjU1KTtcbiAgICAgIH1cbiAgICAgIHJnYlszXSA9IDE7XG4gICAgfSBlbHNlIGlmIChtID0gY3NzLm1hdGNoKC9yZ2JhXFwoXFxzKihcXC0/XFxkKyg/OlxcLlxcZCspPyklLFxccyooXFwtP1xcZCsoPzpcXC5cXGQrKT8pJVxccyosXFxzKihcXC0/XFxkKyg/OlxcLlxcZCspPyklXFxzKixcXHMqKFswMV18WzAxXT9cXC5cXGQrKVxcKS8pKSB7XG4gICAgICByZ2IgPSBtLnNsaWNlKDEsIDUpO1xuICAgICAgZm9yIChpID0gYWIgPSAwOyBhYiA8PSAyOyBpID0gKythYikge1xuICAgICAgICByZ2JbaV0gPSByb3VuZChyZ2JbaV0gKiAyLjU1KTtcbiAgICAgIH1cbiAgICAgIHJnYlszXSA9ICtyZ2JbM107XG4gICAgfSBlbHNlIGlmIChtID0gY3NzLm1hdGNoKC9oc2xcXChcXHMqKFxcLT9cXGQrKD86XFwuXFxkKyk/KSxcXHMqKFxcLT9cXGQrKD86XFwuXFxkKyk/KSVcXHMqLFxccyooXFwtP1xcZCsoPzpcXC5cXGQrKT8pJVxccypcXCkvKSkge1xuICAgICAgaHNsID0gbS5zbGljZSgxLCA0KTtcbiAgICAgIGhzbFsxXSAqPSAwLjAxO1xuICAgICAgaHNsWzJdICo9IDAuMDE7XG4gICAgICByZ2IgPSBoc2wycmdiKGhzbCk7XG4gICAgICByZ2JbM10gPSAxO1xuICAgIH0gZWxzZSBpZiAobSA9IGNzcy5tYXRjaCgvaHNsYVxcKFxccyooXFwtP1xcZCsoPzpcXC5cXGQrKT8pLFxccyooXFwtP1xcZCsoPzpcXC5cXGQrKT8pJVxccyosXFxzKihcXC0/XFxkKyg/OlxcLlxcZCspPyklXFxzKixcXHMqKFswMV18WzAxXT9cXC5cXGQrKVxcKS8pKSB7XG4gICAgICBoc2wgPSBtLnNsaWNlKDEsIDQpO1xuICAgICAgaHNsWzFdICo9IDAuMDE7XG4gICAgICBoc2xbMl0gKj0gMC4wMTtcbiAgICAgIHJnYiA9IGhzbDJyZ2IoaHNsKTtcbiAgICAgIHJnYlszXSA9ICttWzRdO1xuICAgIH1cbiAgICByZXR1cm4gcmdiO1xuICB9O1xuXG4gIHJnYjJjc3MgPSBmdW5jdGlvbihyZ2JhKSB7XG4gICAgdmFyIG1vZGU7XG4gICAgbW9kZSA9IHJnYmFbM10gPCAxID8gJ3JnYmEnIDogJ3JnYic7XG4gICAgaWYgKG1vZGUgPT09ICdyZ2InKSB7XG4gICAgICByZXR1cm4gbW9kZSArICcoJyArIHJnYmEuc2xpY2UoMCwgMykubWFwKHJvdW5kKS5qb2luKCcsJykgKyAnKSc7XG4gICAgfSBlbHNlIGlmIChtb2RlID09PSAncmdiYScpIHtcbiAgICAgIHJldHVybiBtb2RlICsgJygnICsgcmdiYS5zbGljZSgwLCAzKS5tYXAocm91bmQpLmpvaW4oJywnKSArICcsJyArIHJnYmFbM10gKyAnKSc7XG4gICAgfSBlbHNlIHtcblxuICAgIH1cbiAgfTtcblxuICBybmQgPSBmdW5jdGlvbihhKSB7XG4gICAgcmV0dXJuIHJvdW5kKGEgKiAxMDApIC8gMTAwO1xuICB9O1xuXG4gIGhzbDJjc3MgPSBmdW5jdGlvbihoc2wsIGFscGhhKSB7XG4gICAgdmFyIG1vZGU7XG4gICAgbW9kZSA9IGFscGhhIDwgMSA/ICdoc2xhJyA6ICdoc2wnO1xuICAgIGhzbFswXSA9IHJuZChoc2xbMF0gfHwgMCk7XG4gICAgaHNsWzFdID0gcm5kKGhzbFsxXSAqIDEwMCkgKyAnJSc7XG4gICAgaHNsWzJdID0gcm5kKGhzbFsyXSAqIDEwMCkgKyAnJSc7XG4gICAgaWYgKG1vZGUgPT09ICdoc2xhJykge1xuICAgICAgaHNsWzNdID0gYWxwaGE7XG4gICAgfVxuICAgIHJldHVybiBtb2RlICsgJygnICsgaHNsLmpvaW4oJywnKSArICcpJztcbiAgfTtcblxuICBfaW5wdXQuY3NzID0gZnVuY3Rpb24oaCkge1xuICAgIHJldHVybiBjc3MycmdiKGgpO1xuICB9O1xuXG4gIGNocm9tYS5jc3MgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyk7XG4gICAgICByZXR1cm4gT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCA/IHJlc3VsdCA6IGNoaWxkO1xuICAgIH0pKENvbG9yLCBzbGljZS5jYWxsKGFyZ3VtZW50cykuY29uY2F0KFsnY3NzJ10pLCBmdW5jdGlvbigpe30pO1xuICB9O1xuXG4gIENvbG9yLnByb3RvdHlwZS5jc3MgPSBmdW5jdGlvbihtb2RlKSB7XG4gICAgaWYgKG1vZGUgPT0gbnVsbCkge1xuICAgICAgbW9kZSA9ICdyZ2InO1xuICAgIH1cbiAgICBpZiAobW9kZS5zbGljZSgwLCAzKSA9PT0gJ3JnYicpIHtcbiAgICAgIHJldHVybiByZ2IyY3NzKHRoaXMuX3JnYik7XG4gICAgfSBlbHNlIGlmIChtb2RlLnNsaWNlKDAsIDMpID09PSAnaHNsJykge1xuICAgICAgcmV0dXJuIGhzbDJjc3ModGhpcy5oc2woKSwgdGhpcy5hbHBoYSgpKTtcbiAgICB9XG4gIH07XG5cbiAgX2lucHV0Lm5hbWVkID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiBoZXgycmdiKHczY3gxMVtuYW1lXSk7XG4gIH07XG5cbiAgX2d1ZXNzX2Zvcm1hdHMucHVzaCh7XG4gICAgcDogMjAsXG4gICAgdGVzdDogZnVuY3Rpb24obikge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgKHczY3gxMVtuXSAhPSBudWxsKSkge1xuICAgICAgICByZXR1cm4gJ25hbWVkJztcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIENvbG9yLnByb3RvdHlwZS5uYW1lID0gZnVuY3Rpb24obikge1xuICAgIHZhciBoLCBrO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICBpZiAodzNjeDExW25dKSB7XG4gICAgICAgIHRoaXMuX3JnYiA9IGhleDJyZ2IodzNjeDExW25dKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3JnYlszXSA9IDE7XG4gICAgICB0aGlzO1xuICAgIH1cbiAgICBoID0gdGhpcy5oZXgoKTtcbiAgICBmb3IgKGsgaW4gdzNjeDExKSB7XG4gICAgICBpZiAoaCA9PT0gdzNjeDExW2tdKSB7XG4gICAgICAgIHJldHVybiBrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaDtcbiAgfTtcblxuICBsY2gybGFiID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvKlxuICAgIENvbnZlcnQgZnJvbSBhIHF1YWxpdGF0aXZlIHBhcmFtZXRlciBoIGFuZCBhIHF1YW50aXRhdGl2ZSBwYXJhbWV0ZXIgbCB0byBhIDI0LWJpdCBwaXhlbC5cbiAgICBUaGVzZSBmb3JtdWxhcyB3ZXJlIGludmVudGVkIGJ5IERhdmlkIERhbHJ5bXBsZSB0byBvYnRhaW4gbWF4aW11bSBjb250cmFzdCB3aXRob3V0IGdvaW5nXG4gICAgb3V0IG9mIGdhbXV0IGlmIHRoZSBwYXJhbWV0ZXJzIGFyZSBpbiB0aGUgcmFuZ2UgMC0xLlxuICAgIFxuICAgIEEgc2F0dXJhdGlvbiBtdWx0aXBsaWVyIHdhcyBhZGRlZCBieSBHcmVnb3IgQWlzY2hcbiAgICAgKi9cbiAgICB2YXIgYywgaCwgbCwgcmVmO1xuICAgIHJlZiA9IHVucGFjayhhcmd1bWVudHMpLCBsID0gcmVmWzBdLCBjID0gcmVmWzFdLCBoID0gcmVmWzJdO1xuICAgIGggPSBoICogREVHMlJBRDtcbiAgICByZXR1cm4gW2wsIGNvcyhoKSAqIGMsIHNpbihoKSAqIGNdO1xuICB9O1xuXG4gIGxjaDJyZ2IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgTCwgYSwgYXJncywgYiwgYywgZywgaCwgbCwgciwgcmVmLCByZWYxO1xuICAgIGFyZ3MgPSB1bnBhY2soYXJndW1lbnRzKTtcbiAgICBsID0gYXJnc1swXSwgYyA9IGFyZ3NbMV0sIGggPSBhcmdzWzJdO1xuICAgIHJlZiA9IGxjaDJsYWIobCwgYywgaCksIEwgPSByZWZbMF0sIGEgPSByZWZbMV0sIGIgPSByZWZbMl07XG4gICAgcmVmMSA9IGxhYjJyZ2IoTCwgYSwgYiksIHIgPSByZWYxWzBdLCBnID0gcmVmMVsxXSwgYiA9IHJlZjFbMl07XG4gICAgcmV0dXJuIFtsaW1pdChyLCAwLCAyNTUpLCBsaW1pdChnLCAwLCAyNTUpLCBsaW1pdChiLCAwLCAyNTUpLCBhcmdzLmxlbmd0aCA+IDMgPyBhcmdzWzNdIDogMV07XG4gIH07XG5cbiAgbGFiMmxjaCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhLCBiLCBjLCBoLCBsLCByZWY7XG4gICAgcmVmID0gdW5wYWNrKGFyZ3VtZW50cyksIGwgPSByZWZbMF0sIGEgPSByZWZbMV0sIGIgPSByZWZbMl07XG4gICAgYyA9IHNxcnQoYSAqIGEgKyBiICogYik7XG4gICAgaCA9IChhdGFuMihiLCBhKSAqIFJBRDJERUcgKyAzNjApICUgMzYwO1xuICAgIGlmIChyb3VuZChjICogMTAwMDApID09PSAwKSB7XG4gICAgICBoID0gTnVtYmVyLk5hTjtcbiAgICB9XG4gICAgcmV0dXJuIFtsLCBjLCBoXTtcbiAgfTtcblxuICByZ2IybGNoID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGEsIGIsIGcsIGwsIHIsIHJlZiwgcmVmMTtcbiAgICByZWYgPSB1bnBhY2soYXJndW1lbnRzKSwgciA9IHJlZlswXSwgZyA9IHJlZlsxXSwgYiA9IHJlZlsyXTtcbiAgICByZWYxID0gcmdiMmxhYihyLCBnLCBiKSwgbCA9IHJlZjFbMF0sIGEgPSByZWYxWzFdLCBiID0gcmVmMVsyXTtcbiAgICByZXR1cm4gbGFiMmxjaChsLCBhLCBiKTtcbiAgfTtcblxuICBjaHJvbWEubGNoID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3M7XG4gICAgYXJncyA9IHVucGFjayhhcmd1bWVudHMpO1xuICAgIHJldHVybiBuZXcgQ29sb3IoYXJncywgJ2xjaCcpO1xuICB9O1xuXG4gIGNocm9tYS5oY2wgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncztcbiAgICBhcmdzID0gdW5wYWNrKGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIG5ldyBDb2xvcihhcmdzLCAnaGNsJyk7XG4gIH07XG5cbiAgX2lucHV0LmxjaCA9IGxjaDJyZ2I7XG5cbiAgX2lucHV0LmhjbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjLCBoLCBsLCByZWY7XG4gICAgcmVmID0gdW5wYWNrKGFyZ3VtZW50cyksIGggPSByZWZbMF0sIGMgPSByZWZbMV0sIGwgPSByZWZbMl07XG4gICAgcmV0dXJuIGxjaDJyZ2IoW2wsIGMsIGhdKTtcbiAgfTtcblxuICBDb2xvci5wcm90b3R5cGUubGNoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHJnYjJsY2godGhpcy5fcmdiKTtcbiAgfTtcblxuICBDb2xvci5wcm90b3R5cGUuaGNsID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHJnYjJsY2godGhpcy5fcmdiKS5yZXZlcnNlKCk7XG4gIH07XG5cbiAgcmdiMmNteWsgPSBmdW5jdGlvbihtb2RlKSB7XG4gICAgdmFyIGIsIGMsIGYsIGcsIGssIG0sIHIsIHJlZiwgeTtcbiAgICBpZiAobW9kZSA9PSBudWxsKSB7XG4gICAgICBtb2RlID0gJ3JnYic7XG4gICAgfVxuICAgIHJlZiA9IHVucGFjayhhcmd1bWVudHMpLCByID0gcmVmWzBdLCBnID0gcmVmWzFdLCBiID0gcmVmWzJdO1xuICAgIHIgPSByIC8gMjU1O1xuICAgIGcgPSBnIC8gMjU1O1xuICAgIGIgPSBiIC8gMjU1O1xuICAgIGsgPSAxIC0gTWF0aC5tYXgociwgTWF0aC5tYXgoZywgYikpO1xuICAgIGYgPSBrIDwgMSA/IDEgLyAoMSAtIGspIDogMDtcbiAgICBjID0gKDEgLSByIC0gaykgKiBmO1xuICAgIG0gPSAoMSAtIGcgLSBrKSAqIGY7XG4gICAgeSA9ICgxIC0gYiAtIGspICogZjtcbiAgICByZXR1cm4gW2MsIG0sIHksIGtdO1xuICB9O1xuXG4gIGNteWsycmdiID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFscGhhLCBhcmdzLCBiLCBjLCBnLCBrLCBtLCByLCB5O1xuICAgIGFyZ3MgPSB1bnBhY2soYXJndW1lbnRzKTtcbiAgICBjID0gYXJnc1swXSwgbSA9IGFyZ3NbMV0sIHkgPSBhcmdzWzJdLCBrID0gYXJnc1szXTtcbiAgICBhbHBoYSA9IGFyZ3MubGVuZ3RoID4gNCA/IGFyZ3NbNF0gOiAxO1xuICAgIGlmIChrID09PSAxKSB7XG4gICAgICByZXR1cm4gWzAsIDAsIDAsIGFscGhhXTtcbiAgICB9XG4gICAgciA9IGMgPj0gMSA/IDAgOiByb3VuZCgyNTUgKiAoMSAtIGMpICogKDEgLSBrKSk7XG4gICAgZyA9IG0gPj0gMSA/IDAgOiByb3VuZCgyNTUgKiAoMSAtIG0pICogKDEgLSBrKSk7XG4gICAgYiA9IHkgPj0gMSA/IDAgOiByb3VuZCgyNTUgKiAoMSAtIHkpICogKDEgLSBrKSk7XG4gICAgcmV0dXJuIFtyLCBnLCBiLCBhbHBoYV07XG4gIH07XG5cbiAgX2lucHV0LmNteWsgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY215azJyZ2IodW5wYWNrKGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIGNocm9tYS5jbXlrID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpO1xuICAgICAgcmV0dXJuIE9iamVjdChyZXN1bHQpID09PSByZXN1bHQgPyByZXN1bHQgOiBjaGlsZDtcbiAgICB9KShDb2xvciwgc2xpY2UuY2FsbChhcmd1bWVudHMpLmNvbmNhdChbJ2NteWsnXSksIGZ1bmN0aW9uKCl7fSk7XG4gIH07XG5cbiAgQ29sb3IucHJvdG90eXBlLmNteWsgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcmdiMmNteWsodGhpcy5fcmdiKTtcbiAgfTtcblxuICBfaW5wdXQuZ2wgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaywgbywgcmdiLCB2O1xuICAgIHJnYiA9IChmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZWYsIHJlc3VsdHM7XG4gICAgICByZWYgPSB1bnBhY2soYXJndW1lbnRzKTtcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoayBpbiByZWYpIHtcbiAgICAgICAgdiA9IHJlZltrXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHYpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSkuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBmb3IgKGkgPSBvID0gMDsgbyA8PSAyOyBpID0gKytvKSB7XG4gICAgICByZ2JbaV0gKj0gMjU1O1xuICAgIH1cbiAgICByZXR1cm4gcmdiO1xuICB9O1xuXG4gIGNocm9tYS5nbCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKTtcbiAgICAgIHJldHVybiBPYmplY3QocmVzdWx0KSA9PT0gcmVzdWx0ID8gcmVzdWx0IDogY2hpbGQ7XG4gICAgfSkoQ29sb3IsIHNsaWNlLmNhbGwoYXJndW1lbnRzKS5jb25jYXQoWydnbCddKSwgZnVuY3Rpb24oKXt9KTtcbiAgfTtcblxuICBDb2xvci5wcm90b3R5cGUuZ2wgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmdiO1xuICAgIHJnYiA9IHRoaXMuX3JnYjtcbiAgICByZXR1cm4gW3JnYlswXSAvIDI1NSwgcmdiWzFdIC8gMjU1LCByZ2JbMl0gLyAyNTUsIHJnYlszXV07XG4gIH07XG5cbiAgcmdiMmx1bWluYW5jZSA9IGZ1bmN0aW9uKHIsIGcsIGIpIHtcbiAgICB2YXIgcmVmO1xuICAgIHJlZiA9IHVucGFjayhhcmd1bWVudHMpLCByID0gcmVmWzBdLCBnID0gcmVmWzFdLCBiID0gcmVmWzJdO1xuICAgIHIgPSBsdW1pbmFuY2VfeChyKTtcbiAgICBnID0gbHVtaW5hbmNlX3goZyk7XG4gICAgYiA9IGx1bWluYW5jZV94KGIpO1xuICAgIHJldHVybiAwLjIxMjYgKiByICsgMC43MTUyICogZyArIDAuMDcyMiAqIGI7XG4gIH07XG5cbiAgbHVtaW5hbmNlX3ggPSBmdW5jdGlvbih4KSB7XG4gICAgeCAvPSAyNTU7XG4gICAgaWYgKHggPD0gMC4wMzkyOCkge1xuICAgICAgcmV0dXJuIHggLyAxMi45MjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHBvdygoeCArIDAuMDU1KSAvIDEuMDU1LCAyLjQpO1xuICAgIH1cbiAgfTtcblxuICBfaW50ZXJwb2xhdG9ycyA9IFtdO1xuXG4gIGludGVycG9sYXRlID0gZnVuY3Rpb24oY29sMSwgY29sMiwgZiwgbSkge1xuICAgIHZhciBpbnRlcnBvbCwgbGVuLCBvLCByZXM7XG4gICAgaWYgKGYgPT0gbnVsbCkge1xuICAgICAgZiA9IDAuNTtcbiAgICB9XG4gICAgaWYgKG0gPT0gbnVsbCkge1xuICAgICAgbSA9ICdyZ2InO1xuICAgIH1cblxuICAgIC8qXG4gICAgaW50ZXJwb2xhdGVzIGJldHdlZW4gY29sb3JzXG4gICAgZiA9IDAgLS0+IG1lXG4gICAgZiA9IDEgLS0+IGNvbFxuICAgICAqL1xuICAgIGlmICh0eXBlKGNvbDEpICE9PSAnb2JqZWN0Jykge1xuICAgICAgY29sMSA9IGNocm9tYShjb2wxKTtcbiAgICB9XG4gICAgaWYgKHR5cGUoY29sMikgIT09ICdvYmplY3QnKSB7XG4gICAgICBjb2wyID0gY2hyb21hKGNvbDIpO1xuICAgIH1cbiAgICBmb3IgKG8gPSAwLCBsZW4gPSBfaW50ZXJwb2xhdG9ycy5sZW5ndGg7IG8gPCBsZW47IG8rKykge1xuICAgICAgaW50ZXJwb2wgPSBfaW50ZXJwb2xhdG9yc1tvXTtcbiAgICAgIGlmIChtID09PSBpbnRlcnBvbFswXSkge1xuICAgICAgICByZXMgPSBpbnRlcnBvbFsxXShjb2wxLCBjb2wyLCBmLCBtKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZXMgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgXCJjb2xvciBtb2RlIFwiICsgbSArIFwiIGlzIG5vdCBzdXBwb3J0ZWRcIjtcbiAgICB9XG4gICAgcmVzLmFscGhhKGNvbDEuYWxwaGEoKSArIGYgKiAoY29sMi5hbHBoYSgpIC0gY29sMS5hbHBoYSgpKSk7XG4gICAgcmV0dXJuIHJlcztcbiAgfTtcblxuICBjaHJvbWEuaW50ZXJwb2xhdGUgPSBpbnRlcnBvbGF0ZTtcblxuICBDb2xvci5wcm90b3R5cGUuaW50ZXJwb2xhdGUgPSBmdW5jdGlvbihjb2wyLCBmLCBtKSB7XG4gICAgcmV0dXJuIGludGVycG9sYXRlKHRoaXMsIGNvbDIsIGYsIG0pO1xuICB9O1xuXG4gIGNocm9tYS5taXggPSBpbnRlcnBvbGF0ZTtcblxuICBDb2xvci5wcm90b3R5cGUubWl4ID0gQ29sb3IucHJvdG90eXBlLmludGVycG9sYXRlO1xuXG4gIGludGVycG9sYXRlX3JnYiA9IGZ1bmN0aW9uKGNvbDEsIGNvbDIsIGYsIG0pIHtcbiAgICB2YXIgeHl6MCwgeHl6MTtcbiAgICB4eXowID0gY29sMS5fcmdiO1xuICAgIHh5ejEgPSBjb2wyLl9yZ2I7XG4gICAgcmV0dXJuIG5ldyBDb2xvcih4eXowWzBdICsgZiAqICh4eXoxWzBdIC0geHl6MFswXSksIHh5ejBbMV0gKyBmICogKHh5ejFbMV0gLSB4eXowWzFdKSwgeHl6MFsyXSArIGYgKiAoeHl6MVsyXSAtIHh5ejBbMl0pLCBtKTtcbiAgfTtcblxuICBfaW50ZXJwb2xhdG9ycy5wdXNoKFsncmdiJywgaW50ZXJwb2xhdGVfcmdiXSk7XG5cbiAgQ29sb3IucHJvdG90eXBlLmx1bWluYW5jZSA9IGZ1bmN0aW9uKGx1bSwgbW9kZSkge1xuICAgIHZhciBjdXJfbHVtLCBlcHMsIG1heF9pdGVyLCB0ZXN0O1xuICAgIGlmIChtb2RlID09IG51bGwpIHtcbiAgICAgIG1vZGUgPSAncmdiJztcbiAgICB9XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gcmdiMmx1bWluYW5jZSh0aGlzLl9yZ2IpO1xuICAgIH1cbiAgICBpZiAobHVtID09PSAwKSB7XG4gICAgICB0aGlzLl9yZ2IgPSBbMCwgMCwgMCwgdGhpcy5fcmdiWzNdXTtcbiAgICB9IGVsc2UgaWYgKGx1bSA9PT0gMSkge1xuICAgICAgdGhpcy5fcmdiID0gWzI1NSwgMjU1LCAyNTUsIHRoaXMuX3JnYlszXV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGVwcyA9IDFlLTc7XG4gICAgICBtYXhfaXRlciA9IDIwO1xuICAgICAgdGVzdCA9IGZ1bmN0aW9uKGwsIGgpIHtcbiAgICAgICAgdmFyIGxtLCBtO1xuICAgICAgICBtID0gbC5pbnRlcnBvbGF0ZShoLCAwLjUsIG1vZGUpO1xuICAgICAgICBsbSA9IG0ubHVtaW5hbmNlKCk7XG4gICAgICAgIGlmIChNYXRoLmFicyhsdW0gLSBsbSkgPCBlcHMgfHwgIW1heF9pdGVyLS0pIHtcbiAgICAgICAgICByZXR1cm4gbTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobG0gPiBsdW0pIHtcbiAgICAgICAgICByZXR1cm4gdGVzdChsLCBtKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGVzdChtLCBoKTtcbiAgICAgIH07XG4gICAgICBjdXJfbHVtID0gcmdiMmx1bWluYW5jZSh0aGlzLl9yZ2IpO1xuICAgICAgdGhpcy5fcmdiID0gKGN1cl9sdW0gPiBsdW0gPyB0ZXN0KGNocm9tYSgnYmxhY2snKSwgdGhpcykgOiB0ZXN0KHRoaXMsIGNocm9tYSgnd2hpdGUnKSkpLnJnYmEoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdGVtcGVyYXR1cmUycmdiID0gZnVuY3Rpb24oa2VsdmluKSB7XG4gICAgdmFyIGIsIGcsIHIsIHRlbXA7XG4gICAgdGVtcCA9IGtlbHZpbiAvIDEwMDtcbiAgICBpZiAodGVtcCA8IDY2KSB7XG4gICAgICByID0gMjU1O1xuICAgICAgZyA9IC0xNTUuMjU0ODU1NjI3MDkxNzkgLSAwLjQ0NTk2OTUwNDY5NTc5MTMzICogKGcgPSB0ZW1wIC0gMikgKyAxMDQuNDkyMTYxOTkzOTM4ODggKiBsb2coZyk7XG4gICAgICBiID0gdGVtcCA8IDIwID8gMCA6IC0yNTQuNzY5MzUxODQxMjA5MDIgKyAwLjgyNzQwOTYwNjQwMDczOTUgKiAoYiA9IHRlbXAgLSAxMCkgKyAxMTUuNjc5OTQ0MDEwNjYxNDcgKiBsb2coYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHIgPSAzNTEuOTc2OTA1NjY4MDU2OTMgKyAwLjExNDIwNjQ1Mzc4NDE2NSAqIChyID0gdGVtcCAtIDU1KSAtIDQwLjI1MzY2MzA5MzMyMTI3ICogbG9nKHIpO1xuICAgICAgZyA9IDMyNS40NDk0MTI1NzExOTc0ICsgMC4wNzk0MzQ1NjUzNjY2MjM0MiAqIChnID0gdGVtcCAtIDUwKSAtIDI4LjA4NTI5NjM1MDc5NTcgKiBsb2coZyk7XG4gICAgICBiID0gMjU1O1xuICAgIH1cbiAgICByZXR1cm4gY2xpcF9yZ2IoW3IsIGcsIGJdKTtcbiAgfTtcblxuICByZ2IydGVtcGVyYXR1cmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYiwgZXBzLCBnLCBtYXhUZW1wLCBtaW5UZW1wLCByLCByZWYsIHJnYiwgdGVtcDtcbiAgICByZWYgPSB1bnBhY2soYXJndW1lbnRzKSwgciA9IHJlZlswXSwgZyA9IHJlZlsxXSwgYiA9IHJlZlsyXTtcbiAgICBtaW5UZW1wID0gMTAwMDtcbiAgICBtYXhUZW1wID0gNDAwMDA7XG4gICAgZXBzID0gMC40O1xuICAgIHdoaWxlIChtYXhUZW1wIC0gbWluVGVtcCA+IGVwcykge1xuICAgICAgdGVtcCA9IChtYXhUZW1wICsgbWluVGVtcCkgKiAwLjU7XG4gICAgICByZ2IgPSB0ZW1wZXJhdHVyZTJyZ2IodGVtcCk7XG4gICAgICBpZiAoKHJnYlsyXSAvIHJnYlswXSkgPj0gKGIgLyByKSkge1xuICAgICAgICBtYXhUZW1wID0gdGVtcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1pblRlbXAgPSB0ZW1wO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcm91bmQodGVtcCk7XG4gIH07XG5cbiAgY2hyb21hLnRlbXBlcmF0dXJlID0gY2hyb21hLmtlbHZpbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKTtcbiAgICAgIHJldHVybiBPYmplY3QocmVzdWx0KSA9PT0gcmVzdWx0ID8gcmVzdWx0IDogY2hpbGQ7XG4gICAgfSkoQ29sb3IsIHNsaWNlLmNhbGwoYXJndW1lbnRzKS5jb25jYXQoWyd0ZW1wZXJhdHVyZSddKSwgZnVuY3Rpb24oKXt9KTtcbiAgfTtcblxuICBfaW5wdXQudGVtcGVyYXR1cmUgPSBfaW5wdXQua2VsdmluID0gX2lucHV0LksgPSB0ZW1wZXJhdHVyZTJyZ2I7XG5cbiAgQ29sb3IucHJvdG90eXBlLnRlbXBlcmF0dXJlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHJnYjJ0ZW1wZXJhdHVyZSh0aGlzLl9yZ2IpO1xuICB9O1xuXG4gIENvbG9yLnByb3RvdHlwZS5rZWx2aW4gPSBDb2xvci5wcm90b3R5cGUudGVtcGVyYXR1cmU7XG5cbiAgY2hyb21hLmNvbnRyYXN0ID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBsMSwgbDIsIHJlZiwgcmVmMTtcbiAgICBpZiAoKHJlZiA9IHR5cGUoYSkpID09PSAnc3RyaW5nJyB8fCByZWYgPT09ICdudW1iZXInKSB7XG4gICAgICBhID0gbmV3IENvbG9yKGEpO1xuICAgIH1cbiAgICBpZiAoKHJlZjEgPSB0eXBlKGIpKSA9PT0gJ3N0cmluZycgfHwgcmVmMSA9PT0gJ251bWJlcicpIHtcbiAgICAgIGIgPSBuZXcgQ29sb3IoYik7XG4gICAgfVxuICAgIGwxID0gYS5sdW1pbmFuY2UoKTtcbiAgICBsMiA9IGIubHVtaW5hbmNlKCk7XG4gICAgaWYgKGwxID4gbDIpIHtcbiAgICAgIHJldHVybiAobDEgKyAwLjA1KSAvIChsMiArIDAuMDUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKGwyICsgMC4wNSkgLyAobDEgKyAwLjA1KTtcbiAgICB9XG4gIH07XG5cbiAgQ29sb3IucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG1vZGVjaGFuKSB7XG4gICAgdmFyIGNoYW5uZWwsIGksIG1lLCBtb2RlLCByZWYsIHNyYztcbiAgICBtZSA9IHRoaXM7XG4gICAgcmVmID0gbW9kZWNoYW4uc3BsaXQoJy4nKSwgbW9kZSA9IHJlZlswXSwgY2hhbm5lbCA9IHJlZlsxXTtcbiAgICBzcmMgPSBtZVttb2RlXSgpO1xuICAgIGlmIChjaGFubmVsKSB7XG4gICAgICBpID0gbW9kZS5pbmRleE9mKGNoYW5uZWwpO1xuICAgICAgaWYgKGkgPiAtMSkge1xuICAgICAgICByZXR1cm4gc3JjW2ldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybigndW5rbm93biBjaGFubmVsICcgKyBjaGFubmVsICsgJyBpbiBtb2RlICcgKyBtb2RlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNyYztcbiAgICB9XG4gIH07XG5cbiAgQ29sb3IucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG1vZGVjaGFuLCB2YWx1ZSkge1xuICAgIHZhciBjaGFubmVsLCBpLCBtZSwgbW9kZSwgcmVmLCBzcmM7XG4gICAgbWUgPSB0aGlzO1xuICAgIHJlZiA9IG1vZGVjaGFuLnNwbGl0KCcuJyksIG1vZGUgPSByZWZbMF0sIGNoYW5uZWwgPSByZWZbMV07XG4gICAgaWYgKGNoYW5uZWwpIHtcbiAgICAgIHNyYyA9IG1lW21vZGVdKCk7XG4gICAgICBpID0gbW9kZS5pbmRleE9mKGNoYW5uZWwpO1xuICAgICAgaWYgKGkgPiAtMSkge1xuICAgICAgICBpZiAodHlwZSh2YWx1ZSkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgc3dpdGNoICh2YWx1ZS5jaGFyQXQoMCkpIHtcbiAgICAgICAgICAgIGNhc2UgJysnOlxuICAgICAgICAgICAgICBzcmNbaV0gKz0gK3ZhbHVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgICBzcmNbaV0gKz0gK3ZhbHVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJyonOlxuICAgICAgICAgICAgICBzcmNbaV0gKj0gKyh2YWx1ZS5zdWJzdHIoMSkpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJy8nOlxuICAgICAgICAgICAgICBzcmNbaV0gLz0gKyh2YWx1ZS5zdWJzdHIoMSkpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHNyY1tpXSA9ICt2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3JjW2ldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUud2FybigndW5rbm93biBjaGFubmVsICcgKyBjaGFubmVsICsgJyBpbiBtb2RlICcgKyBtb2RlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3JjID0gdmFsdWU7XG4gICAgfVxuICAgIG1lLl9yZ2IgPSBjaHJvbWEoc3JjLCBtb2RlKS5hbHBoYShtZS5hbHBoYSgpKS5fcmdiO1xuICAgIHJldHVybiBtZTtcbiAgfTtcblxuICBDb2xvci5wcm90b3R5cGUuZGFya2VuID0gZnVuY3Rpb24oYW1vdW50KSB7XG4gICAgdmFyIGxhYiwgbWU7XG4gICAgaWYgKGFtb3VudCA9PSBudWxsKSB7XG4gICAgICBhbW91bnQgPSAxO1xuICAgIH1cbiAgICBtZSA9IHRoaXM7XG4gICAgbGFiID0gbWUubGFiKCk7XG4gICAgbGFiWzBdIC09IExBQl9DT05TVEFOVFMuS24gKiBhbW91bnQ7XG4gICAgcmV0dXJuIGNocm9tYS5sYWIobGFiKS5hbHBoYShtZS5hbHBoYSgpKTtcbiAgfTtcblxuICBDb2xvci5wcm90b3R5cGUuYnJpZ2h0ZW4gPSBmdW5jdGlvbihhbW91bnQpIHtcbiAgICBpZiAoYW1vdW50ID09IG51bGwpIHtcbiAgICAgIGFtb3VudCA9IDE7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmRhcmtlbigtYW1vdW50KTtcbiAgfTtcblxuICBDb2xvci5wcm90b3R5cGUuZGFya2VyID0gQ29sb3IucHJvdG90eXBlLmRhcmtlbjtcblxuICBDb2xvci5wcm90b3R5cGUuYnJpZ2h0ZXIgPSBDb2xvci5wcm90b3R5cGUuYnJpZ2h0ZW47XG5cbiAgQ29sb3IucHJvdG90eXBlLnNhdHVyYXRlID0gZnVuY3Rpb24oYW1vdW50KSB7XG4gICAgdmFyIGxjaCwgbWU7XG4gICAgaWYgKGFtb3VudCA9PSBudWxsKSB7XG4gICAgICBhbW91bnQgPSAxO1xuICAgIH1cbiAgICBtZSA9IHRoaXM7XG4gICAgbGNoID0gbWUubGNoKCk7XG4gICAgbGNoWzFdICs9IGFtb3VudCAqIExBQl9DT05TVEFOVFMuS247XG4gICAgaWYgKGxjaFsxXSA8IDApIHtcbiAgICAgIGxjaFsxXSA9IDA7XG4gICAgfVxuICAgIHJldHVybiBjaHJvbWEubGNoKGxjaCkuYWxwaGEobWUuYWxwaGEoKSk7XG4gIH07XG5cbiAgQ29sb3IucHJvdG90eXBlLmRlc2F0dXJhdGUgPSBmdW5jdGlvbihhbW91bnQpIHtcbiAgICBpZiAoYW1vdW50ID09IG51bGwpIHtcbiAgICAgIGFtb3VudCA9IDE7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNhdHVyYXRlKC1hbW91bnQpO1xuICB9O1xuXG4gIENvbG9yLnByb3RvdHlwZS5wcmVtdWx0aXBseSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhLCByZ2I7XG4gICAgcmdiID0gdGhpcy5yZ2IoKTtcbiAgICBhID0gdGhpcy5hbHBoYSgpO1xuICAgIHJldHVybiBjaHJvbWEocmdiWzBdICogYSwgcmdiWzFdICogYSwgcmdiWzJdICogYSwgYSk7XG4gIH07XG5cbiAgYmxlbmQgPSBmdW5jdGlvbihib3R0b20sIHRvcCwgbW9kZSkge1xuICAgIGlmICghYmxlbmRbbW9kZV0pIHtcbiAgICAgIHRocm93ICd1bmtub3duIGJsZW5kIG1vZGUgJyArIG1vZGU7XG4gICAgfVxuICAgIHJldHVybiBibGVuZFttb2RlXShib3R0b20sIHRvcCk7XG4gIH07XG5cbiAgYmxlbmRfZiA9IGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYm90dG9tLCB0b3ApIHtcbiAgICAgIHZhciBjMCwgYzE7XG4gICAgICBjMCA9IGNocm9tYSh0b3ApLnJnYigpO1xuICAgICAgYzEgPSBjaHJvbWEoYm90dG9tKS5yZ2IoKTtcbiAgICAgIHJldHVybiBjaHJvbWEoZihjMCwgYzEpLCAncmdiJyk7XG4gICAgfTtcbiAgfTtcblxuICBlYWNoID0gZnVuY3Rpb24oZikge1xuICAgIHJldHVybiBmdW5jdGlvbihjMCwgYzEpIHtcbiAgICAgIHZhciBpLCBvLCBvdXQ7XG4gICAgICBvdXQgPSBbXTtcbiAgICAgIGZvciAoaSA9IG8gPSAwOyBvIDw9IDM7IGkgPSArK28pIHtcbiAgICAgICAgb3V0W2ldID0gZihjMFtpXSwgYzFbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xuICB9O1xuXG4gIG5vcm1hbCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gYTtcbiAgfTtcblxuICBtdWx0aXBseSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gYSAqIGIgLyAyNTU7XG4gIH07XG5cbiAgZGFya2VuID0gZnVuY3Rpb24oYSwgYikge1xuICAgIGlmIChhID4gYikge1xuICAgICAgcmV0dXJuIGI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhO1xuICAgIH1cbiAgfTtcblxuICBsaWdodGVuID0gZnVuY3Rpb24oYSwgYikge1xuICAgIGlmIChhID4gYikge1xuICAgICAgcmV0dXJuIGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBiO1xuICAgIH1cbiAgfTtcblxuICBzY3JlZW4gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIDI1NSAqICgxIC0gKDEgLSBhIC8gMjU1KSAqICgxIC0gYiAvIDI1NSkpO1xuICB9O1xuXG4gIG92ZXJsYXkgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgaWYgKGIgPCAxMjgpIHtcbiAgICAgIHJldHVybiAyICogYSAqIGIgLyAyNTU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAyNTUgKiAoMSAtIDIgKiAoMSAtIGEgLyAyNTUpICogKDEgLSBiIC8gMjU1KSk7XG4gICAgfVxuICB9O1xuXG4gIGJ1cm4gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIDI1NSAqICgxIC0gKDEgLSBiIC8gMjU1KSAvIChhIC8gMjU1KSk7XG4gIH07XG5cbiAgZG9kZ2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgaWYgKGEgPT09IDI1NSkge1xuICAgICAgcmV0dXJuIDI1NTtcbiAgICB9XG4gICAgYSA9IDI1NSAqIChiIC8gMjU1KSAvICgxIC0gYSAvIDI1NSk7XG4gICAgaWYgKGEgPiAyNTUpIHtcbiAgICAgIHJldHVybiAyNTU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhO1xuICAgIH1cbiAgfTtcblxuICBibGVuZC5ub3JtYWwgPSBibGVuZF9mKGVhY2gobm9ybWFsKSk7XG5cbiAgYmxlbmQubXVsdGlwbHkgPSBibGVuZF9mKGVhY2gobXVsdGlwbHkpKTtcblxuICBibGVuZC5zY3JlZW4gPSBibGVuZF9mKGVhY2goc2NyZWVuKSk7XG5cbiAgYmxlbmQub3ZlcmxheSA9IGJsZW5kX2YoZWFjaChvdmVybGF5KSk7XG5cbiAgYmxlbmQuZGFya2VuID0gYmxlbmRfZihlYWNoKGRhcmtlbikpO1xuXG4gIGJsZW5kLmxpZ2h0ZW4gPSBibGVuZF9mKGVhY2gobGlnaHRlbikpO1xuXG4gIGJsZW5kLmRvZGdlID0gYmxlbmRfZihlYWNoKGRvZGdlKSk7XG5cbiAgYmxlbmQuYnVybiA9IGJsZW5kX2YoZWFjaChidXJuKSk7XG5cbiAgY2hyb21hLmJsZW5kID0gYmxlbmQ7XG5cbiAgY2hyb21hLmFuYWx5emUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIGxlbiwgbywgciwgdmFsO1xuICAgIHIgPSB7XG4gICAgICBtaW46IE51bWJlci5NQVhfVkFMVUUsXG4gICAgICBtYXg6IE51bWJlci5NQVhfVkFMVUUgKiAtMSxcbiAgICAgIHN1bTogMCxcbiAgICAgIHZhbHVlczogW10sXG4gICAgICBjb3VudDogMFxuICAgIH07XG4gICAgZm9yIChvID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IG8gPCBsZW47IG8rKykge1xuICAgICAgdmFsID0gZGF0YVtvXTtcbiAgICAgIGlmICgodmFsICE9IG51bGwpICYmICFpc05hTih2YWwpKSB7XG4gICAgICAgIHIudmFsdWVzLnB1c2godmFsKTtcbiAgICAgICAgci5zdW0gKz0gdmFsO1xuICAgICAgICBpZiAodmFsIDwgci5taW4pIHtcbiAgICAgICAgICByLm1pbiA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsID4gci5tYXgpIHtcbiAgICAgICAgICByLm1heCA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgICByLmNvdW50ICs9IDE7XG4gICAgICB9XG4gICAgfVxuICAgIHIuZG9tYWluID0gW3IubWluLCByLm1heF07XG4gICAgci5saW1pdHMgPSBmdW5jdGlvbihtb2RlLCBudW0pIHtcbiAgICAgIHJldHVybiBjaHJvbWEubGltaXRzKHIsIG1vZGUsIG51bSk7XG4gICAgfTtcbiAgICByZXR1cm4gcjtcbiAgfTtcblxuICBjaHJvbWEuc2NhbGUgPSBmdW5jdGlvbihjb2xvcnMsIHBvc2l0aW9ucykge1xuICAgIHZhciBfY2xhc3NlcywgX2NvbG9yQ2FjaGUsIF9jb2xvcnMsIF9jb3JyZWN0TGlnaHRuZXNzLCBfZG9tYWluLCBfZml4ZWQsIF9tYXgsIF9taW4sIF9tb2RlLCBfbmFjb2wsIF9vdXQsIF9wYWRkaW5nLCBfcG9zLCBfc3ByZWFkLCBjbGFzc2lmeVZhbHVlLCBmLCBnZXRDbGFzcywgZ2V0Q29sb3IsIHJlc2V0Q2FjaGUsIHNldENvbG9ycywgdG1hcDtcbiAgICBfbW9kZSA9ICdyZ2InO1xuICAgIF9uYWNvbCA9IGNocm9tYSgnI2NjYycpO1xuICAgIF9zcHJlYWQgPSAwO1xuICAgIF9maXhlZCA9IGZhbHNlO1xuICAgIF9kb21haW4gPSBbMCwgMV07XG4gICAgX3BvcyA9IFtdO1xuICAgIF9wYWRkaW5nID0gWzAsIDBdO1xuICAgIF9jbGFzc2VzID0gZmFsc2U7XG4gICAgX2NvbG9ycyA9IFtdO1xuICAgIF9vdXQgPSBmYWxzZTtcbiAgICBfbWluID0gMDtcbiAgICBfbWF4ID0gMTtcbiAgICBfY29ycmVjdExpZ2h0bmVzcyA9IGZhbHNlO1xuICAgIF9jb2xvckNhY2hlID0ge307XG4gICAgc2V0Q29sb3JzID0gZnVuY3Rpb24oY29sb3JzKSB7XG4gICAgICB2YXIgYywgY29sLCBvLCByZWYsIHJlZjEsIHJlZjIsIHc7XG4gICAgICBpZiAoY29sb3JzID09IG51bGwpIHtcbiAgICAgICAgY29sb3JzID0gWycjZmZmJywgJyMwMDAnXTtcbiAgICAgIH1cbiAgICAgIGlmICgoY29sb3JzICE9IG51bGwpICYmIHR5cGUoY29sb3JzKSA9PT0gJ3N0cmluZycgJiYgKCgocmVmID0gY2hyb21hLmJyZXdlcikgIT0gbnVsbCA/IHJlZltjb2xvcnNdIDogdm9pZCAwKSAhPSBudWxsKSkge1xuICAgICAgICBjb2xvcnMgPSBjaHJvbWEuYnJld2VyW2NvbG9yc107XG4gICAgICB9XG4gICAgICBpZiAodHlwZShjb2xvcnMpID09PSAnYXJyYXknKSB7XG4gICAgICAgIGNvbG9ycyA9IGNvbG9ycy5zbGljZSgwKTtcbiAgICAgICAgZm9yIChjID0gbyA9IDAsIHJlZjEgPSBjb2xvcnMubGVuZ3RoIC0gMTsgMCA8PSByZWYxID8gbyA8PSByZWYxIDogbyA+PSByZWYxOyBjID0gMCA8PSByZWYxID8gKytvIDogLS1vKSB7XG4gICAgICAgICAgY29sID0gY29sb3JzW2NdO1xuICAgICAgICAgIGlmICh0eXBlKGNvbCkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGNvbG9yc1tjXSA9IGNocm9tYShjb2wpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfcG9zLmxlbmd0aCA9IDA7XG4gICAgICAgIGZvciAoYyA9IHcgPSAwLCByZWYyID0gY29sb3JzLmxlbmd0aCAtIDE7IDAgPD0gcmVmMiA/IHcgPD0gcmVmMiA6IHcgPj0gcmVmMjsgYyA9IDAgPD0gcmVmMiA/ICsrdyA6IC0tdykge1xuICAgICAgICAgIF9wb3MucHVzaChjIC8gKGNvbG9ycy5sZW5ndGggLSAxKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlc2V0Q2FjaGUoKTtcbiAgICAgIHJldHVybiBfY29sb3JzID0gY29sb3JzO1xuICAgIH07XG4gICAgZ2V0Q2xhc3MgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdmFyIGksIG47XG4gICAgICBpZiAoX2NsYXNzZXMgIT0gbnVsbCkge1xuICAgICAgICBuID0gX2NsYXNzZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgbiAmJiB2YWx1ZSA+PSBfY2xhc3Nlc1tpXSkge1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaSAtIDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gMDtcbiAgICB9O1xuICAgIHRtYXAgPSBmdW5jdGlvbih0KSB7XG4gICAgICByZXR1cm4gdDtcbiAgICB9O1xuICAgIGNsYXNzaWZ5VmFsdWUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdmFyIGksIG1heGMsIG1pbmMsIG4sIHZhbDtcbiAgICAgIHZhbCA9IHZhbHVlO1xuICAgICAgaWYgKF9jbGFzc2VzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgbiA9IF9jbGFzc2VzLmxlbmd0aCAtIDE7XG4gICAgICAgIGkgPSBnZXRDbGFzcyh2YWx1ZSk7XG4gICAgICAgIG1pbmMgPSBfY2xhc3Nlc1swXSArIChfY2xhc3Nlc1sxXSAtIF9jbGFzc2VzWzBdKSAqICgwICsgX3NwcmVhZCAqIDAuNSk7XG4gICAgICAgIG1heGMgPSBfY2xhc3Nlc1tuIC0gMV0gKyAoX2NsYXNzZXNbbl0gLSBfY2xhc3Nlc1tuIC0gMV0pICogKDEgLSBfc3ByZWFkICogMC41KTtcbiAgICAgICAgdmFsID0gX21pbiArICgoX2NsYXNzZXNbaV0gKyAoX2NsYXNzZXNbaSArIDFdIC0gX2NsYXNzZXNbaV0pICogMC41IC0gbWluYykgLyAobWF4YyAtIG1pbmMpKSAqIChfbWF4IC0gX21pbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH07XG4gICAgZ2V0Q29sb3IgPSBmdW5jdGlvbih2YWwsIGJ5cGFzc01hcCkge1xuICAgICAgdmFyIGMsIGNvbCwgaSwgaywgbywgcCwgcmVmLCB0O1xuICAgICAgaWYgKGJ5cGFzc01hcCA9PSBudWxsKSB7XG4gICAgICAgIGJ5cGFzc01hcCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGlzTmFOKHZhbCkpIHtcbiAgICAgICAgcmV0dXJuIF9uYWNvbDtcbiAgICAgIH1cbiAgICAgIGlmICghYnlwYXNzTWFwKSB7XG4gICAgICAgIGlmIChfY2xhc3NlcyAmJiBfY2xhc3Nlcy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgYyA9IGdldENsYXNzKHZhbCk7XG4gICAgICAgICAgdCA9IGMgLyAoX2NsYXNzZXMubGVuZ3RoIC0gMik7XG4gICAgICAgICAgdCA9IF9wYWRkaW5nWzBdICsgKHQgKiAoMSAtIF9wYWRkaW5nWzBdIC0gX3BhZGRpbmdbMV0pKTtcbiAgICAgICAgfSBlbHNlIGlmIChfbWF4ICE9PSBfbWluKSB7XG4gICAgICAgICAgdCA9ICh2YWwgLSBfbWluKSAvIChfbWF4IC0gX21pbik7XG4gICAgICAgICAgdCA9IF9wYWRkaW5nWzBdICsgKHQgKiAoMSAtIF9wYWRkaW5nWzBdIC0gX3BhZGRpbmdbMV0pKTtcbiAgICAgICAgICB0ID0gTWF0aC5taW4oMSwgTWF0aC5tYXgoMCwgdCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHQgPSAxO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ID0gdmFsO1xuICAgICAgfVxuICAgICAgaWYgKCFieXBhc3NNYXApIHtcbiAgICAgICAgdCA9IHRtYXAodCk7XG4gICAgICB9XG4gICAgICBrID0gTWF0aC5mbG9vcih0ICogMTAwMDApO1xuICAgICAgaWYgKF9jb2xvckNhY2hlW2tdKSB7XG4gICAgICAgIGNvbCA9IF9jb2xvckNhY2hlW2tdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHR5cGUoX2NvbG9ycykgPT09ICdhcnJheScpIHtcbiAgICAgICAgICBmb3IgKGkgPSBvID0gMCwgcmVmID0gX3Bvcy5sZW5ndGggLSAxOyAwIDw9IHJlZiA/IG8gPD0gcmVmIDogbyA+PSByZWY7IGkgPSAwIDw9IHJlZiA/ICsrbyA6IC0tbykge1xuICAgICAgICAgICAgcCA9IF9wb3NbaV07XG4gICAgICAgICAgICBpZiAodCA8PSBwKSB7XG4gICAgICAgICAgICAgIGNvbCA9IF9jb2xvcnNbaV07XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHQgPj0gcCAmJiBpID09PSBfcG9zLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgY29sID0gX2NvbG9yc1tpXTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodCA+IHAgJiYgdCA8IF9wb3NbaSArIDFdKSB7XG4gICAgICAgICAgICAgIHQgPSAodCAtIHApIC8gKF9wb3NbaSArIDFdIC0gcCk7XG4gICAgICAgICAgICAgIGNvbCA9IGNocm9tYS5pbnRlcnBvbGF0ZShfY29sb3JzW2ldLCBfY29sb3JzW2kgKyAxXSwgdCwgX21vZGUpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZShfY29sb3JzKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNvbCA9IF9jb2xvcnModCk7XG4gICAgICAgIH1cbiAgICAgICAgX2NvbG9yQ2FjaGVba10gPSBjb2w7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29sO1xuICAgIH07XG4gICAgcmVzZXRDYWNoZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9jb2xvckNhY2hlID0ge307XG4gICAgfTtcbiAgICBzZXRDb2xvcnMoY29sb3JzKTtcbiAgICBmID0gZnVuY3Rpb24odikge1xuICAgICAgdmFyIGM7XG4gICAgICBjID0gY2hyb21hKGdldENvbG9yKHYpKTtcbiAgICAgIGlmIChfb3V0ICYmIGNbX291dF0pIHtcbiAgICAgICAgcmV0dXJuIGNbX291dF0oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjO1xuICAgICAgfVxuICAgIH07XG4gICAgZi5jbGFzc2VzID0gZnVuY3Rpb24oY2xhc3Nlcykge1xuICAgICAgdmFyIGQ7XG4gICAgICBpZiAoY2xhc3NlcyAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0eXBlKGNsYXNzZXMpID09PSAnYXJyYXknKSB7XG4gICAgICAgICAgX2NsYXNzZXMgPSBjbGFzc2VzO1xuICAgICAgICAgIF9kb21haW4gPSBbY2xhc3Nlc1swXSwgY2xhc3Nlc1tjbGFzc2VzLmxlbmd0aCAtIDFdXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkID0gY2hyb21hLmFuYWx5emUoX2RvbWFpbik7XG4gICAgICAgICAgaWYgKGNsYXNzZXMgPT09IDApIHtcbiAgICAgICAgICAgIF9jbGFzc2VzID0gW2QubWluLCBkLm1heF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9jbGFzc2VzID0gY2hyb21hLmxpbWl0cyhkLCAnZScsIGNsYXNzZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfY2xhc3NlcztcbiAgICB9O1xuICAgIGYuZG9tYWluID0gZnVuY3Rpb24oZG9tYWluKSB7XG4gICAgICB2YXIgYywgZCwgaywgbGVuLCBvLCByZWYsIHc7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIF9kb21haW47XG4gICAgICB9XG4gICAgICBfbWluID0gZG9tYWluWzBdO1xuICAgICAgX21heCA9IGRvbWFpbltkb21haW4ubGVuZ3RoIC0gMV07XG4gICAgICBfcG9zID0gW107XG4gICAgICBrID0gX2NvbG9ycy5sZW5ndGg7XG4gICAgICBpZiAoZG9tYWluLmxlbmd0aCA9PT0gayAmJiBfbWluICE9PSBfbWF4KSB7XG4gICAgICAgIGZvciAobyA9IDAsIGxlbiA9IGRvbWFpbi5sZW5ndGg7IG8gPCBsZW47IG8rKykge1xuICAgICAgICAgIGQgPSBkb21haW5bb107XG4gICAgICAgICAgX3Bvcy5wdXNoKChkIC0gX21pbikgLyAoX21heCAtIF9taW4pKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChjID0gdyA9IDAsIHJlZiA9IGsgLSAxOyAwIDw9IHJlZiA/IHcgPD0gcmVmIDogdyA+PSByZWY7IGMgPSAwIDw9IHJlZiA/ICsrdyA6IC0tdykge1xuICAgICAgICAgIF9wb3MucHVzaChjIC8gKGsgLSAxKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIF9kb21haW4gPSBbX21pbiwgX21heF07XG4gICAgICByZXR1cm4gZjtcbiAgICB9O1xuICAgIGYubW9kZSA9IGZ1bmN0aW9uKF9tKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIF9tb2RlO1xuICAgICAgfVxuICAgICAgX21vZGUgPSBfbTtcbiAgICAgIHJlc2V0Q2FjaGUoKTtcbiAgICAgIHJldHVybiBmO1xuICAgIH07XG4gICAgZi5yYW5nZSA9IGZ1bmN0aW9uKGNvbG9ycywgX3Bvcykge1xuICAgICAgc2V0Q29sb3JzKGNvbG9ycywgX3Bvcyk7XG4gICAgICByZXR1cm4gZjtcbiAgICB9O1xuICAgIGYub3V0ID0gZnVuY3Rpb24oX28pIHtcbiAgICAgIF9vdXQgPSBfbztcbiAgICAgIHJldHVybiBmO1xuICAgIH07XG4gICAgZi5zcHJlYWQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gX3NwcmVhZDtcbiAgICAgIH1cbiAgICAgIF9zcHJlYWQgPSB2YWw7XG4gICAgICByZXR1cm4gZjtcbiAgICB9O1xuICAgIGYuY29ycmVjdExpZ2h0bmVzcyA9IGZ1bmN0aW9uKHYpIHtcbiAgICAgIGlmICh2ID09IG51bGwpIHtcbiAgICAgICAgdiA9IHRydWU7XG4gICAgICB9XG4gICAgICBfY29ycmVjdExpZ2h0bmVzcyA9IHY7XG4gICAgICByZXNldENhY2hlKCk7XG4gICAgICBpZiAoX2NvcnJlY3RMaWdodG5lc3MpIHtcbiAgICAgICAgdG1hcCA9IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICB2YXIgTDAsIEwxLCBMX2FjdHVhbCwgTF9kaWZmLCBMX2lkZWFsLCBtYXhfaXRlciwgcG9sLCB0MCwgdDE7XG4gICAgICAgICAgTDAgPSBnZXRDb2xvcigwLCB0cnVlKS5sYWIoKVswXTtcbiAgICAgICAgICBMMSA9IGdldENvbG9yKDEsIHRydWUpLmxhYigpWzBdO1xuICAgICAgICAgIHBvbCA9IEwwID4gTDE7XG4gICAgICAgICAgTF9hY3R1YWwgPSBnZXRDb2xvcih0LCB0cnVlKS5sYWIoKVswXTtcbiAgICAgICAgICBMX2lkZWFsID0gTDAgKyAoTDEgLSBMMCkgKiB0O1xuICAgICAgICAgIExfZGlmZiA9IExfYWN0dWFsIC0gTF9pZGVhbDtcbiAgICAgICAgICB0MCA9IDA7XG4gICAgICAgICAgdDEgPSAxO1xuICAgICAgICAgIG1heF9pdGVyID0gMjA7XG4gICAgICAgICAgd2hpbGUgKE1hdGguYWJzKExfZGlmZikgPiAxZS0yICYmIG1heF9pdGVyLS0gPiAwKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGlmIChwb2wpIHtcbiAgICAgICAgICAgICAgICBMX2RpZmYgKj0gLTE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKExfZGlmZiA8IDApIHtcbiAgICAgICAgICAgICAgICB0MCA9IHQ7XG4gICAgICAgICAgICAgICAgdCArPSAodDEgLSB0KSAqIDAuNTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0MSA9IHQ7XG4gICAgICAgICAgICAgICAgdCArPSAodDAgLSB0KSAqIDAuNTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBMX2FjdHVhbCA9IGdldENvbG9yKHQsIHRydWUpLmxhYigpWzBdO1xuICAgICAgICAgICAgICByZXR1cm4gTF9kaWZmID0gTF9hY3R1YWwgLSBMX2lkZWFsO1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHQ7XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0bWFwID0gZnVuY3Rpb24odCkge1xuICAgICAgICAgIHJldHVybiB0O1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGY7XG4gICAgfTtcbiAgICBmLnBhZGRpbmcgPSBmdW5jdGlvbihwKSB7XG4gICAgICBpZiAocCAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0eXBlKHApID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHAgPSBbcCwgcF07XG4gICAgICAgIH1cbiAgICAgICAgX3BhZGRpbmcgPSBwO1xuICAgICAgICByZXR1cm4gZjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBfcGFkZGluZztcbiAgICAgIH1cbiAgICB9O1xuICAgIGYuY29sb3JzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGQsIGRtLCBpLCBudW1Db2xvcnMsIG8sIG91dCwgcmVmLCByZXN1bHRzLCBzYW1wbGVzLCB3O1xuICAgICAgbnVtQ29sb3JzID0gMDtcbiAgICAgIG91dCA9ICdoZXgnO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIF9jb2xvcnMubWFwKGZ1bmN0aW9uKGMpIHtcbiAgICAgICAgICByZXR1cm4gY1tvdXRdKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgaWYgKHR5cGUoYXJndW1lbnRzWzBdKSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBvdXQgPSBhcmd1bWVudHNbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbnVtQ29sb3JzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBudW1Db2xvcnMgPSBhcmd1bWVudHNbMF0sIG91dCA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIH1cbiAgICAgIGlmIChudW1Db2xvcnMpIHtcbiAgICAgICAgZG0gPSBfZG9tYWluWzBdO1xuICAgICAgICBkZCA9IF9kb21haW5bMV0gLSBkbTtcbiAgICAgICAgcmV0dXJuIChmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yICh2YXIgbyA9IDA7IDAgPD0gbnVtQ29sb3JzID8gbyA8IG51bUNvbG9ycyA6IG8gPiBudW1Db2xvcnM7IDAgPD0gbnVtQ29sb3JzID8gbysrIDogby0tKXsgcmVzdWx0cy5wdXNoKG8pOyB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH0pLmFwcGx5KHRoaXMpLm1hcChmdW5jdGlvbihpKSB7XG4gICAgICAgICAgcmV0dXJuIGYoZG0gKyBpIC8gKG51bUNvbG9ycyAtIDEpICogZGQpW291dF0oKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBjb2xvcnMgPSBbXTtcbiAgICAgIHNhbXBsZXMgPSBbXTtcbiAgICAgIGlmIChfY2xhc3NlcyAmJiBfY2xhc3Nlcy5sZW5ndGggPiAyKSB7XG4gICAgICAgIGZvciAoaSA9IHcgPSAxLCByZWYgPSBfY2xhc3Nlcy5sZW5ndGg7IDEgPD0gcmVmID8gdyA8IHJlZiA6IHcgPiByZWY7IGkgPSAxIDw9IHJlZiA/ICsrdyA6IC0tdykge1xuICAgICAgICAgIHNhbXBsZXMucHVzaCgoX2NsYXNzZXNbaSAtIDFdICsgX2NsYXNzZXNbaV0pICogMC41KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2FtcGxlcyA9IF9kb21haW47XG4gICAgICB9XG4gICAgICByZXR1cm4gc2FtcGxlcy5tYXAoZnVuY3Rpb24odikge1xuICAgICAgICByZXR1cm4gZih2KVtvdXRdKCk7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBmO1xuICB9O1xuXG4gIGlmIChjaHJvbWEuc2NhbGVzID09IG51bGwpIHtcbiAgICBjaHJvbWEuc2NhbGVzID0ge307XG4gIH1cblxuICBjaHJvbWEuc2NhbGVzLmNvb2wgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY2hyb21hLnNjYWxlKFtjaHJvbWEuaHNsKDE4MCwgMSwgLjkpLCBjaHJvbWEuaHNsKDI1MCwgLjcsIC40KV0pO1xuICB9O1xuXG4gIGNocm9tYS5zY2FsZXMuaG90ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNocm9tYS5zY2FsZShbJyMwMDAnLCAnI2YwMCcsICcjZmYwJywgJyNmZmYnXSwgWzAsIC4yNSwgLjc1LCAxXSkubW9kZSgncmdiJyk7XG4gIH07XG5cbiAgY2hyb21hLmFuYWx5emUgPSBmdW5jdGlvbihkYXRhLCBrZXksIGZpbHRlcikge1xuICAgIHZhciBhZGQsIGssIGxlbiwgbywgciwgdmFsLCB2aXNpdDtcbiAgICByID0ge1xuICAgICAgbWluOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgbWF4OiBOdW1iZXIuTUFYX1ZBTFVFICogLTEsXG4gICAgICBzdW06IDAsXG4gICAgICB2YWx1ZXM6IFtdLFxuICAgICAgY291bnQ6IDBcbiAgICB9O1xuICAgIGlmIChmaWx0ZXIgPT0gbnVsbCkge1xuICAgICAgZmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9XG4gICAgYWRkID0gZnVuY3Rpb24odmFsKSB7XG4gICAgICBpZiAoKHZhbCAhPSBudWxsKSAmJiAhaXNOYU4odmFsKSkge1xuICAgICAgICByLnZhbHVlcy5wdXNoKHZhbCk7XG4gICAgICAgIHIuc3VtICs9IHZhbDtcbiAgICAgICAgaWYgKHZhbCA8IHIubWluKSB7XG4gICAgICAgICAgci5taW4gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbCA+IHIubWF4KSB7XG4gICAgICAgICAgci5tYXggPSB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgci5jb3VudCArPSAxO1xuICAgICAgfVxuICAgIH07XG4gICAgdmlzaXQgPSBmdW5jdGlvbih2YWwsIGspIHtcbiAgICAgIGlmIChmaWx0ZXIodmFsLCBrKSkge1xuICAgICAgICBpZiAoKGtleSAhPSBudWxsKSAmJiB0eXBlKGtleSkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICByZXR1cm4gYWRkKGtleSh2YWwpKTtcbiAgICAgICAgfSBlbHNlIGlmICgoa2V5ICE9IG51bGwpICYmIHR5cGUoa2V5KSA9PT0gJ3N0cmluZycgfHwgdHlwZShrZXkpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHJldHVybiBhZGQodmFsW2tleV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBhZGQodmFsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgaWYgKHR5cGUoZGF0YSkgPT09ICdhcnJheScpIHtcbiAgICAgIGZvciAobyA9IDAsIGxlbiA9IGRhdGEubGVuZ3RoOyBvIDwgbGVuOyBvKyspIHtcbiAgICAgICAgdmFsID0gZGF0YVtvXTtcbiAgICAgICAgdmlzaXQodmFsKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChrIGluIGRhdGEpIHtcbiAgICAgICAgdmFsID0gZGF0YVtrXTtcbiAgICAgICAgdmlzaXQodmFsLCBrKTtcbiAgICAgIH1cbiAgICB9XG4gICAgci5kb21haW4gPSBbci5taW4sIHIubWF4XTtcbiAgICByLmxpbWl0cyA9IGZ1bmN0aW9uKG1vZGUsIG51bSkge1xuICAgICAgcmV0dXJuIGNocm9tYS5saW1pdHMociwgbW9kZSwgbnVtKTtcbiAgICB9O1xuICAgIHJldHVybiByO1xuICB9O1xuXG4gIGNocm9tYS5saW1pdHMgPSBmdW5jdGlvbihkYXRhLCBtb2RlLCBudW0pIHtcbiAgICB2YXIgYWEsIGFiLCBhYywgYWQsIGFlLCBhZiwgYWcsIGFoLCBhaSwgYWosIGFrLCBhbCwgYW0sIGFzc2lnbm1lbnRzLCBiZXN0LCBjZW50cm9pZHMsIGNsdXN0ZXIsIGNsdXN0ZXJTaXplcywgZGlzdCwgaSwgaiwga0NsdXN0ZXJzLCBsaW1pdHMsIG1heF9sb2csIG1pbiwgbWluX2xvZywgbWluZGlzdCwgbiwgbmJfaXRlcnMsIG5ld0NlbnRyb2lkcywgbywgcCwgcGIsIHByLCByZWYsIHJlZjEsIHJlZjEwLCByZWYxMSwgcmVmMTIsIHJlZjEzLCByZWYxNCwgcmVmMiwgcmVmMywgcmVmNCwgcmVmNSwgcmVmNiwgcmVmNywgcmVmOCwgcmVmOSwgcmVwZWF0LCBzdW0sIHRtcEtNZWFuc0JyZWFrcywgdmFsdWUsIHZhbHVlcywgdztcbiAgICBpZiAobW9kZSA9PSBudWxsKSB7XG4gICAgICBtb2RlID0gJ2VxdWFsJztcbiAgICB9XG4gICAgaWYgKG51bSA9PSBudWxsKSB7XG4gICAgICBudW0gPSA3O1xuICAgIH1cbiAgICBpZiAodHlwZShkYXRhKSA9PT0gJ2FycmF5Jykge1xuICAgICAgZGF0YSA9IGNocm9tYS5hbmFseXplKGRhdGEpO1xuICAgIH1cbiAgICBtaW4gPSBkYXRhLm1pbjtcbiAgICBtYXggPSBkYXRhLm1heDtcbiAgICBzdW0gPSBkYXRhLnN1bTtcbiAgICB2YWx1ZXMgPSBkYXRhLnZhbHVlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhIC0gYjtcbiAgICB9KTtcbiAgICBsaW1pdHMgPSBbXTtcbiAgICBpZiAobW9kZS5zdWJzdHIoMCwgMSkgPT09ICdjJykge1xuICAgICAgbGltaXRzLnB1c2gobWluKTtcbiAgICAgIGxpbWl0cy5wdXNoKG1heCk7XG4gICAgfVxuICAgIGlmIChtb2RlLnN1YnN0cigwLCAxKSA9PT0gJ2UnKSB7XG4gICAgICBsaW1pdHMucHVzaChtaW4pO1xuICAgICAgZm9yIChpID0gbyA9IDEsIHJlZiA9IG51bSAtIDE7IDEgPD0gcmVmID8gbyA8PSByZWYgOiBvID49IHJlZjsgaSA9IDEgPD0gcmVmID8gKytvIDogLS1vKSB7XG4gICAgICAgIGxpbWl0cy5wdXNoKG1pbiArIChpIC8gbnVtKSAqIChtYXggLSBtaW4pKTtcbiAgICAgIH1cbiAgICAgIGxpbWl0cy5wdXNoKG1heCk7XG4gICAgfSBlbHNlIGlmIChtb2RlLnN1YnN0cigwLCAxKSA9PT0gJ2wnKSB7XG4gICAgICBpZiAobWluIDw9IDApIHtcbiAgICAgICAgdGhyb3cgJ0xvZ2FyaXRobWljIHNjYWxlcyBhcmUgb25seSBwb3NzaWJsZSBmb3IgdmFsdWVzID4gMCc7XG4gICAgICB9XG4gICAgICBtaW5fbG9nID0gTWF0aC5MT0cxMEUgKiBsb2cobWluKTtcbiAgICAgIG1heF9sb2cgPSBNYXRoLkxPRzEwRSAqIGxvZyhtYXgpO1xuICAgICAgbGltaXRzLnB1c2gobWluKTtcbiAgICAgIGZvciAoaSA9IHcgPSAxLCByZWYxID0gbnVtIC0gMTsgMSA8PSByZWYxID8gdyA8PSByZWYxIDogdyA+PSByZWYxOyBpID0gMSA8PSByZWYxID8gKyt3IDogLS13KSB7XG4gICAgICAgIGxpbWl0cy5wdXNoKHBvdygxMCwgbWluX2xvZyArIChpIC8gbnVtKSAqIChtYXhfbG9nIC0gbWluX2xvZykpKTtcbiAgICAgIH1cbiAgICAgIGxpbWl0cy5wdXNoKG1heCk7XG4gICAgfSBlbHNlIGlmIChtb2RlLnN1YnN0cigwLCAxKSA9PT0gJ3EnKSB7XG4gICAgICBsaW1pdHMucHVzaChtaW4pO1xuICAgICAgZm9yIChpID0gYWEgPSAxLCByZWYyID0gbnVtIC0gMTsgMSA8PSByZWYyID8gYWEgPD0gcmVmMiA6IGFhID49IHJlZjI7IGkgPSAxIDw9IHJlZjIgPyArK2FhIDogLS1hYSkge1xuICAgICAgICBwID0gdmFsdWVzLmxlbmd0aCAqIGkgLyBudW07XG4gICAgICAgIHBiID0gZmxvb3IocCk7XG4gICAgICAgIGlmIChwYiA9PT0gcCkge1xuICAgICAgICAgIGxpbWl0cy5wdXNoKHZhbHVlc1twYl0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByID0gcCAtIHBiO1xuICAgICAgICAgIGxpbWl0cy5wdXNoKHZhbHVlc1twYl0gKiBwciArIHZhbHVlc1twYiArIDFdICogKDEgLSBwcikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsaW1pdHMucHVzaChtYXgpO1xuICAgIH0gZWxzZSBpZiAobW9kZS5zdWJzdHIoMCwgMSkgPT09ICdrJykge1xuXG4gICAgICAvKlxuICAgICAgaW1wbGVtZW50YXRpb24gYmFzZWQgb25cbiAgICAgIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9maWd1ZS9zb3VyY2UvYnJvd3NlL3RydW5rL2ZpZ3VlLmpzIzMzNlxuICAgICAgc2ltcGxpZmllZCBmb3IgMS1kIGlucHV0IHZhbHVlc1xuICAgICAgICovXG4gICAgICBuID0gdmFsdWVzLmxlbmd0aDtcbiAgICAgIGFzc2lnbm1lbnRzID0gbmV3IEFycmF5KG4pO1xuICAgICAgY2x1c3RlclNpemVzID0gbmV3IEFycmF5KG51bSk7XG4gICAgICByZXBlYXQgPSB0cnVlO1xuICAgICAgbmJfaXRlcnMgPSAwO1xuICAgICAgY2VudHJvaWRzID0gbnVsbDtcbiAgICAgIGNlbnRyb2lkcyA9IFtdO1xuICAgICAgY2VudHJvaWRzLnB1c2gobWluKTtcbiAgICAgIGZvciAoaSA9IGFiID0gMSwgcmVmMyA9IG51bSAtIDE7IDEgPD0gcmVmMyA/IGFiIDw9IHJlZjMgOiBhYiA+PSByZWYzOyBpID0gMSA8PSByZWYzID8gKythYiA6IC0tYWIpIHtcbiAgICAgICAgY2VudHJvaWRzLnB1c2gobWluICsgKGkgLyBudW0pICogKG1heCAtIG1pbikpO1xuICAgICAgfVxuICAgICAgY2VudHJvaWRzLnB1c2gobWF4KTtcbiAgICAgIHdoaWxlIChyZXBlYXQpIHtcbiAgICAgICAgZm9yIChqID0gYWMgPSAwLCByZWY0ID0gbnVtIC0gMTsgMCA8PSByZWY0ID8gYWMgPD0gcmVmNCA6IGFjID49IHJlZjQ7IGogPSAwIDw9IHJlZjQgPyArK2FjIDogLS1hYykge1xuICAgICAgICAgIGNsdXN0ZXJTaXplc1tqXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gYWQgPSAwLCByZWY1ID0gbiAtIDE7IDAgPD0gcmVmNSA/IGFkIDw9IHJlZjUgOiBhZCA+PSByZWY1OyBpID0gMCA8PSByZWY1ID8gKythZCA6IC0tYWQpIHtcbiAgICAgICAgICB2YWx1ZSA9IHZhbHVlc1tpXTtcbiAgICAgICAgICBtaW5kaXN0ID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICAgICAgICBmb3IgKGogPSBhZSA9IDAsIHJlZjYgPSBudW0gLSAxOyAwIDw9IHJlZjYgPyBhZSA8PSByZWY2IDogYWUgPj0gcmVmNjsgaiA9IDAgPD0gcmVmNiA/ICsrYWUgOiAtLWFlKSB7XG4gICAgICAgICAgICBkaXN0ID0gYWJzKGNlbnRyb2lkc1tqXSAtIHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChkaXN0IDwgbWluZGlzdCkge1xuICAgICAgICAgICAgICBtaW5kaXN0ID0gZGlzdDtcbiAgICAgICAgICAgICAgYmVzdCA9IGo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNsdXN0ZXJTaXplc1tiZXN0XSsrO1xuICAgICAgICAgIGFzc2lnbm1lbnRzW2ldID0gYmVzdDtcbiAgICAgICAgfVxuICAgICAgICBuZXdDZW50cm9pZHMgPSBuZXcgQXJyYXkobnVtKTtcbiAgICAgICAgZm9yIChqID0gYWYgPSAwLCByZWY3ID0gbnVtIC0gMTsgMCA8PSByZWY3ID8gYWYgPD0gcmVmNyA6IGFmID49IHJlZjc7IGogPSAwIDw9IHJlZjcgPyArK2FmIDogLS1hZikge1xuICAgICAgICAgIG5ld0NlbnRyb2lkc1tqXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gYWcgPSAwLCByZWY4ID0gbiAtIDE7IDAgPD0gcmVmOCA/IGFnIDw9IHJlZjggOiBhZyA+PSByZWY4OyBpID0gMCA8PSByZWY4ID8gKythZyA6IC0tYWcpIHtcbiAgICAgICAgICBjbHVzdGVyID0gYXNzaWdubWVudHNbaV07XG4gICAgICAgICAgaWYgKG5ld0NlbnRyb2lkc1tjbHVzdGVyXSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgbmV3Q2VudHJvaWRzW2NsdXN0ZXJdID0gdmFsdWVzW2ldO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdDZW50cm9pZHNbY2x1c3Rlcl0gKz0gdmFsdWVzW2ldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGogPSBhaCA9IDAsIHJlZjkgPSBudW0gLSAxOyAwIDw9IHJlZjkgPyBhaCA8PSByZWY5IDogYWggPj0gcmVmOTsgaiA9IDAgPD0gcmVmOSA/ICsrYWggOiAtLWFoKSB7XG4gICAgICAgICAgbmV3Q2VudHJvaWRzW2pdICo9IDEgLyBjbHVzdGVyU2l6ZXNbal07XG4gICAgICAgIH1cbiAgICAgICAgcmVwZWF0ID0gZmFsc2U7XG4gICAgICAgIGZvciAoaiA9IGFpID0gMCwgcmVmMTAgPSBudW0gLSAxOyAwIDw9IHJlZjEwID8gYWkgPD0gcmVmMTAgOiBhaSA+PSByZWYxMDsgaiA9IDAgPD0gcmVmMTAgPyArK2FpIDogLS1haSkge1xuICAgICAgICAgIGlmIChuZXdDZW50cm9pZHNbal0gIT09IGNlbnRyb2lkc1tpXSkge1xuICAgICAgICAgICAgcmVwZWF0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjZW50cm9pZHMgPSBuZXdDZW50cm9pZHM7XG4gICAgICAgIG5iX2l0ZXJzKys7XG4gICAgICAgIGlmIChuYl9pdGVycyA+IDIwMCkge1xuICAgICAgICAgIHJlcGVhdCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBrQ2x1c3RlcnMgPSB7fTtcbiAgICAgIGZvciAoaiA9IGFqID0gMCwgcmVmMTEgPSBudW0gLSAxOyAwIDw9IHJlZjExID8gYWogPD0gcmVmMTEgOiBhaiA+PSByZWYxMTsgaiA9IDAgPD0gcmVmMTEgPyArK2FqIDogLS1haikge1xuICAgICAgICBrQ2x1c3RlcnNbal0gPSBbXTtcbiAgICAgIH1cbiAgICAgIGZvciAoaSA9IGFrID0gMCwgcmVmMTIgPSBuIC0gMTsgMCA8PSByZWYxMiA/IGFrIDw9IHJlZjEyIDogYWsgPj0gcmVmMTI7IGkgPSAwIDw9IHJlZjEyID8gKythayA6IC0tYWspIHtcbiAgICAgICAgY2x1c3RlciA9IGFzc2lnbm1lbnRzW2ldO1xuICAgICAgICBrQ2x1c3RlcnNbY2x1c3Rlcl0ucHVzaCh2YWx1ZXNbaV0pO1xuICAgICAgfVxuICAgICAgdG1wS01lYW5zQnJlYWtzID0gW107XG4gICAgICBmb3IgKGogPSBhbCA9IDAsIHJlZjEzID0gbnVtIC0gMTsgMCA8PSByZWYxMyA/IGFsIDw9IHJlZjEzIDogYWwgPj0gcmVmMTM7IGogPSAwIDw9IHJlZjEzID8gKythbCA6IC0tYWwpIHtcbiAgICAgICAgdG1wS01lYW5zQnJlYWtzLnB1c2goa0NsdXN0ZXJzW2pdWzBdKTtcbiAgICAgICAgdG1wS01lYW5zQnJlYWtzLnB1c2goa0NsdXN0ZXJzW2pdW2tDbHVzdGVyc1tqXS5sZW5ndGggLSAxXSk7XG4gICAgICB9XG4gICAgICB0bXBLTWVhbnNCcmVha3MgPSB0bXBLTWVhbnNCcmVha3Muc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhIC0gYjtcbiAgICAgIH0pO1xuICAgICAgbGltaXRzLnB1c2godG1wS01lYW5zQnJlYWtzWzBdKTtcbiAgICAgIGZvciAoaSA9IGFtID0gMSwgcmVmMTQgPSB0bXBLTWVhbnNCcmVha3MubGVuZ3RoIC0gMTsgYW0gPD0gcmVmMTQ7IGkgPSBhbSArPSAyKSB7XG4gICAgICAgIGlmICghaXNOYU4odG1wS01lYW5zQnJlYWtzW2ldKSkge1xuICAgICAgICAgIGxpbWl0cy5wdXNoKHRtcEtNZWFuc0JyZWFrc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxpbWl0cztcbiAgfTtcblxuICBoc2kycmdiID0gZnVuY3Rpb24oaCwgcywgaSkge1xuXG4gICAgLypcbiAgICBib3Jyb3dlZCBmcm9tIGhlcmU6XG4gICAgaHR0cDovL2h1bW1lci5zdGFuZm9yZC5lZHUvbXVzZWluZm8vZG9jL2V4YW1wbGVzL2h1bWRydW0va2V5c2NhcGUyL2hzaTJyZ2IuY3BwXG4gICAgICovXG4gICAgdmFyIGFyZ3MsIGIsIGcsIHI7XG4gICAgYXJncyA9IHVucGFjayhhcmd1bWVudHMpO1xuICAgIGggPSBhcmdzWzBdLCBzID0gYXJnc1sxXSwgaSA9IGFyZ3NbMl07XG4gICAgaCAvPSAzNjA7XG4gICAgaWYgKGggPCAxIC8gMykge1xuICAgICAgYiA9ICgxIC0gcykgLyAzO1xuICAgICAgciA9ICgxICsgcyAqIGNvcyhUV09QSSAqIGgpIC8gY29zKFBJVEhJUkQgLSBUV09QSSAqIGgpKSAvIDM7XG4gICAgICBnID0gMSAtIChiICsgcik7XG4gICAgfSBlbHNlIGlmIChoIDwgMiAvIDMpIHtcbiAgICAgIGggLT0gMSAvIDM7XG4gICAgICByID0gKDEgLSBzKSAvIDM7XG4gICAgICBnID0gKDEgKyBzICogY29zKFRXT1BJICogaCkgLyBjb3MoUElUSElSRCAtIFRXT1BJICogaCkpIC8gMztcbiAgICAgIGIgPSAxIC0gKHIgKyBnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaCAtPSAyIC8gMztcbiAgICAgIGcgPSAoMSAtIHMpIC8gMztcbiAgICAgIGIgPSAoMSArIHMgKiBjb3MoVFdPUEkgKiBoKSAvIGNvcyhQSVRISVJEIC0gVFdPUEkgKiBoKSkgLyAzO1xuICAgICAgciA9IDEgLSAoZyArIGIpO1xuICAgIH1cbiAgICByID0gbGltaXQoaSAqIHIgKiAzKTtcbiAgICBnID0gbGltaXQoaSAqIGcgKiAzKTtcbiAgICBiID0gbGltaXQoaSAqIGIgKiAzKTtcbiAgICByZXR1cm4gW3IgKiAyNTUsIGcgKiAyNTUsIGIgKiAyNTUsIGFyZ3MubGVuZ3RoID4gMyA/IGFyZ3NbM10gOiAxXTtcbiAgfTtcblxuICByZ2IyaHNpID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvKlxuICAgIGJvcnJvd2VkIGZyb20gaGVyZTpcbiAgICBodHRwOi8vaHVtbWVyLnN0YW5mb3JkLmVkdS9tdXNlaW5mby9kb2MvZXhhbXBsZXMvaHVtZHJ1bS9rZXlzY2FwZTIvcmdiMmhzaS5jcHBcbiAgICAgKi9cbiAgICB2YXIgYiwgZywgaCwgaSwgbWluLCByLCByZWYsIHM7XG4gICAgcmVmID0gdW5wYWNrKGFyZ3VtZW50cyksIHIgPSByZWZbMF0sIGcgPSByZWZbMV0sIGIgPSByZWZbMl07XG4gICAgVFdPUEkgPSBNYXRoLlBJICogMjtcbiAgICByIC89IDI1NTtcbiAgICBnIC89IDI1NTtcbiAgICBiIC89IDI1NTtcbiAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKTtcbiAgICBpID0gKHIgKyBnICsgYikgLyAzO1xuICAgIHMgPSAxIC0gbWluIC8gaTtcbiAgICBpZiAocyA9PT0gMCkge1xuICAgICAgaCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGggPSAoKHIgLSBnKSArIChyIC0gYikpIC8gMjtcbiAgICAgIGggLz0gTWF0aC5zcXJ0KChyIC0gZykgKiAociAtIGcpICsgKHIgLSBiKSAqIChnIC0gYikpO1xuICAgICAgaCA9IE1hdGguYWNvcyhoKTtcbiAgICAgIGlmIChiID4gZykge1xuICAgICAgICBoID0gVFdPUEkgLSBoO1xuICAgICAgfVxuICAgICAgaCAvPSBUV09QSTtcbiAgICB9XG4gICAgcmV0dXJuIFtoICogMzYwLCBzLCBpXTtcbiAgfTtcblxuICBjaHJvbWEuaHNpID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpO1xuICAgICAgcmV0dXJuIE9iamVjdChyZXN1bHQpID09PSByZXN1bHQgPyByZXN1bHQgOiBjaGlsZDtcbiAgICB9KShDb2xvciwgc2xpY2UuY2FsbChhcmd1bWVudHMpLmNvbmNhdChbJ2hzaSddKSwgZnVuY3Rpb24oKXt9KTtcbiAgfTtcblxuICBfaW5wdXQuaHNpID0gaHNpMnJnYjtcblxuICBDb2xvci5wcm90b3R5cGUuaHNpID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHJnYjJoc2kodGhpcy5fcmdiKTtcbiAgfTtcblxuICBpbnRlcnBvbGF0ZV9oc3ggPSBmdW5jdGlvbihjb2wxLCBjb2wyLCBmLCBtKSB7XG4gICAgdmFyIGRoLCBodWUsIGh1ZTAsIGh1ZTEsIGxidiwgbGJ2MCwgbGJ2MSwgcmVzLCBzYXQsIHNhdDAsIHNhdDEsIHh5ejAsIHh5ejE7XG4gICAgaWYgKG0gPT09ICdoc2wnKSB7XG4gICAgICB4eXowID0gY29sMS5oc2woKTtcbiAgICAgIHh5ejEgPSBjb2wyLmhzbCgpO1xuICAgIH0gZWxzZSBpZiAobSA9PT0gJ2hzdicpIHtcbiAgICAgIHh5ejAgPSBjb2wxLmhzdigpO1xuICAgICAgeHl6MSA9IGNvbDIuaHN2KCk7XG4gICAgfSBlbHNlIGlmIChtID09PSAnaHNpJykge1xuICAgICAgeHl6MCA9IGNvbDEuaHNpKCk7XG4gICAgICB4eXoxID0gY29sMi5oc2koKTtcbiAgICB9IGVsc2UgaWYgKG0gPT09ICdsY2gnIHx8IG0gPT09ICdoY2wnKSB7XG4gICAgICBtID0gJ2hjbCc7XG4gICAgICB4eXowID0gY29sMS5oY2woKTtcbiAgICAgIHh5ejEgPSBjb2wyLmhjbCgpO1xuICAgIH1cbiAgICBpZiAobS5zdWJzdHIoMCwgMSkgPT09ICdoJykge1xuICAgICAgaHVlMCA9IHh5ejBbMF0sIHNhdDAgPSB4eXowWzFdLCBsYnYwID0geHl6MFsyXTtcbiAgICAgIGh1ZTEgPSB4eXoxWzBdLCBzYXQxID0geHl6MVsxXSwgbGJ2MSA9IHh5ejFbMl07XG4gICAgfVxuICAgIGlmICghaXNOYU4oaHVlMCkgJiYgIWlzTmFOKGh1ZTEpKSB7XG4gICAgICBpZiAoaHVlMSA+IGh1ZTAgJiYgaHVlMSAtIGh1ZTAgPiAxODApIHtcbiAgICAgICAgZGggPSBodWUxIC0gKGh1ZTAgKyAzNjApO1xuICAgICAgfSBlbHNlIGlmIChodWUxIDwgaHVlMCAmJiBodWUwIC0gaHVlMSA+IDE4MCkge1xuICAgICAgICBkaCA9IGh1ZTEgKyAzNjAgLSBodWUwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGggPSBodWUxIC0gaHVlMDtcbiAgICAgIH1cbiAgICAgIGh1ZSA9IGh1ZTAgKyBmICogZGg7XG4gICAgfSBlbHNlIGlmICghaXNOYU4oaHVlMCkpIHtcbiAgICAgIGh1ZSA9IGh1ZTA7XG4gICAgICBpZiAoKGxidjEgPT09IDEgfHwgbGJ2MSA9PT0gMCkgJiYgbSAhPT0gJ2hzdicpIHtcbiAgICAgICAgc2F0ID0gc2F0MDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFpc05hTihodWUxKSkge1xuICAgICAgaHVlID0gaHVlMTtcbiAgICAgIGlmICgobGJ2MCA9PT0gMSB8fCBsYnYwID09PSAwKSAmJiBtICE9PSAnaHN2Jykge1xuICAgICAgICBzYXQgPSBzYXQxO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBodWUgPSBOdW1iZXIuTmFOO1xuICAgIH1cbiAgICBpZiAoc2F0ID09IG51bGwpIHtcbiAgICAgIHNhdCA9IHNhdDAgKyBmICogKHNhdDEgLSBzYXQwKTtcbiAgICB9XG4gICAgbGJ2ID0gbGJ2MCArIGYgKiAobGJ2MSAtIGxidjApO1xuICAgIHJldHVybiByZXMgPSBjaHJvbWFbbV0oaHVlLCBzYXQsIGxidik7XG4gIH07XG5cbiAgX2ludGVycG9sYXRvcnMgPSBfaW50ZXJwb2xhdG9ycy5jb25jYXQoKGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZW4sIG8sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSBbJ2hzdicsICdoc2wnLCAnaHNpJywgJ2hjbCcsICdsY2gnXTtcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChvID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgbyA8IGxlbjsgbysrKSB7XG4gICAgICBtID0gcmVmW29dO1xuICAgICAgcmVzdWx0cy5wdXNoKFttLCBpbnRlcnBvbGF0ZV9oc3hdKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH0pKCkpO1xuXG4gIGludGVycG9sYXRlX251bSA9IGZ1bmN0aW9uKGNvbDEsIGNvbDIsIGYsIG0pIHtcbiAgICB2YXIgbjEsIG4yO1xuICAgIG4xID0gY29sMS5udW0oKTtcbiAgICBuMiA9IGNvbDIubnVtKCk7XG4gICAgcmV0dXJuIGNocm9tYS5udW0objEgKyAobjIgLSBuMSkgKiBmLCAnbnVtJyk7XG4gIH07XG5cbiAgX2ludGVycG9sYXRvcnMucHVzaChbJ251bScsIGludGVycG9sYXRlX251bV0pO1xuXG4gIGludGVycG9sYXRlX2xhYiA9IGZ1bmN0aW9uKGNvbDEsIGNvbDIsIGYsIG0pIHtcbiAgICB2YXIgcmVzLCB4eXowLCB4eXoxO1xuICAgIHh5ejAgPSBjb2wxLmxhYigpO1xuICAgIHh5ejEgPSBjb2wyLmxhYigpO1xuICAgIHJldHVybiByZXMgPSBuZXcgQ29sb3IoeHl6MFswXSArIGYgKiAoeHl6MVswXSAtIHh5ejBbMF0pLCB4eXowWzFdICsgZiAqICh4eXoxWzFdIC0geHl6MFsxXSksIHh5ejBbMl0gKyBmICogKHh5ejFbMl0gLSB4eXowWzJdKSwgbSk7XG4gIH07XG5cbiAgX2ludGVycG9sYXRvcnMucHVzaChbJ2xhYicsIGludGVycG9sYXRlX2xhYl0pO1xuXG59KS5jYWxsKHRoaXMpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9jaHJvbWEtanMvY2hyb21hLmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2Nocm9tYS1qc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbmV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgY1xuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2llZWU3NTRcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi8uLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL3Byb2Nlc3NcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlY1RvQmluID0gZGVjVG9CaW47XG5leHBvcnRzLmVsaW1pbmF0ZVRlcm1zID0gZWxpbWluYXRlVGVybXM7XG5leHBvcnRzLnNvbHZlR3JvdXAgPSBzb2x2ZUdyb3VwO1xuZXhwb3J0cy5iaW5hcnlUZXJtVG9WYXJUZXJtID0gYmluYXJ5VGVybVRvVmFyVGVybTtcbmV4cG9ydHMuZ2V0RXhwYW5zaW9uRm9ybXVsYSA9IGdldEV4cGFuc2lvbkZvcm11bGE7XG5leHBvcnRzLmdldE1pbnRlcm1FeHBhbnNpb25Gb3JtdWxhID0gZ2V0TWludGVybUV4cGFuc2lvbkZvcm11bGE7XG5leHBvcnRzLmdldE1heHRlcm1FeHBhbnNpb25Gb3JtdWxhID0gZ2V0TWF4dGVybUV4cGFuc2lvbkZvcm11bGE7XG4vKlxuKiBSZXR1cm5zIHRoZSBiaW5hcnkgcmVwcmVzZW50YXRpb24gb2YgdGhlIG51bWJlciBsZWZ0IHBhZGRlZCB0byB0aGUgbnVtYmVyIG9mIHZhcnNcbiogQHBhcmFtIHtudW1iZXJ9IG51bSAtICBhIG51bWJlciB0byBiZSBjb252ZXJ0ZWRcbiogQHBhcmFtIHtudW1iZXJ9IHZhcnMgLSB0aGUgYW1vdW50IG9mIHZhcnMgdGhlIG51bWJlciBzaG91bGQgYmUgcmVwcmVzZW50ZWQgaW5cbiogQHJldHVybiB7c3RyaW5nfSB0aGUgYmluYXJ5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBudW1iZXJcbiovXG5mdW5jdGlvbiBkZWNUb0JpbihudW0sIHZhcnMpIHtcbiAgaWYgKG51bSA+IE1hdGgucG93KDIsIHZhcnMpIC0gMSB8fCBudW0gPCAwKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgTnVtYmVyJyk7XG5cbiAgdmFyIG51bSA9ICcnICsgbnVtLnRvU3RyaW5nKDIpO1xuICB2YXIgcGFkID0gJzAnLnJlcGVhdCh2YXJzKTsgLy8gaXRzIGp1c3QgNSAwJ3MgZm9yIHRoZSBtYXggdmFyIG51bXNcblxuICByZXR1cm4gcGFkLnN1YnN0cmluZygwLCBwYWQubGVuZ3RoIC0gbnVtLmxlbmd0aCkgKyBudW07XG59XG5cbi8qXG4qIFJldHVybnMgdGhlIHJlc3VsdCBvZiBhcHBseWluZyBFbGltaW5hdGlvbiBUaGVvcmVtIHRvIHRoZSB0d28gdGVybXNcbiogQHBhcmFtIHtzdHJpbmd9IHRlcm0xIC0gdGhlIGZpcnN0IHRlcm1cbiogQHBhcmFtIHtzdHJpbmd9IHRlcm0yIC0gdGhlIHNlY29uZCB0ZXJtXG4qIEByZXR1cm4ge3N0cmluZ30gdGhlIHJlc3VsdCBvZiBFbGltaW5hdGlvbiBUaGVvcmVtXG4qL1xuZnVuY3Rpb24gZWxpbWluYXRlVGVybXModGVybTEsIHRlcm0yKSB7XG4gIHRlcm0xID0gdGVybTEuc3BsaXQoJycpO1xuICB0ZXJtMiA9IHRlcm0yLnNwbGl0KCcnKTtcblxuICB2YXIgbnVtRGlmZiA9IDA7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXJtMS5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0ZXJtMVtpXSAhPSB0ZXJtMltpXSkge1xuICAgICAgdGVybTFbaV0gPSAnLSc7XG4gICAgICBudW1EaWZmKys7XG4gICAgICBpZiAobnVtRGlmZiA+IDEpIHRocm93IG5ldyBFcnJvcignVW5zaW1wbGlmaWFibGUgVGVybXMgR2l2ZW4nKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGVybTEuam9pbignJyk7XG59XG5cbi8qXG4qIFJldHVybnMgYSBncm91cCBvZiB0ZXJtcyBzb2x2ZWQgdXNpbmcgRWxpbWluYXRpb24gVGhlb3JlbSwgcmVwcmVzZW50ZWQgYXMgYSBzdHJpbmdcbiogQHBhcmFtIHtBcnJheS5DZWxsfSAgZ3JvdXAgLSBncm91cCB0byBzaW1wbGlmeVxuKiBAcGFyYW0ge251bWJlcn0gdmFycyAtIG51bWJlciBvZiB2YXJzIGZvciB0aGUga21hcFxuKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSBzaW1wbGlmaWVkIGdyb3VwXG4qL1xuZnVuY3Rpb24gc29sdmVHcm91cChncm91cCwgdmFycykge1xuICBpZiAoZ3JvdXAubGVuZ3RoICYgZ3JvdXAubGVuZ3RoIC0gMSAmJiBncm91cC5sZW5ndGggIT0gMSB8fCBncm91cC5sZW5ndGggPiBNYXRoLnBvdygyLCB2YXJzKSkgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBHcm91cFwiKTtcblxuICB2YXIgdGVybTE7XG4gIHZhciB0ZXJtMjtcblxuICBpZiAoZ3JvdXAubGVuZ3RoID4gMikge1xuICAgIHRlcm0xID0gc29sdmVHcm91cChncm91cC5zbGljZSgwLCBncm91cC5sZW5ndGggLyAyKSwgdmFycyk7XG4gICAgdGVybTIgPSBzb2x2ZUdyb3VwKGdyb3VwLnNsaWNlKGdyb3VwLmxlbmd0aCAvIDIpLCB2YXJzKTtcbiAgICByZXR1cm4gZWxpbWluYXRlVGVybXModGVybTEsIHRlcm0yKTtcbiAgfSBlbHNlIGlmIChncm91cC5sZW5ndGggPCAyKSB7XG4gICAgcmV0dXJuIGRlY1RvQmluKGdyb3VwWzBdLnZhbCwgdmFycyk7XG4gIH1cblxuICB0ZXJtMSA9IGdyb3VwWzBdLnZhbDtcbiAgdGVybTIgPSBncm91cFsxXS52YWw7XG5cbiAgcmV0dXJuIGVsaW1pbmF0ZVRlcm1zKGRlY1RvQmluKHRlcm0xLCB2YXJzKSwgZGVjVG9CaW4odGVybTIsIHZhcnMpKTtcbn1cblxuLypcbiogUmV0dXJucyBhIHZhcmlhYmxlIHJlcHJlc2VudGF0aW9uIG9mIGEgdGVybVxuKiBAcGFyYW0ge3N0cmluZ30gdGVybVxuKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSBjb252ZXJ0ZWQgdGVybVxuKi9cbmZ1bmN0aW9uIGJpbmFyeVRlcm1Ub1ZhclRlcm0odGVybSkge1xuICBpZiAodGVybSA9PT0gXCJcIikgcmV0dXJuIFwiVW5kZWZpbmVkIFRlcm1cIjtcbiAgdGVybSA9IHRlcm0uc3BsaXQoJycpO1xuICB2YXIgc3RyaW5nID0gXCJcIjtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRlcm0ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGVybVtpXSA9PT0gXCItXCIpIGNvbnRpbnVlO1xuICAgIHN0cmluZyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgaSk7XG4gICAgaWYgKHRlcm1baV0gPT09IFwiMFwiKSBzdHJpbmcgKz0gXCInXCI7XG4gIH1cblxuICByZXR1cm4gc3RyaW5nO1xufVxuXG4vKlxuKiBSZXR1cm5zIHRoZSBleHBhbnNpb24gZm9ybXVsYSBmb3IgdGhlIGFycmF5IG9mIGdyb3Vwc1xuKiBAcGFyYW0ge0FycmF5LkFycmF5LkNlbGx9IGdyb3VwcyAtIGdyb3VwcyB0byBleHBhbmRcbiogQHBhcmFtIHtudW1iZXJ9IHZhcnMgLSBudW1iZXIgb2YgdmFycyBpbiB0aGUgbWFwXG4qIEByZXR1cm4ge3N0cmluZ30gdGhlIGV4cGFuc2lvbkZvcm11bGFcbiovXG5mdW5jdGlvbiBnZXRFeHBhbnNpb25Gb3JtdWxhKGdyb3VwcywgdmFycywgZXhwYW5zaW9uVHlwZSkge1xuICBzd2l0Y2ggKGV4cGFuc2lvblR5cGUpIHtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gZ2V0TWludGVybUV4cGFuc2lvbkZvcm11bGEoZ3JvdXBzLCB2YXJzKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMDpcbiAgICAgIHJldHVybiBnZXRNYXh0ZXJtRXhwYW5zaW9uRm9ybXVsYShncm91cHMsIHZhcnMpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBcIlVuZGVmaW5lZCBGb3JtdWxhXCI7XG4gICAgICBicmVhaztcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRNaW50ZXJtRXhwYW5zaW9uRm9ybXVsYShncm91cHMsIHZhcnMpIHtcbiAgdmFyIGZvcm11bGEgPSBcIkYgPSBcIjtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGdyb3Vwcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciB0ZXJtO1xuXG4gICAgaWYgKGdyb3Vwc1tpXS5jZWxsQXJyYXkubGVuZ3RoID4gMSkge1xuICAgICAgdGVybSA9IHNvbHZlR3JvdXAoZ3JvdXBzW2ldLmNlbGxBcnJheSwgdmFycyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRlcm0gPSBkZWNUb0Jpbihncm91cHNbaV0uY2VsbEFycmF5WzBdLnZhbCwgdmFycyk7XG4gICAgfVxuXG4gICAgZm9ybXVsYSArPSBiaW5hcnlUZXJtVG9WYXJUZXJtKHRlcm0pO1xuXG4gICAgaWYgKGkgIT0gZ3JvdXBzLmxlbmd0aCAtIDEpIGZvcm11bGEgKz0gXCIgKyBcIjtcbiAgfVxuXG4gIHJldHVybiBmb3JtdWxhO1xufVxuXG5mdW5jdGlvbiBnZXRNYXh0ZXJtRXhwYW5zaW9uRm9ybXVsYShncm91cHMsIHZhcnMpIHtcbiAgdmFyIGZvcm11bGEgPSBcIkYgPSBcIjtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGdyb3Vwcy5sZW5ndGg7IGkrKykge1xuICAgIGZvcm11bGEgKz0gXCIoXCI7XG4gICAgdmFyIHRlcm07XG5cbiAgICBpZiAoZ3JvdXBzW2ldLmNlbGxBcnJheS5sZW5ndGggPiAxKSB7XG4gICAgICB0ZXJtID0gc29sdmVHcm91cChncm91cHNbaV0uY2VsbEFycmF5LCB2YXJzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGVybSA9IGRlY1RvQmluKGdyb3Vwc1tpXS5jZWxsQXJyYXlbMF0udmFsLCB2YXJzKTtcbiAgICB9XG5cbiAgICB0ZXJtID0gYmluYXJ5VGVybVRvVmFyVGVybSh0ZXJtKS5zcGxpdCgnJyk7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRlcm0ubGVuZ3RoOyBqKyspIHtcbiAgICAgIGZvcm11bGEgKz0gdGVybVtqXTtcbiAgICAgIGlmICh0ZXJtW2ogKyAxXSA9PT0gXCInXCIpIHtcbiAgICAgICAgZm9ybXVsYSArPSB0ZXJtW2ogKyAxXTtcbiAgICAgICAgaisrO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2codGVybVtqXSk7XG4gICAgICBpZiAoaiAhPSB0ZXJtLmxlbmd0aCAtIDEpIGZvcm11bGEgKz0gXCIgKyBcIjtcbiAgICB9XG5cbiAgICBmb3JtdWxhICs9IFwiKVwiO1xuICB9XG5cbiAgcmV0dXJuIGZvcm11bGE7XG59XG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2NsYXNzZXMvQmluYXJ5RnVuY3Rpb25zLmpzXCIsXCIvY2xhc3Nlc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9Qb2ludDIgPSByZXF1aXJlKCcuL1BvaW50Jyk7XG5cbnZhciBfUG9pbnQzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUG9pbnQyKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG4vLyBDZWxsIGNsYXNzXG52YXIgQ2VsbCA9IGZ1bmN0aW9uIChfUG9pbnQpIHtcbiAgX2luaGVyaXRzKENlbGwsIF9Qb2ludCk7XG5cbiAgZnVuY3Rpb24gQ2VsbCh2YWwsIHgsIHkpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2VsbCk7XG5cbiAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ251bWJlcicgfHwgdmFsICUgMSAhPT0gMCB8fCB2YWwgPCAwKSB0aHJvdyBuZXcgRXJyb3IoJ3ZhbCBtdXN0IGJlIGEgdmFsaWQgcG9zaXRpdmUgaW50ZWdlci4nKTtcblxuICAgIHZhciBfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIChDZWxsLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoQ2VsbCkpLmNhbGwodGhpcywgeCwgeSkpO1xuXG4gICAgX3RoaXMudmFsID0gTnVtYmVyKHZhbCk7XG4gICAgX3RoaXMuc3RhdHVzID0gJyc7XG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG5cbiAgcmV0dXJuIENlbGw7XG59KF9Qb2ludDMuZGVmYXVsdCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IENlbGw7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2NsYXNzZXMvQ2VsbC5qc1wiLFwiL2NsYXNzZXNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbnZhciBfQ2VsbCA9IHJlcXVpcmUoJy4vQ2VsbCcpO1xuXG52YXIgX0NlbGwyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ2VsbCk7XG5cbnZhciBfUG9pbnQgPSByZXF1aXJlKCcuL1BvaW50Jyk7XG5cbnZhciBfUG9pbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfUG9pbnQpO1xuXG52YXIgX0dyb3VwID0gcmVxdWlyZSgnLi9Hcm91cCcpO1xuXG52YXIgX0dyb3VwMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0dyb3VwKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIENlbGxBcnJheSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gQ2VsbEFycmF5KHZhcnMsIGV4cGFuc2lvblR5cGUpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2VsbEFycmF5KTtcblxuICAgIHRoaXMudmFycyA9IHZhcnM7XG4gICAgdGhpcy5leHBhbnNpb25UeXBlID0gZXhwYW5zaW9uVHlwZTtcbiAgICB0aGlzLmNlbGxzID0gbmV3IEFycmF5KCk7XG5cbiAgICB0aGlzLmNlbGxzWzBdID0gbmV3IEFycmF5KCk7XG4gICAgdGhpcy5jZWxsc1swXS5wdXNoKG5ldyBfQ2VsbDIuZGVmYXVsdCgwLCAwLCAwKSk7XG4gICAgdGhpcy5jZWxsc1swXS5wdXNoKG5ldyBfQ2VsbDIuZGVmYXVsdCg0LCAxLCAwKSk7XG5cbiAgICB0aGlzLmNlbGxzWzFdID0gbmV3IEFycmF5KCk7XG4gICAgdGhpcy5jZWxsc1sxXS5wdXNoKG5ldyBfQ2VsbDIuZGVmYXVsdCgxLCAwLCAxKSk7XG4gICAgdGhpcy5jZWxsc1sxXS5wdXNoKG5ldyBfQ2VsbDIuZGVmYXVsdCg1LCAxLCAxKSk7XG5cbiAgICB0aGlzLmNlbGxzWzJdID0gbmV3IEFycmF5KCk7XG4gICAgdGhpcy5jZWxsc1syXS5wdXNoKG5ldyBfQ2VsbDIuZGVmYXVsdCgzLCAwLCAyKSk7XG4gICAgdGhpcy5jZWxsc1syXS5wdXNoKG5ldyBfQ2VsbDIuZGVmYXVsdCg3LCAxLCAyKSk7XG5cbiAgICB0aGlzLmNlbGxzWzNdID0gbmV3IEFycmF5KCk7XG4gICAgdGhpcy5jZWxsc1szXS5wdXNoKG5ldyBfQ2VsbDIuZGVmYXVsdCgyLCAwLCAzKSk7XG4gICAgdGhpcy5jZWxsc1szXS5wdXNoKG5ldyBfQ2VsbDIuZGVmYXVsdCg2LCAxLCAzKSk7XG5cbiAgICBpZiAodGhpcy52YXJzID4gMykge1xuXG4gICAgICB0aGlzLmNlbGxzWzBdLnB1c2gobmV3IF9DZWxsMi5kZWZhdWx0KDEyLCAyLCAwKSk7XG4gICAgICB0aGlzLmNlbGxzWzBdLnB1c2gobmV3IF9DZWxsMi5kZWZhdWx0KDgsIDMsIDApKTtcblxuICAgICAgdGhpcy5jZWxsc1sxXS5wdXNoKG5ldyBfQ2VsbDIuZGVmYXVsdCgxMywgMiwgMSkpO1xuICAgICAgdGhpcy5jZWxsc1sxXS5wdXNoKG5ldyBfQ2VsbDIuZGVmYXVsdCg5LCAzLCAxKSk7XG5cbiAgICAgIHRoaXMuY2VsbHNbMl0ucHVzaChuZXcgX0NlbGwyLmRlZmF1bHQoMTUsIDIsIDIpKTtcbiAgICAgIHRoaXMuY2VsbHNbMl0ucHVzaChuZXcgX0NlbGwyLmRlZmF1bHQoMTEsIDMsIDIpKTtcblxuICAgICAgdGhpcy5jZWxsc1szXS5wdXNoKG5ldyBfQ2VsbDIuZGVmYXVsdCgxNCwgMiwgMykpO1xuICAgICAgdGhpcy5jZWxsc1szXS5wdXNoKG5ldyBfQ2VsbDIuZGVmYXVsdCgxMCwgMywgMykpO1xuICAgIH1cbiAgICAvLyBob2xkcyBhbGwgbWFya2VkIGdyb3Vwc1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKENlbGxBcnJheSwgW3tcbiAgICBrZXk6ICdtYXJrJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbWFyayh0ZXJtcykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXJtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAvLyBmb3IgZWFjaCB0ZXJtXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5jZWxscy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy5jZWxsc1tqXS5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2VsbHNbal1ba10udmFsID09PSBpKSB7XG4gICAgICAgICAgICAgIHRoaXMuY2VsbHNbal1ba10uc3RhdHVzID0gdGVybXNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAncmVzZXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXNldCgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuY2VsbHNbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICB0aGlzLmNlbGxzW2ldW2pdLnN0YXR1cyA9ICcnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy9Xcml0aW5nIHRoaXMgbmVhciBtaWRuaWdodFxuICAgIC8vIFRPRE86IHdyaXRlIGl0IGJldHRlciBsYXRlclxuXG4gIH0sIHtcbiAgICBrZXk6ICdnZXRHcm91cHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRHcm91cHMoKSB7XG4gICAgICB2YXIgbWFya2VkID0gW107XG4gICAgICAvLyB1c2VkIHRvIHNraXAgc29tZSBncm91cCBjaGVja3NcbiAgICAgIHZhciBudW1BY3RpdmUgPSAwO1xuXG4gICAgICAvLyBUT0RPOiByZWZyYWN0b3IgdG8gd29yayB3aXRoIG1heHRlcm1zXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0aGlzLmNlbGxzW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgaWYgKHRoaXMuY2VsbHNbaV1bal0uc3RhdHVzICE9ICF0aGlzLmV4cGFuc2lvblR5cGUpIG51bUFjdGl2ZSsrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIG1hcmtzIGV2ZXJ5IGNlbGwgYW5kIHJldHVybnMgZWFybHkgdG8gc2F2ZSBwcm9jY2Vzc2luZyB0aW1lXG4gICAgICBpZiAobnVtQWN0aXZlID49IE1hdGgucG93KDIsIHRoaXMudmFycykpIHtcbiAgICAgICAgLy8gZHJhd3MgaWYgYWxsIGFyZSBvblxuICAgICAgICB2YXIgZ3JvdXAgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgdGhpcy5jZWxscy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICBmb3IgKHZhciBfaiA9IDA7IF9qIDwgdGhpcy5jZWxsc1tfaV0ubGVuZ3RoOyBfaisrKSB7XG4gICAgICAgICAgICBncm91cC5wdXNoKHRoaXMuY2VsbHNbX2ldW19qXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbWFya2VkLnB1c2gobmV3IF9Hcm91cDIuZGVmYXVsdChncm91cCwgXCJmdWxsXCIpKTtcblxuICAgICAgICByZXR1cm4gbWFya2VkOyAvLyBhbGwgYXJlIG1hcmtlZFxuICAgICAgfVxuXG4gICAgICBpZiAobnVtQWN0aXZlID49IDggJiYgdGhpcy52YXJzID4gMykge1xuICAgICAgICAvL21hcmsgMng0J3NcbiAgICAgICAgZm9yICh2YXIgX2kyID0gMDsgX2kyIDwgTWF0aC5wb3coMiwgdGhpcy52YXJzIC0gMik7IF9pMisrKSB7XG4gICAgICAgICAgdmFyIHJvb3RQb2ludCA9IHRoaXMuZ2V0KF9pMiwgMCk7XG4gICAgICAgICAgdmFyIHNlY29uZFBvaW50ID0gdGhpcy5nZXQoX2kyLCAxKTtcbiAgICAgICAgICB2YXIgdGhpcmRQb2ludCA9IHRoaXMuZ2V0KF9pMiwgMik7XG4gICAgICAgICAgdmFyIGZvdXJ0aFBvaW50ID0gdGhpcy5nZXQoX2kyLCAzKTtcbiAgICAgICAgICB2YXIgZmlmdGhQb2ludCA9IHRoaXMuZ2V0KF9pMiArIDEsIDApO1xuICAgICAgICAgIHZhciBzaXh0aFBvaW50ID0gdGhpcy5nZXQoX2kyICsgMSwgMSk7XG4gICAgICAgICAgdmFyIHNldmVudGhQb2ludCA9IHRoaXMuZ2V0KF9pMiArIDEsIDIpO1xuICAgICAgICAgIHZhciBlaWdodGhQb2ludCA9IHRoaXMuZ2V0KF9pMiArIDEsIDMpO1xuXG4gICAgICAgICAgaWYgKHJvb3RQb2ludC5zdGF0dXMgIT0gIXRoaXMuZXhwYW5zaW9uVHlwZSAmJiBzZWNvbmRQb2ludC5zdGF0dXMgIT0gIXRoaXMuZXhwYW5zaW9uVHlwZSAmJiB0aGlyZFBvaW50LnN0YXR1cyAhPSAhdGhpcy5leHBhbnNpb25UeXBlICYmIGZvdXJ0aFBvaW50LnN0YXR1cyAhPSAhdGhpcy5leHBhbnNpb25UeXBlICYmIGZpZnRoUG9pbnQuc3RhdHVzICE9ICF0aGlzLmV4cGFuc2lvblR5cGUgJiYgc2l4dGhQb2ludC5zdGF0dXMgIT0gIXRoaXMuZXhwYW5zaW9uVHlwZSAmJiBzZXZlbnRoUG9pbnQuc3RhdHVzICE9ICF0aGlzLmV4cGFuc2lvblR5cGUgJiYgZWlnaHRoUG9pbnQuc3RhdHVzICE9ICF0aGlzLmV4cGFuc2lvblR5cGUgJiYgKHJvb3RQb2ludC5zdGF0dXMgPT0gdGhpcy5leHBhbnNpb25UeXBlIHx8IHNlY29uZFBvaW50LnN0YXR1cyA9PSB0aGlzLmV4cGFuc2lvblR5cGUgfHwgdGhpcmRQb2ludC5zdGF0dXMgPT0gdGhpcy5leHBhbnNpb25UeXBlIHx8IGZvdXJ0aFBvaW50LnN0YXR1cyA9PSB0aGlzLmV4cGFuc2lvblR5cGUgfHwgZmlmdGhQb2ludC5zdGF0dXMgPT0gdGhpcy5leHBhbnNpb25UeXBlIHx8IHNpeHRoUG9pbnQuc3RhdHVzID09IHRoaXMuZXhwYW5zaW9uVHlwZSB8fCBzZXZlbnRoUG9pbnQuc3RhdHVzID09IHRoaXMuZXhwYW5zaW9uVHlwZSB8fCBlaWdodGhQb2ludC5zdGF0dXMgPT0gdGhpcy5leHBhbnNpb25UeXBlKSkge1xuICAgICAgICAgICAgdmFyIF9ncm91cCA9IFtdO1xuXG4gICAgICAgICAgICBfZ3JvdXAucHVzaChyb290UG9pbnQpO1xuICAgICAgICAgICAgX2dyb3VwLnB1c2goc2Vjb25kUG9pbnQpO1xuICAgICAgICAgICAgX2dyb3VwLnB1c2godGhpcmRQb2ludCk7XG4gICAgICAgICAgICBfZ3JvdXAucHVzaChmb3VydGhQb2ludCk7XG4gICAgICAgICAgICBfZ3JvdXAucHVzaChmaWZ0aFBvaW50KTtcbiAgICAgICAgICAgIF9ncm91cC5wdXNoKHNpeHRoUG9pbnQpO1xuICAgICAgICAgICAgX2dyb3VwLnB1c2goc2V2ZW50aFBvaW50KTtcbiAgICAgICAgICAgIF9ncm91cC5wdXNoKGVpZ2h0aFBvaW50KTtcblxuICAgICAgICAgICAgdmFyIHdyYXBwZXIgPSBuZXcgX0dyb3VwMi5kZWZhdWx0KF9ncm91cCwgXCIyeDRcIik7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0dyb3VwVW5pcXVlKG1hcmtlZCwgd3JhcHBlcikpIG1hcmtlZC5wdXNoKHdyYXBwZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vbWFyayA0eDInc1xuICAgICAgICBmb3IgKHZhciBfaTMgPSAwOyBfaTMgPCBNYXRoLnBvdygyLCB0aGlzLnZhcnMgLSAyKTsgX2kzKyspIHtcbiAgICAgICAgICB2YXIgX3Jvb3RQb2ludCA9IHRoaXMuZ2V0KDAsIF9pMyk7XG4gICAgICAgICAgdmFyIF9zZWNvbmRQb2ludCA9IHRoaXMuZ2V0KDEsIF9pMyk7XG4gICAgICAgICAgdmFyIF90aGlyZFBvaW50ID0gdGhpcy5nZXQoMiwgX2kzKTtcbiAgICAgICAgICB2YXIgX2ZvdXJ0aFBvaW50ID0gdGhpcy5nZXQoMywgX2kzKTtcbiAgICAgICAgICB2YXIgX2ZpZnRoUG9pbnQgPSB0aGlzLmdldCgwLCBfaTMgKyAxKTtcbiAgICAgICAgICB2YXIgX3NpeHRoUG9pbnQgPSB0aGlzLmdldCgxLCBfaTMgKyAxKTtcbiAgICAgICAgICB2YXIgX3NldmVudGhQb2ludCA9IHRoaXMuZ2V0KDIsIF9pMyArIDEpO1xuICAgICAgICAgIHZhciBfZWlnaHRoUG9pbnQgPSB0aGlzLmdldCgzLCBfaTMgKyAxKTtcblxuICAgICAgICAgIGlmIChfcm9vdFBvaW50LnN0YXR1cyAhPSAhdGhpcy5leHBhbnNpb25UeXBlICYmIF9zZWNvbmRQb2ludC5zdGF0dXMgIT0gIXRoaXMuZXhwYW5zaW9uVHlwZSAmJiBfdGhpcmRQb2ludC5zdGF0dXMgIT0gIXRoaXMuZXhwYW5zaW9uVHlwZSAmJiBfZm91cnRoUG9pbnQuc3RhdHVzICE9ICF0aGlzLmV4cGFuc2lvblR5cGUgJiYgX2ZpZnRoUG9pbnQuc3RhdHVzICE9ICF0aGlzLmV4cGFuc2lvblR5cGUgJiYgX3NpeHRoUG9pbnQuc3RhdHVzICE9ICF0aGlzLmV4cGFuc2lvblR5cGUgJiYgX3NldmVudGhQb2ludC5zdGF0dXMgIT0gIXRoaXMuZXhwYW5zaW9uVHlwZSAmJiBfZWlnaHRoUG9pbnQuc3RhdHVzICE9ICF0aGlzLmV4cGFuc2lvblR5cGUgJiYgKF9yb290UG9pbnQuc3RhdHVzID09IHRoaXMuZXhwYW5zaW9uVHlwZSB8fCBfc2Vjb25kUG9pbnQuc3RhdHVzID09IHRoaXMuZXhwYW5zaW9uVHlwZSB8fCBfdGhpcmRQb2ludC5zdGF0dXMgPT0gdGhpcy5leHBhbnNpb25UeXBlIHx8IF9mb3VydGhQb2ludC5zdGF0dXMgPT0gdGhpcy5leHBhbnNpb25UeXBlIHx8IF9maWZ0aFBvaW50LnN0YXR1cyA9PSB0aGlzLmV4cGFuc2lvblR5cGUgfHwgX3NpeHRoUG9pbnQuc3RhdHVzID09IHRoaXMuZXhwYW5zaW9uVHlwZSB8fCBfc2V2ZW50aFBvaW50LnN0YXR1cyA9PSB0aGlzLmV4cGFuc2lvblR5cGUgfHwgX2VpZ2h0aFBvaW50LnN0YXR1cyA9PSB0aGlzLmV4cGFuc2lvblR5cGUpKSB7XG4gICAgICAgICAgICB2YXIgX2dyb3VwMiA9IFtdO1xuXG4gICAgICAgICAgICBfZ3JvdXAyLnB1c2goX3Jvb3RQb2ludCk7XG4gICAgICAgICAgICBfZ3JvdXAyLnB1c2goX3NlY29uZFBvaW50KTtcbiAgICAgICAgICAgIF9ncm91cDIucHVzaChfdGhpcmRQb2ludCk7XG4gICAgICAgICAgICBfZ3JvdXAyLnB1c2goX2ZvdXJ0aFBvaW50KTtcbiAgICAgICAgICAgIF9ncm91cDIucHVzaChfZmlmdGhQb2ludCk7XG4gICAgICAgICAgICBfZ3JvdXAyLnB1c2goX3NpeHRoUG9pbnQpO1xuICAgICAgICAgICAgX2dyb3VwMi5wdXNoKF9zZXZlbnRoUG9pbnQpO1xuICAgICAgICAgICAgX2dyb3VwMi5wdXNoKF9laWdodGhQb2ludCk7XG5cbiAgICAgICAgICAgIHZhciBfd3JhcHBlciA9IG5ldyBfR3JvdXAyLmRlZmF1bHQoX2dyb3VwMiwgXCI0eDJcIik7XG4gICAgICAgICAgICBpZiAodGhpcy5pc0dyb3VwVW5pcXVlKG1hcmtlZCwgX3dyYXBwZXIpKSBtYXJrZWQucHVzaChfd3JhcHBlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChudW1BY3RpdmUgPj0gNCkge1xuICAgICAgICAvL21hcmtzIGhvcml6b250YWwgJ3F1YWRzJ1xuICAgICAgICBpZiAodGhpcy52YXJzID4gMykge1xuICAgICAgICAgIGZvciAodmFyIF9pNCA9IDA7IF9pNCA8IE1hdGgucG93KDIsIHRoaXMudmFycyAtIDIpOyBfaTQrKykge1xuICAgICAgICAgICAgdmFyIF9yb290UG9pbnQyID0gdGhpcy5nZXQoMCwgX2k0KTtcbiAgICAgICAgICAgIHZhciBfc2Vjb25kUG9pbnQyID0gdGhpcy5nZXQoMSwgX2k0KTtcbiAgICAgICAgICAgIHZhciBfdGhpcmRQb2ludDIgPSB0aGlzLmdldCgyLCBfaTQpO1xuICAgICAgICAgICAgdmFyIF9mb3VydGhQb2ludDIgPSB0aGlzLmdldCgzLCBfaTQpO1xuXG4gICAgICAgICAgICBpZiAoX3Jvb3RQb2ludDIuc3RhdHVzICE9ICF0aGlzLmV4cGFuc2lvblR5cGUgJiYgX3NlY29uZFBvaW50Mi5zdGF0dXMgIT0gIXRoaXMuZXhwYW5zaW9uVHlwZSAmJiBfdGhpcmRQb2ludDIuc3RhdHVzICE9ICF0aGlzLmV4cGFuc2lvblR5cGUgJiYgX2ZvdXJ0aFBvaW50Mi5zdGF0dXMgIT0gIXRoaXMuZXhwYW5zaW9uVHlwZSAmJiAoX3Jvb3RQb2ludDIuc3RhdHVzID09IHRoaXMuZXhwYW5zaW9uVHlwZSB8fCBfc2Vjb25kUG9pbnQyLnN0YXR1cyA9PSB0aGlzLmV4cGFuc2lvblR5cGUgfHwgX3RoaXJkUG9pbnQyLnN0YXR1cyA9PSB0aGlzLmV4cGFuc2lvblR5cGUgfHwgX2ZvdXJ0aFBvaW50Mi5zdGF0dXMgPT0gdGhpcy5leHBhbnNpb25UeXBlKSkge1xuICAgICAgICAgICAgICB2YXIgX2dyb3VwMyA9IFtdO1xuXG4gICAgICAgICAgICAgIF9ncm91cDMucHVzaChfcm9vdFBvaW50Mik7XG4gICAgICAgICAgICAgIF9ncm91cDMucHVzaChfc2Vjb25kUG9pbnQyKTtcbiAgICAgICAgICAgICAgX2dyb3VwMy5wdXNoKF90aGlyZFBvaW50Mik7XG4gICAgICAgICAgICAgIF9ncm91cDMucHVzaChfZm91cnRoUG9pbnQyKTtcblxuICAgICAgICAgICAgICB2YXIgX3dyYXBwZXIyID0gbmV3IF9Hcm91cDIuZGVmYXVsdChfZ3JvdXAzLCBcIjR4MVwiKTtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuaXNHcm91cFVuaXF1ZShtYXJrZWQsIF93cmFwcGVyMikpIG1hcmtlZC5wdXNoKF93cmFwcGVyMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9tYXJrcyB2ZXJ0aWNhbCAncXVhZHMnXG4gICAgICAgIGZvciAodmFyIF9pNSA9IDA7IF9pNSA8IE1hdGgucG93KDIsIHRoaXMudmFycyAtIDIpOyBfaTUrKykge1xuICAgICAgICAgIHZhciBfcm9vdFBvaW50MyA9IHRoaXMuZ2V0KF9pNSwgMCk7XG4gICAgICAgICAgdmFyIF9zZWNvbmRQb2ludDMgPSB0aGlzLmdldChfaTUsIDEpO1xuICAgICAgICAgIHZhciBfdGhpcmRQb2ludDMgPSB0aGlzLmdldChfaTUsIDIpO1xuICAgICAgICAgIHZhciBfZm91cnRoUG9pbnQzID0gdGhpcy5nZXQoX2k1LCAzKTtcblxuICAgICAgICAgIGlmIChfcm9vdFBvaW50My5zdGF0dXMgIT0gIXRoaXMuZXhwYW5zaW9uVHlwZSAmJiBfc2Vjb25kUG9pbnQzLnN0YXR1cyAhPSAhdGhpcy5leHBhbnNpb25UeXBlICYmIF90aGlyZFBvaW50My5zdGF0dXMgIT0gIXRoaXMuZXhwYW5zaW9uVHlwZSAmJiBfZm91cnRoUG9pbnQzLnN0YXR1cyAhPSAhdGhpcy5leHBhbnNpb25UeXBlICYmIChfcm9vdFBvaW50My5zdGF0dXMgPT0gdGhpcy5leHBhbnNpb25UeXBlIHx8IF9zZWNvbmRQb2ludDMuc3RhdHVzID09IHRoaXMuZXhwYW5zaW9uVHlwZSB8fCBfdGhpcmRQb2ludDMuc3RhdHVzID09IHRoaXMuZXhwYW5zaW9uVHlwZSB8fCBfZm91cnRoUG9pbnQzLnN0YXR1cyA9PSB0aGlzLmV4cGFuc2lvblR5cGUpKSB7XG4gICAgICAgICAgICB2YXIgX2dyb3VwNCA9IFtdO1xuXG4gICAgICAgICAgICBfZ3JvdXA0LnB1c2goX3Jvb3RQb2ludDMpO1xuICAgICAgICAgICAgX2dyb3VwNC5wdXNoKF9zZWNvbmRQb2ludDMpO1xuICAgICAgICAgICAgX2dyb3VwNC5wdXNoKF90aGlyZFBvaW50Myk7XG4gICAgICAgICAgICBfZ3JvdXA0LnB1c2goX2ZvdXJ0aFBvaW50Myk7XG5cbiAgICAgICAgICAgIHZhciBfd3JhcHBlcjMgPSBuZXcgX0dyb3VwMi5kZWZhdWx0KF9ncm91cDQsIFwiMXg0XCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNHcm91cFVuaXF1ZShtYXJrZWQsIF93cmFwcGVyMykpIG1hcmtlZC5wdXNoKF93cmFwcGVyMyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9tYXJrcyAnYm94ZXMnXG4gICAgICAgIGZvciAodmFyIF9pNiA9IDA7IF9pNiA8IDQ7IF9pNisrKSB7XG4gICAgICAgICAgLy8gVE9ETzogTUFLRSBNQVRILlBPVyBTVFVGRiBBIENPTlNUQU5UXG4gICAgICAgICAgZm9yICh2YXIgX2oyID0gMDsgX2oyIDwgTWF0aC5wb3coMiwgdGhpcy52YXJzIC0gMik7IF9qMisrKSB7XG4gICAgICAgICAgICB2YXIgX3Jvb3RQb2ludDQgPSB0aGlzLmdldChfajIsIF9pNik7XG4gICAgICAgICAgICB2YXIgX3NlY29uZFBvaW50NCA9IHRoaXMuZ2V0KF9qMiArIDEsIF9pNik7XG4gICAgICAgICAgICB2YXIgX3RoaXJkUG9pbnQ0ID0gdGhpcy5nZXQoX2oyLCBfaTYgKyAxKTtcbiAgICAgICAgICAgIHZhciBfZm91cnRoUG9pbnQ0ID0gdGhpcy5nZXQoX2oyICsgMSwgX2k2ICsgMSk7XG5cbiAgICAgICAgICAgIGlmIChfcm9vdFBvaW50NC5zdGF0dXMgIT0gIXRoaXMuZXhwYW5zaW9uVHlwZSAmJiBfc2Vjb25kUG9pbnQ0LnN0YXR1cyAhPSAhdGhpcy5leHBhbnNpb25UeXBlICYmIF90aGlyZFBvaW50NC5zdGF0dXMgIT0gIXRoaXMuZXhwYW5zaW9uVHlwZSAmJiBfZm91cnRoUG9pbnQ0LnN0YXR1cyAhPSAhdGhpcy5leHBhbnNpb25UeXBlICYmIChfcm9vdFBvaW50NC5zdGF0dXMgPT0gdGhpcy5leHBhbnNpb25UeXBlIHx8IF9zZWNvbmRQb2ludDQuc3RhdHVzID09IHRoaXMuZXhwYW5zaW9uVHlwZSB8fCBfdGhpcmRQb2ludDQuc3RhdHVzID09IHRoaXMuZXhwYW5zaW9uVHlwZSB8fCBfZm91cnRoUG9pbnQ0LnN0YXR1cyA9PSB0aGlzLmV4cGFuc2lvblR5cGUpKSB7XG4gICAgICAgICAgICAgIHZhciBfZ3JvdXA1ID0gW107XG5cbiAgICAgICAgICAgICAgX2dyb3VwNS5wdXNoKF9yb290UG9pbnQ0KTtcbiAgICAgICAgICAgICAgX2dyb3VwNS5wdXNoKF9zZWNvbmRQb2ludDQpO1xuICAgICAgICAgICAgICBfZ3JvdXA1LnB1c2goX3RoaXJkUG9pbnQ0KTtcbiAgICAgICAgICAgICAgX2dyb3VwNS5wdXNoKF9mb3VydGhQb2ludDQpO1xuXG4gICAgICAgICAgICAgIHZhciBfd3JhcHBlcjQgPSBuZXcgX0dyb3VwMi5kZWZhdWx0KF9ncm91cDUsIFwiMngyXCIpO1xuICAgICAgICAgICAgICBpZiAodGhpcy5pc0dyb3VwVW5pcXVlKG1hcmtlZCwgX3dyYXBwZXI0KSkgbWFya2VkLnB1c2goX3dyYXBwZXI0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVE9ETzogcmVtb3ZlIHZlcmJvc2Ugc2VhcmNoZXNcbiAgICAgIGlmIChudW1BY3RpdmUgPj0gMikge1xuICAgICAgICBmb3IgKHZhciBfaTcgPSAwOyBfaTcgPCBNYXRoLnBvdygyLCB0aGlzLnZhcnMgLSAyKTsgX2k3KyspIHtcbiAgICAgICAgICBmb3IgKHZhciBfajMgPSAwOyBfajMgPCA0OyBfajMrKykge1xuICAgICAgICAgICAgdmFyIF9yb290UG9pbnQ1ID0gdGhpcy5nZXQoX2k3LCBfajMpO1xuXG4gICAgICAgICAgICAvL2hvcml6b250YWxcbiAgICAgICAgICAgIHZhciBfc2Vjb25kUG9pbnQ1ID0gdGhpcy5nZXQoX2k3ICsgMSwgX2ozKTtcbiAgICAgICAgICAgIGlmIChfcm9vdFBvaW50NS5zdGF0dXMgIT0gIXRoaXMuZXhwYW5zaW9uVHlwZSAmJiBfc2Vjb25kUG9pbnQ1LnN0YXR1cyAhPSAhdGhpcy5leHBhbnNpb25UeXBlICYmIChfcm9vdFBvaW50NS5zdGF0dXMgPT0gdGhpcy5leHBhbnNpb25UeXBlIHx8IF9zZWNvbmRQb2ludDUuc3RhdHVzID09IHRoaXMuZXhwYW5zaW9uVHlwZSkpIHtcbiAgICAgICAgICAgICAgdmFyIF9ncm91cDYgPSBbXTtcbiAgICAgICAgICAgICAgX2dyb3VwNi5wdXNoKF9yb290UG9pbnQ1KTtcbiAgICAgICAgICAgICAgX2dyb3VwNi5wdXNoKF9zZWNvbmRQb2ludDUpO1xuXG4gICAgICAgICAgICAgIHZhciBfd3JhcHBlcjUgPSBuZXcgX0dyb3VwMi5kZWZhdWx0KF9ncm91cDYsIFwiMngxXCIpO1xuICAgICAgICAgICAgICBpZiAodGhpcy5pc0dyb3VwVW5pcXVlKG1hcmtlZCwgX3dyYXBwZXI1KSkgbWFya2VkLnB1c2goX3dyYXBwZXI1KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy92ZXJ0aWNhbFxuICAgICAgICAgICAgdmFyIHNlY29uZFBvaW50ViA9IHRoaXMuZ2V0KF9pNywgX2ozICsgMSk7XG4gICAgICAgICAgICBpZiAoX3Jvb3RQb2ludDUuc3RhdHVzICE9ICF0aGlzLmV4cGFuc2lvblR5cGUgJiYgc2Vjb25kUG9pbnRWLnN0YXR1cyAhPSAhdGhpcy5leHBhbnNpb25UeXBlICYmIChfcm9vdFBvaW50NS5zdGF0dXMgPT0gdGhpcy5leHBhbnNpb25UeXBlIHx8IHNlY29uZFBvaW50Vi5zdGF0dXMgPT0gdGhpcy5leHBhbnNpb25UeXBlKSkge1xuICAgICAgICAgICAgICB2YXIgX2dyb3VwNyA9IFtdO1xuICAgICAgICAgICAgICBfZ3JvdXA3LnB1c2goX3Jvb3RQb2ludDUpO1xuICAgICAgICAgICAgICBfZ3JvdXA3LnB1c2goc2Vjb25kUG9pbnRWKTtcblxuICAgICAgICAgICAgICB2YXIgX3dyYXBwZXI2ID0gbmV3IF9Hcm91cDIuZGVmYXVsdChfZ3JvdXA3LCBcIjF4MlwiKTtcbiAgICAgICAgICAgICAgaWYgKHRoaXMuaXNHcm91cFVuaXF1ZShtYXJrZWQsIF93cmFwcGVyNikpIG1hcmtlZC5wdXNoKF93cmFwcGVyNik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChudW1BY3RpdmUgPj0gMSkge1xuICAgICAgICBmb3IgKHZhciBfaTggPSAwOyBfaTggPCBNYXRoLnBvdygyLCB0aGlzLnZhcnMgLSAyKTsgX2k4KyspIHtcbiAgICAgICAgICBmb3IgKHZhciBfajQgPSAwOyBfajQgPCA0OyBfajQrKykge1xuICAgICAgICAgICAgdmFyIF9ncm91cDggPSBbXTtcbiAgICAgICAgICAgIHZhciBwb2ludCA9IHRoaXMuZ2V0KF9pOCwgX2o0KTtcbiAgICAgICAgICAgIF9ncm91cDgucHVzaChwb2ludCk7XG5cbiAgICAgICAgICAgIHZhciBfd3JhcHBlcjcgPSBuZXcgX0dyb3VwMi5kZWZhdWx0KF9ncm91cDgsIFwiMXgxXCIpO1xuICAgICAgICAgICAgaWYgKHBvaW50LnN0YXR1cyA9PSB0aGlzLmV4cGFuc2lvblR5cGUgJiYgdGhpcy5pc0dyb3VwVW5pcXVlKG1hcmtlZCwgX3dyYXBwZXI3KSkgbWFya2VkLnB1c2goX3dyYXBwZXI3KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1hcmtlZDtcbiAgICB9XG5cbiAgICAvLyBtb2RzIGNvb3JkcyBmb3Igb3ZlcmZsb3cgYW5kIHN3YXBzIHRoZW0gYmVjYXVzZSBhcnJheSB4eSBhbmQgbWFwIHh5IGFyZSBmbGlwcGVkXG5cbiAgfSwge1xuICAgIGtleTogJ2dldCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldCh4LCB5KSB7XG4gICAgICByZXR1cm4gdGhpcy5jZWxsc1t5ICUgNF1beCAlIE1hdGgucG93KDIsIHRoaXMudmFycyAtIDIpXTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdpc0dyb3VwVW5pcXVlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gaXNHcm91cFVuaXF1ZShtYXJrZWQsIGdyb3VwKSB7XG4gICAgICBpZiAodHlwZW9mIG1hcmtlZCA9PT0gJ3VuZGVmaW5lZCcgfHwgbWFya2VkID09PSBudWxsKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdtYXJrZWQgaXMgZW1wdHknKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWFya2VkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vZm9yIGVhY2ggbWFya2VkIGdyb3VwXG4gICAgICAgIHZhciBtYXRjaGVzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBncm91cC5jZWxsQXJyYXkubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAvLyBmb3IgZWFjaCBwb2ludCBpbiB0aGUgZ3JvdXBcbiAgICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IG1hcmtlZFtpXS5jZWxsQXJyYXkubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIC8vIGZvciBlYWNoIHBvaW50IGluIHRoZSBtYXJrZWQgZ3JvdXBcbiAgICAgICAgICAgIGlmIChtYXJrZWRbaV0uY2VsbEFycmF5W2tdLnggPT0gZ3JvdXAuY2VsbEFycmF5W2pdLnggJiYgbWFya2VkW2ldLmNlbGxBcnJheVtrXS55ID09IGdyb3VwLmNlbGxBcnJheVtqXS55KSB7XG4gICAgICAgICAgICAgIG1hdGNoZXMucHVzaChncm91cFtqXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1hdGNoZXMubGVuZ3RoID4gZ3JvdXAuY2VsbEFycmF5Lmxlbmd0aCAvIDIpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnc2ltcGxpZnlHcm91cHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzaW1wbGlmeUdyb3Vwcyhncm91cHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSBncm91cHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgLy8gZm9yIGVhY2ggZ3JvdXBcbiAgICAgICAgdmFyIG51bWJlck9mT25lcyA9IDA7XG4gICAgICAgIHZhciBtYXRjaGVzID0gMDtcblxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGdyb3Vwc1tpXS5jZWxsQXJyYXkubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAvLyBmb3IgZWFjaCBwb2ludCBpbiB0aGUgZ3JvdXBcbiAgICAgICAgICAvLyBpZiBpdCBpcyBhIDEgaW5jcmVtZW50IG51bWJlciBvZiBvbmVzIG90aGVyd2lzZSBza2lwIHRoaXMgbG9vcFxuICAgICAgICAgIGlmIChncm91cHNbaV0uY2VsbEFycmF5W2pdLnN0YXR1cyAhPSB0aGlzLmV4cGFuc2lvblR5cGUpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgbnVtYmVyT2ZPbmVzKys7XG5cbiAgICAgICAgICAvLyBjaGVjayBldmVyeSAxIGluIHRoZSBhcnJheSBvZiBncm91cHMgZm9yIG1hdGNoaW5nICh4ICYgeSdzKSBhbmRcbiAgICAgICAgICAvLyBpbmNyZW1lbnQgbWF0Y2hlcyBpZiBpdCBpcyBpbiBhIGRpZmZlcmVudCBncm91cCB0aGFuIHRoZSBjdXJyZW50IGdyb3VwXG4gICAgICAgICAgcGFpcmluZzogZm9yICh2YXIgayA9IDA7IGsgPCBncm91cHMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIGwgPSAwOyBsIDwgZ3JvdXBzW2tdLmNlbGxBcnJheS5sZW5ndGg7IGwrKykge1xuICAgICAgICAgICAgICBpZiAoZ3JvdXBzW2tdLmNlbGxBcnJheVtsXS5zdGF0dXMgPT0gdGhpcy5leHBhbnNpb25UeXBlICYmIGdyb3Vwc1tpXS5jZWxsQXJyYXlbal0ueCA9PT0gZ3JvdXBzW2tdLmNlbGxBcnJheVtsXS54ICYmIGdyb3Vwc1tpXS5jZWxsQXJyYXlbal0ueSA9PT0gZ3JvdXBzW2tdLmNlbGxBcnJheVtsXS55ICYmIGkgIT09IGspIHtcbiAgICAgICAgICAgICAgICBtYXRjaGVzKys7XG4gICAgICAgICAgICAgICAgYnJlYWsgcGFpcmluZzsgLy8gdXNlZCB0byBicmVhayBvdXQgb2YgYm90aCBsb29wc1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVtb3ZlcyB0aGUgZ3JvdXAgYW5kIGRlY3JlbWVudHMgdGhlIGNvdW50IGJ5IDFcbiAgICAgICAgaWYgKG1hdGNoZXMgJiYgbnVtYmVyT2ZPbmVzICYmIG51bWJlck9mT25lcyA9PT0gbWF0Y2hlcykge1xuICAgICAgICAgIGdyb3Vwcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgaS0tO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL1RPRE86IGFzayBwcm9mZXNzb3IgaWYgdGhpcyBpcyBnb29kXG4gICAgICByZXR1cm4gZ3JvdXBzO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NlbGxzVG9Qb2ludHMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjZWxsc1RvUG9pbnRzKGdyb3Vwcykge1xuICAgICAgcmV0dXJuIGdyb3Vwcy5tYXAoZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICAgIHJldHVybiBncm91cC5tYXAoZnVuY3Rpb24gKGNlbGwpIHtcbiAgICAgICAgICByZXR1cm4gbmV3IF9Qb2ludDIuZGVmYXVsdChjZWxsLngsIGNlbGwueSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIENlbGxBcnJheTtcbn0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gQ2VsbEFycmF5O1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9jbGFzc2VzL0NlbGxBcnJheS5qc1wiLFwiL2NsYXNzZXNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRyYXdQb2ludHMgPSBkcmF3UG9pbnRzO1xuZXhwb3J0cy5kcmF3VGVybXMgPSBkcmF3VGVybXM7XG5leHBvcnRzLm1hcmsgPSBtYXJrO1xuZXhwb3J0cy5oZXhUb1JHQiA9IGhleFRvUkdCO1xuXG52YXIgX2Nocm9tYUpzID0gcmVxdWlyZSgnY2hyb21hLWpzJyk7XG5cbnZhciBfY2hyb21hSnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2hyb21hSnMpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBkcmF3UG9pbnRzKGN0eCwgc2NhbGUsIHBvaW50cykge1xuICB2YXIgY29sb3JzID0gX2Nocm9tYUpzMi5kZWZhdWx0LnNjYWxlKFsnI2Y0NDMzNicsICcjOWMyN2IwJywgJyMzZjUxYjUnLCAnIzAzYTlmNCcsICcjMDA5Njg4JywgJyM4YmMzNGEnLCAnI2ZmZWIzYicsICcjZmY5ODAwJ10pLmNvbG9ycygxMik7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgY29sb3IgPSBjb2xvcnMuc3BsaWNlKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNvbG9ycy5sZW5ndGggLSAxKSwgMSk7XG4gICAgdmFyIHJnYiA9IGhleFRvUkdCKGNvbG9yWzBdLCAwLjUpO1xuXG4gICAgc3dpdGNoIChwb2ludHNbaV0udHlwZSkge1xuICAgICAgY2FzZSBcIjJ4MlwiOlxuICAgICAgICBkcmF3MngyKGN0eCwgc2NhbGUsIHBvaW50c1tpXSwgcmdiKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIjJ4NFwiOlxuICAgICAgICBkcmF3Mng0KGN0eCwgc2NhbGUsIHBvaW50c1tpXSwgcmdiKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIjF4MlwiOlxuICAgICAgICBkcmF3MXgyKGN0eCwgc2NhbGUsIHBvaW50c1tpXSwgcmdiKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIjF4NFwiOlxuICAgICAgICBkcmF3MXg0KGN0eCwgc2NhbGUsIHBvaW50c1tpXSwgcmdiKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIjJ4MVwiOlxuICAgICAgICBkcmF3MngxKGN0eCwgc2NhbGUsIHBvaW50c1tpXSwgcmdiKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIjR4MVwiOlxuICAgICAgICBkcmF3NHgxKGN0eCwgc2NhbGUsIHBvaW50c1tpXSwgcmdiKTtjdHgsIHNjYWxlLCBwb2ludHNbaV0sIHJnYjtcbiAgICAgICAgY29udGludWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIjF4MVwiOlxuICAgICAgICBtYXJrKGN0eCwgc2NhbGUsIHBvaW50c1tpXS5jZWxsQXJyYXlbMF0ueCwgcG9pbnRzW2ldLmNlbGxBcnJheVswXS55LCAwLCByZ2IpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb25zb2xlLmxvZyhcImVycm9yXCIpO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBvaW50c1tpXS5jZWxsQXJyYXkubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnNvbGUubG9nKHJnYik7XG4gICAgICBtYXJrKGN0eCwgc2NhbGUsIHBvaW50c1tpXS5jZWxsQXJyYXlbal0ueCwgcG9pbnRzW2ldLmNlbGxBcnJheVtqXS55LCAwLCByZ2IpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkcmF3VGVybXMoY3R4LCBzY2FsZSwgY2VsbHMpIHtcbiAgY3R4LmZvbnQgPSAnMjBwdCBSb2JvdG8nO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNlbGxzW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICBjdHguZmlsbFRleHQoY2VsbHNbaV1bal0uc3RhdHVzLCBzY2FsZSAqIChjZWxsc1tpXVtqXS54ICsgMSkgKyBzY2FsZSAvIDIsIHNjYWxlICogKGNlbGxzW2ldW2pdLnkgKyAxKSArIHNjYWxlIC8gMik7XG4gICAgfVxuICB9XG59XG5cbi8vZHJhd3MgYSBjb2xvciBvbiB0aGUgbWF0Y2hpbmcgY2VsbFxuZnVuY3Rpb24gbWFyayhjdHgsIHNjYWxlLCB4LCB5LCByb3RhdGlvbiwgY29sb3IpIHtcbiAgLy8gc2F2ZXMgY3VycmVudCBjb250ZXh0IHN0YXRlXG4gIGN0eC5zYXZlKCk7XG5cbiAgLy8gdHJhbnNsYXRlcyB0aGUgb3JpZ2luIG9mIHRoZSBjb250ZXh0XG4gIGN0eC50cmFuc2xhdGUoKHggKyAxKSAqIHNjYWxlICsgc2NhbGUgLyAyLCAoeSArIDEpICogc2NhbGUgKyBzY2FsZSAvIDIpO1xuICAvLyByb3RhdGVzIGFyb3VuZCB0aGUgb3JpZ2luXG4gIGN0eC5yb3RhdGUocm90YXRpb24gKiBNYXRoLlBJIC8gMTgwKTtcblxuICAvL2RyYXdzIG1hdGNoIGNvbG9yXG4gIGN0eC5iZWdpblBhdGgoKTtcblxuICBjdHguZmlsbFN0eWxlID0gY29sb3I7XG4gIC8vIHN1YnRyYWN0cyB0byBjZW50ZXIgdGhlIG1hdGNoIGNvbG9yXG4gIGN0eC5maWxsUmVjdCgtc2NhbGUgLyAyLCAtc2NhbGUgLyAyLCBzY2FsZSwgc2NhbGUpO1xuICBjdHguZmlsbFN0eWxlID0gJyMwMDAnO1xuXG4gIGN0eC5yZXN0b3JlKCk7XG59XG5cbmZ1bmN0aW9uIG1hcmtUTChjdHgsIHNjYWxlLCB4LCB5LCBjb2xvcikge1xuICBjdHguc2F2ZSgpO1xuICBjdHgudHJhbnNsYXRlKCh4ICsgMSkgKiBzY2FsZSArIHNjYWxlIC8gMiwgKHkgKyAxKSAqIHNjYWxlICsgc2NhbGUgLyAyKTtcbiAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LmZpbGxSZWN0KC1zY2FsZSAvIDIgKyBzY2FsZSAvIDEwLCAtc2NhbGUgLyAyICsgc2NhbGUgLyAxMCwgc2NhbGUgLSBzY2FsZSAvIDEwLCBzY2FsZSAtIHNjYWxlIC8gMTApO1xuXG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LnJlc3RvcmUoKTtcbn1cblxuZnVuY3Rpb24gbWFya1RNKGN0eCwgc2NhbGUsIHgsIHksIGNvbG9yKSB7XG4gIGN0eC5zYXZlKCk7XG4gIGN0eC50cmFuc2xhdGUoKHggKyAxKSAqIHNjYWxlICsgc2NhbGUgLyAyLCAoeSArIDEpICogc2NhbGUgKyBzY2FsZSAvIDIpO1xuICBjdHguZmlsbFN0eWxlID0gY29sb3I7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguZmlsbFJlY3QoLXNjYWxlIC8gMiwgLXNjYWxlIC8gMiArIHNjYWxlIC8gMTAsIHNjYWxlLCBzY2FsZSAtIHNjYWxlIC8gMTApO1xuXG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LnJlc3RvcmUoKTtcbn1cblxuZnVuY3Rpb24gbWFya0JNKGN0eCwgc2NhbGUsIHgsIHksIGNvbG9yKSB7XG4gIGN0eC5zYXZlKCk7XG4gIGN0eC50cmFuc2xhdGUoKHggKyAxKSAqIHNjYWxlICsgc2NhbGUgLyAyLCAoeSArIDEpICogc2NhbGUgKyBzY2FsZSAvIDIpO1xuICBjdHguZmlsbFN0eWxlID0gY29sb3I7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguZmlsbFJlY3QoLXNjYWxlIC8gMiwgLXNjYWxlIC8gMiwgc2NhbGUsIHNjYWxlIC0gc2NhbGUgLyAxMCk7XG5cbiAgY3R4LnN0cm9rZSgpO1xuICBjdHgucmVzdG9yZSgpO1xufVxuXG5mdW5jdGlvbiBtYXJrQkwoY3R4LCBzY2FsZSwgeCwgeSwgY29sb3IpIHtcbiAgY3R4LnNhdmUoKTtcbiAgY3R4LnRyYW5zbGF0ZSgoeCArIDEpICogc2NhbGUgKyBzY2FsZSAvIDIsICh5ICsgMSkgKiBzY2FsZSArIHNjYWxlIC8gMik7XG4gIGN0eC5maWxsU3R5bGUgPSBjb2xvcjtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5maWxsUmVjdCgtc2NhbGUgLyAyICsgc2NhbGUgLyAxMCwgLXNjYWxlIC8gMiwgc2NhbGUgLSBzY2FsZSAvIDEwLCBzY2FsZSAtIHNjYWxlIC8gMTApO1xuXG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LnJlc3RvcmUoKTtcbn1cblxuZnVuY3Rpb24gbWFya1RSKGN0eCwgc2NhbGUsIHgsIHksIGNvbG9yKSB7XG4gIGN0eC5zYXZlKCk7XG4gIGN0eC50cmFuc2xhdGUoKHggKyAxKSAqIHNjYWxlICsgc2NhbGUgLyAyLCAoeSArIDEpICogc2NhbGUgKyBzY2FsZSAvIDIpO1xuICBjdHguZmlsbFN0eWxlID0gY29sb3I7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguZmlsbFJlY3QoLXNjYWxlIC8gMiwgLXNjYWxlIC8gMiArIHNjYWxlIC8gMTAsIHNjYWxlIC0gc2NhbGUgLyAxMCwgc2NhbGUgLSBzY2FsZSAvIDEwKTtcblxuICBjdHguc3Ryb2tlKCk7XG4gIGN0eC5yZXN0b3JlKCk7XG59XG5cbmZ1bmN0aW9uIG1hcmtMTShjdHgsIHNjYWxlLCB4LCB5LCBjb2xvcikge1xuICBjdHguc2F2ZSgpO1xuICBjdHgudHJhbnNsYXRlKCh4ICsgMSkgKiBzY2FsZSArIHNjYWxlIC8gMiwgKHkgKyAxKSAqIHNjYWxlICsgc2NhbGUgLyAyKTtcbiAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LmZpbGxSZWN0KC1zY2FsZSAvIDIgKyBzY2FsZSAvIDEwLCAtc2NhbGUgLyAyLCBzY2FsZSAtIHNjYWxlIC8gMTAsIHNjYWxlKTtcblxuICBjdHguc3Ryb2tlKCk7XG4gIGN0eC5yZXN0b3JlKCk7XG59XG5cbmZ1bmN0aW9uIG1hcmtSTShjdHgsIHNjYWxlLCB4LCB5LCBjb2xvcikge1xuICBjdHguc2F2ZSgpO1xuICBjdHgudHJhbnNsYXRlKCh4ICsgMSkgKiBzY2FsZSArIHNjYWxlIC8gMiwgKHkgKyAxKSAqIHNjYWxlICsgc2NhbGUgLyAyKTtcbiAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LmZpbGxSZWN0KC1zY2FsZSAvIDIsIC1zY2FsZSAvIDIsIHNjYWxlIC0gc2NhbGUgLyAxMCwgc2NhbGUpO1xuXG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LnJlc3RvcmUoKTtcbn1cblxuZnVuY3Rpb24gbWFya0JSKGN0eCwgc2NhbGUsIHgsIHksIGNvbG9yKSB7XG4gIGN0eC5zYXZlKCk7XG4gIGN0eC50cmFuc2xhdGUoKHggKyAxKSAqIHNjYWxlICsgc2NhbGUgLyAyLCAoeSArIDEpICogc2NhbGUgKyBzY2FsZSAvIDIpO1xuICBjdHguZmlsbFN0eWxlID0gY29sb3I7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguZmlsbFJlY3QoLXNjYWxlIC8gMiwgLXNjYWxlIC8gMiwgc2NhbGUgLSBzY2FsZSAvIDEwLCBzY2FsZSAtIHNjYWxlIC8gMTApO1xuXG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LnJlc3RvcmUoKTtcbn1cblxuZnVuY3Rpb24gbWFya1QoY3R4LCBzY2FsZSwgeCwgeSwgY29sb3IpIHtcbiAgY3R4LnNhdmUoKTtcbiAgY3R4LnRyYW5zbGF0ZSgoeCArIDEpICogc2NhbGUgKyBzY2FsZSAvIDIsICh5ICsgMSkgKiBzY2FsZSArIHNjYWxlIC8gMik7XG4gIGN0eC5maWxsU3R5bGUgPSBjb2xvcjtcblxuICBjdHguYmVnaW5QYXRoKCk7XG4gIGN0eC5maWxsUmVjdCgtc2NhbGUgLyAyICsgc2NhbGUgLyA1LCAtc2NhbGUgLyAyICsgc2NhbGUgLyAxMCwgc2NhbGUgLSBzY2FsZSAvIDIuNSwgc2NhbGUgLSBzY2FsZSAvIDEwKTtcblxuICBjdHguc3Ryb2tlKCk7XG4gIGN0eC5yZXN0b3JlKCk7XG59XG5cbmZ1bmN0aW9uIG1hcmtCKGN0eCwgc2NhbGUsIHgsIHksIGNvbG9yKSB7XG4gIGN0eC5zYXZlKCk7XG4gIGN0eC50cmFuc2xhdGUoKHggKyAxKSAqIHNjYWxlICsgc2NhbGUgLyAyLCAoeSArIDEpICogc2NhbGUgKyBzY2FsZSAvIDIpO1xuICBjdHguZmlsbFN0eWxlID0gY29sb3I7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguZmlsbFJlY3QoLXNjYWxlIC8gMiArIHNjYWxlIC8gNSwgLXNjYWxlIC8gMiwgc2NhbGUgLSBzY2FsZSAvIDIuNSwgc2NhbGUgLSBzY2FsZSAvIDEwKTtcblxuICBjdHguc3Ryb2tlKCk7XG4gIGN0eC5yZXN0b3JlKCk7XG59XG5cbmZ1bmN0aW9uIG1hcmtNVihjdHgsIHNjYWxlLCB4LCB5LCBjb2xvcikge1xuICBjdHguc2F2ZSgpO1xuICBjdHgudHJhbnNsYXRlKCh4ICsgMSkgKiBzY2FsZSArIHNjYWxlIC8gMiwgKHkgKyAxKSAqIHNjYWxlICsgc2NhbGUgLyAyKTtcbiAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LmZpbGxSZWN0KC1zY2FsZSAvIDIgKyBzY2FsZSAvIDUsIC1zY2FsZSAvIDIsIHNjYWxlIC0gc2NhbGUgLyAyLjUsIHNjYWxlKTtcblxuICBjdHguc3Ryb2tlKCk7XG4gIGN0eC5yZXN0b3JlKCk7XG59XG5cbmZ1bmN0aW9uIG1hcmtNSChjdHgsIHNjYWxlLCB4LCB5LCBjb2xvcikge1xuICBjdHguc2F2ZSgpO1xuICBjdHgudHJhbnNsYXRlKCh4ICsgMSkgKiBzY2FsZSArIHNjYWxlIC8gMiwgKHkgKyAxKSAqIHNjYWxlICsgc2NhbGUgLyAyKTtcbiAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LmZpbGxSZWN0KC1zY2FsZSAvIDIsIC1zY2FsZSAvIDIgKyBzY2FsZSAvIDUsIHNjYWxlLCBzY2FsZSAtIHNjYWxlIC8gMi41KTtcblxuICBjdHguc3Ryb2tlKCk7XG4gIGN0eC5yZXN0b3JlKCk7XG59XG5cbmZ1bmN0aW9uIG1hcmtMKGN0eCwgc2NhbGUsIHgsIHksIGNvbG9yKSB7XG4gIGN0eC5zYXZlKCk7XG4gIGN0eC50cmFuc2xhdGUoKHggKyAxKSAqIHNjYWxlICsgc2NhbGUgLyAyLCAoeSArIDEpICogc2NhbGUgKyBzY2FsZSAvIDIpO1xuICBjdHguZmlsbFN0eWxlID0gY29sb3I7XG5cbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHguZmlsbFJlY3QoLXNjYWxlIC8gMiArIHNjYWxlIC8gMTAsIC1zY2FsZSAvIDIgKyBzY2FsZSAvIDUsIHNjYWxlIC0gc2NhbGUgLyAxMCwgc2NhbGUgLSBzY2FsZSAvIDIuNSk7XG5cbiAgY3R4LnN0cm9rZSgpO1xuICBjdHgucmVzdG9yZSgpO1xufVxuXG5mdW5jdGlvbiBtYXJrUihjdHgsIHNjYWxlLCB4LCB5LCBjb2xvcikge1xuICBjdHguc2F2ZSgpO1xuICBjdHgudHJhbnNsYXRlKCh4ICsgMSkgKiBzY2FsZSArIHNjYWxlIC8gMiwgKHkgKyAxKSAqIHNjYWxlICsgc2NhbGUgLyAyKTtcbiAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuXG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4LmZpbGxSZWN0KC1zY2FsZSAvIDIsIC1zY2FsZSAvIDIgKyBzY2FsZSAvIDUsIHNjYWxlIC0gc2NhbGUgLyAxMCwgc2NhbGUgLSBzY2FsZSAvIDIuNSk7XG5cbiAgY3R4LnN0cm9rZSgpO1xuICBjdHgucmVzdG9yZSgpO1xufVxuXG5mdW5jdGlvbiBkcmF3MngyKGN0eCwgc2NhbGUsIGdyb3VwLCBjb2xvcikge1xuICBtYXJrVEwoY3R4LCBzY2FsZSwgZ3JvdXAuY2VsbEFycmF5WzBdLngsIGdyb3VwLmNlbGxBcnJheVswXS55LCBjb2xvcik7XG4gIG1hcmtUUihjdHgsIHNjYWxlLCBncm91cC5jZWxsQXJyYXlbMV0ueCwgZ3JvdXAuY2VsbEFycmF5WzFdLnksIGNvbG9yKTtcbiAgbWFya0JMKGN0eCwgc2NhbGUsIGdyb3VwLmNlbGxBcnJheVsyXS54LCBncm91cC5jZWxsQXJyYXlbMl0ueSwgY29sb3IpO1xuICBtYXJrQlIoY3R4LCBzY2FsZSwgZ3JvdXAuY2VsbEFycmF5WzNdLngsIGdyb3VwLmNlbGxBcnJheVszXS55LCBjb2xvcik7XG59XG5cbmZ1bmN0aW9uIGRyYXcyeDQoY3R4LCBzY2FsZSwgZ3JvdXAsIGNvbG9yKSB7XG4gIG1hcmtUTChjdHgsIHNjYWxlLCBncm91cC5jZWxsQXJyYXlbMF0ueCwgZ3JvdXAuY2VsbEFycmF5WzBdLnksIGNvbG9yKTtcbiAgbWFya0xNKGN0eCwgc2NhbGUsIGdyb3VwLmNlbGxBcnJheVsxXS54LCBncm91cC5jZWxsQXJyYXlbMV0ueSwgY29sb3IpO1xuXG4gIG1hcmtMTShjdHgsIHNjYWxlLCBncm91cC5jZWxsQXJyYXlbMl0ueCwgZ3JvdXAuY2VsbEFycmF5WzJdLnksIGNvbG9yKTtcbiAgbWFya0JMKGN0eCwgc2NhbGUsIGdyb3VwLmNlbGxBcnJheVszXS54LCBncm91cC5jZWxsQXJyYXlbM10ueSwgY29sb3IpO1xuXG4gIG1hcmtUUihjdHgsIHNjYWxlLCBncm91cC5jZWxsQXJyYXlbNF0ueCwgZ3JvdXAuY2VsbEFycmF5WzRdLnksIGNvbG9yKTtcbiAgbWFya1JNKGN0eCwgc2NhbGUsIGdyb3VwLmNlbGxBcnJheVs1XS54LCBncm91cC5jZWxsQXJyYXlbNV0ueSwgY29sb3IpO1xuXG4gIG1hcmtSTShjdHgsIHNjYWxlLCBncm91cC5jZWxsQXJyYXlbNl0ueCwgZ3JvdXAuY2VsbEFycmF5WzZdLnksIGNvbG9yKTtcbiAgbWFya0JSKGN0eCwgc2NhbGUsIGdyb3VwLmNlbGxBcnJheVs3XS54LCBncm91cC5jZWxsQXJyYXlbN10ueSwgY29sb3IpO1xufVxuXG5mdW5jdGlvbiBkcmF3MXgyKGN0eCwgc2NhbGUsIGdyb3VwLCBjb2xvcikge1xuICBtYXJrVChjdHgsIHNjYWxlLCBncm91cC5jZWxsQXJyYXlbMF0ueCwgZ3JvdXAuY2VsbEFycmF5WzBdLnksIGNvbG9yKTtcbiAgbWFya0IoY3R4LCBzY2FsZSwgZ3JvdXAuY2VsbEFycmF5WzFdLngsIGdyb3VwLmNlbGxBcnJheVsxXS55LCBjb2xvcik7XG59XG5cbmZ1bmN0aW9uIGRyYXcxeDQoY3R4LCBzY2FsZSwgZ3JvdXAsIGNvbG9yKSB7XG4gIG1hcmtUKGN0eCwgc2NhbGUsIGdyb3VwLmNlbGxBcnJheVswXS54LCBncm91cC5jZWxsQXJyYXlbMF0ueSwgY29sb3IpO1xuICBtYXJrTVYoY3R4LCBzY2FsZSwgZ3JvdXAuY2VsbEFycmF5WzFdLngsIGdyb3VwLmNlbGxBcnJheVsxXS55LCBjb2xvcik7XG4gIG1hcmtNVihjdHgsIHNjYWxlLCBncm91cC5jZWxsQXJyYXlbMl0ueCwgZ3JvdXAuY2VsbEFycmF5WzJdLnksIGNvbG9yKTtcbiAgbWFya0IoY3R4LCBzY2FsZSwgZ3JvdXAuY2VsbEFycmF5WzNdLngsIGdyb3VwLmNlbGxBcnJheVszXS55LCBjb2xvcik7XG59XG5cbmZ1bmN0aW9uIGRyYXc0eDEoY3R4LCBzY2FsZSwgZ3JvdXAsIGNvbG9yKSB7XG4gIG1hcmtMKGN0eCwgc2NhbGUsIGdyb3VwLmNlbGxBcnJheVswXS54LCBncm91cC5jZWxsQXJyYXlbMF0ueSwgY29sb3IpO1xuICBtYXJrTUgoY3R4LCBzY2FsZSwgZ3JvdXAuY2VsbEFycmF5WzFdLngsIGdyb3VwLmNlbGxBcnJheVsxXS55LCBjb2xvcik7XG4gIG1hcmtNSChjdHgsIHNjYWxlLCBncm91cC5jZWxsQXJyYXlbMl0ueCwgZ3JvdXAuY2VsbEFycmF5WzJdLnksIGNvbG9yKTtcbiAgbWFya1IoY3R4LCBzY2FsZSwgZ3JvdXAuY2VsbEFycmF5WzNdLngsIGdyb3VwLmNlbGxBcnJheVszXS55LCBjb2xvcik7XG59XG5cbmZ1bmN0aW9uIGRyYXcyeDEoY3R4LCBzY2FsZSwgZ3JvdXAsIGNvbG9yKSB7XG4gIG1hcmtMKGN0eCwgc2NhbGUsIGdyb3VwLmNlbGxBcnJheVswXS54LCBncm91cC5jZWxsQXJyYXlbMF0ueSwgY29sb3IpO1xuICBtYXJrUihjdHgsIHNjYWxlLCBncm91cC5jZWxsQXJyYXlbMV0ueCwgZ3JvdXAuY2VsbEFycmF5WzFdLnksIGNvbG9yKTtcbn1cblxuZnVuY3Rpb24gaGV4VG9SR0IoaGV4LCBhbHBoYSkge1xuICB2YXIgciA9IHBhcnNlSW50KGhleC5zbGljZSgxLCAzKSwgMTYpLFxuICAgICAgZyA9IHBhcnNlSW50KGhleC5zbGljZSgzLCA1KSwgMTYpLFxuICAgICAgYiA9IHBhcnNlSW50KGhleC5zbGljZSg1LCA3KSwgMTYpO1xuXG4gIGlmIChhbHBoYSkge1xuICAgIHJldHVybiBcInJnYmEoXCIgKyByICsgXCIsIFwiICsgZyArIFwiLCBcIiArIGIgKyBcIiwgXCIgKyBhbHBoYSArIFwiKVwiO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBcInJnYihcIiArIHIgKyBcIiwgXCIgKyBnICsgXCIsIFwiICsgYiArIFwiKVwiO1xuICB9XG59XG5cbi8vIGV4cG9ydCBmdW5jdGlvbiByYW5kb21SR0IobGVuZ3RoKSB7XG4vLyAgIHZhciBjb2xvciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxlbmd0aCk7XG4vLyAgIHZhciBjb2xvcnMgPSBjaHJvbWEuc2NhbGUoWycjZjQ0MzM2JywgJyM5YzI3YjAnLCAnIzNmNTFiNScsICcjMDNhOWY0JywgJyMwMDk2ODgnLCAnIzhiYzM0YScsICcjZmZlYjNiJywgJyNmZjk4MDAnXSkuY29sb3JzKGxlbmd0aCk7XG4vLyAgIHZhciBoZXggPSBjb2xvcnNbY29sb3JdO1xuLy8gICByZXR1cm4gaGV4VG9SR0IoaGV4LCAwLjUpO1xuLy8gfVxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9jbGFzc2VzL0RyYXdpbmdGdW5jdGlvbnMuanNcIixcIi9jbGFzc2VzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbi8vIEdyb3VwIGNsYXNzIHVzZWQgZm9yIGRyYXdpbmdcbnZhciBHcm91cCA9IGZ1bmN0aW9uIEdyb3VwKGNlbGxBcnJheSwgdHlwZSkge1xuICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgR3JvdXApO1xuXG4gIHRoaXMuY2VsbEFycmF5ID0gY2VsbEFycmF5O1xuICB0aGlzLnR5cGUgPSB0eXBlO1xufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gR3JvdXA7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2NsYXNzZXMvR3JvdXAuanNcIixcIi9jbGFzc2VzXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG4vLyBQb2ludCBjbGFzc1xudmFyIFBvaW50ID0gZnVuY3Rpb24gUG9pbnQoeCwgeSkge1xuICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUG9pbnQpO1xuXG4gIGlmICh4IDwgMCB8fCB5IDwgMCkgdGhyb3cgbmV3IEVycm9yKCdDb29yZGluYXRlcyBtdXN0IGJlIHBvc2l0aXZlJyk7XG4gIHRoaXMueCA9IHg7XG4gIHRoaXMueSA9IHk7XG59O1xuXG5leHBvcnRzLmRlZmF1bHQgPSBQb2ludDtcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY2xhc3Nlcy9Qb2ludC5qc1wiLFwiL2NsYXNzZXNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBfQ2VsbEFycmF5ID0gcmVxdWlyZSgnLi9jbGFzc2VzL0NlbGxBcnJheScpO1xuXG52YXIgX0NlbGxBcnJheTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9DZWxsQXJyYXkpO1xuXG52YXIgX0RyYXdpbmdGdW5jdGlvbnMgPSByZXF1aXJlKCcuL2NsYXNzZXMvRHJhd2luZ0Z1bmN0aW9ucycpO1xuXG52YXIgZHJhd2VyID0gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQoX0RyYXdpbmdGdW5jdGlvbnMpO1xuXG52YXIgX0JpbmFyeUZ1bmN0aW9ucyA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9CaW5hcnlGdW5jdGlvbnMnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlV2lsZGNhcmQob2JqKSB7IGlmIChvYmogJiYgb2JqLl9fZXNNb2R1bGUpIHsgcmV0dXJuIG9iajsgfSBlbHNlIHsgdmFyIG5ld09iaiA9IHt9OyBpZiAob2JqICE9IG51bGwpIHsgZm9yICh2YXIga2V5IGluIG9iaikgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgbmV3T2JqW2tleV0gPSBvYmpba2V5XTsgfSB9IG5ld09iai5kZWZhdWx0ID0gb2JqOyByZXR1cm4gbmV3T2JqOyB9IH1cblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7XG52YXIgY3R4ID0gYy5nZXRDb250ZXh0KCcyZCcpO1xuXG4vLyBjLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCAvIDggKiA1O1xuLy8gYy53aWR0aCA9IHdpbmRvdy5pbm5lckhlaWdodCAvIDggKiA1O1xuXG52YXIgc2NhbGUgPSBjLndpZHRoIC8gNTsgLy9zY2FsZSBvZiB0aGUgY2VsbHM7XG5cbi8vIGZpeGVzIHByb2JsZW0gd2l0aCBicm93c2VycyBtYWtpbmcgbXkgY2FudmFzIGxvb2sgYmFkXG52YXIgZGV2aWNlUGl4ZWxSYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDEsXG4gICAgYmFja2luZ1N0b3JlUmF0aW8gPSBjdHgud2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCBjdHgubW96QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCBjdHgubXNCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IGN0eC5vQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCBjdHguYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCAxLFxuICAgIHJhdGlvID0gZGV2aWNlUGl4ZWxSYXRpbyAvIGJhY2tpbmdTdG9yZVJhdGlvO1xuXG52YXIgb2xkV2lkdGggPSBjLndpZHRoO1xudmFyIG9sZEhlaWdodCA9IGMuaGVpZ2h0O1xuXG5jLndpZHRoID0gb2xkV2lkdGggKiByYXRpbyArIDE7XG5jLmhlaWdodCA9IG9sZEhlaWdodCAqIHJhdGlvICsgMTtcblxuYy5zdHlsZS53aWR0aCA9IG9sZFdpZHRoICsgJ3B4JztcbmMuc3R5bGUuaGVpZ2h0ID0gb2xkSGVpZ2h0ICsgJ3B4JztcblxuLy8gbm93IHNjYWxlIHRoZSBjb250ZXh0IHRvIGNvdW50ZXJcbi8vIHRoZSBmYWN0IHRoYXQgd2UndmUgbWFudWFsbHkgc2NhbGVkXG4vLyBvdXIgYyBlbGVtZW50XG5jdHguc2NhbGUocmF0aW8sIHJhdGlvKTtcblxuLy9rbWFwIHN0dWZmXG52YXIgbWludGVybXMgPSBbXTtcbnZhciBudW1WYXJzID0gMztcbnZhciBleHBhbnNpb25UeXBlID0gMTtcblxudmFyIGNlbGxBcnJheSA9IG5ldyBfQ2VsbEFycmF5Mi5kZWZhdWx0KG51bVZhcnMsIGV4cGFuc2lvblR5cGUpO1xuXG5kcmF3M3ZhcmttYXAoKTtcblxuZnVuY3Rpb24gZ2V0TWludGVybXMoKSB7XG4gIHZhciB0ZW1wID0gW107XG4gIC8vVE9ETzogY2hhbmdlIGl0IHRvIHdvcmsgZm9yIG1vcmUgbWludGVybXMgaW5zdGVhZCBvZiBoYXJkY29kaW5nIHRoZSA4XG4gIC8vZ2V0cyBtaW50ZXJtcyBmcm9tIGh0bWwgZm9ybVxuICBmb3IgKHZhciBpID0gMDsgaSA8IE1hdGgucG93KDIsIG51bVZhcnMpOyBpKyspIHtcbiAgICB2YXIgZm9ybUdyb3VwID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeU5hbWUoJ2dyb3VwJyArIGkpO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBmb3JtR3JvdXAubGVuZ3RoOyBqKyspIHtcbiAgICAgIGlmIChmb3JtR3JvdXBbal0uY2hlY2tlZCA9PSB0cnVlKSB7XG4gICAgICAgIHRlbXBbaV0gPSBmb3JtR3JvdXBbal0udmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRlbXA7XG59XG5cbmZ1bmN0aW9uIHJlc2V0a21hcCgpIHtcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjLndpZHRoLCBjLndpZHRoKTtcbn1cblxudmFyIHNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdudW0tdmFycycpO1xudmFyIGV4cGFuc2lvblR5cGVTd2l0Y2ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXhwYW5zaW9uVHlwZScpO1xuXG5leHBhbnNpb25UeXBlU3dpdGNoLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uIChldmVudCkge1xuICBleHBhbnNpb25UeXBlID0gTnVtYmVyKCFldmVudC50YXJnZXQuY2hlY2tlZCk7XG4gIGNlbGxBcnJheS5leHBhbnNpb25UeXBlID0gZXhwYW5zaW9uVHlwZTtcbiAgcmVuZGVyKCk7XG59KTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5cHJlc3MnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgaWYgKGV2ZW50LmtleUNvZGUgPT0gMTMpIHtcbiAgICByZW5kZXIoKTtcbiAgfVxufSk7XG5cbm5vVWlTbGlkZXIuY3JlYXRlKHNsaWRlciwge1xuICBzdGFydDogMyxcbiAgY29ubmVjdDogW3RydWUsIGZhbHNlXSxcbiAgc3RlcDogMSxcbiAgcmFuZ2U6IHtcbiAgICAnbWluJzogWzNdLFxuICAgICdtYXgnOiBbNF1cbiAgfSxcbiAgcGlwczoge1xuICAgIG1vZGU6ICdzdGVwcycsXG4gICAgZGVuc2l0eTogMzBcbiAgfVxufSk7XG5cbnNsaWRlci5ub1VpU2xpZGVyLm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gIHZhciB0cnV0aFRhYmxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RydXRoLXRhYmxlJyk7XG5cbiAgd2hpbGUgKHRydXRoVGFibGUuZmlyc3RDaGlsZCkge1xuICAgIHRydXRoVGFibGUucmVtb3ZlQ2hpbGQodHJ1dGhUYWJsZS5maXJzdENoaWxkKTtcbiAgfVxuXG4gIHZhciB0YmwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xuXG4gIHZhciB0aGVhZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoZWFkJyk7XG5cbiAgdmFyIHN1cGVySGVhZFJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XG5cbiAgdmFyIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGgnKTtcbiAgaW5wdXQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0lucHV0JykpO1xuICBpbnB1dC5zZXRBdHRyaWJ1dGUoJ2NvbHNwYW4nLCBzbGlkZXIubm9VaVNsaWRlci5nZXQoKSk7XG5cbiAgdmFyIG91dHB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XG4gIG91dHB1dC5zZXRBdHRyaWJ1dGUoJ2NvbHNwYW4nLCAzKTtcbiAgb3V0cHV0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdPdXRwdXQnKSk7XG5cbiAgc3VwZXJIZWFkUm93LmFwcGVuZENoaWxkKGlucHV0KTtcbiAgc3VwZXJIZWFkUm93LmFwcGVuZENoaWxkKG91dHB1dCk7XG5cbiAgdGhlYWQuYXBwZW5kQ2hpbGQoc3VwZXJIZWFkUm93KTtcblxuICB2YXIgdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xuICAvLyBDcmVhdGVzIGhlYWRlcnMgZm9yIHRoZSB0cnV0aCB0YWJsZVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlci5ub1VpU2xpZGVyLmdldCgpOyBpKyspIHtcbiAgICB2YXIgdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0aCcpO1xuICAgIHRoLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFN0cmluZy5mcm9tQ2hhckNvZGUoNjUgKyBpKSkpO1xuICAgIHRyLmFwcGVuZENoaWxkKHRoKTtcbiAgfVxuXG4gIHZhciBvZmYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0aCcpO1xuICBvZmYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJzAnKSk7XG4gIHZhciBvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XG4gIG9uLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcxJykpO1xuICB2YXIgZG9udENhcmUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0aCcpO1xuICBkb250Q2FyZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnWCcpKTtcblxuICB0ci5hcHBlbmRDaGlsZChvZmYpO1xuICB0ci5hcHBlbmRDaGlsZChvbik7XG4gIHRyLmFwcGVuZENoaWxkKGRvbnRDYXJlKTtcblxuICB0aGVhZC5hcHBlbmRDaGlsZCh0cik7XG4gIHRibC5hcHBlbmRDaGlsZCh0aGVhZCk7XG5cbiAgdmFyIHRib2R5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGJvZHknKTtcbiAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IE1hdGgucG93KDIsIHNsaWRlci5ub1VpU2xpZGVyLmdldCgpKTsgX2krKykge1xuICAgIHZhciBfdHIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xuXG4gICAgdmFyIG51bSA9ICcnICsgX2kudG9TdHJpbmcoMik7XG4gICAgdmFyIHBhZCA9ICcwJy5yZXBlYXQoc2xpZGVyLm5vVWlTbGlkZXIuZ2V0KCkpOyAvLyBpdHMganVzdCA1IDAncyBmb3IgdGhlIG1heCB2YXIgbnVtc1xuICAgIHZhciBiaW4gPSBwYWQuc3Vic3RyaW5nKDAsIHBhZC5sZW5ndGggLSBudW0ubGVuZ3RoKSArIG51bTtcblxuICAgIHZhciBiaW5BcnJheSA9IGJpbi5zcGxpdCgnJyk7XG5cbiAgICBmb3IgKHZhciBfaTIgPSAwOyBfaTIgPCBiaW5BcnJheS5sZW5ndGg7IF9pMisrKSB7XG4gICAgICB2YXIgX3RkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcbiAgICAgIF90ZC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShiaW5BcnJheVtfaTJdKSk7XG4gICAgICBfdHIuYXBwZW5kQ2hpbGQoX3RkKTtcbiAgICB9XG5cbiAgICB2YXIgdGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuICAgIHZhciBpbnB1dDEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIGlucHV0MS5zZXRBdHRyaWJ1dGUoJ25hbWUnLCAnZ3JvdXAnICsgX2kpO1xuICAgIGlucHV0MS5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAncmFkaW8nKTtcbiAgICBpbnB1dDEuc2V0QXR0cmlidXRlKCdpZCcsICdPRkYnICsgX2kpO1xuICAgIGlucHV0MS5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgJzAnKTtcbiAgICBpbnB1dDEuc2V0QXR0cmlidXRlKCdjaGVja2VkJywgJ2NoZWNrZWQnKTtcbiAgICB2YXIgbGFiZWwxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICBsYWJlbDEuc2V0QXR0cmlidXRlKCdmb3InLCAnT0ZGJyArIF9pKTtcbiAgICB0ZC5hcHBlbmRDaGlsZChpbnB1dDEpO1xuICAgIHRkLmFwcGVuZENoaWxkKGxhYmVsMSk7XG5cbiAgICB2YXIgdGQyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcbiAgICB2YXIgaW5wdXQyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICBpbnB1dDIuc2V0QXR0cmlidXRlKCduYW1lJywgJ2dyb3VwJyArIF9pKTtcbiAgICBpbnB1dDIuc2V0QXR0cmlidXRlKCd0eXBlJywgJ3JhZGlvJyk7XG4gICAgaW5wdXQyLnNldEF0dHJpYnV0ZSgnaWQnLCAnT04nICsgX2kpO1xuICAgIGlucHV0Mi5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgJzEnKTtcbiAgICB2YXIgbGFiZWwyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICBsYWJlbDIuc2V0QXR0cmlidXRlKCdmb3InLCAnT04nICsgX2kpO1xuICAgIHRkMi5hcHBlbmRDaGlsZChpbnB1dDIpO1xuICAgIHRkMi5hcHBlbmRDaGlsZChsYWJlbDIpO1xuXG4gICAgdmFyIHRkMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XG4gICAgdmFyIGlucHV0MyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgaW5wdXQzLnNldEF0dHJpYnV0ZSgnbmFtZScsICdncm91cCcgKyBfaSk7XG4gICAgaW5wdXQzLnNldEF0dHJpYnV0ZSgndHlwZScsICdyYWRpbycpO1xuICAgIGlucHV0My5zZXRBdHRyaWJ1dGUoJ2lkJywgJ0RPTlRDQVJFJyArIF9pKTtcbiAgICBpbnB1dDMuc2V0QXR0cmlidXRlKCd2YWx1ZScsICdYJyk7XG4gICAgdmFyIGxhYmVsMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgbGFiZWwzLnNldEF0dHJpYnV0ZSgnZm9yJywgJ0RPTlRDQVJFJyArIF9pKTtcbiAgICB0ZDMuYXBwZW5kQ2hpbGQoaW5wdXQzKTtcbiAgICB0ZDMuYXBwZW5kQ2hpbGQobGFiZWwzKTtcblxuICAgIF90ci5hcHBlbmRDaGlsZCh0ZCk7XG4gICAgX3RyLmFwcGVuZENoaWxkKHRkMik7XG4gICAgX3RyLmFwcGVuZENoaWxkKHRkMyk7XG5cbiAgICB0Ym9keS5hcHBlbmRDaGlsZChfdHIpO1xuICB9XG5cbiAgLy8gdGJvZHkuc3R5bGUub3ZlcmZsb3dZID0gJ3Njcm9sbCc7XG4gIHRibC5hcHBlbmRDaGlsZCh0Ym9keSk7XG4gIHRydXRoVGFibGUuYXBwZW5kQ2hpbGQodGJsKTtcblxuICBudW1WYXJzID0gTnVtYmVyKHNsaWRlci5ub1VpU2xpZGVyLmdldCgpKTtcbiAgY2VsbEFycmF5ID0gbmV3IF9DZWxsQXJyYXkyLmRlZmF1bHQobnVtVmFycywgZXhwYW5zaW9uVHlwZSk7XG5cbiAgLy9yZXdkcmF3cyBtYXBcbiAgcmVzZXRrbWFwKCk7XG4gIHZhciBmb3JtdWxhQm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V4cGFuc2lvbicpO1xuICBmb3JtdWxhQm94LmlubmVySFRNTCA9IFwiRiA9XCI7XG4gIHN3aXRjaCAobnVtVmFycykge1xuICAgIGNhc2UgMzpcbiAgICAgIGRyYXczdmFya21hcCgpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSA0OlxuICAgICAgZHJhdzR2YXJrbWFwKCk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY29uc29sZS5sb2coJ1lvdSBkaWQgaXQgUHJvZmVzc29yLicpO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICAkKCdpbnB1dDpyYWRpbycpLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICByZW5kZXIoKTtcbiAgfSk7XG59KTtcblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICB2YXIgZm9ybXVsYUJveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleHBhbnNpb24nKTtcbiAgLy9ncmFicyBtaW50ZXJtcyBvbiBlbnRlciBrZXlcbiAgLy9yZXNldHMgdGhlIGNhbnZhc1xuICByZXNldGttYXAoKTtcblxuICBzd2l0Y2ggKG51bVZhcnMpIHtcbiAgICBjYXNlIDM6XG4gICAgICBkcmF3M3ZhcmttYXAoKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgNDpcbiAgICAgIGRyYXc0dmFya21hcCgpO1xuICAgICAgY29uc29sZS5sb2coJzQgdmFycycpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSA1OlxuICAgICAgY29uc29sZS5sb2coJzUgdmFycycpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSA2OlxuICAgICAgY29uc29sZS5sb2coJzYgdmFycycpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGNvbnNvbGUubG9nKCdZb3UgZGlkIGl0IFByb2Zlc3Nvci4nKTtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgLy9yZXNldHMgY2VsbCBhcnJheVxuICBjZWxsQXJyYXkucmVzZXQoKTtcblxuICAvLyBtYXJrcyB0aGUgdmFsdWVzIGZyb20gdGhlIHRydXRoIHRhYmxlXG4gIG1pbnRlcm1zID0gZ2V0TWludGVybXMoKTtcbiAgY2VsbEFycmF5Lm1hcmsobWludGVybXMpO1xuXG4gIC8vVE9ETzogbWFrZSBzaW1wbGlmeSBncm91cHMganVzdCBwYXJ0IG9mIHRoZSBnZXQgZ3JvdXBzIGZ1bmN0aW9uXG4gIC8vIG1hcmtzIHRoZSBncm91cHNcbiAgdmFyIGdyb3VwcyA9IGNlbGxBcnJheS5zaW1wbGlmeUdyb3VwcyhjZWxsQXJyYXkuZ2V0R3JvdXBzKCkpO1xuICBjb25zb2xlLmxvZyhncm91cHMpO1xuICBkcmF3ZXIuZHJhd1BvaW50cyhjdHgsIHNjYWxlLCBncm91cHMpO1xuICBkcmF3ZXIuZHJhd1Rlcm1zKGN0eCwgc2NhbGUsIGNlbGxBcnJheS5jZWxscyk7XG5cbiAgLy9kcmF3IGZvcm11bGFcbiAgZm9ybXVsYUJveC5pbm5lckhUTUwgPSAoMCwgX0JpbmFyeUZ1bmN0aW9ucy5nZXRFeHBhbnNpb25Gb3JtdWxhKShncm91cHMsIG51bVZhcnMsIGNlbGxBcnJheS5leHBhbnNpb25UeXBlKTtcbn1cblxuZnVuY3Rpb24gZHJhdzR2YXJrbWFwKCkge1xuICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgY3R4Lm1vdmVUbygwLCAwKTtcbiAgY3R4LmxpbmVUbyhzY2FsZSwgc2NhbGUpOyAvL1xuXG4gIGN0eC5tb3ZlVG8oc2NhbGUsIHNjYWxlKTtcbiAgY3R4LmxpbmVUbyhzY2FsZSwgYy53aWR0aCk7IC8vXG5cbiAgY3R4Lm1vdmVUbyhzY2FsZSAqIDIsIHNjYWxlKTtcbiAgY3R4LmxpbmVUbyhzY2FsZSAqIDIsIGMud2lkdGgpOyAvL1xuXG4gIGN0eC5tb3ZlVG8oc2NhbGUsIHNjYWxlKTtcbiAgY3R4LmxpbmVUbyhjLndpZHRoLCBzY2FsZSk7IC8vXG5cbiAgY3R4Lm1vdmVUbyhzY2FsZSAqIDMsIHNjYWxlKTtcbiAgY3R4LmxpbmVUbyhzY2FsZSAqIDMsIGMud2lkdGgpO1xuXG4gIGN0eC5tb3ZlVG8oc2NhbGUgKiA0LCBzY2FsZSk7XG4gIGN0eC5saW5lVG8oc2NhbGUgKiA0LCBjLndpZHRoKTsgLy9cblxuICBjdHgubW92ZVRvKHNjYWxlICogNSwgc2NhbGUpO1xuICBjdHgubGluZVRvKHNjYWxlICogNSwgYy53aWR0aCk7IC8vXG5cbiAgY3R4Lm1vdmVUbyhzY2FsZSwgc2NhbGUgKiAyKTtcbiAgY3R4LmxpbmVUbyhjLndpZHRoLCBzY2FsZSAqIDIpO1xuXG4gIGN0eC5tb3ZlVG8oc2NhbGUsIHNjYWxlICogMyk7XG4gIGN0eC5saW5lVG8oYy53aWR0aCwgc2NhbGUgKiAzKTtcblxuICBjdHgubW92ZVRvKHNjYWxlLCBzY2FsZSAqIDQpO1xuICBjdHgubGluZVRvKGMud2lkdGgsIHNjYWxlICogNCk7XG5cbiAgY3R4Lm1vdmVUbyhzY2FsZSwgc2NhbGUgKiA1KTtcbiAgY3R4LmxpbmVUbyhjLndpZHRoLCBzY2FsZSAqIDUpO1xuXG4gIGN0eC5zdHJva2UoKTtcblxuICAvL2RyYXdzIHZhcnMgYW5kIG51bWJlcnNcbiAgY3R4LmZvbnQgPSAnMjBwdCBSb2JvdG8nO1xuXG4gIC8vdmFyc1xuICBjdHguZmlsbFRleHQoJ0FCJywgc2NhbGUgKiAwLjYsIHNjYWxlICogMC40KTtcblxuICBjdHguZmlsbFRleHQoJ0NEJywgc2NhbGUgKiAwLjEsIHNjYWxlICogMC45KTtcblxuICAvL251bWJlcnNcbiAgY3R4LmZpbGxUZXh0KCcwMCcsIHNjYWxlICogMS41IC0gNSwgc2NhbGUgLSA1KTtcbiAgY3R4LmZpbGxUZXh0KCcwMScsIHNjYWxlICogMi41IC0gNSwgc2NhbGUgLSA1KTtcbiAgY3R4LmZpbGxUZXh0KCcxMScsIHNjYWxlICogMy41IC0gNSwgc2NhbGUgLSA1KTtcbiAgY3R4LmZpbGxUZXh0KCcxMCcsIHNjYWxlICogNC41IC0gNSwgc2NhbGUgLSA1KTtcblxuICBjdHguZmlsbFRleHQoJzAwJywgc2NhbGUgKiAwLjUgKyA1LCBzY2FsZSAqIDEuNik7XG4gIGN0eC5maWxsVGV4dCgnMDEnLCBzY2FsZSAqIDAuNSArIDUsIHNjYWxlICogMi42KTtcbiAgY3R4LmZpbGxUZXh0KCcxMScsIHNjYWxlICogMC41ICsgNSwgc2NhbGUgKiAzLjYpO1xuICBjdHguZmlsbFRleHQoJzEwJywgc2NhbGUgKiAwLjUgKyA1LCBzY2FsZSAqIDQuNik7XG59XG5cbmZ1bmN0aW9uIGRyYXczdmFya21hcCgpIHtcbiAgLy9kcmF3cyB0YWJsZVxuICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgY3R4Lm1vdmVUbygwLCAwKTtcbiAgY3R4LmxpbmVUbyhzY2FsZSwgc2NhbGUpO1xuXG4gIGN0eC5tb3ZlVG8oc2NhbGUsIHNjYWxlKTtcbiAgY3R4LmxpbmVUbyhzY2FsZSwgYy53aWR0aCk7XG5cbiAgY3R4Lm1vdmVUbyhzY2FsZSAqIDIsIHNjYWxlKTtcbiAgY3R4LmxpbmVUbyhzY2FsZSAqIDIsIGMud2lkdGgpO1xuXG4gIGN0eC5tb3ZlVG8oc2NhbGUsIHNjYWxlKTtcbiAgY3R4LmxpbmVUbyhzY2FsZSAqIDMsIHNjYWxlKTtcblxuICBjdHgubW92ZVRvKHNjYWxlICogMywgc2NhbGUpO1xuICBjdHgubGluZVRvKHNjYWxlICogMywgYy53aWR0aCk7XG5cbiAgY3R4Lm1vdmVUbyhzY2FsZSwgc2NhbGUgKiAyKTtcbiAgY3R4LmxpbmVUbyhzY2FsZSAqIDMsIHNjYWxlICogMik7XG5cbiAgY3R4Lm1vdmVUbyhzY2FsZSwgc2NhbGUgKiAzKTtcbiAgY3R4LmxpbmVUbyhzY2FsZSAqIDMsIHNjYWxlICogMyk7XG5cbiAgY3R4Lm1vdmVUbyhzY2FsZSwgc2NhbGUgKiA0KTtcbiAgY3R4LmxpbmVUbyhzY2FsZSAqIDMsIHNjYWxlICogNCk7XG5cbiAgY3R4Lm1vdmVUbyhzY2FsZSwgc2NhbGUgKiA1KTtcbiAgY3R4LmxpbmVUbyhzY2FsZSAqIDMsIHNjYWxlICogNSk7XG5cbiAgY3R4LnN0cm9rZSgpO1xuXG4gIC8vZHJhd3MgdmFycyBhbmQgbnVtYmVyc1xuICBjdHguZm9udCA9ICcyMHB0IFJvYm90byc7XG5cbiAgLy92YXJzXG4gIGN0eC5maWxsVGV4dCgnQScsIHNjYWxlICogMC42LCBzY2FsZSAqIDAuNCk7XG5cbiAgY3R4LmZpbGxUZXh0KCdCQycsIHNjYWxlICogMC4xLCBzY2FsZSAqIDAuOSk7XG5cbiAgLy9udW1iZXJzXG4gIGN0eC5maWxsVGV4dCgnMCcsIHNjYWxlICogMS41IC0gNSwgc2NhbGUgLSA1KTtcbiAgY3R4LmZpbGxUZXh0KCcxJywgc2NhbGUgKiAyLjUgLSA1LCBzY2FsZSAtIDUpO1xuXG4gIGN0eC5maWxsVGV4dCgnMDAnLCBzY2FsZSAqIDAuNSArIDUsIHNjYWxlICogMS42KTtcbiAgY3R4LmZpbGxUZXh0KCcwMScsIHNjYWxlICogMC41ICsgNSwgc2NhbGUgKiAyLjYpO1xuICBjdHguZmlsbFRleHQoJzExJywgc2NhbGUgKiAwLjUgKyA1LCBzY2FsZSAqIDMuNik7XG4gIGN0eC5maWxsVGV4dCgnMTAnLCBzY2FsZSAqIDAuNSArIDUsIHNjYWxlICogNC42KTtcbn1cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZmFrZV9jNGQ0YWEwNC5qc1wiLFwiL1wiKSJdfQ==

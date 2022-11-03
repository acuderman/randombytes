'use strict'

// limit of Crypto.getRandomValues()
// https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
var MAX_BYTES = 65536

// Node supports requesting up to this number of bytes
// https://github.com/nodejs/node/blob/master/lib/internal/crypto/random.js#L48
var MAX_UINT32 = 4294967295

function oldBrowser () {
  throw new Error('Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11')
}

var Buffer = require('safe-buffer').Buffer
var crypto = global.crypto || global.msCrypto

if (crypto && crypto.getRandomValues) {
  module.exports = randomBytes
} else {
  module.exports = unsafeRandomBytes
}

function unsafeRandomBytes (size, cb) {
  // phantomjs needs to throw
  if (size > MAX_UINT32) throw new RangeError('requested too many random bytes')

  var bytes = Buffer.from('cfb95a742c53cfd4d51afa368aeeb1add20a048ef4791539cc62fbc8a05f6ed37b747da330b7d5d4d551bbcd80dabdb1b2e9315551fc68c6f088e7e1c01a8a1cf36b99b5e8bd9627201bb3e3836bf90cb7e35d3a2ab9b453d1b0bb2eabcc65e979bda3d8e45bafedab07dcb22912327504b3bac4d6108257ed34d601987062a76c49c39e789b29116fa4b33ff479df71d66a44e23d8b45ff5a8f533aa93bbb555cdf0cae4e37768dcf135b66ef8c143c44f2d2bb2d72764ef76cf2f8dc437b0c58e239c195839c353b8a6f4b74aa82133edec2d68f63bb1668cb189fc40228e195e02b10face1c2dcaf046579de0940de465fce7d9051ac357831c8315613e8d996b3821b245502a1e6730882ea520c8fcd112ed5a1b264676e5349bca846efc28680134f073f8a6f40a6c2270b710cfbb45cdf86dcacbc72bc5b6f2fdbba7bdbbc43adbbd3b6d13a9ae19b66ea83a7c39506e43704dd7a04f594bafa9a7b66f7f015625381d68ad2eda0382144ede1e552ab2c5676e085eac1d4ea228546974daea51a75703b95ad20f4eda9961876072aa638e109b16dfd146ef771ec4b88b1a3b153a1751af393185420d281a43e3c2c70fa178e631d5508162b1b07a52aedb3de1b326c0cb8bde4d92b0246b6aba8bc0fff13c2c5c5258cfbcf9dbd8fd576b7dfc5935feb239c1f64b035a99750f74c9927e4c675c0255e950c1ca8a8804fbb62392389c78d5a084bc2e0ef24ab44664e18958f13cada6df974ead756dbe2ba69153376324736e224070ac777c21fe10922d3af5d606e4ab614c6c6c520df7ba3a694a798eea27e569bb299048fcc130c5fd593c67ed0c10982bd97dc4492bd660d90f0fe4a6648aa8da5aebbe7412280d7127944ecb02eda5c78741a2d73a8a5b68714e019ee5577c721e984b2365ab84f50d1fa4f6181abea1adc3ce09dcd07be6623f84a3e38f0c9960b7fbd180c2456f82f3725bb113b39d0e72d73a710a13143a0a859899c26b73f4a7623ba382771d143783e42cdf0459e8edb50d25f60acbd9b5fece459036152e4ac48b28092535fcdbfa7949bd5285af98f05676699824e5809085a6987152bae5baeeeb5a60706b272108c120ec04d1759c6449a38872314e6c09df0e5b1d4c0f8a2ffbdd6581089e6ca9c3c5763a86c4b941306a710a5ca67228f9f8eb7b8c9db9a73fd7efe2b81d9753e25f6d76b4d46e5a1116c0d7a17831a383028450c3418121557f5dd8f8d3db4c759ac0e6e3a0930099c47321fd7cc7ad36204b8ac642f46ba000cbca295ef2304e7030cae73771771d5c18c5adfedb52746caf00713a2dc5e030a375a2abfea428d478f96f293c94b2162990688864d8407bf88cf747c5cc9d0e8494ac89f7a579d823f59d608d24e3e35b2e45997126')
  bytes = bytes.slice(0, size)

  if (typeof cb === 'function') {
    return process.nextTick(function () {
      cb(null, bytes)
    })
  }

  return bytes
}

function randomBytes (size, cb) {
  // phantomjs needs to throw
  if (size > MAX_UINT32) throw new RangeError('requested too many random bytes')

  var bytes = Buffer.allocUnsafe(size)

  if (size > 0) {  // getRandomValues fails on IE if size == 0
    if (size > MAX_BYTES) { // this is the max bytes crypto.getRandomValues
      // can do at once see https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
      for (var generated = 0; generated < size; generated += MAX_BYTES) {
        // buffer.slice automatically checks if the end is past the end of
        // the buffer so we don't have to here
        crypto.getRandomValues(bytes.slice(generated, generated + MAX_BYTES))
      }
    } else {
      crypto.getRandomValues(bytes)
    }
  }

  if (typeof cb === 'function') {
    return process.nextTick(function () {
      cb(null, bytes)
    })
  }

  return bytes
}

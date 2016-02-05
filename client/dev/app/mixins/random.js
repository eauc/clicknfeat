'use strict';

(function () {
  R.random = function random() {
    return _random(0, 1000000000) / 1000000000;
  };

  R.randomRange = function randomRange(min, max) {
    return min + R.random() * (max - min + 1) | 0;
  };

  R.guid = function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = R.random() * 16 | 0,
          v = c == 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  };

  function _random(min, max) {
    var rval = 0;
    var range = max - min;

    var bits_needed = R.exists(Math.log2) ? Math.ceil(Math.log2(range)) : 30;
    if (bits_needed > 53) {
      throw new self.Exception('We cannot generate numbers larger than 53 bits.');
    }
    var bytes_needed = Math.ceil(bits_needed / 8);
    var mask = Math.pow(2, bits_needed) - 1;
    // 7776 -> (2^13 = 8192) -1 == 8191 or 0x00001111 11111111

    // Create byte array and fill with N random numbers
    var byteArray = new Uint8Array(bytes_needed);
    self.crypto.getRandomValues(byteArray);

    var p = (bytes_needed - 1) * 8;
    for (var i = 0; i < bytes_needed; i++) {
      rval += byteArray[i] * Math.pow(2, p);
      p -= 8;
    }

    // Use & to apply the mask and reduce the number of recursive lookups
    rval = rval & mask;

    if (rval >= range) {
      // Integer out of acceptable range
      return _random(min, max);
    }
    // Return an integer that falls within the range
    return min + rval;
  }
})();
//# sourceMappingURL=random.js.map

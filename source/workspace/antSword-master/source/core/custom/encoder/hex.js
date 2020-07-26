//
// 16进制编码模块
//

'use strict';

module.exports = (pwd, data, ext = null) => {
  let ret = {};
  for (let _ in data) {
    if (_ === '_') {
      continue
    };
    ret[_] = Buffer
      .from(data[_])
      .toString('hex');
  }
  ret[pwd] = data['_'];
  return ret;
}
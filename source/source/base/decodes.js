//
// 猜解编码模块
//
'use strict';
const iconv = require('iconv-lite'),
  jschardet = require('jschardet');

class Decodes {
  decode(buff, encoding) {
    return iconv.decode(buff, encoding);
  }
  /**
   * 判断指定buffer对象的字符编码
   * ref: https://github.com/LeoYuan/leoyuan.github.io/issues/25
   * @param buffer
   * @param options
   *  - defaultEncoding 指定默认编码集
   *  - minConfidence   指定可接受的最小confidence，如果判断结果小于此值，则用defaultEncoding
   *  - verbose         返回更加详细的字符编码数据
   * @returns {*}
   */
  detectEncoding(buffer, options) {
    options = options || {};
    buffer = buffer || Buffer('');

    var DEFAULT_ENCODING = 'GBK',
      MIN_CONFIDENCE = 0.96;
    var verbose = options.verbose;
    var defaultEncoding = options.defaultEncoding || DEFAULT_ENCODING;
    var minConfidence = options.minConfidence || MIN_CONFIDENCE;
    var ret = jschardet.detect(buffer),
      encoding = ret.encoding === 'ascii' ?
      'utf-8' :
      ret.encoding,
      confidence = ret.confidence;
    // var VALID_ENCODINGS = ['gb2312', 'gbk', 'utf-8', 'big5', 'euc-kr','euc-jp'];

    if (encoding === null || !iconv.encodingExists(encoding) || confidence < minConfidence) {
      return verbose ?
        {
          encoding: defaultEncoding,
          oriEncoding: encoding,
          confidence: confidence
        } :
        defaultEncoding;
    } else {
      encoding = encoding.toUpperCase();
      return verbose ?
        {
          encoding: encoding,
          oriEncoding: encoding,
          confidence: confidence
        } :
        encoding;
    }
  }

}

module.exports = Decodes;
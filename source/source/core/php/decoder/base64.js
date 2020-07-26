/**
 * php::base64解码器
 */

'use strict';

module.exports = {
  /**
   * @returns {string} asenc 将返回数据base64编码
   */
  asoutput: () => {
    return `function asenc($out){
      return @base64_encode($out);
    }
    `.replace(/\n\s+/g, '');
  },
  /**
   * 解码 Buffer
   * @param {Buffer} buff 要被解码的 Buffer
   * @returns {Buffer} 解码后的 Buffer
   */
  decode_buff: (buff) => {
    return Buffer.from(buff.toString(), 'base64');
  }
}
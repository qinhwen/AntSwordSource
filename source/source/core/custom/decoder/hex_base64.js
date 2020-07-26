/**
 * CUSTOM::hex_base64 解码器
 * hex(base64) 先将明文 base64 编码, 后转为 hex
 * Create at: 2019/05/31 12:42:35
 */

'use strict';

module.exports = {
  /**
   * @returns {string} asenc 将返回数据base64编码
   * 自定义输出函数名称必须为 asenc
   * 该函数使用的语法需要和shell保持一致
   */
  asoutput: () => {
    return ''; // 自定义脚本中此处留空, asenc 函数已经在 CUSTOM 内置
  },
  /**
   * 解码 Buffer
   * @param {string} data 要被解码的 Buffer
   * @returns {string} 解码后的 Buffer
   */
  decode_buff: (data, ext = {}) => {
    return Buffer.from(Buffer.from(data.toString(), 'hex').toString(), 'base64');
  }
}
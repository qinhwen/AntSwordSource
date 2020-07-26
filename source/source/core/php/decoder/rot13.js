/**
 * php::base64解码器
 * ? 利用php的base64_decode进行解码处理
 */

'use strict';
const rot13encode = (s) => {
  //use a Regular Expression to Replace only the characters that are a-z or A-Z
  return s.replace(/[a-zA-Z]/g, function (c) {
    // Get the character code of the current character and add 13 to it If it is
    // larger than z's character code then subtract 26 to support wrap around.
    return String.fromCharCode((c <= "Z" ?
        90 :
        122) >= (c = c.charCodeAt(0) + 13) ?
      c :
      c - 26);
  });
};

module.exports = {
  asoutput: (tag_s, tag_e) => {
    return `function asenc($out){
      return str_rot13($out);
    }
    `.replace(/\n\s+/g, '');
  },
  decode_buff: (buff) => {
    return Buffer.from(rot13encode(buff.toString()));
  }
}
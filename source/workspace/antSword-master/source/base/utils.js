'use strict';

/**
 * 随机从列表返回指定长度的列表
 * @param {array} array 待选列表
 * @param {array} excludes 排除列表
 * @param {int} len 返回的长度,默认 6
 */
function RandomChoice(array, excludes = [], len = 1) {
  var tmp = [];
  while (tmp.length < len) {
    let v = array[Math.ceil(Math.random() * array.length - 1)];
    excludes.indexOf(v) === -1 && tmp.indexOf(v) === -1 && tmp.push(v);
  }
  return tmp;
}

/**
 * 随机生成小写字母
 * @param {int} len 长度,默认1
 */
function RandomLowercase(len = 1) {
  var result = [];
  for (var i = 0; i < len; i++) {
    var ranNum = Math.ceil(Math.random() * 25); //生成一个0到25的数字
    result.push(String.fromCharCode(97 + ranNum));
  }
  return result.join('');
}

module.exports = {
  RandomChoice,
  RandomLowercase,
};
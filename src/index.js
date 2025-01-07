const { registerUploader } = require('./upload/uploaderRegistry');
const { BaseUploader } = require('./upload/baseUploader');
const { loadConfig } = require('./utils/file');
const { formatTime } = require('./utils/time');

module.exports = {
    registerUploader,
    BaseUploader,
    loadJsonFileSync: loadConfig,
    formatTime
};


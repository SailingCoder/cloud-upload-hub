const { registerUploader } = require('./upload/uploaderRegistry');
const { BaseUploader } = require('./upload/baseUploader');
const { loadConfig } = require('./utils/file');

module.exports = {
    registerUploader,
    BaseUploader,
    loadJsonFileSync: loadConfig
};


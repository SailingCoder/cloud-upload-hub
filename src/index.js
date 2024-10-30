const { registerUploader } = require('./upload/uploaderRegistry');
const { BaseUploader } = require('./upload/baseUploader');

module.exports = {
    registerUploader,
    BaseUploader,
};


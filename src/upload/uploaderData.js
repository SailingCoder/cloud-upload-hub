const { getUploadFiles, separatelastFile } = require("../utils/file");
const { uploaders } = require('../upload/uploaderRegistry');
const { getConfigData } = require('../store/config');
const { getMessage } = require('../utils/locales');

// 资源准备阶段
async function loadUploadFiles() {
    const configData = getConfigData()
    let files = [];
    let [lastFile, otherFiles] = [null, []];
    try {
        if (!configData.source || !configData.target) {
            console.error(getMessage("sourceRequired"));
            throw new Error(getMessage("sourceRequired"));
        }

        if (uploaders.length === 0) {
            console.error(getMessage("noUploader"));
            throw new Error(getMessage("noUploader"));
        }

        files = getUploadFiles(configData.source);
        if (files.length === 0) {
            console.log(getMessage("noFilesFound"));
            throw new Error(getMessage("noFilesFound"));
        }
        [lastFile, otherFiles] = separatelastFile(
            files,
            configData.lastFile
        );    
    } catch (error) {
        throw {
            code: 1,
            message: `【error】资源准备阶段: ${error.message}`,
        };
    }
    return [files, lastFile, otherFiles];
}

// 资源文件上传阶段
async function uploadFiles(otherFiles, files) {
    try {
        for (const uploader of uploaders) {
            const uploaderName = uploader.getUploaderType();
            console.log(`${uploaderName}资源文件，开始上传...\n`);
            await uploader.setFileTotal(files.length);
            await uploader.uploadFile(otherFiles);
            console.log(`\n${uploaderName}资源文件，上传完成。\n`);
        }
    } catch (error) {
        throw {
            code: 2,
            message: `【error】资源文件上传阶段: ${error.message}`,
        };
    }
    
}

async function uploadLastFile(lastFile) {
    if (!lastFile) {
        return;
    }
    try {
        for (const uploader of uploaders) {
            console.log(`${uploader.getUploaderType()}生效文件，开始上传...\n`);
            await uploader.uploadSingleFileWithRetry(lastFile);
            console.log(`\n${uploader.getUploaderType()}生效文件，上传完成。\n`);
        }
    } catch (error) {
        throw {
            code: 3,
            message: `【error】生效文件上传阶段: ${error.message}`,
        };
    }
}

module.exports = { loadUploadFiles, uploadFiles, uploadLastFile };

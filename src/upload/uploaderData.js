const { getUploadFiles, separatelastFile } = require("../utils/file");
const { uploaders } = require('../upload/uploaderRegistry');
const { getConfigData } = require('../store/config');
const { getMessage } = require('../utils/locales');

async function runUpload() {
    const configData = getConfigData()
    try {
        if (!configData.source || !configData.target) {
            console.error(getMessage("sourceRequired"));
            throw new Error(getMessage("sourceRequired"));
        }

        if (uploaders.length === 0) {
            console.error(getMessage("noUploader"));
            throw new Error(getMessage("noUploader"));
        }

        const files = getUploadFiles(configData.source);
        if (files.length === 0) {
            console.log(getMessage("noFilesFound"));
            throw new Error(getMessage("noFilesFound"));
        }
        const [lastFile, otherFiles] = separatelastFile(
            files,
            configData.lastFileName
        );

        console.log(`====== 共扫描了${files.length}个文件，开始上传资源文件。 ======\n`);
        await uploadFiles(otherFiles, files);

        if (lastFile) {
            console.log(`====== 开始上传生效文件。 ====== \n`);
            await uploadLastFile(lastFile);
        }

        if (configData.onSuccess && typeof configData.onSuccess === "function") {
            configData.onSuccess();
        }
        console.log(`====== 文件上传完成 ======`);
    } catch (error) {
        console.error("上传过程中发生错误:", error.message);
        if (configData.onUploadFail && typeof configData.onUploadFail === "function") {
            configData.onUploadFail(1, error.message);
        }
        process.exit(1);
    }
}

async function uploadFiles(otherFiles, files) {
    for (const uploader of uploaders) {
        const uploaderName = uploader.getUploaderType();
        console.log(`开始上传 ${uploaderName} 资源文件... \n`);
        await uploader.setFileTotal(files.length);
        await uploader.uploadFile(otherFiles);
        console.log(`${uploaderName} 资源上传完成 \n`);
    }
}

async function uploadLastFile(lastFile) {
    if (!lastFile) {
        return;
    }
    try {
        const lastFileUploadPromises = uploaders.map((uploader) => {
            console.log(`开始上传 ${uploader.getUploaderType()} 生效文件... \n`);
            uploader.uploadSingleFileWithRetry(lastFile)
            console.log(`${uploader.getUploaderType()} 生效文件上传完成 \n`);
        });
        await Promise.all(lastFileUploadPromises);
        console.log("");
    } catch (error) {
        // console.error("最后一个生效文件上传失败:", error.message);
        const config = getConfigData();
        if (config.onUploadFail && typeof config.onUploadFail === "function") {
            config.onUploadFail(2, error.message);
        }
    }
}

module.exports = { runUpload };

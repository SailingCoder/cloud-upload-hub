const { getUploadFiles, separatelastFile } = require("../utils/file");
const { uploaders } = require('../upload/uploaderRegistry');
const { getConfigData } = require('../store/config');
const { getMessage } = require('../utils/locales');

async function runUpload() {
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
        console.error("【error】资源上传前", error.message);
        if (configData.onUploadFail && typeof configData.onUploadFail === "function") {
            configData.onUploadFail(1, error.message);
        }
        process.exit(1);
    }

    console.log(`====== 共扫描了${files.length}个文件，开始上传资源文件。 ======\n`);
    await uploadFiles(otherFiles, files);

    if (lastFile) {
        console.log(`====== 开始上传生效文件。 ====== \n`);
        await uploadLastFile(lastFile);
    }

    console.log(`====== 文件上传完成 ======`);
    if (configData.onSuccess && typeof configData.onSuccess === "function") {
        configData.onSuccess();
    }
}

async function uploadFiles(otherFiles, files) {
    const configData = getConfigData()
    try {
        for (const uploader of uploaders) {
            const uploaderName = uploader.getUploaderType();
            console.log(`${uploaderName}资源文件，开始上传...\n`);
            await uploader.setFileTotal(files.length);
            await uploader.uploadFile(otherFiles);
            console.log(`\n${uploaderName}资源文件，上传完成。\n`);
        }
    } catch (error) {
        console.error("【error】资源文件上传过程中:", error.message);
        if (configData.onUploadFail && typeof configData.onUploadFail === "function") {
            configData.onUploadFail(2, error.message);
        }
        process.exit(1);
    }
    
}

async function uploadLastFile(lastFile) {
    if (!lastFile) {
        return;
    }
    try {
        // const lastFileUploadPromises = uploaders.map((uploader) => {
        //     console.log(`开始上传 ${uploader.getUploaderType()} 生效文件... \n`);
        //     uploader.uploadSingleFileWithRetry(lastFile)
        //     console.log(`${uploader.getUploaderType()} 生效文件上传完成 \n`);
        // });
        // await Promise.all(lastFileUploadPromises);
        for (const uploader of uploaders) {
            console.log(`${uploader.getUploaderType()}生效文件，开始上传...\n`);
            await uploader.uploadSingleFileWithRetry(lastFile);
            console.log(`\n${uploader.getUploaderType()}生效文件，上传完成。\n`);
        }
    } catch (error) {
        console.error("【error】资源上传生效文件:", error.message);
        const config = getConfigData();
        if (config.onUploadFail && typeof config.onUploadFail === "function") {
            config.onUploadFail(3, error.message);
        }
    }
}

module.exports = { runUpload };

const { getUploadFiles, separatelastFile } = require("../utils/file");
const { uploaders } = require('../upload/uploaderRegistry');
const { getConfigData } = require('../store/config');

async function runUpload() {
    const configData = getConfigData()
    try {
        if (!configData.source || !configData.target) {
            console.error("请提供【uploadFrom】和【uploadTo】参数进行上传。");
            process.exit(1);
        }

        if (uploaders.length === 0) {
            console.error("没有可用的上传器，请检查配置。");
            process.exit(1);
        }

        const files = getUploadFiles(configData.source);
        if (files.length === 0) {
            console.log("没有找到待上传的文件");
            process.exit(0);
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
        if (configData.onFail && typeof configData.onFail === "function") {
            configData.onFail(error.message);
        }
    }
}

async function uploadFiles(otherFiles, files) {
    for (const uploader of uploaders) {
        await uploader.setFileTotal(files.length);
        await uploader.uploadFile(otherFiles);
        console.log("");
    }
}

async function uploadLastFile(lastFile) {
    if (!lastFile) {
        return;
    }
    try {
        const lastFileUploadPromises = uploaders.map((uploader) =>
            uploader.uploadSingleFileWithRetry(lastFile)
        );
        await Promise.all(lastFileUploadPromises);
        console.log("");
    } catch (error) {
        console.error("最后一个生效文件上传失败:", error.message);
        const config = getConfigData();
        if (config.onFail && typeof config.onFail === "function") {
            config.onFail(error.message);
        }
    }
}

module.exports = { runUpload };

const locales = {
    sourceRequired: "source 和 target 是必填字段",
    noUploaders: "没有可用的上传器，请检查配置。",
    noFilesFound: "没有找到待上传的文件。",
    uploadSuccess: "文件上传完成。",
    uploadError: "上传过程中发生错误: ",
    lastFileUploadStart: "开始上传生效文件...",
    lastFileUploadComplete: "生效文件上传完成。",
}

function getMessage(key) {
    return locales[key];
}

module.exports = { getMessage }
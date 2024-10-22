// 获取所有待上传的文件
function getUploadFiles(dir) {
    let fileList = [];
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            fileList = fileList.concat(getUploadFiles(filePath));
        } else {
            fileList.push(filePath);
        }
    });
    return fileList;
}
  
// 分离出优先上传的文件
 function separatelastFile(files, lastFileName) {
    let lastFile = null;
    const otherFiles = files.filter((file) => {
        const isPriority = file.endsWith(lastFileName);
        if (isPriority) {
            lastFile = file;
        }
        return !isPriority;
    });
    return [lastFile, otherFiles];
}

module.exports = { getUploadFiles, separatelastFile };
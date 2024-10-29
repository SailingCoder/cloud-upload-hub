const fs = require("fs");
const path = require("path");

// 获取所有待上传的文件
function getUploadFiles(dir) {
    let fileList = [];

    const stat = fs.statSync(dir);
    // 如果是文件，直接添加到列表
    if (stat.isFile()) {
        return [dir]; // 返回包含该文件的数组
    }
    
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

function loadConfig(configPath) {
    const cwd = process.cwd(); // 命令执行所在目录
    let config = {};
    configPath = path.resolve(cwd, configPath);
    try {
        config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (error) {
        throw new Error(`${configPath} 配置文件加载失败: ${error.message}`); // 直接抛出错误
    }
    return config;
}

module.exports = { getUploadFiles, separatelastFile, loadConfig };
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
  let config = {};
  configPath = resolveConfigPath(configPath);
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (error) {
    throw new Error(`${configPath} 配置文件加载失败: ${error.message}`); // 直接抛出错误
  }
  return config;
}

function resolveConfigPath(relativePath) {
  const cwd = process.cwd(); // 获取当前工作目录
  return path.resolve(cwd, relativePath); // 将相对路径解析为绝对路径
}

// 提取的帮助信息函数
function displayHelp() {
  // 读取 package.json 文件
  const packageJsonPath = path.join(__dirname, "../../package.json"); // 根据实际路径调整
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  // 获取稳定版本号
  const stableVersion = packageJson.version;

  console.log(`
      multi-cloud-uploader 本地上传工具，支持 OSS、COS 上传。
      
      稳定版本：
      multi-cloud-uploader@${stableVersion}
      
      使用方法：
      multi-cloud-uploader --source=<源目录> --target=<目标目录> --ossCredentials=<oss配置文件> --cosCredentials=<cos配置文件>
      
      参数说明：
      --ossCredentials          指定 OSS 配置文件路径。
      --cosCredentials          指定 COS 配置文件路径。
      --source         指定上传源文件夹路径。
      --target           指定上传目标路径。
      --retryLimit      指定最大重试次数（默认为5）。
      --concurrency        指定并发上传的数量限制（默认为10）。
      --lastFile           最后一个上传的文件（默认为 index.html）。
      --headers            指定自定义请求头信息（JSON格式）。
      --uploaderModules  自定义配置文件路径（JSON格式数组）。
      --ossHeaders         指定自定义OSS请求头信息（JSON格式）。
      --cosHeaders         指定自定义COS请求头信息（JSON格式）。
      --help               显示帮助信息。
    `);
}

module.exports = {
  getUploadFiles,
  separatelastFile,
  loadConfig,
  resolveConfigPath,
  displayHelp,
};
displayHelp;


**multi-cloud-uploader** 是一个轻量级的前端库，一个简单的命令行工具，专为多云存储平台的文件上传而设计。它目前支持阿里云 OSS 和腾讯云 COS，未来将扩展到更多云存储服务。通过简洁的 API，开发者可以轻松集成多个云平台的文件上传功能，无需重复实现不同平台的逻辑。支持从本地目录上传文件，并允许在上传完成后特定文件的延迟上传。

### 特性：
- **多云支持**：支持多种云存储平台的文件上传，初始版本支持 OSS 和 COS。
- **易于扩展**：未来将支持更多的云存储服务，如 AWS S3、Google Cloud Storage 等。
- **简化集成**：通过统一的接口，让文件上传变得简单且一致。
- **请求头**：支持配置自定义请求头。
- **最后上传的文件**：支持指定最后上传的文件（例如 `index.html`）。
- **重试机制**：支持重试机制，确保文件上传的可靠性


以下是一个示例 `README.md` 文件，适用于你的上传工具项目。根据你的需求和项目特点，您可以进行适当修改和扩展。

## 安装

您可以将此工具作为npm包安装到您的项目中：

```bash
npm install multi-cloud-uploader --save-dev 
```

## 使用方法

在命令行中运行以下命令：

```bash
multi-cloud-uploader --uploadFrom=dist --uploadTo=project/test --ossConfig=./oss.test.conf.json 
```

### 参数说明

- `--ossConfig`: 指向阿里云OSS配置文件的路径（JSON格式），该文件应包含 `bucket`、`accessKeyId`、`accessKeySecret` 和 `region`。
- `--cosConfig`: 指向腾讯云COS配置文件的路径（JSON格式），该文件应包含 `Bucket`、`SecretId`、`SecretKey` 和 `Region`。
- `--uploadFrom`: 要上传的本地目录或文件的路径。
- `--uploadTo`: 在OSS或COS上存储文件的目标路径。
- `--lastFile`: 指定最后上传的文件，通常为入口文件（默认 `index.html`）。
- `--maxRetryCount`: 指定最大重试次数（默认为5）。
- `--concurrency`: 指定并发上传的数量限制（默认为10）。
- `--headers`: 指定自定义请求头信息（JSON格式）。
- `--ossHeaders`: 指定自定义OSS请求头信息（JSON格式）。
- `--cosHeaders`: 指定自定义COS请求头信息（JSON格式）。

### 显示帮助信息

```bash
multi-cloud-uploader --help
```

### 示例

```bash
multi-cloud-uploader --uploadFrom=path/to/uploadFrom --uploadTo=path/to/uploadTo --headers='{"x-my-header":"my-value"}' --ossConfig=config/ossConfig.json  --cosConfig=config/cosConfig.json
```

## 配置文件示例

### 阿里云OSS配置（ossConfig.json）

```json
{
  "bucket": "your-bucket-name",
  "accessKeyId": "your-access-key-id",
  "accessKeySecret": "your-access-key-secret",
  "region": "oss-cn-beijing"
}
```

### 腾讯云COS配置（cosConfig.json）

```json
{
  "Bucket": "your-bucket-name",
  "SecretId": "your-secret-id",
  "SecretKey": "your-secret-key",
  "Region": "ap-beijing"
}
```

## 许可

该项目使用 [MIT 许可证](LICENSE)。
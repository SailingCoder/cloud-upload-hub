# multi-cloud-uploader - Lightweight Frontend Multi-Cloud Upload Library

**multi-cloud-uploader** is a lightweight Node library designed for uploading files to multiple cloud storage platforms. Currently, it supports Alibaba Cloud OSS and Tencent Cloud COS, with plans to extend support to more cloud storage services in the future.

This library aims to simplify the integration of file upload functionality across different cloud platforms, allowing developers to avoid redundant implementations for each service.

![npm version](https://img.shields.io/npm/v/multi-cloud-uploader)

[Chinese Documentation](https://github.com/SailingCoder/multi-cloud-uploader/blob/main/doc/README_CN.md)

### Features

*   **Multi-Cloud Support**: Supports OSS, COS, and allows users to dynamically choose single or multiple uploads.
*   **Dynamic Configuration Loading**: Use the `customConfigPaths` parameter to configure uploads for other private or public clouds (expandable).
*   **Easy to Extend**: Future support for more cloud storage options like AWS S3 and Google Cloud Storage.
*   **Simplified Integration**: Unified API to streamline the file upload process.
*   **Custom Headers**: Supports independent request header configuration for OSS and COS.
*   **Last File Upload Specification**: Default support for `index.html`.
*   **Retry Mechanism**: Automatic retries for uploads to ensure reliability.

## Installation

Install the library via npm:

```bash
npm install multi-cloud-uploader --save-dev 
```

## Usage

### Command-Line Example

To use multi-cloud-uploader, run the following command in the terminal:

```bash
multi-cloud-uploader --uploadFrom=<source directory> --uploadTo=<destination directory> --ossConfig=<oss configuration file>
```

### Example

To upload files to a test directory:

```bash
multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/test --ossConfig=./oss.test.conf.json 
```

In your package.json, you can configure scripts as follows:

```json
"scripts": {
  "uploader:tice": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/tice --ossConfig=./config/oss.tice.conf.json",
  "uploader:test": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/test --ossConfig=./config/oss.test.conf.json",
  "uploader:gray": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/gray --ossConfig=./config/oss.gray.conf.json",
  "uploader:prod": "multi-cloud-uploader --uploadFrom=dist --uploadTo=projectName/prod --ossConfig=./config/oss.prod.conf.json"
}
```

Execute a command with:

```bash
npm run uploader:tice
```

### Parameter Explanation

*   `--ossConfig`: Path to the Alibaba Cloud OSS configuration file (in JSON format), must include `bucket`, `accessKeyId`, `accessKeySecret`, and `region`.
*   `--cosConfig`: Path to the Tencent Cloud COS configuration file (in JSON format), must include `Bucket`, `SecretId`, `SecretKey`, and `Region`.
*   `--uploadFrom`: Specify the local directory or file path to upload.
*   `--uploadTo`: Target path in OSS or COS.
*   `--lastFile`: The last file to upload (default is `index.html`).
*   `--maxRetryCount`: Maximum number of retry attempts (default is 5).
*   `--concurrency`: Limit on the number of concurrent uploads (default is 10).
*   `--headers`: Custom request headers (in JSON format).
*   `--customConfigPaths`: Paths to custom configuration files (in JSON format array).
*   `--ossHeaders`: OSS request headers (in JSON format).
*   `--cosHeaders`: COS request headers (in JSON format).

### Configuration File Example

For an Alibaba Cloud OSS configuration (ossConfig.json):

```json
{
  "bucket": "your-bucket-name",
  "accessKeyId": "your-access-key-id",
  "accessKeySecret": "your-access-key-secret",
  "region": "oss-cn-beijing"
}
```

### Show Help Information

To display help information, run:

```bash
multi-cloud-uploader --help
```

## Custom Configuration Loading with customConfigPaths

You can dynamically load specific uploader configuration files (beyond OSS and COS) using the `customConfigPaths` parameter. This parameter should be a JSON array that can contain multiple configuration file paths.

### Command-Line Example

```bash
multi-cloud-uploader --uploadFrom=<source directory> --uploadTo=<destination directory> --customConfigPaths='[<config file path1>, <config file path2>]' --ossConfig=<oss configuration file>
```

For example:

```json
"uploader:tice": "multi-cloud-uploader --uploadFrom=src --uploadTo=test/sailing  --customConfigPaths='[\"./upload/ossUpload.js\"]' --ossConfig=./oss.tice.conf.json",
```

### Configuration Steps

For OSS, follow these steps ([ossConfig.json](https://github.com/SailingCoder/multi-cloud-uploader/tree/main/example/config)):

1. **Code Implementation**

Create [./example/uploaderRegistryOSS.js](https://github.com/SailingCoder/multi-cloud-uploader/tree/main/example/uploaderRegistryOSS.js):

```js
const OSS = require('ali-oss');
const { BaseUploader, registerUploader } = require('multi-cloud-uploader');

class UploadCopyOss extends BaseUploader {
  constructor(options) {
    super(options); // Call base class constructor
    this.client = new OSS({
      region: options.region,
      accessKeyId: options.accessKeyId,
      accessKeySecret: options.accessKeySecret,
      bucket: options.bucket,
    });
    this.headers = options.headers || {}; // Optional
  }

  // Actual file upload function
  async uploadSingleFile(file, targetPath) {
    try {
      const result = await this.client.put(targetPath, file, {
        headers: this.headers, // Optional
      });
      return {
        success: result?.res?.status === 200, // Required field
        status: result?.res?.status, // Required field
        // message: `File ${file} uploaded successfully to ${targetPath}`, // Optional
        // extra: result,  // Optional
      };
    } catch (error) {
      return {
        success: false, // Required field
        message: error.message, // Required field
      };
    }
  }
}

// Register OSS uploader
registerUploader(UploadCopyOss, {
  configName: 'ossCopyConfig', // Configuration file name, required
  configRequiredFields: ['bucket', 'accessKeyId', 'accessKeySecret', 'region'], // Required
  // headerName: 'ossCopyHeaders', // Header configuration, optional
  type: 'ossCopy', // Uploader type, required
});
```

2. **package.json Setup**

Add to your scripts:

```json
"scripts": {
  "uploaderRegistryOSS:tice": "multi-cloud-uploader --uploadFrom=src --uploadTo=test/sailing  --customConfigPaths='[\"./example/uploaderRegistryOSS.js\"]' --ossCopyConfig=./config/oss.tice.conf.json"
}
```

Or And COS：

```json
"scripts": {
  "uploaderRegistryOSS:tice": "multi-cloud-uploader --uploadFrom=src --uploadTo=test/sailing  --customConfigPaths='[\"./example/uploaderRegistryOSS.js\"]' --ossCopyConfig=./config/oss.tice.conf.json --cosConfig=./config/cos.tice.conf.json"
}
```

3. **oss.test.conf.json Configuration**

Create `./config/oss.test.conf.json`:

```json
{
    "bucket": "your-bucket-name",
    "accessKeyId": "your-access-key-id",
    "accessKeySecret": "your-access-key-secret",
    "region": "oss-cn-beijing"
}
```

4. **Execute Command**

Run:

```bash
npm run uploaderRegistryOSS:tice
```

## Communication

For suggestions or issues, feel free to reach out via [issues](https://github.com/SailingCoder/multi-cloud-uploader/issues).

## License

This project is licensed under the [MIT License](LICENSE).
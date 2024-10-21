const OSS = require('ali-oss')
const path = require('path')
const fs = require('fs')

class UploadAliOss {
  constructor({ bucket, accessKeyId, accessKeySecret, region, uploadFrom, uploadTo, maxRetryCount = 5, headers }) {
    this.uploadFrom = uploadFrom
    this.uploadTo = uploadTo
    this.allFiles = []
    this.totalFileNum = 0
    this.successFileNum = 0
    this.failFileNum = 0
    this.maxRetryCount = maxRetryCount
    this.headers = headers

    this.validateOssConfig(bucket, accessKeyId, accessKeySecret)
    this.client = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      bucket
    })
  }

  validateOssConfig(bucket, accessKeyId, accessKeySecret) {
    if (!bucket || !accessKeyId || !accessKeySecret) {
      throw new Error('缺少OSS配置')
    }
  }

  async uploadFile(uploadFrom = this.uploadFrom, uploadTo = this.uploadTo) {
    if (!uploadFrom || !uploadTo) {
      throw new Error('【uploadFrom】【uploadTo】 为必传参数')
    }

    const dir = path.join(process.cwd(), uploadFrom)
    const isDirectory = fs.statSync(dir).isDirectory()

    if (!isDirectory) {
      this.totalFileNum = 1
      await this.putOss(uploadTo, uploadFrom)
      return
    }

    this.getFileList(uploadFrom)
    this.totalFileNum = this.allFiles.length
    console.log(`共扫描了${this.totalFileNum}个文件`)

    for (const file of this.allFiles) {
      const ossPath = file.replace(uploadFrom, uploadTo)
      await this.putOss(ossPath, file)
    }
  }

  getFileList(dir) {
    const files = fs.readdirSync(dir)
    files.forEach((item) => {
      const fullpath = path.join(dir, item)
      const stats = fs.statSync(fullpath)
      if (stats.isDirectory()) {
        this.getFileList(fullpath)
      } else {
        this.allFiles.push(fullpath)
      }
    })
  }

  async putOss(ossPath, localPath, requestCount = 1) {
    try {
      const result = await this.client.put(ossPath, localPath, { headers: this.headers })

      if (result.res.status === 200) {
        this.successFileNum++
        console.log(`第${requestCount}次上传成功: ${localPath}`)

        if (this.successFileNum === this.totalFileNum) {
          console.log(`======全部文件上传成功(${this.totalFileNum}个)======`)
        } else if (this.successFileNum + this.failFileNum === this.totalFileNum) {
          console.log(`======上传结束，共上传${this.totalFileNum}个，成功${this.successFileNum}个，失败${this.failFileNum}个======`)
        }
      }
    } catch (e) {
      console.log(`第${requestCount}次上传失败: ${localPath}`)

      if (requestCount >= this.maxRetryCount) {
        this.failFileNum++
        if (this.successFileNum + this.failFileNum === this.totalFileNum) {
          console.log(`======上传结束，共上传${this.totalFileNum}个，成功${this.successFileNum}个，失败${this.failFileNum}个======`)
        }
        return
      }

      await this.putOss(ossPath, localPath, ++requestCount)
    }
  }
}

module.exports = { UploadAliOss }

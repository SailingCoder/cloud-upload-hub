# 1.0.0(2024-10-22)
## features
+ 支持批量上传文件 OSS 或者 COS
+ 支持上传单个文件 OSS 或者 COS


# 1.0.3(2024-10-29)
## features
+ 通过 uploaderModules 参数配置其他私有云或公有云的上传（支持扩展）。

# 1.0.5(2024-10-30)
## features
+ Log update。

# 1.0.5(2024-10-30)
## features
- 修复了在上传时意外包含源目录文件夹的问题，确保上传的文件结构符合预期。
- 例如，之前的上传路径 `test/sailing/src/index.js` 现在更新为 `test/sailing/index.js`。
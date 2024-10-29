function validateConfig(config, requiredKeys, type='') {
    const missingKeys = requiredKeys.filter(key => !config[key]);
    if (missingKeys.length > 0) {
        throw new Error(`缺少${type}配置: 请检查配置文件中的 ${missingKeys.join(', ')} 是否存在。`);
    }
}

module.exports = { validateConfig };
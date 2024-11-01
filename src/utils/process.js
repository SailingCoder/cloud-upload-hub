const minimist = require('minimist');

// 并发控制的核心逻辑
async function runConcurrentLimit(tasks, limit) {
    const taskQueue = [];
    while (tasks.length > 0) {
        while (taskQueue.length < limit && tasks.length > 0) {
            const task = tasks.shift();
            const taskPromise = task().finally(() => taskQueue.splice(taskQueue.indexOf(taskPromise), 1));
            taskQueue.push(taskPromise);
        }
        await Promise.race(taskQueue); // 等待最先完成的任务
    }
    await Promise.all(taskQueue); // 确保剩余的任务都完成
}

// 获取命令行参数
function getArgv() {
    return minimist(process.argv.slice(2));
}

module.exports = { runConcurrentLimit, getArgv };
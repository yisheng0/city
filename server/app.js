const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// 中间件
app.use(bodyParser.json());
app.use(cors());

// 模拟数据
let data1 = require('./m1.json');
let data2 = require('./m2.json');
let data3 = require('./m3.json');
let data4 = require('./m4.json');
let data5 = require('./m5.json');

function light(res, data, delay) {
    return new Promise((resolve) => {
        setTimeout(() => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
            resolve();
        }, delay);
    });
}
function step(res) {
    Promise.resolve()
        .then(() => light(res, data1, 2000))
        .then(() => light(res, data2, 2000))
        .then(() => light(res, data3, 2000))
        .then(() => light(res, data4, 2000))
        .then(() => light(res, data5, 2000))
        .then(() => step(res))
        .catch((err) => {
            console.error('错误：', err.message);
            res.status(500).send('内部服务器错误');
        });
}
app.get('/sse', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.status(200);
    step(res);
});

// 启动服务器
app.listen(3000, () => {
    console.log('服务器已在端口 3000 上启动');
});

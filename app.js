const fs = require('fs');
const path = require('path');
const express = require('express');
const chokidar = require('chokidar');

const mocker = {};
const app = express();

const apiMock = (app, dir) => {
    app.all('/*', (req, res, next) => {
        const key = req.originalUrl;
        if (mocker[key]) {
            return res.send(mocker[key]);
        }
        next();
    });
    chokidar.watch(dir).on('all', (event, curPath) => {
        if (fs.statSync(curPath).isFile()) {
            delete require.cache[path.resolve(curPath)];
            Object.assign(mocker, require(curPath));
        }
    })
}

apiMock(app, path.resolve('./mock'));

app.listen(3000, () => {
    console.log('listening at 3000');
})
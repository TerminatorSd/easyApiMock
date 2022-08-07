const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const mocker = {};

module.exports.apiMock = (app, dir) => {
  app.all("/*", (req, res, next) => {
    const key = req.originalUrl;
    if (mocker[key]) {
      return res.send(mocker[key]);
    }
    next();
  });
  chokidar.watch(dir).on("all", (event, curPath) => {
    if (fs.statSync(curPath).isFile()) {
      delete require.cache[path.resolve(curPath)];
      Object.assign(mocker, require(curPath));
    }
  });
};

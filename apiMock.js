const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");

const mocker = {};
const cacheUrlInFile = {};

module.exports.apiMock = (app, dir) => {
  app.all("/*", (req, res, next) => {
    const key = req.originalUrl;
    if (mocker[key]) {
      return res.send(mocker[key]);
    }
    next();
  });
  chokidar.watch(dir).on("all", (event, curPath) => {
    if (event === "unlink") {
      console.log("删除mock文件：", curPath);
      const toDeleteArr = cacheUrlInFile[curPath];
      toDeleteArr.forEach((item) => {
        delete mocker[item];
      });
    } else if (["add", "change"].includes(event)) {
      if (fs.statSync(curPath).isFile()) {
        console.log(`${event === "add" ? "新增" : "修改"}mock文件：`, curPath);
        delete require.cache[path.resolve(curPath)];
        const module = require(curPath);
        Object.assign(mocker, module);
        Object.assign(cacheUrlInFile, {
          [curPath]: Object.keys(module),
        });
      }
    }
  });
};

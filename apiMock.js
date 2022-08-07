const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const { pathToRegexp } = require("path-to-regexp");

const mocker = {};
const cacheUrlInFile = {};

// “？：”非获取匹配，匹配冒号后的内容但不获取匹配结果，不进行存储供以后使用。
// pathToRegexp('/api/users/:id') => /^\/api\/users(?:\/([^\/#\?]+?))[\/#\?]?$/i
const getMockerKey = (url) => {
  return Object.keys(mocker).find((key) => {
    return pathToRegexp(key).exec(url);
  });
};

module.exports.apiMock = (app, dir) => {
  app.all("/*", (req, res, next) => {
    const mockerKey = getMockerKey(req.originalUrl);
    if (mockerKey && mocker[mockerKey]) {
      return res.send(mocker[mockerKey]);
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

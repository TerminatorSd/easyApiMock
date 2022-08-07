const path = require("path");
const express = require("express");
const { apiMock } = require("./apiMock");

const app = express();

apiMock(app, path.resolve("./mock"));

app.listen(3000, () => {
  console.log("listening at 3000");
});

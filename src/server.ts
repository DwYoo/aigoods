import router from "./routes/index";

var express = require('express');
var app = express();
app.use('/', router);

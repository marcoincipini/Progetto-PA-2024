var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
app.get('/', function (req, res) {
    res.send('Questo programma funziona');
});
app.listen(port, function () {
    console.log("Server is running at http://localhost:".concat(port));
});

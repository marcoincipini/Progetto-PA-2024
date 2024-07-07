const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', function(req, res) {
    res.send('Questo programma funziona');
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
import * as express from 'express';
import * as dotenv from 'dotenv';

const app = express();
const port = process.env.PORT || 3000;

app.get('/', function(req: any, res: any){
    res.send('Questo programma funziona');
});
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
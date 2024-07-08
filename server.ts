import express, { Application } from 'express';
import bodyParser from 'body-parser';
import router from './routes';
import { sequelize } from './config';

const app: Application = express();
const port = 3000;

app.use(bodyParser.json());

// Aggiungi le tue rotte
app.use('/api', router);

// Sincronizza il modello con il database e avvia il server
sequelize.sync().then(() => {
  console.log('Database connesso e modello sincronizzato.');
  app.listen(port, () => {
    console.log(`Server avviato su http://localhost:${port}`);
  });
}).catch((error) => {
  console.error('Errore durante la connessione al database:', error);
});

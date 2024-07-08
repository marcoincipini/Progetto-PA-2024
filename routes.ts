const express = require('express');
import { creaParcheggio, elencoParcheggi, dettaglioParcheggio, aggiornaParcheggio, eliminaParcheggio } from './controllers/parcheggiController';
import { validateParcheggio } from './middleware/validateParcheggio';

const router = express.Router();

router.post('/parcheggi', validateParcheggio, creaParcheggio);
router.get('/parcheggi', elencoParcheggi);
router.get('/parcheggi/:id', dettaglioParcheggio);
router.put('/parcheggi/:id', validateParcheggio, aggiornaParcheggio);
router.delete('/parcheggi/:id', eliminaParcheggio);

export default router;

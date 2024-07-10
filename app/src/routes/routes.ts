import { Router } from "express";
// importare i controller ed i middleware necessari

const router = Router();

// usare in app.ts app.use('/api', routes);
router.post('/parkings',/*middleware specifici,*/ (req: any, res: any) =>{
    //chiamata al controller(parametri*, res);
});
router.get('/parkings',/*middleware specifici,*/ (req: any, res: any) =>{
    //chiamata al controller(parametri*, res);
});
router.put('/parkings',/*middleware specifici,*/ (req: any, res: any) =>{
    //chiamata al controller(parametri*, res);
});
router.delete('/parkings',/*middleware specifici,*/ (req: any, res: any) =>{
    //chiamata al controller(parametri*, res);
});

export default router;
import express, { type Response, type Request } from 'express';
import { initDb } from './Config/db';
import cors from 'cors';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  }),
);

app.get('/', (req: Request, res: Response) => {
  res.send('Bienvenu Hervé');
});

app.get('/home', (req: Request, res: Response) => {
  res.send('Hello Reason tu arriveras, faut te décider et rester focus');
});
(async () => {
  await initDb();

  app.listen(PORT, () => {
    console.log('Serveur démarré sur http://localhost:' + PORT);
  });
})();

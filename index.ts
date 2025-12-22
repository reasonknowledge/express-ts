import express, { type Response, type Request } from 'express'

const app = express()
const PORT = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/home', (req: Request, res: Response) => {
  res.send('Hello Reason tu arriveras, faut te décider et rester focus')
})

app.listen(PORT, () => {
  console.log('Serveur démarré sur le port http://localhost:' + PORT)
})

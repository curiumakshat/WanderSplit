import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import apiRouter from './src/api/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

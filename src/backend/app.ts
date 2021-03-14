import express from 'express';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import userRouter from './routes/user';
import adminRouter from './routes/admin';
import './admin/defaultAccount'; // to create default admin account
import { readFileSync } from 'fs';
import { authMiddleware } from './auth';
import apolloServer from './apollo';

const app = express();

const pub = path.join(__dirname, './public')

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(pub));
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/graphql', authMiddleware, apolloServer.getMiddleware({ path: '/' }));

// 404 fallback to react:
app.use(function(req, res){
  res.setHeader('Content-Type', 'text/html');
  res.send(readFileSync(pub + "/index.html"))
});
  
export default app;
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';

import config from './config';
import runSockets from './socket';
import { Routes } from './routes';

const app = express();
const server = http.createServer(app);
const routes = new Routes();

server.listen(config.http.port, () => {
  console.log('server is running ......');
});

app.use(routes.getRoutes());

app.use(cors());

runSockets(server);

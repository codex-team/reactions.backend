import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import http from 'http';

import config from './config';
import runSockets from './socket';


const app = express();
const server = http.createServer(app);

server.listen(config.http.port, () => {
    console.log('server is running ......')
});

runSockets(server);


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
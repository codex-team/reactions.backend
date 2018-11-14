import {Server} from "http";
import {Socket} from "socket.io";
import * as ioEntry from "socket.io";

const runSockets = (server: Server) => {
    const connections: Socket[] = [];
    const io = ioEntry.listen(server);

    console.log('sockets are running ......');
    io.sockets.on('connection', (socket: Socket) => {
        connections.push(socket);
        console.log(' %s sockets is connected', connections.length);

        socket.on('disconnect', () => {
            connections.splice(connections.indexOf(socket), 1);
        });

        socket.on('sending message', (message) => {
            console.log('Message is received :', message);

            io.sockets.emit('new message', {message: message});
        });
    });

};

export default runSockets;
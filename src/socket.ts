import {Server} from "http";
import Io, {Socket} from "socket.io";

/**
 * Start sockets observing.
 * @param {Server} server - The instance of the node Server.
 */
const runSockets = (server: Server) => {
    const connections: Socket[] = [];
    const io = Io.listen(server);

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
import { Server } from 'http';
import Io, { Socket } from 'socket.io';

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

    socket.on('message', (message) => {
      console.log('Message is received :', message);
      const moduleId = message.type;
      if (moduleId == 'initialization') {
        socket.join(message.moduleId);
      } else {
        io.to(message.moduleId).emit('new message', { message: message });
      }
    });
  });
};

export default runSockets;

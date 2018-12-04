import { Server } from 'http';
import Io, { Socket } from 'socket.io';
import md5 from 'md5';


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
      console.log('Socket disconnected');
      connections.splice(connections.indexOf(socket), 1);
    });

    socket.on('message', (message) => {
      console.log('Message is received :', message);
      const type = message.type;
      // const moduleId = md5(message.moduleId);
      if (type == 'initialization') {
        socket.join(md5(message.moduleId));
      } else {
        message.votedReactionId = message.reaction;
        message.reactions[message.reaction] = +message.reactions[message.reaction] + 1;
        io.to(md5(message.moduleId)).emit('update', message);
      }
    });
  });
};

export default runSockets;

import { Server } from 'http';
import Io, { Socket } from 'socket.io';
import md5 from 'md5';
import actions from './actions';
import Reactions from './models/Reactions';

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

    socket.on('message', async (message) => {
      const type = message.type;
      let reactions: Reactions | undefined;

      switch (type) {
        case 'initialization':
          socket.join(md5(message.id));

          reactions = await actions.getReactions(message.origin, message);

          socket.emit('update', reactions);
          return;

        case 'vote':
          reactions = await actions.vote(message.origin, message);
          break;

        case 'unvote':
          reactions = await actions.unvote(message.origin, message);
          break;
      }

      socket.broadcast.to(md5(message.id)).emit('update', reactions);
    });
  });
};

export default runSockets;

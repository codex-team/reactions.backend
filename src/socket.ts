import { Server } from 'http';
import Io, { Socket } from 'socket.io';
import md5 from 'md5';
import reactionActions from './actions';
import voteTokenActions from './actions/vote-token';
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
      let token: string | undefined;
      switch (type) {
        case 'initialization':
          socket.join(md5(message.id));

          reactions = await reactionActions.getReactions(message.origin, message);
          socket.emit('update', reactions);
          return;

        case 'getToken':
          token = await voteTokenActions.get(message.origin, message.userId);
          socket.emit('receiveToken', token);
          break;

        case 'vote':
          reactions = await reactionActions.vote(message.origin, message);
          break;

        case 'unvote':
          reactions = await reactionActions.unvote(message.origin, message);
          break;
      }

      socket.broadcast.to(md5(message.id)).emit('update', reactions);
    });
  });
};

export default runSockets;

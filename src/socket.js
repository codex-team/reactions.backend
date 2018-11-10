let io = require('socket.io');


const runSockets = (server) => {
    const connections = [];
    io = io.listen(server);

    console.log('sockets are running ......');
    io.sockets.on('connection',(socket) => {
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
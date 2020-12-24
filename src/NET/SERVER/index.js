import net from 'net';   // TCP Protocol
import fs from 'fs';

const port = process.env.PORT || 9002;
const host = process.env.HOST || 'localhost';
const server = net.createServer();

// store client sockets
const ClientSockets = [];

// welcome message log
server.listen(port, host, () => {
  console.log('server listening on %j', server.address());
});

// error log
server.on('error', (error) => {
  console.log('Server Error :', error);
});


// when client is connected
server.on('connection', (socket) => {
  ClientSockets.push(socket);
  socket.setTimeout(500);

  // check how many client is connected now
  server.getConnections((error, count) => {
    if (error) console.log("connections error");
    console.log("Current Total Connections : ", count);
  });


  socket.setEncoding('utf8'); // Default is utf-8
  writeData(socket, "Hello I'm server"); // send data to client


  // when client send some data
  socket.on('data', (data) => {
    console.log('from client // ' + data.toString());

    setTimeout(() => {
      // basically tcp connections don't be closed until explicit stop-command on server or client
      // when you want to close client socket, use destory method
      socket.destroy();
    }, 2000);

  });


  // when client closed
  socket.on('close', () => {
    console.log('client disconnted.');

    // remove client socket from the client list
    let clientIndex = ClientSockets.indexOf(socket);
    ClientSockets.splice(clientIndex, 1);
  });



  // broadcast alarm to all clients
  ClientSockets.forEach( soc => {
    // don't broadcast to new client
    if (soc !== socket) writeData( soc, 'New client in !!' );
  });

});

// param data is chunk
const writeData = (socket, data) => {

  // when socket.write(data) is failed, return false
  // in usual case, if stream buffer is full, write func will return false.
  let writeFail = !socket.write(data);

  if (!writeFail) {
    // when stream buffer is cleaned out, drain event emit
    socket.once('drain', () => {
      writeData(socket, data);
    });
  }
}

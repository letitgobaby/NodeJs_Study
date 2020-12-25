import dgram from 'dgram';

const port = 41234;
const address = 'localhost';

// create socket <IPv4>
const server = dgram.createSocket('udp4');

// if port and address are not specified, OS will attempt to bind random port and all addresses.
// once binding is complete, a 'listening' event is emitted and callback function is called.
// A bound datagram socket keeps the Node.js process running to receive datagram messages.
// ## socket.bind([port][, address][, callback]) ##
server.bind(port, address);


//emits when socket is ready and listening for datagram msgs
server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});



// rinfo<Object>  ->  Remote address information
// The 'message' event is emitted when a new datagram is available on a socket.
server.on('message', (message, rinfo) => {
  console.log(`server got: ${message} from ${rinfo.address}:${rinfo.port}`);

  let msg = new Buffer.from('Hello UDP Receiver');
  server.send(msg, 0, msg.length, rinfo.port, rinfo.address, (err) => {
          if (err) throw err;
          console.log('good job');
      }
  );

});





server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('close', () => {
  console.log('socket is closed !');
});



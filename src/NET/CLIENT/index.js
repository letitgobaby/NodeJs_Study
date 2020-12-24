import net from 'net';

const port = 9002;
const host = 'localhost';

const TcpOptions = {
  port, 
  host,
  // localAddress <string>,
  // localPort <number>,
  // family <number>,
  // hints <number>,
  // lookup <Function>,
  // onread: {
  //   // Reuses a 4KiB Buffer for every read from the socket.
  //   buffer: Buffer.alloc(4 * 1024),
  //   callback: function(nread, buf) {
  //     // Received data is available in `buf` from 0 to `nread`.
  //     console.log(buf.toString('utf8', 0, nread));
  //   }
  // }
};

// create client's socket instance
const client = net.connect(TcpOptions);

client.on('connect', () => {
  console.log('Connected: ');
  console.log('   local = %s:%s', client.localAddress, client.localPort);
  console.log('   server = %s:%s', client.remoteAddress, client.remotePort);
  client.setEncoding('utf8');
  writeData(client, "I'm Client."); // send data to server
});

client.on('data', (data) => {
	console.log('Got data from server : ', data.toString());
});

client.on('close', () => {
  console.log('Socket Closed');
});

client.on('end',() => {
  console.log('Client disconnected');
});

client.on('error', () => {
  console.log('Client socket error !!!!');
});


// buffer가 모두 비워졌을 경우에 drain이벤트가 발생한다.
const writeData = (socket, data) => {
  let writeFail = !socket.write(data);
  if (!writeFail) {
    
    socket.once('drain', () => {
      writeData(socket, data);
    });
  }
}
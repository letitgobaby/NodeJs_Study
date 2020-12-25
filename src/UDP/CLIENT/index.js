import dgram from 'dgram';

const PORT = 41234;
const HOST = 'localhost';

const client = dgram.createSocket('udp4');


let message = new Buffer.from('TEST!');

// msg <Buffer> | <TypedArray> | <DataView> | <string> | <Array> Message to be sent.
// offset <integer> Offset in the buffer where the message starts.
// length <integer> Number of bytes in the message.
// port <integer> Destination port.
// address <string> Destination host name or IP address.
// callback <Function> Called when the message has been sent.
client.send(message, 0, message.length, PORT, HOST, (err, bytes) => {
  if (err) { client.close(); throw err; }
  console.log('UDP message sent to ' + HOST + ':' + PORT);
});


client.on('message',function(msg,info){
  console.log('**************************');
  console.log('Data received from server : ' + msg.toString());
  console.log('Received %d bytes from %s:%d',msg.length, info.address, info.port);
  console.log('**************************');
});
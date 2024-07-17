const activeClients = []
const session = require('./session');

const { ObjectId } = require('mongodb');

const Channel = require('./schemas/Channel');
const Message = require("./schemas/Message")



// module.exports.getActiveClients = function () {
//   return activeClients
// } -- this might be unneeded...??


module.exports = async (ws, req) => {
  const sessionData = await session.current(req); 

  if (!sessionData) {
    return
  }

  ws._userId = sessionData.id
  activeClients.push(ws) // uses session data to then keep track of connected web sockets
  console.log('session', sessionData)










  ws.on('message', async function incoming(event) {
    event = JSON.parse(event);
    console.log('received: %s', event);

    if (event.Type == 'MessageSent') {
      event.Data['author'] = sessionData.id
      let message = await Message.create(event.Data)
      let channel = await Channel.findById(message.channel_id)
      let recipients = channel.recipients
      // get message channel, get recipients of channel, find connected clients who are recipients and then broadcast

      // (front end) if current channel matches message channel then just display, otherwise show new messages in channels
      // also, send data to front end showing last message sent time as well as last time read?

      activeClients.forEach((ws) => {
        if (recipients.includes(new ObjectId(ws._userId))) {
          ws.send(JSON.stringify({ Type: 'MessageRecieved', Data: message }))
        }

      })
    }

    if (event.Type == 'MessageEdit') { 
        Message.updateOne({_id: event.Data.message_id}, event.Data.fields)
    }

    if (event.Type == 'GetHistory') {}



  });

  ws.on('close', function close() {
    console.log('Client disconnected');
  });




}
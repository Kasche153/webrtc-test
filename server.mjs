import geckos, { iceServers } from '@geckos.io/server'
import http from 'http'
import express from 'express'
import path from 'path'

const app = express()
const server = http.createServer(app)

const port = process.env.PORT || 8080

app.use(express.static('public'))

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'))
})

// make sure the client uses the same port
// @geckos.io/client uses the port 9208 by default

const io = geckos({
  iceServers: process.env.NODE_ENV === 'production' ? iceServers : [],
  portRange: {
    min: 10000,
    max: 10007,
  },
  cors: { allowAuthorization: true },
})

// listen on port 3000 (default is 9208)

io.onConnection((channel) => {
  channel.onDisconnect(() => {
    console.log(`${channel.id} got disconnected`)
  })

  channel.emit('chat message', `Welcome to the chat ${channel.id}!`)

  channel.on('chat message', (data) => {
    channel.room.emit('chat message', data)
  })
})

io.addServer(server)
server.listen(80, () => {
  console.log('server started :) ')
})

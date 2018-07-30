const Websocket = require('ws');
const Blockchain = require('../geospatialblockchain/blockchain');


const P2P_PORT = process.env.P2P_PORT || 5001;

const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

class P2pServer  
{
    constructor(blockchain)
    {
        this.blockchain = blockchain ; 
        this.sockets = [];
    }

    listen()
    {
        const server= new Websocket.Server({port:P2P_PORT});
        server.on('connection', socket => this.connectSocket(socket));

        this.connectToPeers();
        console.log(`Listening on peer-to-peer connections on: ${P2P_PORT}`);
    }

    connectSocket(socket) 
    {
        this.sockets.push(socket);
        console.log('Socket connected');
        this.messageHandler(socket);
        this.sendChain(socket);
    }


    connectToPeers() 
    {
        peers.forEach(peer => {
          const socket = new Websocket(peer);
          socket.on('open', () => this.connectSocket(socket));
        });
    }


    messageHandler(socket) 
    {
        socket.on('message', message => 
        {
        const data = JSON.parse(message);
        console.log('data', data);
        this.blockchain.replaceChain(data);
        });
    }

    syncChains() 
    {
        this.sockets.forEach(socket => {
          this.sockets.forEach(socket => this.sendChain(socket));
        });
    }

    sendChain(socket) 
    {
        socket.send(JSON.stringify(this.blockchain.chain));
    }
}

module.exports=P2pServer;
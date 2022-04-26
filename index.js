const WebSocket = require('websocket').server
const express = require('express')

const PORT = process.env.PORT || 3000

const INDEX = './index.html'

const app = express()
    .get('/chess', (req, res) => res.sendFile(INDEX, {
        root: __dirname + '/public'
    }))
    .get('/', (req, res) => res.sendFile(INDEX, {
        root: __dirname + '/public'
    }))
    .use(express.static('public'))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));


const wss = new WebSocket({
    'httpServer': app
})

let clients = {}

let games = {}
let randomGames = []

let colors = {
    '0': 'white',
    '1': 'black'
}

wss.on('request', request => {
    const connection = request.accept(null, request.origin)
    connection.on('open', () => {
        console.log('new client connected');
    })

    connection.on('close', () => {

    })

    connection.on('message', message => {
        let result = JSON.parse(message.utf8Data)
        const gameID = guid()

        // client want to create a new game
        if (result.method == 'create') {


            games[gameID] = {
                id: gameID,
                clients: [],
                status: []
            }

            let payLoad = {
                method: 'create',
                game: games[gameID]
            }

            let con = clients[result.clientID].connection
            console.log(payLoad);
            con.send(JSON.stringify(payLoad))

        }

        // a client want to join a game
        if (result.method == 'join') {
            let con = clients[result.clientID].connection
            let clientID = result.clientID
            let gameID = result.gameID
            let game = games[gameID]
            if (!game || !(game.clients.length < 2)) {
                let payLoad = {
                    method: 'join',
                    success: false,
                    message: !game ? 'game not found' : 'game room is full'
                }
                con.send(JSON.stringify(payLoad))
            } else if (game.clients.filter(x => x.clientID == clientID).length == 0) {
                let color = colors[game.clients.length]
                game.clients.push({
                    clientID,
                    color
                })
                //if i want i can tell the other client that someone has joined the game

                let payLoad = {
                    method: 'join',
                    game,
                    success: true,
                    message: 'joined the game successfully'
                }
                con.send(JSON.stringify(payLoad))

                if (game.clients.length == 2) {
                    payLoad = {
                        method: 'start',
                        game
                    }
                    game.clients.forEach(c => clients[c.clientID].connection.send(JSON.stringify(payLoad)))
                }
            }
        }



        if (result.method == 'set') {
            let payLoad = {
                method: 'set',
                location: result.location,
                index: result.index
            }
            let clientID = result.clientID
            let gameID = result.gameID
            let game = games[gameID]
            game.clients.forEach(c => c.clientID != clientID && clients[c.clientID].connection.send(JSON.stringify(payLoad)))
        }
        // connect between 2 players
        if (result.method == 'random') {
            let clientID = result.clientID
            if (randomGames.length && randomGames.indexOf(clientID) == -1) {

                let client2ID = randomGames[0]
                randomGames.splice(0, 1)
                games[gameID] = {
                    id: gameID,
                    clients: [],
                    status: []
                }

                let payLoad = {
                    method: 'random',
                    gameID
                }
                let RandomClients = [clientID, client2ID]
                RandomClients.forEach((cl) => {
                    clients[cl].connection.send(JSON.stringify(payLoad))
                })


            } else {
                randomGames.push(result.clientID)
            }
        }

        if (result.method == 'close') {
            randomGames = randomGames.filter(val => val !== result.clientID)
        }
    })

    const clientID = guid()
    clients[clientID] = {
        connection
    }

    let payLoad = {
        method: 'connect',
        clientID,
    }

    // console.log(payLoad);

    connection.send(JSON.stringify(payLoad))

})


//id generator
function guid() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}
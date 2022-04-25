let pieceClass = new BoardPieces(null)

let Mycolor = null
let clientID = null
let gameID = null


let GameDiv = null
let createBtn = null
let gameIDInput = null
let joinBtn
let randomBtn
let loadingDiv
let copyLbl
let copyIcon

const HOST = location.origin.replace(/^http/, 'ws')

const ws = new WebSocket(HOST)



ws.onmessage = message => {
    const response = JSON.parse(message.data)

    if (response.method === 'connect') {
        // if (getCookie('clientID')) {
        //     clientID = getCookie('clientID')
        // } else {
        clientID = response.clientID
        // setCookie('clientID', clientID, 2)
        // }
        console.log(clientID);
    }

    if (response.method === 'create') {

        console.log(response.game.id);
        gameIDInput.value = response.game.id
    }

    if (response.method === 'join') {
        console.log(response)
        if (!response.success) {
            //tell the client he couldnt join 
            // GameDiv.style.display = ''

        }
        if (response.success) {
            GameDiv.style.display = 'none'
            loadingDiv.style.display = 'flex'
            gameID = response.game.id
            Mycolor = response.game.clients.filter(client => client.clientID == clientID)[0].color
        }

    }

    if (response.method === 'start') {
        loadingDiv.style.display = 'none'
        create_table()
        pieceClass = new BoardPieces([chessPiecesB, chessPiecesW])
        addListeners()
    }

    if (response.method == 'random') {

        gameID = response.gameID
        const payLoad = {
            method: 'join',
            gameID,
            clientID
        }
        ws.send(JSON.stringify(payLoad))

    }

    if (response.method === 'set') {
        let index = response.index
        let location = response.location
        pieceClass.index = index
        pieceClass.setLocation(location.y, location.x)
    }
}



window.onbeforeunload = () => {
    ws.send(JSON.stringify({
        method: 'close',
        clientID
    }))
}


// execute all the functions on load
window.onload = async () => {


    GameDiv = document.getElementById('start-game')
    createBtn = document.getElementById('new-game')
    gameIDInput = document.getElementById('game-id')
    joinBtn = document.getElementById('join-game')
    randomBtn = document.getElementById('join-random')
    loadingDiv = document.getElementById('loader-container')
    copyLbl = document.getElementById('copy-lbl')
    copyIcon = document.getElementById('copyBtn')




    // create game click
    createBtn.addEventListener('click', (e) => {

        const payLoad = {
            method: 'create',
            clientID
        }

        ws.send(JSON.stringify(payLoad))

    })


    // join game with id
    joinBtn.addEventListener('click', (e) => {

        const payLoad = {
            method: 'join',
            gameID: gameIDInput.value,
            clientID
        }

        ws.send(JSON.stringify(payLoad))
    })


    // join random game
    randomBtn.addEventListener('click', (e) => {

        const payLoad = {
            method: 'random',
            clientID
        }
        loadingDiv.style.display = 'flex'

        ws.send(JSON.stringify(payLoad))

        GameDiv.style.display = 'none'
        loadingDiv.style.display = 'flex'
    })


    // join random game
    copyIcon.addEventListener('click', async (e) => {
        gameIDInput.focus()
        gameIDInput.select()
        const isCopied = await new Promise((res, rej) => {
            res(document.execCommand('copy'))
        })
        if (isCopied) {
            copyLbl.style.visibility = 'visible'
            copyLbl.style.opacity = '1'
            setTimeout(() => {
                // copyLbl.style.visibility = 'hidden'
                copyLbl.style.opacity = '0'
                setTimeout(() => {
                    copyLbl.style.visibility = 'hidden'
                    // copyLbl.style.opacity = '0'
                }, 1000)
            }, 1000)
        }

    })




    // ws = new WebSocket('ws://localhost:3000')

    // ws.onmessage = message => {
    //     const response = JSON.parse(message.data)
    //     if (response.method === 'connect') {
    //         clientID = response.clientID
    //         console.log(clientID);
    //     }
    // }




    // create_table()

    // //   initializes the BoardPieces class and inserts the Piece classes' array
    // pieceClass = new BoardPieces([chessPiecesB, chessPiecesW])

    // // add focus event listeners
    // addListeners()
}




// ------   trials   -------


// inbetween tester

// let loc1 = {y:0,x:2}
// let loc2 = {y:1,x:3}
// let loc3 = {y:0,x:6}
// console.log(pieceClass.isInbetween(loc1,loc2, loc3))


// general tests
//   console.log(  pieceClass.getPieceByName('pawn', 'black'))
// console.log(pieceClass.isThreatened(2,3, 'white'))
// console.log(pieceClass.pieces[14].possibleMoveLocations(true))
// console.log(pieceClass.pieces[30].possibleMoveLocations(true))

// console.log(pieceClass.pieces[14].possibleMoveLocations())
// console.log(pieceClass.pieces[14])


//some trials
// pieceArr[0].y = 3
// pieceArr[0].appendPiece()
// pieceClass.setLocation(0, 7, 1)
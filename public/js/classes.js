class BoardPieces {
    /**
     * @param {[object]} BoardPieces
     */
    constructor(Arr) {
        if (Arr) {
            this.inializePiece(Arr)
            this.turn = 'white'
            this.index = -1
            this.kingAttacked = {
                threat: false,
                threats: null,
                king: null
            }
            this.currentLocations = []
            this.lastLocation = null
        }
    }
    //     constructor(pieces) {
    //     if (pieces)
    //         this.pieces = pieces
    // }

    whoseTurn() {
        // this.turnDiv.style.bottom =  this.turnDiv.style.bottom .includes('100')? '-15%': '100%'
        this.turnDiv.style.opacity = '0'
        setTimeout(() => {
            this.turnDiv.style.opacity = '1'
            this.turnDiv.style.bottom = this.turnDiv.style.bottom.includes('100') ? '-10%' : '100%'
            this.turnDiv.style.color = this.turn
            this.turnDiv.firstElementChild.innerHTML = `${this.turn}'s turn`
        }, 500)
    }

    resetBoard(Arr) {
        clearListeners()

        if (this.turnDiv)
            this.turnDiv.remove()

        if (this.winnerDiv) {
            this.winnerDiv.remove()
            this.winnerDiv = null
        }

        this.pieces.forEach(piece => {
            piece.icon.remove()
        })

        this.inializePiece(Arr)
        this.turn = 'white'
        this.index = -1
        this.kingAttacked = {
            threat: false,
            threats: null,
            king: null
        }
    }

    getPiece(y, x, color = null) {
        let index = null
        let piece = this.pieces.filter((piece, i) => {
            if (piece.x === x && piece.y === y &&
                (color ? piece.color == color : true)) {
                index = i
                return true
            }
            return false
        })
        if (piece.length)
            return {
                piece: piece[0],
                index
            }
        return null
    }

    getPieceByName(type, color) {
        let BoardPieces = this.pieces.filter((piece) => piece.type === type && piece.color === color)
        return BoardPieces
    }

    isKingAttacked() {
        const moves = this.getAllOppMove(this.turn, false)
        const king = this.getPieceByName('king', this.turn)[0]
        const x = king.x
        const y = king.y
        const threats = moves.filter((piece) => piece.x === x && piece.y === y)
        let threat = threats ? threats : []
        this.kingAttacked = {
            threat: threats.length > 0 || threat.length > 0,
            threats: threat,
            king
        }
        return {
            threat: threats.length > 0 || threat.length > 0,
            threats: threat,
            king: {
                y,
                x
            }
        }
    }

    isMiddle(x1, x2, x3) {
        return (x1 >= x2 && x2 >= x3) || (x1 <= x2 && x2 <= x3)
    }

    isInbetween(loc1, loc2, loc3) {
        let y1 = loc1.y
        let y2 = loc2.y
        let x1 = loc1.x
        let x2 = loc2.x
        let y3 = loc3.y
        let x3 = loc3.x

        if (x1 == x3) {
            return (x2 == x1) && this.isMiddle(y1, y2, y3)
        }

        if (y1 == y3) {
            return (y2 == y1) && this.isMiddle(x1, x2, x3)
        }

        let m = parseFloat((y1 - y3) / (x1 - x3))
        let b = y1 - m * x1
        return (y2 == m * x2 + b) && this.isMiddle(x1, x2, x3) && this.isMiddle(y1, y2, y3)

    }

    kingAttackedManager(y, x, kingA) {
        // let kingA = this.isKingAttacked()
        if (!kingA.threat)
            return true

        let kingThreats = kingA.threats
        let l = kingThreats.length
        if (l == 0)
            return true
        let isknight = kingThreats.filter(t => t.type == 'kngiht')
        if (isknight.length == 1)

            return isknight[0].threats.x == x && isknight[0].threats.y == y
        else {
            if (l > 1)
                return false

            let kingLoc = {
                y: kingA.king.y,
                x: kingA.king.x
            }
            let attackerLoc = kingThreats[0].loc
            kingThreats = kingThreats[0]

            let result = (kingThreats.loc.x == x && kingThreats.loc.y == y) ||
                this.isInbetween(kingLoc, {
                    y,
                    x
                }, attackerLoc)

            return result
        }

    }

    setLocation(y, x) {
        let index = this.index
        if (this.pieces.length > index &&
            index > -1 && !this.pieces[index].deleted &&
            this.isLocationExists(y, x)) {
            if (this.pieces[index].color == this.turn) {
                // if (this.kingAttackedManager(y, x) || this.pieces[index].type == 'king') {
                const isOccupied = this.getPiece(y, x)
                if (isOccupied) {
                    isOccupied.piece.deletePiece()
                }
                this.pieces[index].x = x
                this.pieces[index].y = y
                this.pieces[index].icon.setAttribute('data-x', x)
                this.pieces[index].icon.setAttribute('data-y', y)
                this.pieces[index].appendPiece()
                if (Mycolor == this.turn) { // if im the client managing this color then send the movement to the server

                    let payLoad = {
                        method: 'set',
                        location: {
                            y,
                            x
                        },
                        index,
                        clientID,
                        gameID
                    }

                    ws.send(JSON.stringify(payLoad))

                }
                if (this.pieces[index].type === 'pawn' && ((this.turn == 'white' && y == 0) || (this.turn == 'black' && y == 7)))
                    setTimeout(() => this.makeMeQueen(index), 500)
                else
                    this.nexTurn()

            }
        }
    }

    makeMeQueen(index) {
        let piece = this.pieces[index]
        if (piece.type == 'pawn') {
            piece.type = 'queen'
            piece.icon.classList.remove('fa-chess-pawn', 'pawn')
            piece.icon.classList.add('fa-chess-queen', 'queen')
        }

        this.nexTurn()
    }

    isLocationExists(y, x) {
        return x > -1 && x < 8 && y > -1 && y < 8
    }

    getAllOppMove(colorSelf, forT = true, initial = false) {

        let possibleMovements = []

        let filtered = this.pieces.filter(x => x.color != colorSelf && !x.deleted)
        filtered.forEach(cell => {
            let pos = cell.possibleMoveLocations(forT, initial)
            pos.map(p => {
                p.type = cell.type;
                p.color = cell.color;
                p.loc = {
                    y: cell.y,
                    x: cell.x
                }
            })
            // console.log(pos);
            possibleMovements.push(...pos)
        })
        // this.pieces.forEach((piece) => {
        //     let isColor = piece.color != colorSelf
        //     let posibilities = isColor ?
        //         piece.possibleMoveLocations(true).filter(location => {
        //             location.x == x && location.y == y
        //         }) : []
        //     threateningPieces.push(...posibilities)
        // })
        return possibleMovements
    }

    inializePiece(Arr) {
        let divTurn = document.createElement('div')
        divTurn.classList.add('div-turn')
        divTurn.style.color = 'white'
        divTurn.style.bottom = document.querySelector('.board-reverse') ? '100%' : '-10%'
        divTurn.innerHTML = `<h2>white's turn</h2>`
        document.body.querySelector('.chess-inner').appendChild(divTurn)
        this.turnDiv = divTurn

        this.pieces = []
        Arr.forEach((obj) => {
            const keys = Object.keys(obj)
            keys.forEach((key) => {
                obj[key].forEach((piece, i) => {
                    const newPiece = new Piece(piece.y, piece.x, piece.type, piece.color, piece.class, this, i)
                    this.pieces.push(newPiece)
                })
            })
        })
    }

    nexTurn() {
        this.turn = this.turn === 'black' ? 'white' : 'black'
        const isWinner = this.canKillKing()

        if (!this.hasMoves()) {
            this.winner(this.turn === 'black' ? 'white' : 'black')
        }
        if (isWinner) {
            this.winner(this.turn)
        }
        this.whoseTurn()
    }

    isMyTurn(index) {
        return this.turn === this.pieces[index].color
    }

    hasMoves() {
        let kingThreat = this.isKingAttacked()
        // if (kingThreat.threat == false)
        //     return true
        let moves = this.getAllOppMove(this.turn == 'black' ? 'white' : 'black', false, true)

        // let kingThreat = this.isKingAttacked()

        moves = moves.filter(move =>
            ((move.type !== 'king' && this.kingAttackedManager(move.y, move.x, kingThreat))) ||
            (move.type == 'king' && !move.threat))
        return moves.length > 0
    }

    canKillKing() {
        let positions = this.getAllOppMove(this.turn == 'black' ? 'white' : 'black', false)

        let color = this.turn == 'black' ? 'white' : 'black'
        // if opponent came to kill king and can approach him its checkmate
        const oppKing = this.getPieceByName('king', color)[0]

        let filtered = positions.filter(pos => pos.x == oppKing.x && pos.y == oppKing.y)
        if (filtered.length > 0) {
            // if (!false) {
            // this.winner(this.turn)
            return true
            // }
        }
        return false
    }

    kingAttackAfterMove(piece, moves) {
        let myColor = this.turn
        moves = moves.filter(move => {
            let res = false
            let x = piece.x
            let y = piece.y
            piece.MoveLocations(move.y, move.x)
            let kingThreat = this.isKingAttacked()
            piece.MoveLocations(y, x)
            res = !kingThreat.threat || this.kingAttackedManager(move.y, move.x, kingThreat)
            return res
        })
        return moves
        // })
    }

    winner(winColor) {
        const winDiv = document.createElement('div')
        winDiv.classList.add('winner-div')
        winDiv.innerHTML = `<h3>Checkmate</h3><h1>${winColor == Mycolor ? 'you won':  `you lost`}!!</h1>
        <p>hope you had fun playing</p>`
        winDiv.style.backgroundColor = winColor
        winDiv.style.color = winColor == 'black' ? 'white' : 'black'
        winDiv.style.outline = '15px solid green'
        document.body.querySelector('.chess-container').appendChild(winDiv)
        this.winnerDiv = winDiv
    }
}



class Piece extends BoardPieces {
    /**
     * 
     * @param {Number} y 
     * @param {Number} x 
     * @param {string} type 
     * @param {string} color 
     * @param {[string]} classes 
     * @param {BoardPieces} parent 
     * @param {Number} index 
     */
    constructor(y, x, type, color, classes, parent, index) {
        super(null)
        this.y = y
        this.x = x
        this.type = type
        this.color = color
        this.class = classes
        this.deleted = false
        this.memory = []
        this.createPieceElement()
        this.appendPiece()
        this.parent = parent
        this.index = index
    }

    createPieceElement() {
        const icon = document.createElement('i')
        icon.setAttribute('data-x', this.x)
        icon.setAttribute('data-y', this.y)
        icon.classList.add(...this.class)
        icon.setAttribute('tabindex', '0')
        this.icon = icon
    }


    appendPiece() {
        this.memory.push({
            y: this.y,
            x: this.x
        })
        document.getElementById(`${this.y}-${this.x}`).appendChild(this.icon)
    }

    deletePiece() {
        this.icon.remove()
        this.deleted = true
        this.MoveLocations(-1, -1)
    }

    possibleMoveLocations(isForT = false, initial = true) {
        const types = {
            pawn: 'pawnMove',
            king: 'kingMove',
            queen: 'queenMove',
            rook: 'rookMove',
            bishop: 'bishopMove',
            knight: 'knightMove',
        }
        // this[types[this.type]](isForT)
        let result = this[types[this.type]](isForT, initial)


        // let kingA = this.parent.isKingAttacked()
        // result = result.filter(res => {
        //     this.parent.kingAttackedManager(res.x, res.y, kingA)
        // })
        // // console.log(result);
        return result
    }

    MoveLocations(y, x) {
        this.x = x
        this.y = y
    }

    isBlack(val = null) {
        if (val)
            return this.color == 'black' ? val : -val
        return this.color == 'black'
    }

    getOpponentColor() {
        return this.color == 'black' ? 'white' : 'black'
    }

    pawnMove(isForT = false) {
        let y = this.y
        let x = this.x

        this.possibleMoves = []

        const isNext1Occupied = this.parent.getPiece(y + this.isBlack(1), x)
        const isNext2Occupied = this.parent.getPiece(y + this.isBlack(2), x)
        // is one step allowed
        if (!isForT && (this.isBlack() ? y < 7 : y > 0) &&
            !isNext1Occupied)
            this.possibleMoves.push({
                y: y + this.isBlack(1),
                x: x
            })
        // are two steps allowed
        if (!isForT && (this.isBlack() ? y === 1 : y === 6) &&
            !isNext2Occupied && !isNext1Occupied) {
            this.possibleMoves.push({
                y: y + this.isBlack(2),
                x: x
            })
        }

        // can i eat front right
        if ((this.isBlack() ? y < 7 : y > 0) && x < 7 &&
            (isForT || this.parent.getPiece(y + this.isBlack(1), x + 1, this.getOpponentColor()))) {
            this.possibleMoves.push({
                y: y + this.isBlack(1),
                x: x + 1,
                kill: true
            })
        }

        // can i eat front left
        if ((this.isBlack() ? y < 7 : y > 0) && x > 0 &&
            (isForT || this.parent.getPiece(y + this.isBlack(1), x - 1, this.getOpponentColor()))) {
            this.possibleMoves.push({
                y: y + this.isBlack(1),
                x: x - 1,
                kill: true
            })
        }
        return this.possibleMoves
    }

    kingMove(isForT = false, initial = true) {
        let x = this.x
        let y = this.y
        let checkArr = [{
            y: y - 1,
            x: x
        }, {
            y: y - 1,
            x: x + 1
        }, {
            y: y - 1,
            x: x - 1
        }, {
            y: y + 1,
            x: x
        }, {
            y: y + 1,
            x: x + 1
        }, {
            y: y + 1,
            x: x - 1
        }, {
            y: y,
            x: x + 1
        }, {
            y: y,
            x: x - 1
        }]

        checkArr = checkArr.filter((check) => this.isLocationExists(check.y, check.x) && (isForT || !this.parent.getPiece(check.y, check.x, this.color)));

        let opponetsMove = !initial ? [] : this.parent.getAllOppMove(this.color, true, false);

        !isForT && checkArr.map((check) => {
            let threat = isForT ? false : opponetsMove.filter(move => move.x === check.x && move.y === check.y)
            // console.log(threat);
            check.threat = threat ? threat.length > 0 : false
            check.kill = this.parent.getPiece(check.y, check.x, this.getOpponentColor()) ? true : false
            return check
        })
        this.possibleMoves = checkArr
        return this.possibleMoves
    }

    queenMove(isForT = false) {
        const rook = this.rookMove(isForT)
        const bishop = this.bishopMove(isForT)
        this.possibleMoves = [...rook, ...bishop]
        return this.possibleMoves
    }

    rookMove(isForT = false) {
        this.possibleMoves = []
        let x = this.x
        let y = this.y



        this.possibleMoves.push(...this.getMovesInDirection(y, x, 1, 0, isForT))
        this.possibleMoves.push(...this.getMovesInDirection(y, x, -1, 0, isForT))
        this.possibleMoves.push(...this.getMovesInDirection(y, x, 0, 1, isForT))
        this.possibleMoves.push(...this.getMovesInDirection(y, x, 0, -1, isForT))

        // // get horizontal movements to right
        // for (let j = x + 1; j < 8; j++) {
        //     let LocOccupied = this.parent.getPiece(y, j)
        //     if (!(LocOccupied && LocOccupied.piece.color == this.color) || isForT) {
        //         this.possibleMoves.push({
        //             y,
        //             x: j,
        //             kill: LocOccupied ? true : false
        //         })
        //         if (LocOccupied && ((LocOccupied.piece.color !== this.color) || (LocOccupied.piece.color == this.color && isForT))) // check if king then keep going
        //             if (!(LocOccupied.piece.color !== this.color && LocOccupied.piece.type == 'king' && isForT))
        //                 break
        //     } else
        //         break
        // }

        // //get horizontal movement left
        // for (let j = x - 1; j > -1; j--) {
        //     let LocOccupied = this.parent.getPiece(y, j)
        //     if (!(LocOccupied && LocOccupied.piece.color == this.color) || isForT) {
        //         this.possibleMoves.push({
        //             y,
        //             x: j,
        //             kill: LocOccupied ? true : false
        //         })
        //         if ((LocOccupied && LocOccupied.piece.color !== this.color) || (LocOccupied && LocOccupied.piece.color == this.color && isForT))
        //             if (!(LocOccupied.piece.color !== this.color && LocOccupied.piece.type == 'king' && isForT))
        //                 break
        //     } else
        //         break
        // }


        // //get vertical movement down
        // for (let i = y + 1; i < 8; i++) {
        //     let LocOccupied = this.parent.getPiece(i, x)
        //     if (!(LocOccupied && LocOccupied.piece.color == this.color) || isForT) {
        //         this.possibleMoves.push({
        //             y: i,
        //             x,
        //             kill: LocOccupied ? true : false
        //         })
        //         if ((LocOccupied && LocOccupied.piece.color !== this.color) || (LocOccupied && LocOccupied.piece.color == this.color && isForT))
        //             if (!(isForT && LocOccupied.piece.color !== this.color && LocOccupied.piece.type == 'king'))
        //                 break
        //     } else
        //         break
        // }

        // //get vertical movement up
        // for (let i = y - 1; i > -1; i--) {
        //     let LocOccupied = this.parent.getPiece(i, x)
        //     if (!(LocOccupied && LocOccupied.piece.color == this.color) || isForT) {
        //         this.possibleMoves.push({
        //             y: i,
        //             x,
        //             kill: LocOccupied ? true : false
        //         })
        //         if ((LocOccupied && LocOccupied.piece.color !== this.color) || (LocOccupied && LocOccupied.piece.color == this.color && isForT))
        //             if (!(isForT && LocOccupied.piece.color !== this.color && LocOccupied.piece.type == 'king'))
        //                 break
        //     } else
        //         break
        // }

        return this.possibleMoves

    }

    bishopMove(isForT = false) {
        // bishop movement
        let x = this.x
        let y = this.y
        this.possibleMoves = []

        this.possibleMoves.push(...this.getMovesInDirection(y, x, 1, 1, isForT))
        this.possibleMoves.push(...this.getMovesInDirection(y, x, 1, -1, isForT))
        this.possibleMoves.push(...this.getMovesInDirection(y, x, -1, 1, isForT))
        this.possibleMoves.push(...this.getMovesInDirection(y, x, -1, -1, isForT))

        // // check for all options to top
        // let temp1 = x + 1
        // let temp2 = x - 1
        // for (let i = y - 1; i > -1; i--) {
        //     if (temp1 < 8 && (isForT || !this.parent.getPiece(i, temp1, this.color))) {
        //         this.possibleMoves.push({
        //             y: i,
        //             x: temp1,
        //             kill: this.parent.getPiece(i, temp1) ? true : false
        //         })
        //         if (this.parent.getPiece(i, temp1, this.getOpponentColor()) ||
        //             this.parent.getPiece(i, temp1, this.color))
        //             temp1 = 8
        //     } else {
        //         temp1 = 8
        //     }

        //     if (temp2 > -1 && (isForT || !this.parent.getPiece(i, temp2, this.color))) {
        //         this.possibleMoves.push({
        //             y: i,
        //             x: temp2,
        //             kill: this.parent.getPiece(i, temp2) ? true : false
        //         })
        //         if (this.parent.getPiece(i, temp2, this.getOpponentColor()) ||
        //             this.parent.getPiece(i, temp2, this.color))
        //             temp2 = -1
        //     } else
        //         temp2 = -1
        //     temp1++
        //     temp2--
        // }

        // //check all options to bottom
        // temp1 = x + 1
        // temp2 = x - 1
        // for (let i = y + 1; i < 8; i++) {
        //     if (temp1 < 8 && (isForT || !this.parent.getPiece(i, temp1, this.color))) {
        //         this.possibleMoves.push({
        //             y: i,
        //             x: temp1,
        //             kill: this.parent.getPiece(i, temp1) ? true : false
        //         })
        //         if (this.parent.getPiece(i, temp1, this.getOpponentColor()) ||
        //             this.parent.getPiece(i, temp1, this.color))
        //             temp1 = 8
        //     } else {
        //         temp1 = 8
        //     }

        //     if (temp2 > -1 && (isForT || !this.parent.getPiece(i, temp2, this.color))) {
        //         this.possibleMoves.push({
        //             y: i,
        //             x: temp2,
        //             kill: this.parent.getPiece(i, temp2) ? true : false
        //         })
        //         if (this.parent.getPiece(i, temp2, this.getOpponentColor()) ||
        //             this.parent.getPiece(i, temp2, this.color))
        //             temp2 = -1
        //     } else
        //         temp2 = -1
        //     temp1++
        //     temp2--
        // }
        return this.possibleMoves
    }

    knightMove(isForT = false) {
        let x = this.x
        let y = this.y
        this.possibleMoves = []

        let checkArr = [{
                y: y + 2,
                x: x + 1
            },
            {
                y: y + 2,
                x: x - 1
            },
            {
                y: y - 2,
                x: x + 1
            },
            {
                y: y - 2,
                x: x - 1
            },
            {
                y: y + 1,
                x: x + 2
            },
            {
                y: y + 1,
                x: x - 2
            },
            {
                y: y - 1,
                x: x + 2
            },
            {
                y: y - 1,
                x: x - 2
            }
        ]

        checkArr.forEach((check) => {
            let oPiece = this.parent.getPiece(check.y, check.x, this.color)
            if (this.isLocationExists(check.y, check.x) && (isForT || !oPiece)) {
                this.possibleMoves.push({
                    y: check.y,
                    x: check.x,
                    kill: this.parent.getPiece(check.y, check.x) ? true : false
                })
            }
        })
        return this.possibleMoves
    }

    getMovesInDirection(y, x, dY, dX, isForT) {
        let moves = []
        for (let i = 1; i < 8; i++) {
            let row = y + dY * i
            let col = x + dX * i
            if (this.isLocationExists(row, col)) {
                let LocOccupied = this.parent.getPiece(row, col)
                if (!(LocOccupied && LocOccupied.piece.color == this.color) || isForT) {
                    moves.push({
                        y: row,
                        x: col,
                        kill: LocOccupied ? true : false
                    })
                    if (LocOccupied && ((LocOccupied.piece.color !== this.color) || (LocOccupied.piece.color == this.color && isForT)))
                        if (!(LocOccupied.piece.color !== this.color && LocOccupied.piece.type == 'king' && isForT)) // check if king then keep going
                            break
                } else break
            } else break

        }
        return moves
    }
}
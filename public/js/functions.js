let selectedPieceIndex = 0


const create_table = () => {


    //create div containers
    const divC = document.createElement('div')
    divC.classList.add('chess-container')

    const div = document.createElement('div')
    div.classList.add('chess-inner')

    divC.appendChild(div)

    // add the div to body
    document.body.appendChild(divC)

    // create the table and add to div
    const table = document.createElement('table')

    div.appendChild(table)
    // table borders
    const navR = document.createElement('div')
    navR.classList.add('chess-nav', 'right-nav')
    const navL = document.createElement('div')
    navL.classList.add('chess-nav', 'left-nav')
    const navT = document.createElement('div')
    navT.classList.add('chess-nav', 'top-nav')
    const navB = document.createElement('div')
    navB.classList.add('chess-nav', 'bottom-nav')

    const rotateIcon = document.createElement('i')
    rotateIcon.classList.add('fa-solid', 'fa-rotate')
    rotateIcon.id = "rotate-board"
    rotateIcon.setAttribute('title', 'roatate the board 180 degrees')

    const resetIcon = document.createElement('i')
    resetIcon.classList.add('fa-solid', 'fa-arrow-rotate-left')
    resetIcon.id = "reset-board"
    resetIcon.setAttribute('title', 'reset the board and start agian')

    createNumbers(true, navL)
    createNumbers(false, navT)


    div.appendChild(navR)
    div.appendChild(navL)
    div.appendChild(navT)
    div.appendChild(navB)
    div.appendChild(rotateIcon)
    div.appendChild(resetIcon)

    // create rows and cells
    let i = 0
    while (i < 8) {
        let row = table.insertRow(i)
        let j = 0;
        while (j < 8) {
            let cell = row.insertCell(j)
            cell.id = `${i}-${j}`
            j++
        }
        i++
    }

    rotateIcon.addEventListener('click', (e) => {
        table.classList.toggle('board-reverse')
        Array.from(table.querySelectorAll('td')).forEach(el => el.classList.toggle('board-reverse'))
        pieceClass.turnDiv.style.opacity = '0'
        setTimeout(() => {
            pieceClass.turnDiv.style.opacity = '1'
            pieceClass.turnDiv.style.bottom = pieceClass.turnDiv.style.bottom.includes('100') ? '-10%' : '100%'
        }, 600)
    })

    resetIcon.addEventListener('click', (e) => {
        const mainDiv = document.querySelector('.chess-container')

        mainDiv.remove()
        GameDiv.style.display = ''

        // pieceClass.resetBoard([chessPiecesB, chessPiecesW])
        // addListeners()
    })

    if (Mycolor == 'black') {
        rotateIcon.click()
    }
}

//needed to initialize all icon click event
const addListeners = () => {
    const icon = document.querySelectorAll(`.chess-inner tr td i.chess-${Mycolor}`)
    Array.from(icon).forEach((el) => {
        el.addEventListener('click', iconEventCB)
    })
}

//callback function for icon click event (to show and add listeners to allowed moves)
const iconEventCB = (e) => {

    clearListeners() //clear all listeners before preceeding to current events

    e.target.parentElement.classList.add('focused-piece')

    let x = Number(e.target.getAttribute('data-x'))
    let y = Number(e.target.getAttribute('data-y'))

    let currentPiece = pieceClass.getPiece(y, x)
    pieceClass.index = currentPiece.index
    if (pieceClass.isMyTurn(currentPiece.index)) {
        let positions = currentPiece.piece.possibleMoveLocations()
        let kingThreats = pieceClass.isKingAttacked()
        let isKing = positions.length > 0 && (positions[0].threat == false || positions[0].threat == true)
        let isKingHasThreat = positions.length > 0 && ((positions[0].threat || positions[0].threat == false) ? positions.filter(x => x.threat == true).length > 0 : false)

        positions = positions.filter(pos => {
            if (!isKing && pieceClass.kingAttackedManager(pos.y, pos.x, kingThreats)) {
                return true
            }
            if (isKing) {
                return true
            }
            return false
        })
        positions = pieceClass.kingAttackAfterMove(currentPiece.piece, positions)
        positions.forEach((pos) => {
            if (!pos.threat) {
                addListenerToSelectors(
                    `#\\3${pos.y}-${pos.x}, #\\3${pos.y}-${pos.x} i`,
                    (element) => {
                        element.classList.add('move-option')
                        if (pos.kill) {
                            element.classList.add('move-option-kill')
                        }
                    })
            } else {
                document.getElementById(`${pos.y}-${pos.x}`).classList.add('move-option-threat', 'move-option')
            }
        })



    } else { // if not his turn
        e.target.parentElement.classList.remove('focused-piece')
        e.target.parentElement.classList.add('focused-piece-other')
    }
    Array.from(document.querySelectorAll(
        'td:not(.move-option):empty')).forEach(el => {
        el.addEventListener('click', removeCurrentSelection)
    })
}

//callback to apply a click and move element to this location
function cellEventCB(e) {
    let id = e.target.id
    if (!id)
        id = e.target.parentElement.id
    let y = Number(id.split('-')[0])
    let x = Number(id.split('-')[1])
    pieceClass.setLocation(y, x)
    clearListeners()
}

// needed a middle function in order to add/remove click listeners
const removeCurrentSelection = (e) => {
    clearListeners()
}

// get a selector and adds a listener to each element thats retreived
const addListenerToSelectors = (selector, func) => {
    const elements = Array.from(document.querySelectorAll(selector))
    elements.forEach((el) => {
        if (func)
            func(el)
        el.removeEventListener('click', iconEventCB)
        el.addEventListener('click', cellEventCB)
    })
}

// clear all listeners and reinitalize only needed click events
const clearListeners = () => {
    Array.from(document.querySelectorAll('.chess-inner td, .chess-inner td i')).forEach(el => {
        el.classList.remove('move-option', 'move-option-kill', 'move-option-threat', 'focused-piece-other', 'focused-piece')
        el.removeEventListener('click', cellEventCB)
        el.removeEventListener('click', iconEventCB)
        el.removeEventListener('click', removeCurrentSelection) // in trial
    })
    addListeners()
}

//generates table numeric and charcters numbers to the board left and top nav
function createNumbers(isNumbers, parent) {
    for (let i = 0; i < 8; i++) {
        const div = document.createElement('div')
        div.classList.add(isNumbers ? 'vertical-numbers' : 'horizontal-numbers')
        div.innerText = isNumbers ? i + 1 : String.fromCharCode(i + 1 + 64)
        parent.appendChild(div)
    }
}

// function setCookie(name, value, days) {
//     var expires = "";
//     if (days) {
//         var date = new Date();
//         date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
//         expires = "; expires=" + date.toUTCString();
//     }
//     document.cookie = name + "=" + (value || "") + expires + "; path=/";
// }

// function getCookie(name) {
//     var nameEQ = name + "=";
//     var ca = document.cookie.split(';');
//     for (var i = 0; i < ca.length; i++) {
//         var c = ca[i];
//         while (c.charAt(0) == ' ') c = c.substring(1, c.length);
//         if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
//     }
//     return null;
// }

// const copyText = (txt) => {
//     navigator.clipboard.writeText(txt)
// }
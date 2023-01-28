function entierAleatoire(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function setChat() {
    setTimeout(() => {
        while (document.getElementsByTagName('canvas').length === 0) {}
        document.getElementsByTagName('canvas')[0].style.position = 'relative'
        document.getElementsByTagName('canvas')[0].style.left = innerWidth / 2 - 500 + 'px'

        let chatEl = document.createElement('div')
        let chatTitle = document.createElement('h3')
        chatTitle.innerHTML = 'Salon de discussion'
        chatTitle.style.textAlign = 'center'
        let chatBody = document.createElement('div')
        chatBody.id = 'chatBody'
        chatBody.style.display = 'flex'
        chatBody.style.flexDirection = 'column'
        let chatInput = document.createElement('input')
        chatInput.id = 'chatUserInput'
        chatInput.style =
            "height: 30px; font-family:'Roboto-Thin'; margin: auto;" +
            'padding:10px; font-size:20px; border-width:4px; border-bottom-color: #BCC4CA; border-right-color: #BCC4CA;' +
            ' border-left-color: white;border-top-color: white; border-radius: 10px;'
        chatInput.placeholder = 'Dire quelque chose'
        chatInput.type = 'text'
        chatInput.onkeydown = (e) => {
            if (e.keyCode === 13) {
                const text = chatInput.value
                sendTxt(text)
                document.getElementById('chatUserInput').value = ''
            } else if (e.keyCode === 32) {
                document.getElementById('chatUserInput').value += ' '
            }
        }
        chatInput.addEventListener('focus', (e) => {
            canRestart = false
        })
        chatInput.addEventListener('focusout', (e) => {
            canRestart = true
        })
        chatEl.style.color = 'white'
        chatBody.style.maxHeight =
            innerHeight -
            document.getElementsByTagName('canvas')[0].offsetHeight -
            20 -
            chatTitle.offsetHeight -
            chatInput.offsetHeight -
            150 +
            'px'
        chatBody.style.overflow = 'auto'
        chatEl.appendChild(chatTitle)
        chatEl.appendChild(chatBody)
        chatEl.appendChild(chatInput)
        chatEl.style.position = 'relative'
        chatEl.style.left = innerWidth / 2 - 500 + 'px'
        chatEl.style.width = document.getElementsByTagName('canvas')[0].offsetWidth + 'px'
        chatEl.style.height =
            innerHeight - document.getElementsByTagName('canvas')[0].offsetHeight - 20 - 50 + 'px'
        chatEl.style.backgroundColor = 'black'
        document.body.appendChild(chatEl)
        ladder.style.width = document.getElementsByTagName('canvas')[0].offsetWidth + 'px'
        ladder.style.overflow = 'auto'
        ladder.style.position = 'absolute'
        ladder.style.left = innerWidth / 2 - 500 + 'px'
        ladder.style.top = '10px'
        ladder.style.backgroundColor = 'black'
        ladder.style.color = 'white'
    }, 1)
}

function genScope() {
    let controller = false
    const innerSocket = io.connect(location.origin)

    fetch('/me')
        .then((res) => {
            if (res.ok) {
                return res.json()
            }
            location.replace(`${location.origin}/authRedirect/${window.btoa(location.href)}`)
        })
        .then((value) => {
            innerSocket.emit('auth', {
                userId: value.id,
                socketToken: value.socketToken,
            })
        })

    window.sendTxt = (text) => {
        if (text !== '') {
            innerSocket.emit('gameChat', text)
        }
    }

    function genGame(password, pseudo, ioSocket) {
        let others = {}

        const config = {
            type: Phaser.CANVAS,
            width: 500,
            height: 200,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 700 },
                    debug: false,
                },
            },
            scene: [MainMenu, Level2, Level1, Level3, Level4],
            pixelArt: true,
            zoom: 2,
        }

        const game = new Phaser.Game(config)
        game.password = password
        game.pseudo = pseudo
        game.socket = ioSocket

        let controller = function (type, action, psd, obj) {
            if (type === 0) {
                switch (action) {
                    case 'leaderboard':
                        break
                }
            } else if (type === 1) {
                if (psd === password) {
                    switch (action) {
                        case 'update':
                            break
                        case 'changeSkin':
                            break
                    }
                }
            }
        }
        return controller
    }

    innerSocket.on('getId', (id, psd) => {
        controller = genGame(id, psd, innerSocket)
        setChat()
    })

    // sockets events

    innerSocket.on('gameChat', (obj) => {
        let p = document.createElement('p')
        // p.className = "chatParagraph";
        let txt = '.b' + obj.psd + '!b' + ' : ' + obj.txt
        let dtxt = document.createTextNode(txt)
        p.appendChild(dtxt)
        document.getElementById('chatBody').appendChild(p)
        transformMarks()
        document.getElementById('chatBody').scroll(0, 10000000)
    })

    innerSocket.on('logAndComeBack', () => {
        sessionStorage.setItem('goTo', location.pathname)
        location.replace('/login')
    })

    innerSocket.on('disconnect', () => {
        alert(
            'Vous avez ete deconnecte, cela est probablement du à une mise a jour du serveur faite par ' +
                'Le gentil developpeur, nous devons rafraichir la page, desole pour le derrangement'
        )
        location.reload()
    })

    innerSocket.on('ladderTournois', (arr) => {
        ladder.innerHTML = ''
        let userIds = []
        // tri data
        for (let i = 0, rank = 1; i < arr.length; i++, rank++) {
            let canStore = true
            for (let j = 0; j < userIds.length; j++) {
                if (arr[i].userId === userIds[j]) {
                    canStore = false
                    rank--
                    break
                }
            }
            const username = users.get(arr[i].userId)?.username
            if (canStore && username) {
                let p = document.createElement('p')
                p.appendChild(document.createTextNode(rank + '. ' + username))
                p.innerHTML += ' &rarr; '
                p.appendChild(
                    document.createTextNode(
                        `score : ${arr[i].score}, sauts : ${arr[i].jumps}, temps : ${arr[i].time}`
                    )
                )
                p.className = 'ladder'
                ladder.appendChild(p)
                userIds.push(arr[i].userId)
            }
        }
        ladder.innerHTML +=
            "<br><br><p class='ladder'>" +
            scoreActuel.psd +
            ' &rarr; ' +
            Math.round(scoreActuel.score) +
            ', sauts : ' +
            scoreActuel.jumps +
            ', temps : ' +
            scoreActuel.time
        ladder.innerHTML +=
            "<br><br><p class='ladder'>Appuyer sur 'r' pour recommencer, sur 'q' pour aller sur le menu.</p>"
    })
}

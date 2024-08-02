const LOCAL_STORAGE_KEYS = {
    PLAYER_X: 'PLAYER_X',
    PLAYER_Y: 'PLAYER_Y',
}

function savePlayerPosition(x, y) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PLAYER_X, x.toString())
    localStorage.setItem(LOCAL_STORAGE_KEYS.PLAYER_Y, y.toString())
}

function getPlayerPosition() {
    const xRaw = localStorage.getItem(LOCAL_STORAGE_KEYS.PLAYER_X)
    const yRaw = localStorage.getItem(LOCAL_STORAGE_KEYS.PLAYER_Y)

    if (xRaw === null || yRaw === null) {
        return {
            x: 20,
            y: 1550,
        }
    }

    return { x: +xRaw, y: +yRaw }
}

class MainMenu extends Phaser.Scene {
    frames = 0

    constructor() {
        super({
            key: 'MainMenu',
        })
    }

    preload() {
        this.load.image('tilesetPokemon', './assets/maps/tilesets/tileset_pokemon.png')
        this.load.tilemapTiledJSON('MainMenu', './assets/maps/tilemaps/MainMenu.json')
        loadSkins(this)
    }

    create() {
        this.available = true
        this.spriteName = getSkinForUser(this.game.user)
        this.canMove = true
        this.notWonYet = true
        this.jumps = 0
        this.timeStart = Date.now()
        this.goToMap = (str) => {
            jumpSetter(0)
            clearInterval(this.liveInterval)
            this.available = false
            this.game.socket.off('livePos', this.liveHandler)
            this.game.socket.off('deletePlayer', this.delHandler)
            this.scene.start(str)
        }

        const map = this.add.tilemap('MainMenu')
        const tileset = map.addTilesetImage('tileset_pokemon', 'tilesetPokemon')

        //layers
        const solidLayer = map.createStaticLayer('solid', [tileset], 0, 0)
        const skyLayer = map.createStaticLayer('ground', [tileset], 0, 0).setDepth(-1)

        this.othersPlayers = {}
        this.mapName = 'MainMenu'

        // pour restart cette map
        this.input.keyboard.on('keyup', (e) => {
            if (e.key === 'r' && canRestart) {
                this.goToMap('MainMenu')
            }
            if (e.key === 'q' && canRestart) {
                this.goToMap('MainMenu')
            }
            if (e.key === 'A') {
                this.goToMap('Level1')
            }
        })

        const { x, y } = getPlayerPosition()

        this.player = this.physics.add.sprite(x, y, this.spriteName)

        this.player.body.setCircle(11, 6, 25)
        this.physics.add.world.gravity = { x: 0, y: 0 }

        //  this.player physics properties. Give the little guy a slight bounce.
        this.player.setBounce(0.1)
        this.player.setCollideWorldBounds(true)

        //collisions
        solidLayer.setCollisionByProperty({ solid: true })

        this.physics.add.collider(solidLayer, this.player, (sprite, tile) => {
            if (tile.properties.hasOwnProperty('win')) {
                this.goToMap(tile.properties.win)
                console.log(tile.properties.win)
            } else if (tile.properties.hasOwnProperty('dead')) {
                this.goToMap('MainMenu')
                document.getElementById('ladder').style.visibility = 'hidden'
                document.getElementsByTagName('canvas')[0].style.visibility = 'visible'
            }
        })

        setupAnimations(this)

        //  Input Events
        this.game.cursors = this.input.keyboard.createCursorKeys()

        //camera
        this.cameras.main.startFollow(this.player)
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)

        this.liveInterval = setInterval(() => {
            const gameObj = {
                x: this.player.x,
                y: this.player.y,
                skin: this.spriteName,
                map: this.mapName,
                anim: this.anim,
            }
            this.game.socket.emit('livePos', gameObj, this.game.password)
        }, 40)

        this.liveHandler = (obj) => {
            if (this.available) {
                for (const key in obj) {
                    if (key !== this.game.pseudo) {
                        if (this.mapName === obj[key].map) {
                            if (this.othersPlayers.hasOwnProperty(key)) {
                                this.othersPlayers[key].x = obj[key].x
                                this.othersPlayers[key].y = obj[key].y
                                this.othersPlayers[key].nameDisplayer.x =
                                    obj[key].x - this.othersPlayers[key].nameDisplayer.width / 2
                                this.othersPlayers[key].nameDisplayer.y = obj[key].y - 50
                                this.othersPlayers[key].anims.play(
                                    obj[key].anim + '_' + obj[key].skin,
                                    true
                                )
                            } else {
                                const localBody = this.physics.add.sprite(
                                    obj[key].x,
                                    obj[key].y,
                                    obj[key].skin
                                )

                                localBody.body.setCircle(11, 6, 25)
                                localBody.setCollideWorldBounds(true)
                                localBody.body.moves = false
                                this.physics.collide(this.player, localBody)
                                this.physics.add.collider(
                                    this,
                                    true,
                                    this.player,
                                    localBody,
                                    () => {}
                                )
                                this.othersPlayers[key] = localBody
                                this.othersPlayers[key].nameDisplayer = this.add.text(16, 16, key, {
                                    fontSize: '18px',
                                    fill: '#F00',
                                })
                            }
                        } else {
                            if (this.othersPlayers.hasOwnProperty(key)) {
                                this.othersPlayers[key].disableBody(true, true)
                                this.othersPlayers[key].nameDisplayer.destroy()
                            }
                        }
                    }
                }
            }
        }
        this.delHandler = (pseudo) => {
            if (this.othersPlayers.hasOwnProperty(pseudo)) {
                this.othersPlayers[pseudo].disableBody(true, true)
                this.othersPlayers[pseudo].nameDisplayer.destroy()
                delete this.othersPlayers[pseudo]
            }
        }
        this.game.socket.on('livePos', this.liveHandler)
        this.game.socket.on('deletePlayer', this.delHandler)
    }

    update() {

        this.frames++

        if (this.frames === 20) {
            this.frames = 0
            savePlayerPosition(this.player.x, this.player.y)
        }

        if (this.canMove) {
            if (this.game.cursors.left.isDown) {
                this.player.setVelocityX(-160)
                this.player.setVelocityY(0)
                this.player.anims.play('left_' + this.spriteName, true)
                this.anim = 'left'
            } else if (this.game.cursors.right.isDown) {
                this.player.setVelocityX(160)
                this.player.setVelocityY(0)
                this.player.anims.play('right_' + this.spriteName, true)
                this.anim = 'right'
            } else if (this.game.cursors.up.isDown) {
                this.player.setVelocityY(-160)
                this.player.setVelocityX(0)
                this.player.anims.play('up_' + this.spriteName, true)
                this.anim = 'up'
            } else if (this.game.cursors.down.isDown) {
                this.player.setVelocityY(160)
                this.player.setVelocityX(0)
                this.player.anims.play('down_' + this.spriteName, true)
                this.anim = 'down'
            } else {
                this.player.setVelocityX(0)
                this.player.setVelocityY(0)
                this.player.anims.play('idle_' + this.spriteName)
                this.anim = 'idle'
            }
        }
    }
}

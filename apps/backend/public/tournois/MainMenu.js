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
        let self = this
        self.available = true
        this.spriteName = getSkinForUser(self.game.user)
        this.canMove = true
        this.notWonYet = true
        this.jumps = 0
        this.timeStart = Date.now()
        this.goToMap = (str) => {
            jumpSetter(0)
            clearInterval(self.liveInterval)
            self.available = false
            self.game.socket.off('livePos', self.liveHandler)
            self.game.socket.off('deletePlayer', self.delHandler)
            this.scene.start(str)
        }

        const map = this.add.tilemap('MainMenu')
        const tileset = map.addTilesetImage('tileset_pokemon', 'tilesetPokemon')

        //layers
        let solidLayer = map.createStaticLayer('solid', [tileset], 0, 0)
        let skyLayer = map.createStaticLayer('ground', [tileset], 0, 0).setDepth(-1)

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
        self.physics.add.world.gravity = { x: 0, y: 0 }

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
        self.game.cursors = this.input.keyboard.createCursorKeys()

        //camera
        this.cameras.main.startFollow(this.player)
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)

        self.liveInterval = setInterval(() => {
            const gameObj = {
                x: self.player.x,
                y: self.player.y,
                skin: self.spriteName,
                map: self.mapName,
                anim: self.anim,
            }
            self.game.socket.emit('livePos', gameObj, self.game.password)
        }, 40)

        self.liveHandler = (obj) => {
            if (self.available) {
                for (let key in obj) {
                    if (key !== self.game.pseudo) {
                        if (self.mapName === obj[key].map) {
                            if (self.othersPlayers.hasOwnProperty(key)) {
                                self.othersPlayers[key].x = obj[key].x
                                self.othersPlayers[key].y = obj[key].y
                                self.othersPlayers[key].nameDisplayer.x =
                                    obj[key].x - self.othersPlayers[key].nameDisplayer.width / 2
                                self.othersPlayers[key].nameDisplayer.y = obj[key].y - 50
                                self.othersPlayers[key].anims.play(
                                    obj[key].anim + '_' + obj[key].skin,
                                    true
                                )
                            } else {
                                const localBody = self.physics.add.sprite(
                                    obj[key].x,
                                    obj[key].y,
                                    obj[key].skin
                                )

                                localBody.body.setCircle(11, 6, 25)
                                localBody.setCollideWorldBounds(true)
                                localBody.body.moves = false
                                self.physics.collide(self.player, localBody)
                                self.physics.add.collider(
                                    self,
                                    true,
                                    self.player,
                                    localBody,
                                    () => {}
                                )
                                self.othersPlayers[key] = localBody
                                self.othersPlayers[key].nameDisplayer = this.add.text(16, 16, key, {
                                    fontSize: '18px',
                                    fill: '#F00',
                                })
                            }
                        } else {
                            if (self.othersPlayers.hasOwnProperty(key)) {
                                self.othersPlayers[key].disableBody(true, true)
                                self.othersPlayers[key].nameDisplayer.destroy()
                            }
                        }
                    }
                }
            }
        }
        self.delHandler = (pseudo) => {
            if (self.othersPlayers.hasOwnProperty(pseudo)) {
                self.othersPlayers[pseudo].disableBody(true, true)
                self.othersPlayers[pseudo].nameDisplayer.destroy()
                delete self.othersPlayers[pseudo]
            }
        }
        self.game.socket.on('livePos', self.liveHandler)
        self.game.socket.on('deletePlayer', self.delHandler)
    }

    update() {
        let self = this

        this.frames++

        if (this.frames === 20) {
            this.frames = 0
            savePlayerPosition(this.player.x, this.player.y)
        }

        if (this.canMove) {
            if (self.game.cursors.left.isDown) {
                this.player.setVelocityX(-160)
                this.player.setVelocityY(0)
                this.player.anims.play('left_' + self.spriteName, true)
                self.anim = 'left'
            } else if (self.game.cursors.right.isDown) {
                this.player.setVelocityX(160)
                this.player.setVelocityY(0)
                this.player.anims.play('right_' + self.spriteName, true)
                self.anim = 'right'
            } else if (self.game.cursors.up.isDown) {
                this.player.setVelocityY(-160)
                this.player.setVelocityX(0)
                this.player.anims.play('up_' + self.spriteName, true)
                self.anim = 'up'
            } else if (self.game.cursors.down.isDown) {
                this.player.setVelocityY(160)
                this.player.setVelocityX(0)
                this.player.anims.play('down_' + self.spriteName, true)
                self.anim = 'down'
            } else {
                this.player.setVelocityX(0)
                this.player.setVelocityY(0)
                this.player.anims.play('idle_' + self.spriteName)
                self.anim = 'idle'
            }
        }
    }
}

class Level2 extends Phaser.Scene {
    constructor() {
        super({
            key: 'Level2',
        })
    }

    preload() {
        this.load.image('tileset', './assets/maps/tilesets/marioTileset.png')
        this.load.tilemapTiledJSON('Level2', './assets/maps/tilemaps/Level2.json')
        loadSkins(this)
    }

    create() {
        this.available = true
        this.anim = 'idle'
        this.accel = false
        this.accelBol = true
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

        const map = this.add.tilemap('Level2')
        const tileset = map.addTilesetImage('marioTileset', 'tileset')

        //layers
        const solidLayer = map.createStaticLayer('solid', [tileset], 0, 0)
        // let skyLayer = map.createStaticLayer("sky", [tileset], 0, 0).setDepth(-1);

        // pour restart cette map
        this.input.keyboard.on('keyup', (e) => {
            if (e.key === 'r' && canRestart) {
                this.goToMap('Level2')
                document.getElementById('ladder').style.visibility = 'hidden'
                document.getElementsByTagName('canvas')[0].style.visibility = 'visible'
            }
            if (e.key === 'q' && canRestart) {
                this.goToMap('MainMenu')
                document.getElementById('ladder').style.visibility = 'hidden'
                document.getElementsByTagName('canvas')[0].style.visibility = 'visible'
            }
            if (e.key === 'A') {
                this.goToMap('Level4')
                document.getElementById('ladder').style.visibility = 'hidden'
                document.getElementsByTagName('canvas')[0].style.visibility = 'visible'
            }
        })

        this.othersPlayers = {}
        this.mapName = 'Level2'

        this.player = this.physics.add.sprite(80, 1250, this.spriteName)

        this.player.body.setCircle(11, 6, 25)

        // fais legerement rebondir le perso
        this.player.setBounce(0.1)
        this.player.setCollideWorldBounds(true)

        //collisions
        solidLayer.setCollisionByProperty({ solid: true })

        this.physics.add.collider(solidLayer, this.player, (sprite, tile) => {
            if (this.accelBol) {
                this.accel = false
            }
            if (tile.properties.hasOwnProperty('win')) {
                if (this.notWonYet) {
                    this.notWonYet = false
                    this.canMove = false
                    const dTime = Math.round((Date.now() - this.timeStart) / 10) / 100
                    const score =
                        '.iMon score est de : ' +
                        this.jumps +
                        ' sauts et ' +
                        Math.round((Date.now() - this.timeStart) / 10) / 100 +
                        ' secondes sur la map 2 !!i'
                    this.game.socket.emit(
                        'scoreTournois',
                        { jumps: this.jumps, time: dTime, password: this.game.password },
                        2
                    )
                    scoreActuel.score = (dTime + this.jumps) * 100
                    scoreActuel.jumps = this.jumps
                    scoreActuel.time = dTime
                    sendTxt(score)
                    document.getElementById('ladder').style.visibility = 'visible'
                    document.getElementsByTagName('canvas')[0].style.visibility = 'hidden'
                }
            } else if (tile.properties.hasOwnProperty('bounce')) {
                this.player.setVelocityY(tile.properties['bounce'])
            } else if (tile.properties.hasOwnProperty('dead')) {
                this.goToMap('Level2')
                document.getElementById('ladder').style.visibility = 'hidden'
                document.getElementsByTagName('canvas')[0].style.visibility = 'visible'
            } else if (tile.properties.hasOwnProperty('accel')) {
                this.accel = true
                this.accelBol = false
                this.player.setVelocityX(tile.properties.accel)
                setTimeout(() => {
                    this.accelBol = true
                }, 1000)
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

        if (this.canMove) {
            if (this.game.cursors.left.isDown && !this.accel) {
                this.player.setVelocityX(-160)

                if (this.player.body.onFloor()) {
                    this.player.anims.play('left_' + this.spriteName, true)
                    this.anim = 'left'
                } else {
                    this.player.anims.play('leftJump_' + this.spriteName, true)
                    this.anim = 'leftJump'
                }
            } else if (this.game.cursors.right.isDown && !this.accel) {
                this.player.setVelocityX(160)

                if (this.player.body.onFloor()) {
                    this.player.anims.play('right_' + this.spriteName, true)
                    this.anim = 'right'
                } else {
                    this.player.anims.play('rightJump_' + this.spriteName, true)
                    this.anim = 'rightJump'
                }
            } else {
                if (!this.accel) {
                    this.player.setVelocityX(0)
                }

                this.player.anims.play('idle_' + this.spriteName)
                this.anim = 'idle'
            }
            if (this.game.cursors.up.isDown && this.player.body.onFloor()) {
                this.player.setVelocityY(-430)
                this.jumps++
                jumpSetter(this.jumps)
            }
        }
    }
}

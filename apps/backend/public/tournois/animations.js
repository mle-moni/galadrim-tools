const skins = ['leo', 'victorieux']

const skinsSet = new Set(skins)

function getSkinForUser(player) {
    if (skinsSet.has(player.skin)) {
        return player.skin
    }
    return 'leo'
}

function loadSkins(instance) {
    for (const skin of skins) {
        instance.load.spritesheet(skin, `./assets/sprites/${skin}_full.png`, {
            frameWidth: 32,
            frameHeight: 48,
        })
    }
}

function setupAnimations(instance) {
    //  Our this.player animations, idleing, walking left and walking right. + left and right on air

    for (const skin of skins) {
        instance.anims.create({
            key: 'left_' + skin,
            frames: instance.anims.generateFrameNumbers(skin, { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1,
        })

        instance.anims.create({
            key: 'up_' + skin,
            frames: instance.anims.generateFrameNumbers(skin, { start: 12, end: 15 }),
            frameRate: 5,
            repeat: -1,
        })

        instance.anims.create({
            key: 'down_' + skin,
            frames: instance.anims.generateFrameNumbers(skin, { start: 8, end: 11 }),
            frameRate: 5,
            repeat: -1,
        })

        instance.anims.create({
            key: 'leftJump_' + skin,
            frames: instance.anims.generateFrameNumbers(skin, { start: 0, end: 3 }),
            frameRate: 3,
            repeat: -1,
        })

        instance.anims.create({
            key: 'rightJump_' + skin,
            frames: instance.anims.generateFrameNumbers(skin, { start: 4, end: 7 }),
            frameRate: 3,
            repeat: -1,
        })

        instance.anims.create({
            key: 'idle_' + skin,
            frames: [{ key: skin, frame: 8 }],
            frameRate: 20,
        })

        instance.anims.create({
            key: 'right_' + skin,
            frames: instance.anims.generateFrameNumbers(skin, { start: 4, end: 7 }),
            frameRate: 5,
            repeat: -1,
        })
    }
}

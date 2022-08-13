import { RenouvArtWaitProps } from './RenouvArtWait'

const aleas = ['r', 'g', 'b'] as const

const MAX_SPEED = 0.1
const MIN_SPEED = 0.05
const SPEED_STEP = 0.001

class Ball {
    constructor(public angle: number, public w: number) {}
}

function entierAleatoire(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export class RenouvArtLogic {
    private ctx: CanvasRenderingContext2D
    private animation: number
    private center: number
    private speed = MIN_SPEED
    private balls: Ball[] = []
    private ani = new Ball(0, 10)
    private speedIncreasing = true
    private color = {
        r: entierAleatoire(0, 255),
        g: entierAleatoire(0, 255),
        b: entierAleatoire(0, 255),
    }
    private linearSpeed = false
    private mainBallColor = 'white'

    constructor(private canvas: HTMLCanvasElement, params: RenouvArtWaitProps) {
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('could not get canvas 2d context')
        this.ctx = ctx
        this.center = canvas.width / 2

        this.setParams(params)
        this.init()
        this.animation = requestAnimationFrame(() => this.draw())
    }
    setParams(params: RenouvArtWaitProps) {
        if (params.speed) {
            this.linearSpeed = true
            this.speed = params.speed / 100
        }
        if (params.mainBallColor) this.mainBallColor = params.mainBallColor
    }
    init() {
        for (let i = 1; i < 20; i++) {
            this.balls.push(new Ball(0.1 * i, 10 - i / 2))
        }
    }
    cleanup() {
        cancelAnimationFrame(this.animation)
    }
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        this.ani.angle += this.speed

        this.drawBalls()
        this.drawMainBall()
        this.updateSpeed()

        this.color[aleas[entierAleatoire(0, aleas.length - 1)]] += 1
        this.animation = requestAnimationFrame(() => this.draw())
    }
    drawBalls() {
        for (let i = 0; i < this.balls.length; i++) {
            this.ctx.fillStyle = `RGB(${(this.color.r + i) % 255},${(this.color.g + i) % 255},${
                (this.color.b + i) % 255
            })`
            this.ctx.beginPath()
            this.ctx.arc(
                this.center + Math.cos(this.ani.angle - this.balls[i].angle) * 50,
                this.center + Math.sin(this.ani.angle - this.balls[i].angle) * 50,
                this.balls[i].w,
                0,
                2 * Math.PI
            )
            this.ctx.fill()
        }
    }
    drawMainBall() {
        this.ctx.fillStyle = this.mainBallColor
        this.ctx.beginPath()
        this.ctx.arc(
            this.center + Math.cos(this.ani.angle) * 50,
            this.center + Math.sin(this.ani.angle) * 50,
            this.ani.w,
            0,
            2 * Math.PI
        )
        this.ctx.fill()
    }
    updateSpeed() {
        if (this.linearSpeed) return
        if (this.speedIncreasing && this.speed < MAX_SPEED) {
            this.speed += SPEED_STEP
            if (this.speed >= MAX_SPEED) {
                this.speedIncreasing = false
            }
        } else if (this.speedIncreasing === false && this.speed > MIN_SPEED) {
            this.speed -= SPEED_STEP
            if (this.speed <= MIN_SPEED) {
                this.speedIncreasing = true
            }
        }
    }
}

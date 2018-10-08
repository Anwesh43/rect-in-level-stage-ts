const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5

class RectInLevelStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    ril : RectInLevel = new RectInLevel()
    animator : Animator = new Animator()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.ril.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.ril.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.ril.update(() => {
                        this.animator.stop()
                        this.render()
                    })
                })
            })
        }
    }

    static init() {
        const stage : RectInLevelStage = new RectInLevelStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += 0.05 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    interval : number
    animated : boolean = false

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class RILNode {
    prev : RILNode
    next : RILNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new RILNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const gap : number = w / (nodes + 1)
        const size : number = gap/3
        const scale : number = this.state.scale
        context.fillStyle = '#283593'
        context.save()
        context.translate(gap + this.i * gap, h/2)
        for (var j = 0; j < 2; j++) {
            const x = -size + j * size
            const sf = 1 - 2 * j
            const sc = Math.min(0.5, Math.max(0, scale - 0.5 * j)) * 2
            const y = (size/2 + h/2) * (1 - sc) * sf * -1
            context.fillRect(x,y, size, size/2)
        }
        context.restore()
        if (this.prev) {
            this.prev.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : RILNode {
        var curr = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class RectInLevel {
    curr : RILNode = new RILNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

import {Sound}   from '../../_snd/sound.js'
import {Ticker}  from '../../_lib/timer.js'
import {Vec2}    from '../../_lib/vec2.js'
import {U,R,L}   from '../../_lib/direction.js'
import {Cvs,Ctx} from '../_canvas.js'
import {Game}    from '../_main.js'
import {State}   from '../_state.js'
import {Maze}    from '../maze.js'
import {Ghost}   from '../ghosts/ghost.js'
import Sprite    from '../ghosts/ghost_sprite_cb.js'
import PacSprite from '../pacman/pac_sprite.js'
import {TileSize as T} from '../_constants.js'

const ModSymbol = Symbol()
const IntermissionMap = new Map([[2,1], [5,2], [9,3]])

export class CBreak {
	/** @type {Scene1|Scene2|Scene3|null} */
	static #scene = null
	static begin(num=IntermissionMap.get(Game.level)) {
		if (State.isCBreak || !between(num,1,3)) return false
		Sound.play('cutscene', {loop:1^num == 2})
		CBreak.#scene = new [Scene1,Scene2,Scene3][num-1]
		return true
	}
	static update() {this.#scene?.update(this.#scene)}
	static draw()   {this.#scene?.draw(this.#scene)}

	pacPos    = Vec2()
	Pacman    = new PacSprite
	Akabei    = new Ghost
	pacPaused = false
	pacVelX   = -Maze.Width/180
	constructor(symbol) {
		if (symbol != ModSymbol)
			throw TypeError('The constructor is not visible')
		this.pacPos.y =
		this.Akabei.y = Cvs.height/2 - T/2
		this.Akabei.state.switchToWalk()
		$on('Quit.CB', this.end)
		$on('blur.CB focus.CB', this.pause)
		State.switchToCBreak()
	}
	movePacman() {
		!this.pacPaused && (this.pacPos.x += this.pacVelX)
		this.Pacman.update()
	}
	drawPacman(rScale=1) {
		this.Pacman.draw(Ctx, Vec2(this.pacPos).add(T/2), rScale)
	}
	drawAkabei(cfg={}) {
		const
		Aka = this.Akabei, {pos,aIdx}= Aka
		Aka.sprite.draw({...Aka, ...pos, aIdx, ...cfg})
	}
	pause() {
		Ticker.pause()
		Sound.pauseAll(Ticker.paused)
	}
	end() {
		$off('.CB')
		CBreak.#scene = null
		State.lastIs('Title')
			? State.switchToTitle()
			: State.switchToNewLevel()
	}
} $('button.CB').on('click', e=> CBreak.begin(+e.target.value))

class Scene1 extends CBreak {
	constructor() {
		super(ModSymbol)
		this.akaVelX  = -Maze.Width / 156.4
		this.pacPos.x =  Maze.Width + T*1
		this.Akabei.x =  Maze.Width + T*3
	}
	moveAkabei() {
		if (Ticker.elapsedTime > 400)
			this.Akabei.x += this.akaVelX
	}
	update({Pacman,Akabei,pacPos}=this) {
		this.movePacman()
		this.moveAkabei()
		switch (Pacman.orient) {
		case L:
			if (pacPos.x >= -T*9) break
			this.pacPaused = true
			this.pacVelX *= -1.08
			this.akaVelX *= -0.60
			Pacman.orient = Akabei.orient = R
			break
		case R:
			Akabei.x > T*7 && (this.pacPaused=false)
			Akabei.x > Maze.Width + T*9 && this.end()
			break
		}
	}
	draw() {
		this.drawAkabei({frightened: this.Akabei.orient == R})
		this.drawPacman(this.Pacman.orient == R ? 4 : 1)
	}
}
class Scene2 extends CBreak {
	constructor() {
		super(ModSymbol)
		this.counter  = 0
		this.akaEyes  = L
		this.ripped   = false
		this.sprite   = Sprite.stakeClothes
		this.AkaVelX  = this.pacVelX
		this.pacPos.x = Maze.Width + T*3
		this.Akabei.x = Maze.Width + T*16
	}
	moveAkabei({Akabei:Aka, AkaVelX:vX}=this) {
		const {CaughtX,AkaMinX}= this.sprite
		Aka.x + vX    > CaughtX && (Aka.x += vX)
		Aka.x + vX/10 > AkaMinX ?  (Aka.x += vX/10):(Aka.x = AkaMinX)
		return Aka.x != AkaMinX
	}
	update() {
		this.movePacman()
		if (!this.counter && this.moveAkabei(this))
			return
		switch (this.counter++) {
		case 90:
			this.Akabei.x -= T/4
			this.ripped  = true
			this.akaEyes = U
			break
		case 90 + 60*1:
			this.akaEyes = 'LowerR'
			break
		case 90 + 60*3:
			this.end()
		}
	}
	draw({sprite:sp, Akabei:Aka, AkaVelX,akaEyes,ripped}=this) {
		sp.drawStake()
		ripped && sp.drawOffcut()
		const aIdx = ripped? 0 : (this.counter? 1 : Aka.aIdx)
		this.drawPacman()
		this.drawAkabei({aIdx,ripped,orient:akaEyes})
		if (Aka.x + AkaVelX < sp.CaughtX && !ripped) {
			const pos  = Aka.centerPos.add(T,0)
			const rate = norm(sp.CaughtX, sp.AkaMinX, Aka.x)
			sp.expandClothes(pos, aIdx, rate)
		}
	}
}
class Scene3 extends CBreak {
	constructor() {
		super(ModSymbol)
		this.pacVelX  = -Maze.Width / 200
		this.akaVelX  = -Maze.Width / 200
		this.pacPos.x =  Maze.Width + T*3
		this.Akabei.x =  Maze.Width + T*10
	}
	moveAkabei({Akabei:Aka}=this) {
		Aka.x += this.akaVelX
		Aka.x < -T*8 && (Aka.orient = R) && (this.akaVelX *= -1)
		Aka.x > (T*9 + Maze.Width) && Aka.orient == R && this.end()
	}
	update() {
		this.movePacman()
		this.moveAkabei(this)
	}
	draw() {
		this.drawPacman()
		this.Akabei.orient == L
			? this.drawAkabei({repaired:true})
			: this.drawAkabei({isHadake:true})
	}
}
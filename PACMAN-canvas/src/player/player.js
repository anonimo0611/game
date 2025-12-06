export {player,Player}
import {Sound}    from '../../_snd/sound.js'
import {Common}   from '../../_lib/common.js'
import {Game}     from '../_main.js'
import {Ctrl}     from '../control.js'
import {State}    from '../state.js'
import {Score}    from '../score.js'
import {Maze}     from '../maze.js'
import {Actor}    from '../actor.js'
import {GhsMgr}   from '../ghosts/_system.js'
import  Sprite    from '../sprites/pacman.js'
import {Mover}    from './controller.js'
import {TunEntry} from './tunnel.js'

class PlayerPac {
	#eatIdx = 0
	#sinceLastEating = 0

	#mover    = new Mover(13.5, 24)
	#tunEntry = new TunEntry
	#fadeIn   = new Actor.SpawnFadeIn

	/** @readonly */
	sprite = new Sprite(Ctx)

	get radius()    {return PacRadius}
	get hidden()    {return Timer.frozen}
	get closed()    {return State.isInGame == false}
	get maxAlpha()  {return Ctrl.pacSemiTrans? .75:1}

	get speed()     {return this.#mover.speed}
	get dir()       {return this.#mover.dir}
	get orient()    {return this.#mover.orient}
	get pos()       {return this.#mover.pos}
	get center()    {return this.#mover.center}
	get stopped()   {return this.#mover.stopped}
	get inTunSide() {return this.#mover.inTunSide}
	get tunEntry()  {return this.#tunEntry}

	get timeSinceLastEating() {
		return (this.#sinceLastEating * Game.interval)
	}
	forwardPos(num=0) {
		return Vec2[this.dir].mul(num*T).add(this.center)
	}
	offsetTarget(num=0) {
		const  ofstX = (this.dir == U ? -num : 0)
		return this.forwardPos(num).addX(ofstX*T)
	}
	resetTimer() {
		this.#sinceLastEating = 0
	}
	drawCenterDot() {
		if (!this.hidden && Ctrl.showGridLines)
			this.#mover.drawCenterDot()
	}
	draw() {
		if (State.isIntro )
			return
		Ctx.save()
		this.#fadeIn.setAlpha(this.maxAlpha)
		this.sprite.draw(this)
		this.drawCenterDot()
		Ctx.restore()
	}
	update() {
		this.#fadeIn.update(this.maxAlpha)
		if (this.closed || this.hidden)
			return
		this.#sinceLastEating++
		this.#tunEntry.update()
		this.sprite.update(this)
		this.#update(this.speed*2|0)
	}
	#update(steps=1) {
		for (const _ of range(steps)) {
			this.#eatDot(this.#mover)
			this.#mover.update(this.speed/steps)
			if (this.stopped) break
		}
	}
	#eatDot({tileIdx:i}= this.#mover) {
		if (!Maze.hasDot(i))
			return
		this.#playEateSE()
		this.resetTimer()
		Maze.hasPow(i)
			? this.#eatPowerDot()
			: this.#eatSmallDot()
		Maze.clearBgDot(this.#mover) == 0
			? State.toCleared()
			: Player.trigger('AteDot')
	}
	#eatPowerDot() {
		Score.add(PowPts)
		GhsMgr.setFrightMode()
	}
	#eatSmallDot() {
		Score.add(DotPts)
	}
	#playEateSE() {
		const id  = (this.#eatIdx ^= 1)? 'eat1' : 'eat0'
		const dur = (T/this.speed) * Ticker.Interval * .5
		Sound.play(id, {duration:dur})
	}
}
let   player = new PlayerPac
const Player = new class extends Common {
	draw()   {player.draw()}
	update() {player.update()}
},
reset = ()=> {player = new PlayerPac}
State.on({_Restarted_NewLevel:reset})
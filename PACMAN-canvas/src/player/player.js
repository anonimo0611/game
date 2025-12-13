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

	/** @private */
	mov        = new Mover(13.5, 24)
	#tunEntry  = new TunEntry
	#spawnFade = new Actor.SpawnFade

	/** @readonly */
	sprite = new Sprite(Ctx)

	get radius()    {return PacRadius}
	get hidden()    {return Timer.frozen}
	get closed()    {return State.isInGame == false}
	get maxAlpha()  {return Ctrl.pacSemiTrans? .75:1}

	get dir()       {return this.mov.dir}
	get orient()    {return this.mov.orient}
	get pos()       {return this.mov.pos}
	get center()    {return this.mov.center}
	get inTunSide() {return this.mov.inTunSide}
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
	#drawCenterDot() {
		if (!this.hidden && Ctrl.showGridLines)
			Actor.drawCenterDot(this.center)
	}
	draw() {
		if (State.isIntro )
			return
		Ctx.save()
		this.#spawnFade.setAlpha(this.maxAlpha)
		this.sprite.draw(this)
		this.#drawCenterDot()
		Ctx.restore()
	}
	update() {
		this.#spawnFade.update(this.maxAlpha)
		if (this.closed || this.hidden)
			return
		this.#sinceLastEating++
		this.#tunEntry.update()
		this.sprite.update(this.mov)
		this.#update(this.mov.speed*2|0)
	}
	#update(steps=1) {
		const {tileIdx,speed}= this.mov
		for (const _ of range(steps)) {
			this.#eatDot(tileIdx)
			this.mov.update(speed/steps)
			if (this.mov.stopped) break
		}
	}
	#eatDot(tileIdx=-1) {
		if (!Maze.hasDot(tileIdx))
			return
		this.#playEatSE()
		this.resetTimer()
		Maze.hasPow(tileIdx)
			? this.#eatPowerDot()
			: this.#eatSmallDot()
		Maze.clearBgDot(this.mov) == 0
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
	#playEatSE() {
		const id  = (this.#eatIdx ^= 1)? 'eat1':'eat0'
		const dur = (T/this.mov.speed) * Ticker.Interval * .5
		Sound.play(id, {duration:dur})
	}
}
let   player = new PlayerPac
const Player = new Common,
reset = ()=> {player = new PlayerPac}
State.on({_Restarted_NewLevel:reset})
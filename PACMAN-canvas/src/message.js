import {Confirm} from '../_lib/confirm.js'
import {Game}    from './_main.js'
import {State}   from './state.js'

export const Message = new class {
	/**
	 * @param {number} col
	 * @param {number} row
	 */
	drawText(col, row, color='', text='',
		{ctx=Ctx,scale=[1,1],face='Atari',size=T,style=''}={}
	) {
		ctx.save()
		ctx.scale(...scale)
		ctx.font = `${style} ${size}px ${face}`
		ctx.fillStyle = color ?? '#FFF'
		String(text).split('\n').forEach((txt,i)=>
			ctx.fillText(txt, col*T+2, row*T-2 + size*i))
		ctx.restore()
	}
	#drawLevel() {
		const cfg = {scale:[0.82, 1], size:T*0.8, style:'small-caps'}
		drawText(0.5, 12.9, Color.Message2, `Level${Game.levelStr}`, cfg)
	}
	#drawLogo() {
		const cfg = {face:'PacFont', size:T*1.15}
		drawText(Cols-4.8, 12.5, Color.Message2, 'pac', cfg)
		drawText(Cols-3.0, 13.5, Color.Message2, 'man', cfg)
	}
	#drawPausedText() {
		if (Confirm.opened || !Ticker.paused)
			return
		(Ticker.pausedCount & 32) == 0
			&& drawText(11, 19, Color.Message3, 'PAUSED')
	}
	draw() {
		this.#drawLevel()
		this.#drawLogo()
		this.#drawPausedText()
		if (State.isStart) {
			drawText( 9, 13, Color.Message1, 'PLAYER　ONE')
		}
		if (State.isSt_Ready) {
			drawText(11, 19, Color.Message2, 'READY!')
		}
		if (State.isTitle
		 || State.isGameOver) {
			drawText( 9, 19, Color.Message3, 'GAME　　OVER')
		}
	}
},{drawText}=Message
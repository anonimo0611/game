import {Confirm} from '../_lib/confirm.js'
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
	#drawPausedText() {
		if (!Confirm.opened && Ticker.paused)
			(Ticker.pausedCount & 32) == 0
			&& drawText(11, 19, Color.Message3, 'PAUSED')
	}
	draw() {
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
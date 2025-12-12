import {Confirm} from '../_lib/confirm.js'
import {State}   from './state.js'

export const Message = new class {
	/**
	 @param {number} col
	 @param {number} row
	 @param {?Cvs2DStyle}   color
	 @param {string|number} text
	*/
	drawText(col, row, color, text,
		{ctx=Ctx, scaleX=1, face='Atari', size=T, style=''}={}
	) {
		ctx.save()
		ctx.scale(scaleX, 1)
		ctx.font = `${style} ${size}px ${face}`
		ctx.fillStyle = color ?? 'white'
		String(text).split('\n').forEach((txt,i)=>
			ctx.fillText(txt, col*T+2, row*T-2 + size*i))
		ctx.restore()
	}
	#drawPausedText() {
		(!Confirm.opened && Ticker.paused)
			&& (Ticker.pausedCount & 32) == 0
			&& drawText(11, 19, '#F00','PAUSED')
	}
	draw() {
		this.#drawPausedText()
		if (State.isIntro)
			drawText( 9, 13, '#0FF','PLAYER　ONE')

		if (State.isStartMode)
			drawText(11, 19, '#FF0','READY!')

		if (State.isTitle
		 || State.isGameOver)
		 	drawText( 9, 19, '#F00','GAME　　OVER')
	}
}, {drawText}=Message
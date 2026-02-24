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
		{ctx=Fg, scaleX=1, face='Atari', size=T, style=''}={}
	) {
		ctx.save()
		ctx.scale(scaleX, 1)
		ctx.textBaseline = 'top'
		ctx.font = `${style} ${size}px "${face}"`
		ctx.fillStyle = color ?? 'white'
		String(text).split('\n').forEach((txt,i)=>
			ctx.fillText(txt, col*T+2, row*T+2 + size*i))
		ctx.restore()
	}
	draw() {
		this.#topHouse()
		this.#bottomHouse()
		this.#pausedText()
	}
	#topHouse() {
		if (State.isIntro)
			drawText( 9, 12, '#0FF','PLAYER　ONE')
	}
	#bottomHouse() {
		if (Ticker.paused)
			return
		if (State.isStartMode)
			drawText(11, 18, '#FF0','READY!')

		if (State.isTitle
		 || State.isGameOver)
			drawText( 9, 18, '#F00','GAME　　OVER')
	}
	#pausedText() {
		if (!Ticker.paused)
			return
		!State.isTitle
			&& !Confirm.opened
			&& !(Ticker.pausedCount & 32)
			&& drawText(11, 18, '#F00','PAUSED')
	}
}, {drawText}=Message
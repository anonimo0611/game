import {Confirm} from '../_lib/confirm.js'
import {State}   from './state.js'

export const Message = new class MessageView {
	/**
	 @param {number} col
	 @param {number} row
	 @param {?CvsStyle} color
	 @param {string|number} content
	*/
	drawText(col, row, color, content,
		{ctx=Fg, scaleX=1, face='Atari', size=T, style=''}={}
	) {
		ctx.save()
		ctx.translate(col*T+2, row*T+2)
		ctx.scale(scaleX, 1)
		ctx.textBaseline = 'top'
		ctx.font = `${style} ${size}px "${face}"`
		ctx.fillStyle = color || 'white'
		String(content).split('\n').forEach((txt,i)=>
			ctx.fillText(txt, 0, size*i))
		ctx.restore()
	}
	#drawPausedText() {
		!State.isTitle
			&& !Confirm.opened
			&& !(Ticker.pausedCount & 32)
			&& drawText(11, 18, '#F00','PAUSED')
	}
	draw() {
		if (State.isNewGame)
			drawText( 9, 12, '#0FF','PLAYER　ONE')

		if (Ticker.paused)
			return this.#drawPausedText()

		if (State.isStarting)
			drawText(11, 18, '#FF0','READY!')

		if (State.isTitle
		 || State.isGameOver)
			drawText( 9, 18, '#F00','GAME　　OVER')
	}
}, {drawText}=Message
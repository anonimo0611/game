import {Sound}    from '../_snd/sound.js'
import {State}    from './state.js'
import {drawText} from './message.js'
import {Ctrl}     from './control.js'
import {Lives}    from './lives.js'

let _score  = 0, _hiSco  = 0
let _savedS = 0, _savedH = 0

export const Score = new class {
	static {$(this.setup)}
	static setup() {
		Score.reset()
		State.on({
			Quit:    Score.#restore,
			Intro:   Score.#onIntro,
			GameOver:Score.#onGameOver,
		})
	}
	reset() {
		_score = 0
		_hiSco = localStorage.anopac_hiscore|0
	}
	#save() {
		_savedS = _score
		_savedH = _hiSco
	}
	#restore() {
		_score = _savedS
		_hiSco = _savedH
	}
	#onIntro() {
		Score.#save()
		_score = 0
	}
	#onGameOver() {
		const hiSco = localStorage.anopac_hiscore|0
		if (!Ctrl.isPractice && _hiSco > hiSco)
			localStorage.anopac_hiscore = _hiSco
	}
	get #showUP() {
		return !State.isInGame || Ticker.paused
			? true : !!(Ticker.count & (Sound.ringing? 8:16))
	}
	get #color() {
		return (Sound.ringing? Colors.Extend : null)
	}
	draw() {
		drawText(2,1, this.#color, this.#showUP? '1UP':'')
		drawText(6,1, null, _score || '00')
		Ctrl.isPractice
			? drawText(14,1, null, 'PRACTICE')
			: drawText(14,1, null, `HIGH　${_hiSco || '00'}`)
	}
	add(points=0) {
		const score = _score + points
		if (!Ctrl.isPractice && score > _hiSco) {
			_hiSco = score
		}
		if (between(Ctrl.extendScore, _score+1, score)) {
			Lives.append()
			Sound.play('bell')
		}
		_score = score
	}
}
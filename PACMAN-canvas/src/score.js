import {Sound}    from '../_snd/sound.js'
import {Ticker}   from '../_lib/timer.js'
import {State}    from './_state.js'
import {Ctrl}     from './control.js'
import {Lives}    from './lives.js'
import {drawText} from './message.js'

let _score=0,_hiSco=0
let _saveS=0,_saveH=0

export const Score = new class {
	static {$load(this.#setup)}
	static #setup() {
		Score.#init()
		$on('InitData',Score.#init)
		$on('Quit',    Score.#restore)
		$on('Start',   Score.#onStart)
		$on('GameOver',Score.#onGameOver)
	}
	#init() {
		_hiSco = localStorage.anopac_hiscore|0
	}
	#save() {
		_saveS = _score
		_saveH = _hiSco
	}
	#restore() {
		_score = _saveS
		_hiSco = _saveH
	}
	#onStart() {
		Score.#save()
		_score = 0
	}
	#onGameOver() {
		const hiSco = localStorage.anopac_hiscore|0
		if (!Ctrl.isPractice && _hiSco > hiSco)
			localStorage.anopac_hiscore=_hiSco
	}
	add(points=0) {
		const score = _score + points
		if (!Ctrl.isPractice && score > _hiSco) {
			_hiSco = score
		}
		if (between(Ctrl.extendPts, _score+1, score)) {
			Lives.append()
			Sound.play('extend')
		}
		_score = score
	}
	get #oneUpDisp() {
		return !State.isPlaying || Ticker.paused
			? true : !!(Ticker.count & (Sound.ringing? 8:16))
	}
	draw() {
		const oneUpColor = (Sound.ringing? '#F55':'#FFF')
		drawText(2,1, oneUpColor, this.#oneUpDisp? '1UP':'')
		drawText(6,1, '#FFF', _score || '00')
		Ctrl.isPractice
			? drawText(14,1, '#FFF', 'PRACTICE')
			: drawText(14,1, '#FFF', `HIGH　${_hiSco || '00'}`)
	}
}
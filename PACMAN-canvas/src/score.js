import {Sound} from '../_snd/sound.js'
import {State} from './state.js'
import {print} from './message.js'
import {Ctrl}  from './control.js'
import {Lives} from './lives.js'

let _score = 0, _hiSco = 0
let _saveS = 0, _saveH = 0

export const Score = new class {
	static {$(this.setup)}
	static setup() {
		Score.reset()
		State.on({
			Quit:    Score.#restore,
			Start:   Score.#onStart,
			GameOver:Score.#onGameOver,
		})
	}
	reset() {
		_score = 0
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
			localStorage.anopac_hiscore = _hiSco
	}
	get #UPDisp() {
		return !State.isPlaying || Ticker.paused
			? true : !!(Ticker.count & (Sound.ringing? 8:16))
	}
	get #UPColor() {
		return (Sound.ringing? Color.Extend : null)
	}
	draw() {
		print(2,1, this.#UPColor, this.#UPDisp? '1UP':'')
		print(6,1, null, _score || '00')
		Ctrl.isPractice
			? print(14,1, null, 'PRACTICE')
			: print(14,1, null, `HIGH　${_hiSco || '00'}`)
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
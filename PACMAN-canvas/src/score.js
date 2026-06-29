import {Sound}    from '../_snd/sound.js'
import {Confirm}  from '../_lib/confirm.js'
import {Game}     from './_main.js'
import {State}    from './state.js'
import {Env}      from './control.js'
import {Lives}    from './lives.js'
import {btns}     from './ui.js'
import {drawText} from './message.js'

const HISCORE_KEY = 'anopac_hiscore'
let [_score,_hiSco,savedScore,savedHiSco]= [0,0,0,0]

export const Score = new class ScoreManager {
	static {$(this.setup)}
	static setup() {
		State.on({
			Quit:     Score.#onQuit,
			NewGame:  Score.#onNewGame,
			GameOver: Score.#onGameOver,
		})
		Score.#reset()
		$(btns.clear).on({click:Score.#clearConfirm})
	}
	#clearConfirm() {
		Confirm.open('Are you sure you want to clear high-score?',
			['Cancel'], ['Clear',Score.#clear])
	}
	#clear() {
		localStorage.removeItem(HISCORE_KEY)
		Score.#reset()
	}
	#reset() {
		_score = 0
		_hiSco = localStorage[HISCORE_KEY]|0
	}
	#onNewGame() {
		savedScore = _score
		savedHiSco = _hiSco
		_score = 0
	}
	#onQuit() {
		if (!Game.started) return
		_score = savedScore
		_hiSco = savedHiSco
	}
	#onGameOver() {
		const hi = localStorage[HISCORE_KEY]|0
		if (!Env.isPractice && _hiSco > hi)
			localStorage[HISCORE_KEY] = _hiSco
	}
	get #showUP() {
		return (!State.isInGame || Ticker.paused)
			? true : !!(Ticker.count & (Sound.ringing? 8:16))
	}
	get #fgColorUP() {
		return (Sound.ringing? Color.ExtendLife : null)
	}
	draw() {
		drawText(2,0, this.#fgColorUP, this.#showUP? '1UP':'')
		drawText(6,0, null, _score || '00')
		Env.isPractice
			? drawText(14,0, null, 'PRACTICE')
			: drawText(14,0, null, `HIGH　${_hiSco || '00'}`)
	}
	add(points = 0) {
		if (!State.isInGame)
			return

		const oldScore = _score
		_score += points

		if (!Env.isPractice && _score > _hiSco) {
			_hiSco = _score
		}
		if (isBetween(Env.extendScore, oldScore+1, _score)) {
			Lives.extend()
			Sound.playGetsHiScore()
		}
	}
}
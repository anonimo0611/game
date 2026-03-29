import {Sound}    from '../_snd/sound.js'
import {Game}     from './_main.js'
import {State}    from './state.js'
import {drawText} from './message.js'
import {Ctrl}     from './control.js'
import {Lives}    from './lives.js'

let [_score,_hiSco,savedScore,savedHiSco]= [0,0,0,0]

export const Score = new class {
	/** @readonly */
	HiScoreKey = 'anopac_hiscore'
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
		_hiSco = localStorage[Score.HiScoreKey]|0
	}
	#restore() {
		if (Game.started) {
			_score = savedScore
			_hiSco = savedHiSco
		}
	}
	#onIntro() {
		savedScore = _score
		savedHiSco = _hiSco
		_score = 0
	}
	#onGameOver() {
		const hi = localStorage[Score.HiScoreKey]|0
		if (!Ctrl.isPractice && _hiSco > hi)
			localStorage[Score.HiScoreKey] = _hiSco
	}
	get #showUP() {
		return !State.isInGame || Ticker.paused
			? true : !!(Ticker.count & (Sound.ringing? 8:16))
	}
	get #fgColorUP() {
		return (Sound.ringing? Colors.Extend : null)
	}
	draw() {
		drawText(2,0, this.#fgColorUP, this.#showUP? '1UP':'')
		drawText(6,0, null, _score || '00')
		Ctrl.isPractice
			? drawText(14,0, null, 'PRACTICE')
			: drawText(14,0, null, `HIGH　${_hiSco || '00'}`)
	}
	add(points=0) {
		const total = _score + points
		if (!Ctrl.isPractice && total > _hiSco) {
			_hiSco = total
		}
		if (between(Ctrl.extendScore, _score+1, total)) {
			Lives.append()
			Sound.playBellSE()
		}
		_score = total
	}
}
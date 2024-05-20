let score  = 0;
let savedS = 0;
let high   = 0;
let savedH = 0;
const Form = byId('scoreForm');

import {Lives} from './lives.js'
export const Score = new class {
	static {$ready(this.#setup)}
	static #setup() {
		$on({
			Title:   Score.#onTitle,
			Start:   Score.#onStart,
			Clear:   Score.#onClear,
			keydown: Score.#restore,
			Resize:  Score.#resetScore,
			GameOver:Score.#setStorage,
		});
		Score.#resetScore();
	}
	get storageKey() {
		return 'randPacHiscore'+MAZE_IDX;
	}
	get storageData() {
		return localStorage.getItem(Score.storageKey) ?? 0;
	}
	#onTitle() {
		Form.lifeBonus.value = '';
	}
	#onStart() {
		savedH = high;
		savedS = score;
		Score.#score = 0;
	}
	#onClear() {
		Lives.left && Score.#addLifeBonus();
		Score.#setStorage();
	}
	#resetScore() {
		Score.#score = score = savedS = 0;
		Score.#high  = high  = savedH = Score.storageData;
	}
	#restore(e) {
		if (!/^[RG]$/i.test(e.key)) return;
		Score.#high  = savedH;
		Score.#score = savedS;
	}
	#setStorage() {
		savedH = high;
		savedS = score;
		high > Score.storageData
			&& localStorage.setItem(Score.storageKey, high);
	}
	set #high(pts) {
		Form.high.value = (high = pts) || '00';
	}
	set #score(pts) {
		Form.score.value = (score = pts) || '00';
	}
	#addLifeBonus() {
		const pts = '500<small>PTS</small>';
		Score.add(Lives.left * parseInt(pts));
		Form.lifeBonus.innerHTML = `LIFE BONUS ${pts} x${Lives.left}`;
	}
	add(pts=0) {
		pts += score;
		pts > high && (Score.#high = pts);
		Score.#score = pts;
	}
};
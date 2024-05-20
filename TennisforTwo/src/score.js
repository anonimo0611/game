import {Timer}   from '../lib/timer.js';
import {Sound}   from '../snd/sound.js';
import {cvs,ctx} from './canvas.js';
import {Scene}   from './scene.js';
import {Message} from './message.js';
import {Title}   from './title.js';
import {Color}   from './colors.js';
import {Court}   from './court.js';
import {Player}  from './player.js';

let   $scorer  = -1;
const PtsList  = new Uint8Array(2);
const FontSize = cvs.height/6;
$on({
	'Reset Start':()=> PtsList.fill(0),
	'Reset Serve':()=> $scorer = -1,
});
const GameOverTexts = freeze([
	'YOU\u2002WIN !\xA0',
	'YOU\u2002LOSE !',
]);

export const Score = freeze(new class {
	Max = 11;
	get waiting() {return $scorer >= 0}
	get winner()  {return PtsList.findIndex(v=> v == Score.Max)}
	draw() {
		const {isInGame}= Scene;
		for (let i=0; i<Player.Side.Max; i++) {
			const capSize  = int(FontSize/3.3);
			const scoreStr = String(PtsList[i]).padStart(2, 0);
			ctx.save();
			ctx.translate(cvs.width/4 + cvs.width/2*i, capSize*1.5);
			ctx.textAlign = 'center';
			ctx.fillStyle = i == Score.winner
				? Color.PinkRGBA
				: Color.CyanRGBA;
			ctx.font = `${capSize}px VectorBold`;
			ctx.fillText(i == 0 ? 'PLAYER':'COM', 0, 0);
			ctx.font = `${FontSize}px VectorNums`;
			ctx.fillText(scoreStr, 0, capSize*1.2 + FontSize/2);
			ctx.restore();
		}
		Score.#drawResult();
	}
	#drawResult() {
		const {winner}= Score;
		if (!Scene.isGameOver) return;
		const color = winner
			? Color.CyanRGBA
			: Color.PinkRGBA;
		Message.draw(GameOverTexts[winner], color);
	}
	scored(scorer) {
		if (Score.waiting) return;
		$scorer = scorer;
		Sound.play('point');
		if (Scene.isInGame && ++PtsList[scorer] == Score.Max)
			Scene.switchToGameOver();
		Timer.cancelAll().set(1000, Score.#proceedNext);
	}
	#proceedNext() {
		Score.winner >= 0 && Scene.isGameOver
			? Timer.set(2000, ()=> $trigger('Init'))
			: Player.setServe($scorer);
	}
});
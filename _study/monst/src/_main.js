import {Ticker}  from '../lib/timer.js';
import {cvs,ctx} from './canvas.js';
import * as Draw from './draw.js';
import {Pointer} from './pointer.js';
import {Bullet}  from './bullet.js';
import {Phase}	 from './phase.js';
import {Player}  from './player.js';
import {Monster} from './monster.js';

const {drawBorderedFont} = Draw;

const CursorGrad = ctx.createRadialGradient(0,0, Player.Radius*3/4, 0,0, Player.Radius*2);
      CursorGrad.addColorStop(0.0, 'rgba(100% 75% 25% /0.0)');
      CursorGrad.addColorStop(1.0, 'rgba(100% 75% 25% /1.0)');

export const Game = new class {
	#cursorScale = 0;
	static {
		$on('load Reset',this.#init)
	}
	static #init() {
		Game.#cursorScale = 0;
		Phase.switch(Phase.enum.Idle);
		Player.init();
		Monster.init();
		Ticker.set(Game.#mainLoop);
	}
	#update() {
		Pointer.update();
		Player.update();
		Monster.update();
		switch (Phase.current) {
		case Phase.enum.Fire:
			Phase.fire();
			break;
		case Phase.enum.Monster:
			Phase.monster();
			break;
		}
	}
	draw() {
		ctx.clearRect(0, 0, cvs.width, cvs.height);
		Monster.dropShadow();
		Player.dropShadow();

		Player.drawPlayers();
		Monster.drawMonsters();
		Monster.drawBars();

		Player.drawStatus();
		Monster.drawNumbers();
		Game.#drawCursor();

		switch (Phase.current) {
		case Phase.enum.Over:
			Game.gameOver();
			break;
		case Phase.enum.Clear:
			Game.clear();
			break;
		}
		Pointer.draw();
	}
	drawMessage(text, strokeColor, fillColor) {
		ctx.save();
			ctx.fillStyle = 'rgba(0,0,0,.4)';
			ctx.fillRect(0, 0, cvs.width, cvs.height);
		ctx.restore();
		drawBorderedFont({ctx,
			x:			cvs.width /2,
			y:			cvs.height/2 + 20,
			text:		text,
			align:		'center',
			font:		'40px Atari',
			lineWidth:	4,
			fillStyle:	fillColor,
			strokeStyle:strokeColor,
		});
	}
	gameOver() {
		Game.drawMessage('GAME OVER', '#606', '#f0f');
	}
	clear() {
		Game.drawMessage('STAGE CLEAR!', '#c00', 'rgb(100%,75%,0%)');
	}
	#drawCursor() {
		const pos = vec2(Player.current.position)
		pos.y += sin(Ticker.count * PI*2 / 60) * Player.Radius / 8;
		Game.#cursorScale += sin(Ticker.count * PI*2 / 45) / 8;

		if (!Phase.isIdle)
			return;
		ctx.save();
		ctx.translate(...pos.vals);
		ctx.beginPath();
		ctx.arc(0, 0, max(0, Player.Radius * Game.#cursorScale), 0, PI*2);
		ctx.fillStyle = CursorGrad;
		ctx.fill();
		ctx.restore();
	}
	#mainLoop() {
		Game.#update();
		Game.draw();
	}
};
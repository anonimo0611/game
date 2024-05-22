import {rgbaPct} from '../lib/color.js';
import {Ticker}  from '../lib/timer.js';
import {cvs,ctx} from './canvas.js';
import {Draw}    from './draw.js';
import {Pointer} from './pointer.js';
import {Bullet}  from './bullet.js';
import {Phase}	 from './phase.js';
import {Player}  from './player.js';
import {Monster} from './monster.js';

const Game = new class {
	static {
		$ready(this.init);
		$on({Reset:this.init});
	}
	static init() {
		Phase.switchToIdle();
		Player.init();
		Monster.init();
		Ticker.set(Game.mainLoop);
	}
	update() {
		Pointer.update();
		Player.update();
		Monster.update();
		Phase.isFire    && Phase.fire();
		Phase.isMonster && Phase.monster();
	}
	draw() {
		ctx.clearRect(0,0, cvs.width, cvs.height);
		Monster.dropShadow();
		Player.dropShadow();

		Player.drawPlayers();
		Monster.drawMonsters();
		Monster.drawHpBars();

		Monster.drawStatus();
		Player.drawStatus();
		Player.drawCursor();

		Phase.isOver  && Game.drawMessage('GAME OVER',  '#F0F','#606');
		Phase.isClear && Game.drawMessage('STAGE CLEAR','#FB0','#C00');
		Pointer.draw();
	}
	drawMessage(text, fillStyle, strokeStyle) {
		ctx.save();
		ctx.fillStyle = rgbaPct(0,0,0, .4);
		ctx.fillRect(0,0, cvs.width, cvs.height);
		ctx.restore();
		Draw.message({text,fillStyle,strokeStyle});
	}
	mainLoop() {
		Game.update();
		Game.draw();
	}
};
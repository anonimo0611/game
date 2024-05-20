import {Ticker}  from '../lib/timer.js';
import {Confirm} from '../lib/confirm.js';
import {rgba}    from '../lib/color.js';
import {cvs,ctx} from './_canvas.js';
import {Game}    from './_main.js';
import {Scene}   from './scene.js';
import {Field}   from './field.js';

const FontSize  = 28;
const MainColor = '#EA6AAC'; // Pink
const SubColor  = '#DCC678'; // Light Orange

export const Message = freeze(new class  {
	#draw(txt,color, {offset=1, fs=FontSize, align='center',
		x=cvs.width/2, y=(cvs.height/2)+(fs*4)+(fs*offset)}={}
	) {
		ctx.save();
		ctx.font = `${fs}px/1 Atari`;
		ctx.textAlign     = align;
		ctx.shadowColor   = rgba(0,0,0,.7);
		ctx.shadowOffsetX = 3;
		ctx.shadowOffsetY = 3;
		ctx.fillStyle = color;
		ctx.fillText(txt, x, y);
		ctx.restore();
		return this;
	}
	#drawCtrls() {
		const fs = 18;
		const vm = -5;
		const x  = Field.Left + fs/2;
		const y  = Field.Bottom;
		this.#draw('Press M to mute',   'white', {fs,align:'left',x,y:y-fs+vm})
		this.#draw('Press ESC to pause','white', {fs,align:'left',x,y:y+vm});
	}
	draw() {
		if (Confirm.opened)
			return;
		(Game.isDemoScene || Scene.isGameOver)
			&& this.#draw('GAME　OVER', MainColor);
		Game.isDemoScene
			&& this.#draw('Click to Start!', SubColor, {offset:2.5})
			&& this.#drawCtrls();
		!Game.respawned && Scene.isReady
			&& this.#draw(`STAGE ${Game.stageNum}`, MainColor)
			&& (Ticker.elapsed > Game.ReadyTime - 1000)
			&& this.#draw('READY!', SubColor, {offset:2.5});
		Game.respawned && Scene.isReady
			&& this.#draw('READY!', SubColor, {offset:1.5});
		Scene.isClear
			&& this.#draw(`STAGE ${Game.stageNum}`, MainColor)
			&& this.#draw('CLEARED!', SubColor, {offset:2.5});
	}
});
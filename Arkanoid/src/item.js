import {Ticker}   from '../lib/timer.js';
import {hsl,rgba} from '../lib/color.js';
import {Sound}    from '../snd/sound.js';
import {cvs,ctx}  from './_canvas.js';
import {Scene}    from './scene.js';
import {Score}    from './score.js';
import {Paddle}   from './paddle.js';
import {Brick}    from './brick.js';
import {Ball}     from './ball.js';

export class Item {
	static {
		$on('InGame', _=> AppearedSet.clear())
	}
	static init() {
		ItemSet.clear();
	}
	static get existApearedItem() {
		return ItemSet.size > 0 || Ball.numberOfBalls > 1;
	}
	static #ignore(idx) {
		return AppearedSet.has(idx) || Paddle.exclItem == idx
			|| (Ball.speedDownEnabeld && idx == ItemType.SpeedDown)
	}
	static appear({x, y}) {
		if (this.existApearedItem) return;
		if (AppearedSet.size == SubClasses.length) {
			AppearedSet.clear();
		}
		if (randInt(0,7) != 0) return;
		let idx = randInt(0,SubClasses.length-1);
		while (this.#ignore(idx))
			idx = randInt(0,SubClasses.length-1);
		AppearedSet.add(idx);
		ItemSet.add(new SubClasses[idx](x, y))
	}
	static update() {
		ItemSet.forEach(e=> e.update());
	}
	static draw() {
		ItemSet.forEach(e=> e.draw());
	}
	Width     = Brick.Width;
	Height    = Brick.Height;
	TextAlpha = 0.8;
	TextColor = rgba(255,204,0,this.TextAlpha);

	#aIdex     = 0;
	#textScale = 0;
	#scaleTbl  = integers(20).map(n=> n>10 ? 20-n : n);

	Speed = 4;
	Pos = vec2(0,0);
	constructor(x, y) {
		this.Pos.set(x, y);
	}
	setGrad(hue, nonColor) {
		const {Width:w,Height:h}= this;
		const s = nonColor ? 0 : 91;
		this.grad = ctx.createLinearGradient(w,0,w,h);
		this.grad.addColorStop(0.00, hsl(hue,s,36));
		this.grad.addColorStop(0.20, hsl(hue,s,80));
		this.grad.addColorStop(0.40, hsl(hue,s,36));
		this.grad.addColorStop(1.00, hsl(hue,s,50));
	}
	update() {
		if (!Scene.isInGame) {
			ItemSet.delete(this);
			return;
		}
		if (Ticker.count % 2 == 0) ++this.#aIdex;
		const len = this.#scaleTbl.length;
		const idx = this.#aIdex = this.#aIdex % len;
		this.#textScale = this.#scaleTbl[idx] / (len/2);
		this.Pos.y += this.Speed;

		if (collisionRect(this,Paddle)) {
			Score.add(1000);
			Sound.play('item');
			$trigger('GetItem', this.Type);
			ItemSet.delete(this);
		}
		if (this.Pos.y > cvs.height || collisionRect(this,Paddle))
			ItemSet.delete(this);
	}
	draw() {
		if (!Scene.isInGame) return;
		const {x,y,Width:w,Height:h}= {...this.Pos,...this};
		const offsetH = h * (this.#aIdex / this.#scaleTbl.length);
		ctx.save();
		ctx.translate(x,y);
		fillRoundRect(ctx, 15,15, w,h, w/8, rgba(0,0,0,.5));
		ctx.restore();

		ctx.save();
		ctx.translate(x,y);
		fillRoundRect(ctx, 0,0, w,h, w/10, this.grad);
		ctx.restore();

		ctx.save();
		ctx.translate(x, y + offsetH);
		ctx.scale(1,this.#textScale);
		ctx.font = `${h/1.2}px/1 Atari`;
		ctx.textAlign = 'center';
		ctx.fillStyle = this.TextColor;
		ctx.fillText(this.Text, w/2, h/2 - 5);
		ctx.restore();
	}
} freeze(Item);

export const ItemType = freeze({
	Catch:      0,
	Disruption: 1,
	Expand:     2,
	Extend:     3,
	Laser:      4,
	SpeedDown:  5,
});
const SubClasses = [
	class extends Item {
		Text = 'C';
		Hue  = 120;
		Type = ItemType.Catch;
		constructor(x, y) {
			super(x, y);
			this.setGrad(this.Hue);
			freeze(this);
		}
	},
	class extends Item {
		Text = 'D';
		Hue  = 206;
		Type = ItemType.Disruption;
		constructor(x, y) {
			super(x, y);
			this.setGrad(this.Hue);
			freeze(this);
		}
	},
	class extends Item {
		Text = 'E';
		Hue  = 240;
		Type = ItemType.Expand;
		constructor(x, y) {
			super(x, y);
			this.setGrad(this.Hue);
			freeze(this);
		}
	},
	class extends Item {
		Text = 'P';
		Hue  = 220;
		Type = ItemType.Extend;
		TextColor = rgba(0,255,255,this.TextAlpha);
		constructor(x, y) {
			super(x, y);
			this.setGrad(0, true);
			freeze(this);
		}
	},
	class extends Item {
		Text = 'L';
		Hue  = 0;
		Type = ItemType.Laser;
		constructor(x, y) {
			super(x, y);
			this.setGrad(this.Hue);
			freeze(this);
		}
	},
	class extends Item {
		Text = 'S';
		Hue  = 16;
		Type = ItemType.SpeedDown;
		constructor(x, y) {
			super(x, y);
			this.setGrad(this.Hue);
			freeze(this);
		}
	},
];
const ItemSet = new Set();
const AppearedSet = new Set();
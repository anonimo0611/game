import {Ticker}   from '../lib/timer.js';
import {hsl,rgba} from '../lib/color.js';
import {Sound}    from '../snd/sound.js';
import {Game}     from './_main.js';
import {cvs,ctx}  from './_canvas.js';
import {Scene}    from './scene.js';
import {Score}    from './score.js';
import {Paddle}   from './paddle.js';
import {BrickG}   from './brick.js';
import {BallG}    from './ball.js';

const ItemSet     = new Set();
const AppearedSet = new Set();

let $avoid  = false;
let $lstIdx = -1;

export class Item {
	static {
		$on({InGame:_=> AppearedSet.clear()});
	}
	static init() {
		$avoid  = false;
		$lstIdx = -1;
		ItemSet.clear();
	}
	static get apearedItemExists() {
		return ItemSet.size > 0 || BallG.count > 1;
	}
	static get Current() {return ItemSet.values().next().value}
	
	static appear({x, y}) {
		if (this.apearedItemExists)
			return;
		if (!$avoid && randInt(0,1) != 0)
			return;

		let idx = randInt(0, SubClasses.length-1);
		if (idx === $lstIdx
		 || idx === ItemType.Extend && AppearedSet.has(idx)
		) return void ($avoid = true);

		if (ExclTypes.includes(idx)) {
			if (idx === Paddle.ExclItem)
				idx = randChoice(ExclTypes
					.filter(i=> i != $lstIdx && i != idx));
		}
		$avoid = false;
		AppearedSet.add(idx);
		ItemSet.add(new SubClasses[$lstIdx=idx]({x, y}));
	}
	static update() {
		ItemSet.forEach(e=> e.update());
	}
	static draw() {
		ItemSet.forEach(e=> e.draw());
	}
	Speed     = cvs.height / 175;
	TextAlpha = 0.8;
	TextColor = rgba(255,204,0,this.TextAlpha);

	Width      = BrickG.ColWidth;
	Height     = BrickG.RowHeight * 1.25;
	#aIdex     = 0;
	#textScale = 0;
	#scaleTbl  = integers(30).map(n=> n>15 ? 30-n : n);

	get CenterX() {return this.Pos.x + this.Width/2}

	constructor(pos, {hue,nonColored=false}={}) {
		const {Width:w,Height:h}= this;
		const s = nonColored? 0:91;
		this.Pos  = vec2(pos);

		this.grad  = ctx.createRadialGradient(0,0,0, 0,0,h/2);
		this.grad.addColorStop(0.0, hsl(hue,s,90));
		this.grad.addColorStop(1.0, hsl(hue,s,35));
		this.outlineColor = hsl(hue, nonColored? 0:40, 40);
	}
	update() {
		if (!Game.isPlayScene) {
			ItemSet.delete(this);
			return;
		}
		if (Ticker.count % 2 == 0)
			++this.#aIdex;

		const len = this.#scaleTbl.length;
		const idx = this.#aIdex = this.#aIdex % len;
		this.#textScale = this.#scaleTbl[idx] / (len/2);
		this.Pos.y += this.Speed;

		if (collisionRect(Paddle,this)) {
			Score.add(1000);
			Sound.play('item');
			$trigger('GotItem', this.Type);
			ItemSet.delete(this);
		}
		if (this.Pos.y > cvs.height) {
			ItemSet.delete(this);
		}
	}
	draw() {
		if (!Game.isPlayScene) return;
		const {x,y,Width:w,Height:h}= {...this.Pos,...this};
		const offsetH  = h * (this.#aIdex/this.#scaleTbl.length);
		const cornerR  = h/3;
		const fontSize = h;

		// Item shadow
		ctx.save();
		ctx.translate(x+h/3, y+h/3);
		fillRoundRect(ctx, 0,0, w,h, cornerR, rgba(0,0,0, 0.4));
		ctx.restore();

		// Item itself
		ctx.save();
		ctx.translate(x, y);
		ctx.lineWidth = cvs.width / 200 | 0;
		fillRoundRect  (ctx, 0,0, w,h, cornerR, this.grad);
		strokeRoundRect(ctx, 0,0, w,h, cornerR, this.outlineColor)
		ctx.restore();

		// Logo text
		ctx.save();
		ctx.translate(x+1, y + offsetH);
		ctx.scale(1, this.#textScale * 0.7);
		ctx.shadowColor   = rgba(0,0,0,0.7);
		ctx.shadowOffsetX = fontSize * 0.1;
		ctx.shadowOffsetY = fontSize * 0.1;
		ctx.font = `${fontSize}px Atari`;
		ctx.textAlign = 'center';
		ctx.fillStyle = this.TextColor;
		ctx.fillText(this.Text, w/2+1, h/2 - fontSize/6);
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
		Type = ItemType.Catch;
		constructor(pos) {
			super(pos, {hue:120});
			freeze(this);
		}
	},
	class extends Item {
		Text = 'D';
		Type = ItemType.Disruption;
		constructor(pos) {
			super(pos, {hue:206});
			freeze(this);
		}
	},
	class extends Item {
		Text = 'E';
		Type = ItemType.Expand;
		constructor(pos) {
			super(pos, {hue:240});
			freeze(this);
		}
	},
	class extends Item {
		Text = 'P';
		Type = ItemType.Extend;
		constructor(pos) {
			super(pos, {hue:220, nonColored:true});
			freeze(this);
		}
	},
	class extends Item {
		Text = 'L';
		Type = ItemType.Laser;
		constructor(pos) {
			super(pos, {hue:0});
			freeze(this);
		}
	},
	class extends Item {
		Text = 'S';
		Type = ItemType.SpeedDown;
		constructor(pos) {
			super(pos, {hue:16});
			freeze(this);
		}
	},
];
export const ExclTypes = freeze([
	ItemType.Catch,
	ItemType.Disruption,
	ItemType.Expand,
	ItemType.Laser,
]);
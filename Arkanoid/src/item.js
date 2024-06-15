import {Ticker}   from '../lib/timer.js';
import {hsl,rgba} from '../lib/color.js';
import {Sound}    from '../snd/sound.js';
import {Game}     from './_main.js';
import {cvs,ctx}  from './_canvas.js';
import {Scene}    from './scene.js';
import {Score}    from './score.js';
import {Paddle}   from './paddle.js';
import {BallMgr}  from './ball.js';
import {BrickMgr} from './brick.js';
import {Rect}     from './brick.js';

const Width  = BrickMgr.ColWidth;
const Height = BrickMgr.RowHeight * 1.25;

export const ItemType = freeze({
	Extend:     0,
	Catch:      1,
	Disruption: 2,
	Expand:     3,
	Laser:      4,
	SpeedDown:  5,
});

let $current   = null;
let $lastIndex = -1;
let $extended  = 0;
let $spdDowned = 0;

$on({'InGame Reset': ()=> $current = null});

export const ItemMgr = new class {
	init() {
		$current   = null;
		$lastIndex = -1;
	 	$extended  = 0;
		$spdDowned = 0;
	}
	get Type() {
		return ItemType;
	}
	get apearedItemExists() {
		return $current || BallMgr.count > 1;
	}
	get Current() {return $current}

	appear({x, y}) {
		if (this.apearedItemExists)
			return;
		if (randInt(0,2) != 0)
			return;
		$current = new SubClasses[this.#choice()]({x, y});
	}
	#choice() {
		let idx = randInt(0, SubClasses.length-1);
		if (idx === $lastIndex)
			return this.#choice();

		if (ExclTypes.includes(idx)) {
			if (idx === Paddle.ExclType)
				idx = randChoice(ExclTypes
					.filter(i=> i != $lastIndex && i != idx));
		}
		if (idx == ItemType.Extend && (randInt(0,3) || $extended))
			return this.#choice();
		if (idx == ItemType.SpeedDown && $spdDowned > 2)
			return this.#choice();

		return $lastIndex=idx;
	}
	update() {$current instanceof Item && $current.update()}
	draw()   {$current instanceof Item && $current.draw()}
};

class Item extends Rect {
	Speed      = cvs.height / 175;
	TextAlpha  = 0.8;
	TextColor  = rgba(255,204,0, this.TextAlpha);
	#aIdex     = 0;
	#textScale = 0;
	#scaleTbl  = integers(30).map(n=> n>15 ? 30-n : n);

	get centerX() {return this.Pos.x + Width/2}

	constructor(pos, {hue,nonColored=false}={}) {
		super(pos, Width, Height);
		const s = nonColored? 0:91;
		this.Pos  = vec2(pos).xFreeze();
		this.Grad = ctx.createLinearGradient(Width,0,Width,Height);
		this.Grad.addColorStop(0.00, hsl(hue,s,36));
		this.Grad.addColorStop(0.20, hsl(hue,s,80));
		this.Grad.addColorStop(0.30, hsl(hue,s,36));
		this.Grad.addColorStop(1.00, hsl(hue,s,50));
		this.outlineColor = hsl(hue, nonColored? 0:40, 40);
	}
	update() {
		if (!Game.isPlayScene) {
			$current = null;
			return;
		}
		if (Ticker.count % 2 == 0)
			++this.#aIdex;

		const len = this.#scaleTbl.length;
		const idx = this.#aIdex = this.#aIdex % len;
		this.#textScale = this.#scaleTbl[idx] / (len/2);
		this.Pos.y += this.Speed;

		if (Paddle.collisionRect(this)) {
			Score.add(1000);
			Sound.play('item');
			$(ItemMgr).trigger('Obtained', this.Type);
			if (this.Type == ItemType.Extend)    $extended++;
			if (this.Type == ItemType.SpeedDown) $spdDowned++;
			$current = null;
		}
		if (this.Pos.y > cvs.height) {
			$current = null;
		}
	}
	draw() {
		if (!Game.isPlayScene) return;
		const {x,y,Width:w,Height:h}= this;
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
		fillRoundRect  (ctx, 0,0, w,h, cornerR, this.Grad);
		strokeRoundRect(ctx, 0,0, w,h, cornerR, this.outlineColor)
		ctx.restore();

		// Logo text
		ctx.save();
		ctx.translate(x+1, y + offsetH);
		ctx.scale(1, this.#textScale * 0.8);
		ctx.shadowColor   = rgba(0,0,0,0.7);
		ctx.shadowOffsetX = fontSize * 0.1;
		ctx.shadowOffsetY = fontSize * 0.1;
		ctx.font = `${fontSize}px Atari`;
		ctx.textAlign = 'center';
		ctx.fillStyle = this.TextColor;
		ctx.fillText(this.Text, w/2+1, h/2 - fontSize/6);
		ctx.restore();
	}
}
const SubClasses = [
	class extends Item {
		Text = 'P';
		Type = ItemType.Extend;
		constructor(pos) {
			super(pos, {hue:220, nonColored:true});
			freeze(this);
		}
	},
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
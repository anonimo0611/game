import {Ticker}  from '../lib/timer.js';
import {Grid}    from './_grid.js';
import {Game}    from './_main.js';
import {ctx}     from './_canvas.js';
import {Phase}   from './phase.js';
import {Pointer} from './pointer.js';

const MatchesMin = 3;
const OrbRadius  = Grid.Size*.95 / 2;

const RotateSpeed = PI/20;
const ComboScaleMin =  1;
const ComboScaleMax = 10;

export const OrbType = freeze({
	None:   -1,
	Red:     0,
	Yellow:  1,
	Green:   2,
	Blue:    3,
	Purple:  4,
	Pink:    5,
	Max:     6,
});
const OrbColors = freeze([
	'#ff0033', // Red
	'#fb7537', // Yellow
	'#339933', // Green
	'#0085de', // Blue
	'#6600ff', // Purple
	'#fd07c3', // Pink
]);
const ComboColors =
	freeze('#00f|#f00|#0f0|#00f|#f0f|#0ff'.split('|'));

const Directions = freeze([
	Vec2.Up,
	Vec2.Left,
	Vec2.Down,
	Vec2.Right
]);

const Edging = ctx.createRadialGradient(0,0,0,0,0, OrbRadius);
Edging.addColorStop(0.00, 'transparent');
Edging.addColorStop(0.89, 'transparent');
Edging.addColorStop(0.90, '#666');
Edging.addColorStop(1.00, '#fff');

const Gradients = Array(OrbType.Max).fill().map((_,i)=> {
	const g = ctx.createRadialGradient(-Grid.Size/6,-Grid.Size/6,0, 0,0,OrbRadius);
	g.addColorStop(0.00, '#eee');
	g.addColorStop(0.89, OrbColors[i]);
	g.addColorStop(1.00, '#fff');
	return g;
});

function isInBoard({x, y}) {
	return between(x, 0, Grid.Cols-1)
		&& between(y, 0, Grid.Rows-1);
}
export class Orb {
	#x = 0; #y = 0;
	type       = randInt(0, OrbType.Max-1);
	rotCenter  = vec2(0,0);
	rotate     = 0;
	rotateMax  = 0;
	fadeOut    = 0;
	fallY      = 0;
	combo      = 0;
	comboScale = 0;

	constructor(x, y) {
		this.#x = x;
		this.#y = y;
	}
	get x() {return this.#x}
	get y() {return this.#y}

	static #comboColor = 0;
	static swapType(orb1, orb2) {
		[orb1.type, orb2.type]=
		[orb2.type, orb1.type];
	}
	static update() {
		Orbs.flat().forEach(orb=> orb.#update());
		if (Ticker.count % 3 == 0)
			this.#comboColor = ++this.#comboColor % ComboColors.length;
	}
	static fall() {
		let falling = false;
		for (let y=Grid.Rows-1; y>0; y--)
			for (let x=0; x<Grid.Cols; x++) {
				const orb = Orbs[y][x];
				if (orb.type == OrbType.None) {
					Orb.swapType(orb, Orbs[y-1][x]);
					orb.fallY = -Grid.Size;
					falling = true;
				}
			}
		for (let x=0; x<Grid.Cols; x++)
			if (Orbs[0][x].type == OrbType.None) {
				Orbs[0][x].type  = randInt(0,OrbType.Max-1);
				Orbs[0][x].fallY = -Grid.Size;
				falling = true;
			}
		return falling;
	}
	static draw() {
		Orbs.flat().forEach(orb=> {
			(orb.rotate >= orb.rotateMax)
				? orb.#draw()
				: orb.#rotation();
		});
		Orbs.flat().forEach(orb=> {
			orb.#comboEffect();
		});
		if (Phase.isSwap)
			Pointer.swappingOrb?.#drawOrb(Pointer.Pos, {alpha:.8});
	}
	static remove() {
		const map = Array(Grid.Rows*Grid.Cols).fill(false);
		Orbs.flat().forEach(orb=> orb.#mappingMatchedOrbs(map));
		for (let y=Grid.Rows-1; y>=0; y--)
			for (let x=0; x<Grid.Cols; x++) {
				if (!map[y*Grid.Cols+x]) continue;
				Orbs[y][x].#remove(map);
				return true;
			}
		return false;
	}
	#update() {
		if (this.rotate < this.rotateMax)
			this.rotate += RotateSpeed;
		if (this.comboScale > ComboScaleMin) {
			this.comboScale *= 0.92;
			if (this.comboScale < ComboScaleMin)
				this.comboScale = ComboScaleMin;
		}
	}
	#mappingMatchedOrbs(matchedMap) {
		this.fadeOut = 0;
		if (this.type == OrbType.None) return;
		for (const dir of Directions) {
			let count = 0;
			let pos = vec2(this);
			while (1) {
				count++;
				pos.add(dir);
				if (!isInBoard(pos)
					|| Orbs[pos.y][pos.x].type != this.type
				) break;
			}
			if (count >= MatchesMin) {
				let pos = vec2(this);
				for (let i=0; i<count; i++) {
					matchedMap[pos.y*Grid.Cols+pos.x] = true;
					pos.add(dir);
				}
			}
		}
	}
	#remove(matchedMap) {
		Game.addComboCount();
		this.combo = Game.comboCount;
		this.comboScale = ComboScaleMax;
		const temp = [vec2(this)];
		while (temp.length) {
			Orbs[temp[0].y][temp[0].x].fadeOut = 1;
			for (const dir of Directions) {
				const pos = Vec2.add(temp[0],dir);
				if (!isInBoard(pos)
					|| !matchedMap[pos.y*Grid.Cols+pos.x]
					|| Orbs[pos.y][pos.x].type != this.type
					|| Orbs[pos.y][pos.x].fadeOut > 0
				) continue;
				temp.push(pos);
			}
			temp.shift();
		}
	}
	#rotation() {
		const alpha = Phase.isSwap && this == Pointer.swappingOrb ? .25 : 1;
		const pos   = vec2(this.rotCenter);
		const rotV  = vec2(-cos(this.rotate),sin(this.rotate)).mul(Grid.Size/2);
		this.#drawOrb(pos.add(rotV), {alpha});
	}
	#draw() {
		const alpha = (_=> {
			if (Phase.isSwap && this == Pointer.swappingOrb)
				return .25;
			if (Phase.isRemove && this.fadeOut > 0)
				return this.fadeOut;
			return 1;
		})();
		const pos = vec2(this).add(.5).mul(Grid.Size);
		if (Phase.isFall && this.fallY < 0)
			pos.y += this.fallY;
		this.#drawOrb(pos, {alpha});
	}
	#drawOrb({x, y}, {alpha=1,scale=1}={}) {
		if (this.type == OrbType.None) return;
		ctx.save();

		ctx.globalAlpha = alpha;
		ctx.translate(x, y);
		ctx.scale(scale, scale);

		// Outside
		ctx.beginPath();
			ctx.fillStyle = Edging;
			ctx.arc(0,0, OrbRadius, 0, PI*2);
		ctx.fill();

		// Inner
		ctx.beginPath();
			ctx.fillStyle = Gradients[this.type];
			ctx.arc(0,0, OrbRadius*.9, 0, PI*2);
		ctx.fill();

		ctx.restore();
	}
	#comboEffect() {
		if (this.combo < 2) return;
		const text  = `Combo ${this.combo}`;
		const fSize = int(Grid.Size/8);
		ctx.save();
		ctx.translate(...vec2(this).add(.5).mul(Grid.Size).vals);
		ctx.scale(this.comboScale, this.comboScale);
		ctx.font = `${fSize}px Atari`;
		ctx.lineWidth   = 4;
		ctx.textAlign   ='center';
		ctx.strokeStyle ='rgba(40,40,40,.7)';
		ctx.fillStyle   = ComboColors[Orb.#comboColor];
		ctx.strokeText(text, 0, fSize/2);
		ctx.fillText(text, 0, fSize/2);
		ctx.restore();
	}
} freeze(Orb);

export const Orbs =
	Array(Grid.Rows).fill().map((_,y)=>
		Array(Grid.Cols).fill().map((_,x)=> new Orb(x, y))
	);
import './wall.js';
import {Astar}      from './_lib/astar.js';
import {Rect}       from './_lib/rect.js';
import {Vec2}       from './_lib/vec2.js';
import {Dirs}       from './_lib/direction.js';
import {XorShift}   from './_lib/rand.js';
import {TileType}   from './_constants.js';
import {Container}  from './_main.js';
import {Bg,Ctx}     from './_main.js';
import {Scene}      from './scene.js';
import {Pacman}     from './pacman/pac.js';
import {putGhost}   from './ghosts/ghost_sub.js';

const WallMap = new Map();
const mapExec = ({x,y},m,v)=> WallMap[m](y*GRID+x, v);
const hasWall = t=> mapExec(t,'has');
const setWall = t=> mapExec(t,'set', t);
const delWall = t=> mapExec(t,'delete');

export const DotMap = new Map();
export const PowMap = new Map();
export {WallMap,hasWall};

const Graph = new class {
	#data; get data() {return this.#data}
	set() {
		this.#data = Astar.Graph(integers(GRID)
			.map(x=> integers(GRID).map(y=> +hasWall({x,y}))));
	}
};
const Rand = new class {
	#seed = 0;
	#hueA = 0;
	#rand = new XorShift();
	set(seed) {
		this.#rand = new XorShift(seed);
		this.#hueA = this.#rand.nextInt(0,360);
		// Corrects hues from bluish to purplish
		this.#hueA = between(this.#hueA, 256,295) ? 295 : this.#hueA;
		this.#hueA = between(this.#hueA, 195,255) ? 195 : this.#hueA;
		setCSSVariables();
	}
	get hueA()     {return this.#hueA}
	get seed()     {return this.#rand.seed}
	choice(...arg) {return this.#rand.choice(...arg)}
	next(min, max) {return this.#rand.nextInt(min, max)}
};

export const Color = freeze(new class {
	BgColor = '#000';
	PacMan  = '#FF0';
	get Wall()  {return `hsl(${Rand.hueA}      98% 84%)`}
	get Door()  {return `hsl(${Rand.hueA-180} 100% 80%)`}
	get Dark()  {return `hsl(${Rand.hueA- 90}  30% 30% /0.8)`}
	get Pts()   {return `hsl(${Rand.hueA-180} 100% 80%)`}
	get Dot()   {return `hsl(${Rand.hueA-190} 100% 88%)`}
	get Clear() {return `hsl(${Rand.hueA+100}  60% 70%)`}
});
function setCSSVariables() {
	$(dBody).css({
		'--color-wall'  :  Color.Wall,
		'--color-body'  : `hsl(${Rand.hueA}      50% 25%)`,
		'--color-title' : `hsl(${Rand.hueA- 90} 100% 80%)`,
		'--color-ready' : `hsl(${Rand.hueA-120}  80% 80%)`,
		'--color-light' : `hsl(${Rand.hueA-180}  80% 78%)`,
		'--color-dark'  : `hsl(${Rand.hueA-180}  80% 20%)`,
		'--color-darkA' : `hsl(${Rand.hueA-180}  40% 20% /0.7)`,
	});
}

const Dot = new class {
	static {$on('Title', _=> Dot.#reset())}
	#max = 0; get max() {return this.#max}
	#reset() {
		DotMap.clear();
		for (let y=2; y<GRID-2; y++)
			for (let x=2; x<GRID-2; x++) this.#set({x,y});
		this.#max = DotMap.size;
	}
	#set(tile) {
		if (hasWall(tile) || Pen.isAround(tile)) return;
		const pos = Vec2(tile).add(.5).mul(T);
		const idx = Vec2(tile).idx(GRID);
		DotMap.set(idx, pos);
		PowMap.has(idx) == false
			&& fillCircle(Bg)(...pos.vals, T/12, Color.Dot);
	}
};
class PowDot {
	static #instance = null;
	static get instance() {return this.#instance ||= new PowDot}
	static {$on('Title Pause Respawn Losing', _=> new PowDot)}
	#scale = 1;
	#angle = PI/2;
	constructor() {PowDot.#instance = this}
	update() {
		if (!Scene.isPlaying) return;
		this.#scale = 0.7 + abs(sin(this.#angle -= PI/40) * 0.3);
	}
	#drawDot({x, y}) {
		fillCircle(Ctx)(x, y, T/2.2*this.#scale, Color.Dot);
	}
	draw() {PowMap.forEach(pos=> this.#drawDot(pos))}
};

class PenRect {
	Tile   = new Rect((GRID>>1)-2, (GRID>>1)-2, 4,4);
	Pixel  = this.Tile.mul(T);
	Around = this.Tile.outer(1);
	Middle = this.Pixel.y + this.Pixel.Height/2;
}
export const Pen = freeze(new class Cls {
	static Rect = new PenRect;
	static {$on('Resize', _=> this.Rect = new PenRect)}
	get Rect()     {return Cls.Rect.Pixel}
	get TileRect() {return Cls.Rect.Tile}
	get Middle()   {return Cls.Rect.Middle}
	get Frame()    {return T/5}
	get Door()     {return Vec2(GRID>>1, Cls.Rect.Tile.y)}
	get Entrance() {return Vec2(this.Door).add(0, -1)}
	isInHouse = pos=> Cls.Rect.Tile.contains(pos);
	isAround  = pos=> Cls.Rect.Around.contains(pos);
});

export const Maze = freeze(new class {
	static {$on('Reset Respawn', this.#reset)}
	static #reset(_, config) {
		Maze.#generate(config);
		Maze.#resetObjs();
	}
	DotMap  = DotMap;
	PowMap  = PowMap;
	hasWall = hasWall;
	get Seed()   {return Rand.seed}
	get Graph()  {return Graph.data}
	get DotMax() {return Dot.max}
	get PowDot() {return PowDot.instance}
	get Center() {return CVS_SIZE/2}

	#generate({seed,isInit=false}={}) {
		if (!isInit) return;
		Rand.set(seed);
		Container.style.background = Color.BgColor;
		WallMap.clear();
		this.#setRandomWalls();
		Graph.set();
	}
	#resetObjs() {
		Scene.isReset && PowMap.clear();
		Pacman.instantiate();
		MAP_DATA.forEach(this.#setObj);
	}
	#setObj(tip, idx) {
		const tile = Vec2.fromIdx(idx, GRID);
		const pos  = Vec2.mul(tile, T);
		const ghs0 = TileType.Ghosts[0];
		switch (tip) {
		case TileType.Wall:
			Scene.isReset && WallMap.set(idx, tile);
			break;
		case TileType.Pow:
			Scene.isReset && PowMap.set(idx, Vec2.add(pos,T/2));
			break;
		default:
			tip >= ghs0 && putGhost(tip - ghs0, ...tile.vals);
		}
	}
	#connectLen(num) {
		return [num, Rand.choice(4,8), Rand.choice(8,10,10)][MAZE_IDX];
	}
	#isInField({x, y}) {
		return !(x<3 || y<3 || x>GRID-4 || y>GRID-4);
	}
	#canPutWall(pos) {
		return MAP_DATA[pos.y*GRID+pos.x] != TileType.Pow
			&& this.#isInField(pos) && !Pen.isAround(pos) && !hasWall(pos);
	}
	#hasSurroundingsBlank(pos, outer=1) {
		return Rect.surround(pos, outer).every(pos=> !hasWall(pos));
	}
	#blankExists(isSurround=false) {
		for (let y=3; y<GRID-3; y++)
			for (let x=3; x<GRID-3; x++) {
				if ( isSurround && !hasWall({x,y})) continue;
				if (!isSurround && !this.#canPutWall({x,y})) continue;
				if (this.#hasSurroundingsBlank({x,y})) return true;
			}
		return false;
	}
	#setRandomWalls() {
		while (1) {
			const num = Rand.choice(2,4);
			const dir = Rand.choice(Dirs);
			const x = int(Rand.next(2,GRID-3)/num) * num - 1;
			const y = int(Rand.next(2,GRID-3)/num) * num - 1;
			if (!this.#canPutWall({x,y})) continue;
			for (let i=0, len=this.#connectLen(num); i<=len; i++) {
				const pos = Vec2[dir].mul(i).add(x,y);
				if (this.#canPutWall(pos)) setWall(pos);
				else break;
			}
			if (!this.#blankExists()) break;
		}
		while (1) {
			this.#connIsolatedWalls();
			this.#breakDeadEndWalls();
			if (!this.#blankExists(true)) break;
		}
		this.#setSquareWalls();
	}
	#connIsolatedWalls() {
		for (const [_,t] of WallMap) {
			if (!this.#hasSurroundingsBlank(t)) continue;
			const dirs = Dirs.filter(dir=> this.#canPutWall(Vec2[dir].add(t)));
			setWall(Vec2[Rand.choice(dirs)].add(t));
		}
	}
	#breakDeadEndWalls() {
		for (let y=3; y<GRID-3; y++)
			for (let x=3; x<GRID-3; x++) {
				if (hasWall({x,y})) continue;
				const dirs = Dirs.filter(dir=> hasWall(Vec2[dir].add(x,y)));
				dirs.length>2 && delWall(Vec2[Rand.choice(dirs)].add(x,y));
			}
	}
	#setSquareWalls() {
		for (let y=3; y<GRID-3; y++)
			for (let x=3; x<GRID-3; x++) {
				if (!this.#canPutWall({x,y}) || Rand.choice([0,1])
				 || !this.#hasSurroundingsBlank({x,y},2)) continue;
				setWall({x,y}) && Rect.surround({x,y}).forEach(setWall);
			}
	}
});
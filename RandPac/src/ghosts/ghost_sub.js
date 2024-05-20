import {U,R,D,L}  from '../_lib/direction.js';
import {Vec2}     from '../_lib/vec2.js';
import {Maze,Pen} from '../maze.js';
import {Pacman}   from '../pacman/pac.js';
import {Ghost}    from './ghost.js';
import {Ghosts}   from './ghost_sys.js';

class Akabei extends Ghost {
	Color = '#E00';
	ScatterPos = Vec2(GRID-3, 2).freeze();
	constructor(idx,col,row) {
		const dir = range(Pen.TileRect.x-1, col)
			.some(x=> !Maze.hasWall({x, y:row-1})) ? L : R;
		super({idx,col,row,dir});
		freeze(this);
	}
	get angry()     {return Ghost.Elroy.angry}
	get chaseStep() {return Ghost.Elroy.step}
	get ChasePos()  {return Pacman.instance.tilePos}
}
class Pinky extends Ghost {
	Color = '#F9B';
	ScatterPos  = Vec2(2, 2).freeze();
	ReleaseTime = 500; // ms
	constructor(idx,col,row) {
		super({idx,col,row,dir:D});
		freeze(this);
	}
	get ChasePos() {
		return Pacman.instance.getForwardPos(4);
	}
}
class Aosuke extends Ghost {
	Color = '#0CF';
	ScatterPos  = Vec2(GRID-3, GRID-3).freeze();
	ReleaseTime = 1000; // ms
	constructor(idx,col,row) {
		const offsetX = -(A/2-T/2) - 2;
		super({idx,col,row,offsetX,dir:U,initAlign:L});
		freeze(this);
	}
	get ChasePos() {
		const pos = Pacman.instance.getForwardPos(2);
		return pos.clone.sub(Ghosts[Ghost.Type.Akabei].tilePos).add(pos);
	}
}
class Guzuta extends Ghost {
	Color = '#FB0';
	ScatterPos  = Vec2(2, GRID-3).freeze();
	ReleaseTime = 1000; // ms
	ChaseRadius = 6 * T;
	constructor(idx,col,row) {
		const offsetX = +(A/2-T/2) + 2;
		super({idx,col,row,offsetX,dir:U,initAlign:R});
		freeze(this);
	}
	get ChasePos() {
		return Vec2.distance(this, Pacman.instance) < this.ChaseRadius
			? this.ScatterPos
			: Pacman.instance.tilePos;
	}
}
export function putGhost(idx, col, row) {
	Ghosts[idx] = new [Akabei,Pinky,Aosuke,Guzuta][idx]
		.prototype.constructor(idx, col, row);
}
export class Actor {
	hp      = 0;
	mp      = 0;
	level   = 0;
	attack  = 0;
	defence = 0;
	constructor([strength=0,agility=0,maxHp=0,maxMp=0]=[]) {
		this.strength = strength;
		this.agility  = agility;
		this.maxHp    = maxHp;
		this.maxMp    = maxMp;
	}
	update(){}
	draw(){}
}
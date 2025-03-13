'use strict'
class Vector2 {
	#x=0;#y=0;
	 x=0; y=0;
	get vals()         {return [this.x, this.y]}
	get hyphenated()   {return `${this.x}-${this.y}`}
	get inverse()      {return this.clone.mul(-1)}
	get sqrMagnitude() {return this.x**2 + this.y**2}
	get magnitude()    {return sqrt(this.sqrMagnitude)}
	get clone()        {return Vec2(this.x,  this.y)}
	get asInt()        {return Vec2(this.x|0,this.y|0)}
	get normalized()   {return Vec2(this.x/this.magnitude, this.y/this.magnitude)}
	constructor(v1,v2) {
		this.set(v1,v2)
		defineProperties(this, {
			x:{get(){return this.#x},set(x){this.setX(x)},enumerable:true},
			y:{get(){return this.#y},set(y){this.setY(y)},enumerable:true},
		})
	}
	set(v1, v2=v1) {
		const {x,y}= this.#check(v1, v2)
		this.#x = x
		this.#y = y
		return this
	}
	setX(x) {return this.set(x, this.y)}
	setY(y) {return this.set(this.x, y)}

	add(v1, v2=v1) {
		const {x,y}= this.#check(v1, v2)
		this.#x += x
		this.#y += y
		return this
	}
	sub(v1, v2=v1) {
		const {x,y}= this.#check(v1, v2)
		this.#x -= x
		this.#y -= y
		return this
	}
	mul(s) {
		this.#check(s,s, {scalar:true})
		this.#x *= s
		this.#y *= s
		return this
	}
	div(s) {
		this.#check(s,s, {scalar:true})
		this.#x /= s
		this.#y /= s
		return this
	}
	divInt(s) {
		this.#check(s,s, {scalar:true})
		this.#x = (this.x/s)|0
		this.#y = (this.y/s)|0
		return this
	}
	eq(v1, v2=v1) {
		const {x,y}= this.#check(v1, v2, {asgmt:false})
		return Vec2.eq(this, {x,y})
	}
	distance(v) {
		return Vec2.sub(this, v).magnitude
	}
	freeze() {
		return freeze(this)
	}
	#check(v1=0,v2=0,{asgmt=true,scalar=false}={}) {
		if (asgmt && isFrozen(this))
			throw TypeError('Cannot assign to read only property')
		if (scalar && !isNum(v1))
			throw TypeError(`Scalar '${v1}' is not a number`)
		if (Dir.isValid(v1))
			return Vec2[v1]
		{
			const [x,y]= isObj(v1) ? [v1.x, v1.y] : [v1, v2]
			if (!isNum(x)) throw TypeError(`${x} is an invalid x value`)
			if (!isNum(y)) throw TypeError(`${y} is an invalid y value`)
			return {x,y}
		}
	}
} freeze(Vector2)

/** @typedef {Vector2} */
const Vec2 = function() {
	const
	Vec2 = (...args)=> new Vector2(...args,)
	Vec2.Zero  = Vec2( 0, 0)
	Vec2.Up    = Vec2( 0,-1)
	Vec2.Right = Vec2( 1, 0)
	Vec2.Down  = Vec2( 0, 1)
	Vec2.Left  = Vec2(-1, 0)
	for (const [k,v] of entries(Vec2)) {
		defineProperty(Vec2, k, {get(){return v.clone}})
	}
	Vec2.isValid  = (pos)  => isObj(pos) && isNum(pos.x) && isNum(pos.y)
	Vec2.eq       = (v, v2)=> abs(v.x-v2.x) < 1e-6 && abs(v.y-v2.y) < 1e-6
	Vec2.idx      = (v,col)=> Number(v.y * col + v.x)
	Vec2.add      = (v, v2)=> Vec2(v).add(v2)
	Vec2.sub      = (v, v2)=> Vec2(v).sub(v2)
	Vec2.mul      = (v, sc)=> Vec2(v).mul(sc)
	Vec2.div      = (v, sc)=> Vec2(v).div(sc)
	Vec2.divInt   = (v, sc)=> Vec2(v).divInt(sc)
	Vec2.distance = (v, v2)=> Vec2.sub(v, v2).magnitude
	return freeze(Vec2)
}()
//---- Scene ----

interface Scene {update():void, draw?():void}

//---- Tile & Coords ----

/** A non-negative integer representing the tile index. */
type TileIdx  = number
type xyTuple  = Readonly<[x:number, y:number]>
type Position = Readonly<{x:number, y:number}>
type PathNode = {tile:Vec2,dir:Direction,stopped:boolean}

interface ReadonlyVec2 {
	readonly x: number
	readonly y: number
	readonly vals: [x:number, y:number]
	readonly hyphenated: string
	readonly asInt: Vec2
	readonly clone: Vec2
	readonly normalized: Vec2
	readonly magnitude: number
	readonly sqrMag: number
	readonly inverse: Vec2
	void(): void
	distance(pos:Position): Vec2
	toIdx(cols:number): number
	toString(): string
}

//---- Points ----

type PtsValue = 100|200|300|400|800|1600|500|700|1000|2000|3000|5000
type FloatingPtsData = {
    key: {points:PtsValue};
    pos: Readonly<Position>;
    dur?:number;
    fn?: ()=> void;
}

//---- Direction ----

type Direction  = 'Up'|'Right'|'Down'|'Left'
type Vertical   = 'Up'|'Down'
type Horizontal = 'Left'|'Right'

//---- Canvas API ----

type Cvs2DStyle = string|CanvasGradient|CanvasPattern

//---- jQuery ----

type Global = Window & typeof globalThis
type JQData = any[]|JQuery.PlainObject|string|number|boolean

type JQKeyboardEvent   = JQuery.KeyboardEventBase
type JQTriggeredEvent  = JQuery.TriggeredEvent

type JQWindowHandler   = (events:JQTriggeredEvent<Global,undefined,Global,Global>)=> void
type JQWindowHandlers  ={[events:string]:JQWindowHandler}

type JQTriggerHandler  = (events:JQTriggeredEvent)=> void
type JQTriggerHandlers ={[events:string]:JQTriggerHandler}

interface JQuery {
	offon<TType extends string>(
		events:  TType,
		handler: JQuery.TypeEventHandler<TElement,undefined,TElement,TElement,TType>,
		force?:  boolean,
	):this
	onNS<TType extends string>(
		events:   TType,
		handlers: JQTriggerHandlers,
	):this
	onWheel(handler: (event:WheelEvent)=> void):this
}
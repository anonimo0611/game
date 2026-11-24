//---- Dictionary ----

type Maybe<T> = T | undefined
interface PrimitiveMap {
    string:  string;
    number:  number;
    boolean: boolean;
}

//---- Dictionary ----

type Dict<T>        = Readonly<Record<string, T>>
type NumericDict<T> = Readonly<Record<number, T>>
type Scene = {update():void, draw():void}
type SceneDict<T extends string> = {readonly [K in T]?:Scene}

//---- Timer ----

interface TimerData {
	amount:  number;
	timeout: number;
	ignoreFrozen: boolean;
	callback: ()=> void;
}
type TimerSeq = readonly [
	durationMS: number,
	callback: ()=> void,
	key?: unknown,
]

//---- Tile & Coords ----

interface Pos  {readonly x:number, readonly y:number}
interface Tile {readonly x:number, readonly y:number}
type TileIdx  = number
type xyTuple  = Readonly<[x:number, y:number]>
type PathNode = {tile:Vec2, dir:Direction, stopped:boolean}

//---- Points ----

type PointType = typeof PointType[keyof typeof PointType]
type PointVal  = 100|200|300|400|500|700|800|1000|1600|2000|3000|5000
type FloatingPtsData = {
	pts: {type:PointType, value:PointVal};
	x: number,
	y: number,
	dur?: number;
	frozen?: boolean;
	cb?: ()=> void;
}

//---- Direction ----

type Up    = 'Up'
type Right = 'Right'
type Down  = 'Down'
type Left  = 'Left'
type Vertical   = Up|Down
type Horizontal = Left|Right
type Direction  = Up|Right|Down|Left
type Directions = Direction[]

//---- Ghosts ----

type GhostType = (typeof GhostType)[Exclude<keyof typeof GhostType,'Max'>]
type GhostData = {dir?:Direction, type?:GhostType, tile?:xyTuple, align?:-1|0|1}

/** Represents Akabei's dazed eyes in intermissions scene part 2. */
type Dazed = 'Dazed'
type GhostGaze = Direction|Dazed

//---- Canvas API ----

type Ctx2D = EnhancedCtx2D
type CvsStyle = string | CanvasGradient | CanvasPattern

//---- Key events ----

type KeyboardEventLike = KeyboardEvent | JQuery.KeyboardEventBase

//---- jQuery ----

type Global = Window & typeof globalThis
type JQData = any[]|JQuery.PlainObject|string|number|boolean

type JQEvent<T extends HTMLElement = HTMLElement> = JQuery.TriggeredEvent<T,undefined,T,T>
type JQKeyboardEvent   = JQuery.KeyboardEventBase
type JQKeyupKeydownObj = {keyup?:JQKeyboardHandler, keydown?:JQKeyboardHandler}
type JQTriggerHandler  = (ev:JQuery.TriggeredEvent, data?:any)=> void
type JQKeyboardHandler = (ev:JQKeyboardEvent, data?:any)=> void
type JQTriggerHandlers = {[ev:string]:JQTriggerHandler} | JQKeyupKeydownObj

interface JQuery {
	onWheel(handler: (ev:WheelEvent)=> void): this

	offon<TType extends string>(
		events: TType,
		handler: JQuery.TypeEventHandler<TElement,undefined,TElement,TElement,TType>,
		force?: boolean,
	): this

	onNS<TType extends string>(
		namespace: TType,
		handlers: JQTriggerHandlers,
		force?: boolean,
	): this
}
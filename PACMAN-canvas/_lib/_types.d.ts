//---- Dictionary ----

type SceneDict<T>   = {[K in T]?: {update():void, draw?():void}}
type NumericDict<T> = {readonly [K:number]:T}

//---- Timer ----

type TimerData = {
	amount:  number;
	timeout: number;
	ignoreFrozen: boolean;
	callback: ()=> void;
}
type TimerSeq = [durationMS:number, callback:()=> void]

//---- Tile & Coords ----

/** A non-negative integer representing the tile index. */
type TileIdx  = number
type xyTuple  = Readonly<[x:number, y:number]>
type Position = Readonly<{x:number, y:number}>
type PathNode = {tile:Vec2, dir:Direction, stopped:boolean}

//---- Points ----

type PtsValue = 100|200|300|400|500|700|800|1000|1600|2000|3000|5000
type FloatingPtsData = {
	key: {points: PtsValue};
	pos:  Readonly<Position>;
	dur?: number;
	cb?:  ()=> void;
}

//---- Direction ----

type Direction  = 'Up'|'Right'|'Down'|'Left'
type Vertical   = 'Up'|'Down'
type Horizontal = 'Left'|'Right'

/** Represents Akabei's dazed eyes in intermissions scene part 2. */
type DazedEyes = 'DazedEyes'
type VisualOrient = Direction|DazedEyes

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
		handler: JQuery.TypeEventHandler<TElement, undefined, TElement, TElement, TType>,
		force?:  boolean,
	): this
	onNS<TType extends string>(
		events:   TType,
		handlers: JQTriggerHandlers,
	): this
	onWheel(handler: (event: WheelEvent)=> void): this
}
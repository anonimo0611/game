//---- Ghosts ----

type GhostIdx = (typeof GhostType)['Akabei'|'Pinky'|'Aosuke'|'Guzuta']
type GhostHitRadii = readonly [normal: number, frightened: number]

//---- Dictionary ----

type Scene = {update():void, draw():void}
type SceneDict<T extends string> = {[K in T]?:Scene}
type NumericDict<T> = {readonly [K:number]:T}

//---- Timer ----

type TimerData = {
	amount:  number;
	timeout: number;
	ignoreFrozen: boolean;
	callback: ()=> void;
}
type TimerSeq = [durationMS:number, callback:()=> void, key?:unknown]

//---- Tile & Coords ----

/** Must be a positive value */
type TileIdx  = number
type xyTuple  = Readonly<[x:number, y:number]>
type Position = Readonly<{x:number, y:number}>
type PathNode = {tile:Vec2, dir:Direction, stopped:boolean}

//---- Points ----

type PtsIdx = typeof PointType[keyof typeof PointType]
type PtsVal = 100|200|300|400|500|700|800|1000|1600|2000|3000|5000
type FloatingPtsData = {
	key: {ptsType:PtsIdx, ptsValue:PtsVal};
	pos:  Position;
	dur?: number;
	frozen?: boolean;
	cb?: ()=> void;
}

//---- Direction ----

type Direction  = 'Up'|'Right'|'Down'|'Left'
type Vertical   = 'Up'|'Down'
type Horizontal = 'Left'|'Right'

/** Represents Akabei's dazed eyes in intermissions scene part 2. */
type Dazed = 'Dazed'
type VisualOrient = Direction|Dazed

//---- Canvas API ----

type Ctx2D = EnhancedCtx2D
type CvsStyle = string|CanvasGradient|CanvasPattern

//---- jQuery ----

type Global = Window & typeof globalThis
type JQData = any[]|JQuery.PlainObject|string|number|boolean

type JQKeyboardEvent    = JQuery.KeyboardEventBase
type JQTriggeredEvent   = JQuery.TriggeredEvent
type JQWindowHandler    = (ev:JQuery.TriggeredEvent<Global,undefined,Global,Global>, data?:any)=> void
type JQTriggerHandler   = (ev:JQTriggeredEvent, data?:any)=> void
type JQKeyboardHandler  = (ev:JQKeyboardEvent,  data?:any)=> void
type JQKeyboardHandlers = {keyup?:JQKeyboardHandler, keydown?:JQKeyboardHandler}
type JQTriggerHandlers  = {[ev:string]:JQTriggerHandler}|JQKeyboardHandlers

interface JQuery {
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
	onWheel(handler: (ev:WheelEvent)=> void): this
}
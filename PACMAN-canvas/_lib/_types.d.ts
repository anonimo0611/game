//---- Scene ----

interface Scene {update():void, draw?():void}

//---- Coordinates ----

type xyTuple  = Readonly<[x:number, y:number]>
type Position = Readonly<{x:number, y:number}>
type PathNode = Readonly<{tile:Vec2, dir:Direction, stopped:boolean}>

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
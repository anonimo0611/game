/*--- Vector2 ---*/

type xyTuple  = [x:number, y:number]
type Position = {x:number, y:number}

/*--- Direction ---*/

type Direction = 'Up'|'Right'|'Down'|'Left'

/*--- Canvas API ---*/

type Cvs2DStyle = string|CanvasGradient|CanvasPattern


/*--- jQuery ---*/

type JQData = any[]|JQuery.PlainObject|string|number|boolean
type StateOptions = {delay?:number,data?:JQData}

type JQWindowHandler = (event: JQuery.TriggeredEvent<Window & typeof globalThis, undefined,
	Window & typeof globalThis, Window & typeof globalThis>)=> void

type JQTriggerHandler  = (event:JQuery.TriggeredEvent)=> void
type JQTriggerHandlers = {[event:string]:JQTriggerHandler}
type JQTriggerWindowHandlers = {[event:string]:JQWindowHandler}

interface JQuery {
	offon<TType extends string>(
		events:  TType,
		handler: JQuery.TypeEventHandler<TElement, undefined, TElement, TElement, TType>,
		force?:  boolean,
	):this;
	onWheel(handler: (event:WheelEvent)=> void):this;
}
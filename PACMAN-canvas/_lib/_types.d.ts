// Coordinates

type xyTuple  = [x:number, y:number]
type Position = {x:number, y:number}

// Direction

type Direction = 'Up'|'Right'|'Down'|'Left'

// Canvas API

type Cvs2DStyle = string|CanvasGradient|CanvasPattern

// jQuery

type Global = Window & typeof globalThis
type JQData = any[]|JQuery.PlainObject|string|number|boolean

type JQWindowHandlers  ={[event:string]:JQWindowHandler}
type JQWindowHandler   = (event:JQuery.TriggeredEvent<Global,undefined,Global,Global>)=> void

type JQTriggerHandlers ={[event:string]:JQTriggerHandler}
type JQTriggerHandler  = (event:JQuery.TriggeredEvent)=> void

interface JQuery {
	offon<TType extends string>(
		events:  TType,
		handler: JQuery.TypeEventHandler<TElement,undefined,TElement,TElement,TType>,
		force?:  boolean,
	):this;
	onWheel(handler: (event:WheelEvent)=> void):this;
}
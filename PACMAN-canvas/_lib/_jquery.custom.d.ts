type JQWindowHandler = (event: JQuery.TriggeredEvent<Window & typeof globalThis, undefined,
	Window & typeof globalThis, Window & typeof globalThis>)=> any

interface JQuery {
	offon<TType extends string>(
		events:  TType,
		handler: JQuery.TypeEventHandler<TElement, undefined, TElement, TElement, TType>,
		force?:  boolean,
	):this;
	onWheel(handler: (ev:WheelEvent)=> void):this;
}
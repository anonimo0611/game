type JQWindowHandler = (event: JQuery.TriggeredEvent<Window & typeof globalThis, undefined,
	Window & typeof globalThis, Window & typeof globalThis>)=> unknown

interface JQuery {
	offon<TType extends string>(
		events:  TType,
		handler: JQuery.TypeEventHandler<TElement, undefined, TElement, TElement, TType>,
		force?:  boolean,
	):this;
}
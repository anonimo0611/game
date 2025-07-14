interface JQuery {
	offon<TType extends string>(
		events: TType,
		handler:JQuery.TypeEventHandler<TElement, undefined, TElement, TElement, TType>
	):this;
}
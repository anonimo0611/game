namespace StateDef {
	type Was <S extends string> = {[K in S as `was${K}`]:boolean}
	type Set <S extends string> = {[K in S as `set${K}`]:(opt?:Opts)=> void}
	type Is  <S extends string> = {readonly [K in S as `is${K}`]:boolean}
	type Opts<S extends string> = {delay?:number,data?:JQData,fn?:(state:S,data?:JQData)=> void}
	type Props<Owner,State extends string> = Is<State> & Was<State> & Set<State>
}
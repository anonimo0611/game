namespace StateDef {
	type Was<S extends string> = {[K in S as`was${K}`]:boolean}
	type To <S extends string> = {[K in S as `to${K}`]:(opt?:Opts)=> void}
	type Is <S extends string> = {readonly [K in S as `is${K}`]:boolean}
	type Opts = {delay?:number,data?:JQData}
	type Props<Owner,State extends string> = Is<State> & Was<State> & To<State>
}
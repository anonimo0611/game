export namespace StateDef {
	type To <S extends string,Self> = {[K in S as `to${K}`]:(opt?:Opts)=> Self}
	type Is <S extends string> = {[K in S as `is${K}`]:boolean}
	type Was<S extends string> = {[K in S as`was${K}`]:boolean}
	type Opts = {delay?:number,data?:JQData}
	type Props<Owner,State extends string,Self> = Is<State> & Was<State> & To<State,Self>
}
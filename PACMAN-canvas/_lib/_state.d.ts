
namespace StateDef {
	type Opts<S extends string> = {delay?:number, data?:JQData, cb?:(state:S, data?:JQData)=> void}
	type Fluent<State extends object,S extends string> = State
		& {readonly [K in S as `is${K}`]:boolean}
		& {readonly [K in S as `was${K}`]:boolean}
		& {readonly [K in S as `set${K}`]:(opt?:Opts<S>)=> void}
}
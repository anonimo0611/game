namespace Sound {
	type Manifest<S extends string> = ReadonlyArray<{
		readonly src: string,
		readonly data: {
			readonly channels: number,
			readonly audioSprite: ReadonlyArray<Data<S>>
		}
	}>
	type Opts = {delay?:number, duration?:number, offset?:number, loop?:number, volume?:number}
	type Data<S extends string> = {id:S, startTime:number, duration:number, volume?:number, loop?:number}
	type onSettled = (succeeded:boolean)=> void
	type PlayOpts<S> = {[K in S]:Readonly<Sound.Data<S>>}
	type Instance<S> = {[K in S]:createjs.AbstractSoundInstance}
	type Fluent<Core extends object,T extends string> = Core
		& {[K in T as `play${K}`]:(opts?:Opts)=> void}
		& {[K in T as `stop${K}`]:()=> Fluent<Core,T>}
}
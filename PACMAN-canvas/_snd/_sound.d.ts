export namespace SoundDef {
	type Setup = {onLoaded?():void,onFailed?():void}
	type Opts  = {interrupt?:string,delay?:number,duration?:number,offset?:number,loop?:number;volume?:number,pan?:number}

	type Data<S extends string> = {id:S,startTime:number,duration:number,volume?:number,loop?:number}
	type Play<S extends string> = {[K in S as`play${K}`]:(opts?:Opts)=> void}
	type Stop<S extends string,Self> = {[K in S as`stop${K}`]:(...ids:S[])=> Self}

	type Manifest<S extends string> = ReadonlyArray<{
		readonly src: string,
		readonly data: {
			readonly channels: number,
			readonly audioSprite: ReadonlyArray<Data<S>>
		}
	}>
}
namespace Sound {
	type Opts = {interrupt?:string,delay?:number,duration?:number,offset?:number,loop?:number;volume?:number,pan?:number}
	type Data<S extends string> = {id:S,startTime:number,duration:number,volume?:number,loop?:number}
	type playFn    = (opts?:Opts)=> void
	type onSettled = (succeeded:boolean)=> void
	type Manifest<S extends string> = ReadonlyArray<{
		readonly src: string,
		readonly data: {
			readonly channels: number,
			readonly audioSprite: ReadonlyArray<Data<S>>
		}
	}>
}
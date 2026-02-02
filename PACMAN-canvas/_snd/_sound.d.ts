interface ManifestOpts {startTime:number, duration:number, volume?:number, loop?:number}
interface PlayOpts {interrupt?:string, delay?:number, duration?:number, offset?:number, loop?:number;volume?:number, pan?:number}
type Manifest<T> = {src:string, data:{channels:number, audioSprite:({id:T} & ManifestOpts)[]}}[]
type GenAudioSprite = <T extends Record<string, ManifestOpts>>(data: T) => ({ [K in keyof T]: {id:K} & T[K]}[keyof T])[]
const SoundData = /**@type {const}*/({
    //---- looped.ogg ----
    siren0:  {srcIdx:0, startTime:    0, duration: 402},
    siren1:  {srcIdx:0, startTime: 1402, duration: 327},
    siren2:  {srcIdx:0, startTime: 2730, duration: 298},
    siren3:  {srcIdx:0, startTime: 4028, duration: 265},
    escape:  {srcIdx:0, startTime: 5292, duration: 268},
    fright:  {srcIdx:0, startTime: 6561, duration: 538},
    cutscene:{srcIdx:0, startTime: 8059, duration:5686},
    start:   {srcIdx:0, startTime:14233, duration:4500},
    //---- regular.ogg ----
    losing:  {srcIdx:1, startTime:    0, duration:1749},
    eat0:    {srcIdx:1, startTime: 1998, duration:  80},
    eat1:    {srcIdx:1, startTime: 2137, duration:  80},
    bitten:  {srcIdx:1, startTime: 2603, duration: 575},
    bell:    {srcIdx:1, startTime: 3641, duration:2090},
    fruit:   {srcIdx:1, startTime: 5952, duration: 496},
}),
genSprite = (/**@type {number}*/idx)=>
    entries(SoundData).flatMap(([k,v])=> idx == v.srcIdx ? [{id:k,...v}]:[])
/**
 * @typedef {keyof SoundData} SoundType
 * @type {ReadonlyMap<string,{loop:number,volume:number}>}
 */
export const
ConfigMap = new Map([
	['_normal', {loop: 0, volume:1.00}],
	['eat',     {loop: 0, volume:0.70}],
	['bell',    {loop: 0, volume:0.70}],
	['cutscene',{loop: 1, volume:1.00}],
	['fright',  {loop:-1, volume:0.55}],
	['siren',   {loop:-1, volume:0.80}],
	['escape',  {loop:-1, volume:0.90}],
])
, Ids      = /**@type {SoundType[]}*/(keys(SoundData))
, SirenIds = /**@type {const}*/(['siren0','siren1','siren2','siren3'])
, Manifest = [
    {src:'./res/looped.ogg', data:{channels:3, audioSprite:[...genSprite(0)]}},
    {src:'./res/regular.ogg',data:{channels:4, audioSprite:[...genSprite(1)]}},
]
/**
 @typedef {keyof Looped | keyof Regular} SoundType
 @typedef {{[key in SoundType]?:{startTime:number,duration:number}}} SoundData
*/
const Looped = /**@type {const}*/({ // looped.ogg
    siren0:   {startTime:    0, duration: 402},
    siren1:   {startTime: 1402, duration: 327},
    siren2:   {startTime: 2730, duration: 298},
    siren3:   {startTime: 4028, duration: 265},
    fright:   {startTime: 6561, duration: 538},
    eyesGhost:{startTime: 5292, duration: 268},
    cutscene: {startTime: 8059, duration:5686},
    start:    {startTime:14233, duration:4500},
})
const Regular = /**@type {const}*/({ // regular.ogg
    dying:    {startTime:    0, duration:1749},
    eat0:     {startTime: 1998, duration:  80},
    eat1:     {startTime: 2137, duration:  80},
    bitten:   {startTime: 2603, duration: 575},
    bell:     {startTime: 3641, duration:2090},
    fruit:    {startTime: 5952, duration: 496},
})
const genSprite = (/**@type {SoundData}*/data)=>
    [...entries(data).map(([id,val])=> ({id,...val}))]

/**
 @type {ReadonlyMap<string,{loop:number,volume:number}>}
*/
export const
OptsMap = new Map([
    ['_normal',  {loop: 0, volume:1.00}],
    ['eat',      {loop: 0, volume:0.70}],
    ['bell',     {loop: 0, volume:0.70}],
    ['cutscene', {loop: 1, volume:1.00}],
    ['fright',   {loop:-1, volume:0.55}],
    ['siren',    {loop:-1, volume:0.80}],
    ['eyesGhost',{loop:-1, volume:0.90}],
])
,Ids      = /**@type {SoundType[]}*/(keys({...Looped,...Regular}))
,SirenIds = /**@type {const}*/(['siren0','siren1','siren2','siren3'])
,Manifest = [
    {src:'./res/looped.ogg', data:{channels:3, audioSprite:genSprite(Looped)}},
    {src:'./res/regular.ogg',data:{channels:4, audioSprite:genSprite(Regular)}},
]
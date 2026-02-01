/**
 @typedef {import('./manager.js').ManifestOpts} ManifestOpts
 @typedef {{[K in SoundType]?:ManifestOpts}} SoundData
 @typedef {keyof typeof Manifest.opts} SoundType
*/
const looped = /**@type {const}*/({ // looped.ogg
    Siren0:   {startTime:    0, duration: 402, volume:0.80, loop:-1},
    Siren1:   {startTime: 1402, duration: 327, volume:0.80, loop:-1},
    Siren2:   {startTime: 2730, duration: 298, volume:0.80, loop:-1},
    Siren3:   {startTime: 4028, duration: 265, volume:0.80, loop:-1},
    Fright:   {startTime: 6561, duration: 538, volume:0.55, loop:-1},
    EyesGhost:{startTime: 5292, duration: 268, volume:0.90, loop:-1},
    Cutscene: {startTime: 8059, duration:5686, volume:1.00, loop: 1},
    Start:    {startTime:14233, duration:4500},
})
const regular = /**@type {const}*/({ // regular.ogg
    Dying:    {startTime:    0, duration:1749},
    Eat0:     {startTime: 1998, duration:  80, volume:0.70},
    Eat1:     {startTime: 2137, duration:  80, volume:0.70},
    Bitten:   {startTime: 2603, duration: 575},
    Bell:     {startTime: 3641, duration:2090},
    Fruit:    {startTime: 5952, duration: 496},
})

/**
 @template {Record<string,ManifestOpts>} T
 @returns {({[K in keyof T]:{id:K} & T[K]}[keyof T])[]}
*/const genSprite = (/**@type {T}*/data)=>
    [...typedEntries(data).map(([id,val])=> ({id,...val}))]

export const SirenIds =
    /**@type {const}*/(['Siren0','Siren1','Siren2','Siren3'])

export const Manifest = {
    opts: {...looped,...regular},
    manifest: [
        {src:'./res/looped.ogg', data:{channels:3, audioSprite:genSprite(looped)}},
        {src:'./res/regular.ogg',data:{channels:4, audioSprite:genSprite(regular)}},
    ]
}
/** @typedef {(typeof Manifest)[number]['data']['audioSprite'][number]['id']} SoundType */
export const Manifest = /**@type {const}*/([
    {src:'./res/looped.ogg', data:{channels:3, audioSprite:[// looped.ogg
        {id:'Siren0',  startTime:    0, duration: 402, volume:0.80, loop:-1},
        {id:'Siren1',  startTime: 1402, duration: 327, volume:0.80, loop:-1},
        {id:'Siren2',  startTime: 2730, duration: 298, volume:0.80, loop:-1},
        {id:'Siren3',  startTime: 4028, duration: 265, volume:0.80, loop:-1},
        {id:'FrightSE',startTime: 6561, duration: 538, volume:0.55, loop:-1},
        {id:'EyesSE',  startTime: 5292, duration: 268, volume:0.90, loop:-1},
        {id:'CoffBGM', startTime: 8059, duration:5686, volume:1.00, loop: 1},
        {id:'StartBGM',startTime:14233, duration:4500},
    ]}},
    {src:'./res/regular.ogg',data:{channels:4, audioSprite:[// regular.ogg
        {id:'DyingSE', startTime:    0, duration:1749},
        {id:'EatSE0',  startTime: 1998, duration:  80, volume:0.70},
        {id:'EatSE1',  startTime: 2137, duration:  80, volume:0.70},
        {id:'BittenSE',startTime: 2603, duration: 575},
        {id:'BellSE',  startTime: 3641, duration:2090},
        {id:'EatenSE', startTime: 5952, duration: 496},
    ]}},
])
export const SirenIds = /**@type {const}*/(['Siren0','Siren1','Siren2','Siren3'])
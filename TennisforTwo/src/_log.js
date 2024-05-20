import {Ball}    from './ball.js';
import {Pointer} from './pointer.js';

const debugContainer = byId('debug');
globalThis.putLog = (...arg)=> {debugContainer.textContent = `${arg}`}

export const debugLog = ()=> log(`\
Ball  PosX : ${Ball.Pos.x |0}
Ball  xPct : ${Ball.xPct.toFixed(3)}
Ball  yPct : ${Ball.yPctOfBetweenNetToTop.toFixed(3)}
Cusor Pos  : ${Pointer.Pos.asInt.vals}
Cusor xPct : ${Pointer.xPct.toFixed(3)}
Cusor yPct : ${Pointer.yPctOfBetweenNetToTop.toFixed(3)}
`);
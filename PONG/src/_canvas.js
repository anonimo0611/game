import {RGBA} from '../lib/color.js';
export const cvs = document.getElementById('canvas');
export const ctx = cvs.getContext('2d');
export const DefaultRGBA = RGBA(0,255,255,.80);
ctx.globalCompositeOperation = 'screen';
ctx.fillStyle = ctx.strokeStyle = DefaultRGBA.string;
export const cvs          = document.getElementById('canvas');
export const cvsForBrick  = document.createElement('canvas');
export const cvsForShadow = document.createElement('canvas');

export const ctx          = cvs.getContext('2d');
export const ctxForBrick  = cvsForBrick.getContext('2d');
export const ctxForShadow = cvsForShadow.getContext('2d');

cvsForBrick.width  = cvsForShadow.width  = cvs.width;
cvsForBrick.height = cvsForShadow.height = cvs.height;
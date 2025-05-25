import * as _Menu from '../_lib/menu.js'
export const Menu = freeze({
	Level:  new _Menu.DorpDown('LevelMenu'),
	Extend: new _Menu.Slide('ExtendMenu'),
}),
/** @typedef {keyof Menu} MenuType */
MenuIds = /**@type {MenuType[]}*/(keys(Menu))
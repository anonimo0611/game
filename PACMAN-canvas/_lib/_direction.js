'use strict'

const DirEnum = freeze({Up:'Up',Right:'Right',Down:'Down',Left:'Left'})
const {Up,Right,Down,Left}= DirEnum
const {Up:U,Right:R,Down:D,Left:L}= DirEnum

const Dir = freeze({
	Up,Right,Down,Left,
	opp: new Map([[U,D],[R,L],[D,U],[L,R]]),
	wasdToDir: new Map([['W',U],['A',L],['S',D],['D',R]]),
	/**
	 * @param {KeyboardEvent} e
	 * @returns {?(U|R|D|L)}
	 */
	from(e, {wasd=false}={}) {
		if (!isKeyboardEvent(e)) return null
		if (isCombinationKey(e)) return null
		const key = e.code.replace(/^(Arrow|Key)/,'')
		return this.has(key)? key
			: (wasd && this.wasdToDir.get(key) || null)
	},
	/** @param {U|R|D|L} dir */
	has(dir) {return hasOwn(DirEnum,dir)},
})
const COLS   =  13;
const ROWS   =  18;
const Width  = 598;
const Height = 700;
const CellW  = int(Width  / COLS);
const CellH  = int(Height / ROWS);

const ColorType = {
	Hard:       0,
	Immortality:1,
	White:      2,
	Red:        3,
	Orange:     4,
	Yellow:     5,
	Green:      6,
	Cyan:       7,
	Blue:       8,
	Pink:       9,
}
const ColorCode = [
	'#A6A6A6', // Hard
	'#BFBF40', // Immortality
	'#E6E6E6', // White
	'#ED5E5E', // Red
	'#EDB95E', // Orange
	'#EDED5E', // Yellow
	'#5EED5E', // Green
	'#5EEDD5', // Cyan
	'#5E8EED', // Blue
	'#ED5EED', // Pink
];
const Points = [
	100, // Hard
	  0, // Immortality
	 50, // White
	 90, // Red
	 60, // Orange
	120, // Yellow
	 80, // Green
	 70, // Cyan
	100, // Blue
	110, // Pink
];
const DefaultType   = ColorType.Red;
const ColorNames    = keys(ColorType);
const MapArray      = Array(ROWS).fill().map(_=>Array(COLS).fill(-1));
const gridTableElm  = makeElm('table#board');
const selectListElm = makeElm('ul#selectBlock');
const [toolContainer,outputArea,logOut]= byIds('tool|output|log');

function log(v) {logOut.value = v}
function createSelectTool() {
	for (const [i,code] of ColorCode.entries()) {
		const name = ColorNames[i];
		const li = makeElm(`li.${name}`).readOnly({colorType:i});
		li.textContent = '　';
		li.dataset.pts = Points[i];
		$(li).on('mousedown', selectColor);
		selectListElm.append(li);
	}
	$(selectListElm).find('li').eq(DefaultType).mousedown();
	toolContainer.prepend(selectListElm);
}
function createGirdBoard() {
	for (let y=0; y<ROWS; y++) {
		const row = makeElm('tr');
		for (let x=0; x<COLS; x++) {
			const data = makeElm('td');
			row.append(data);
		}
		gridTableElm.append(row);
	}
	toolContainer.prepend(gridTableElm);
}
createGirdBoard();
createSelectTool();

function getCell({x, y}) {
	return gridTableElm.rows[y].cells[x];
}
function getPosition(cell) {
	const x = int(cell.offsetLeft/ cell.offsetWidth);
	const y = int(cell.offsetTop / cell.offsetHeight);
	return {x, y};
}
function outputData() {
	const array = JSON.parse(JSON.stringify(MapArray));
	outputArea.value =
		JSON.stringify(array)
			.replace(/\[\[/g,       '[\n[')
			.replace(/\],\[/g,      '],\n[')
			.replace(/([\[,])(\d)/g,'$1 $2')
		+',';
}
function selectColor(e) {
	$(selectListElm).find('.selected').removeClass('selected');
	e.target.classList.add('selected');
	gridTableElm.selectedColorType = e.target.colorType;
}
function eyedropper(cell) {
	if (!cell.style.background)
		return;
	const {y, x}= getPosition(cell);
	const idx = MapArray[y][x];
	$(selectListElm).find('li').eq(idx).mousedown();
}
function fromArray() {
	const formated = outputArea.value
		.trim()
		.replace(/\/\/.+/g,'')
		.replace(/\s+/g,'')
		.replace(/,$/,'')
	;
	try {
		JSON.parse(formated);
	} catch (e) {
		alert('Could not be parsed as a array');
	}
	const array = JSON.parse(formated);
	if (!Array.isArray(array)) {
		alert('Parsed data is not an Array object');
		return;
	}

	for (let y=0; y<ROWS; y++)
		for (let x=0; x<COLS; x++) {
			const cell = gridTableElm.rows[y].cells[x];
			MapArray[y][x] = -1;
			cell.removeAttribute('style');
		}
	
	for (let y=0; y<ROWS; y++)
		for (let x=0; x<COLS; x++) {
			const cell = gridTableElm.rows[y].cells[x];
			const idx  = array?.[y]?.[x] ?? -1;
			MapArray[y][x] = idx
			cell.style.background = ColorCode[idx];
		}
	outputData();
}

function setData(cell) {
	const {y, x}= getPosition(cell);
	if (cell.style.background) {
		cell.removeAttribute('style');
		MapArray[y][x] = -1;
	} else {
		const type = gridTableElm.selectedColorType;
		cell.style.background  = ColorCode[type];
		MapArray[y][x] = type;
	}
	outputData();
}

const Mouse = new class {
	downed = false;
	Pos = vec2(0,0);
	onDown(e) {
		if (e.altKey) {
			eyedropper(e.target);
			return;
		}
		if (!Mouse.downed)
			setData(e.target);
		Mouse.downed = true;
	}
	onUp(e) {
		Mouse.downed = false;
	}
	onOver(e) {
		if (Mouse.downed)
			setData(e.target);
	}
}
$(gridTableElm)
.on('mousedown', Mouse.onDown)
.on('mouseover', Mouse.onOver);
$(window)
.on('mouseup',   Mouse.onUp);
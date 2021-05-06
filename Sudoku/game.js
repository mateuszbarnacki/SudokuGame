document.addEventListener('DOMContentLoaded', () => {
	const gridContent = document.getElementById('gridContent');
	const numberGrid = document.getElementById('numberGrid');
	const time = document.getElementById('time');
	const stopButton = document.getElementById('stopTime');
	const startButton = document.getElementById('startTime');
	const checkButton = document.getElementById('checkButton');
	const playAgainButton = document.getElementById('playAgainButton');
	const width = 9;
	const height = 9;
	// Array which contains fields of the board
	var fields = Array(width*height);
	// Array which contains fields of the right panel
	var rightPanelNumbers = Array(9);
	// Array which contains data about sudoku board
	var sudoku = Array(81);
	// Array of filled fields of sudoku
	var filledSudoku = Array(81);
	// Array of self-added indexes
	var addedIndexes = [];
	// Array of empty fields at the baginning of the game
	var errorIndexes = [];
	// Selected field holder
	var idxHolder = -1;
	var timeoutHolder;
	var boardCompleted = false;
	var measureTime = false;
	var clock = 0;
	var temp = -1;
	
	time.innerHTML = 'Czas: 00:00';
	stopButton.onclick = stopTimer;
	startButton.onclick = startTimer;
	checkButton.onclick = checkFields;
	playAgainButton.onclick = refresh;
	
	function initialize() {
		for (let i = 0; i < width*height; i++) {
				if (filledSudoku[i] == -1) {
					fields[i].addEventListener('click', fieldEvent);
				} else {
					fields[i].innerHTML = filledSudoku[i];
					if (addedIndexes.includes(i)) {
						fields[i].addEventListener('click', fieldEvent);
						specifyAttributeForSelectedField(fields[i], i, 'color: #143380;');
					} else {
						specifyAttributeForSelectedField(fields[i], i, '');
					}
				}
		}
	}
	
	function refresh() {
		measureTime = false;
		clock = 0;
		addedIndexes = [];
		idxHolder = -1;
		temp = -1;
		addedIndexes = [];
		for (let i = 0; i < width/height; i++) {
			sudoku[i] = 0;
			filledSudoku[i] = 0;
		}
		while (gridContent.firstChild) {
			gridContent.removeChild(gridContent.lastChild);
		}
		time.innerHTML = 'Czas: 00:00';
		startButton.onclick = startTimer;
		clearTimeout(timeoutHolder);
		createBoard();
		generateBoard();
	}
	
	function checkRows() {
		var isCorrect = true;
		for (let idx = 0; idx < width*height; idx += 9) {
			for (let i = 0; i < width-1; i++) {
				for (let j = i+1; j < width; j++) {
					if (fields[idx+i].innerHTML == fields[idx+j].innerHTML) {
						isCorrect = false;
						errorIndexes.push(idx+i);
						errorIndexes.push(idx+j);
					}
				}
			}
		}
		return isCorrect;
	}
	
	function checkColumns() {
		var isCorrect = true;
		for (let idx = 0; idx < width; idx++) {
			for (let i = 0; i < width*height - width; i+=9) {
				for (let j = i+9; j < width*height; j+=9) {
					if (fields[idx+i].innerHTML == fields[idx+j].innerHTML) {
						isCorrect = false;
						errorIndexes.push(idx+i);
						errorIndexes.push(idx+j);
					}
				}
			}
		}
		return isCorrect;
	}
	
	function checkSquares() {
		var isCorrect = true;
		var firstSquareIndexes = [0, 3, 6, 27, 30, 33, 54, 57, 60];
		var tmpArr;
		for (elem in firstSquareIndexes) {
			tmpArr = [elem, elem+1, elem+2, elem+9, elem+10, elem+11, elem+18, elem+19, elem+20];
			for (let i = 0; i < tmpArr.length-1; i++) {
				for (let j = i+1; j < tmpArr.length; j++) {
					if (fields[i].innerHTML == fields[j].innerHTML) {
						isCorrect = false;
						errorIndexes.push(i);
						errorIndexes.push(j);
					}
				}
			}
		}
		return isCorrect;
	}
	
	function checkFields() {
		if (checkRows() && checkColumns() && checkSquares()) {
			startButton.style.visibility = 'hidden';
			stopTimer();
			clearTimeout(timeoutHolder);
			for (let i = 0; i < width*height; i++) {
				fields[i].innerHTML = '';
				fields[i].removeEventListener('click', fieldEvent, false);
				specifyAttributeForSelectedField(fields[i], i, '');
			}
			specifyAttributeForSelectedField(fields[38], 38, 'background-image: linear-gradient(#099e39, green 0%); color: #099e39;');
			specifyAttributeForSelectedField(fields[48], 48, 'background-image: linear-gradient(#099e39, green 0%); color: #099e39;');
			specifyAttributeForSelectedField(fields[58], 58, 'background-image: linear-gradient(#099e39, green 0%); color: #099e39;');
			specifyAttributeForSelectedField(fields[50], 50, 'background-image: linear-gradient(#099e39, green 0%); color: #099e39;');
			specifyAttributeForSelectedField(fields[42], 42, 'background-image: linear-gradient(#099e39, green 0%); color: #099e39;');
			specifyAttributeForSelectedField(fields[34], 34, 'background-image: linear-gradient(#099e39, green 0%); color: #099e39;');
			specifyAttributeForSelectedField(fields[26], 26, 'background-image: linear-gradient(#099e39, green 0%); color: #099e39;');
			// Tutaj należy wysłać dane do bazy
			
		} else {
			for (let i = 0; i < width*height; i++) {
				specifyAttributeForSelectedField(fields[i], i, '');
			}
			specifyAttributeForSelectedField(fields[errorIndexes[0]], errorIndexes[0], 'background-image: linear-gradient(green, #8c2508 0%); color: #fff;');
			specifyAttributeForSelectedField(fields[errorIndexes[1]], errorIndexes[1], 'background-image: linear-gradient(green, #8c2508 0%); color: #fff;');
			errorIndexes = [];
		}
	}
	
	function fieldEvent(e) {
			// Listener dla pola na planszy sudoku
			for (let j = 0; j < 81; j++) {
				if (addedIndexes.includes(j)) {
					specifyAttributeForSelectedField(fields[j], j, 'color: #143380;');
				} else {
					specifyAttributeForSelectedField(fields[j], j, '');
				}
			}
			var i = e.target.getAttribute('id');
			var x = i % 9;
			var y = Math.floor(i / 9);
			var columnSquare = Math.floor(x / 3);
			var rowSquare = Math.floor(y / 3);
			var selectedSquareFirstIdx = rowSquare * 27 + columnSquare * 3; 
			var selectedRowFirstIdx = y * 9;
			var selectedColumnFirstIdx = x;
			//console.log("i = " + i + " x = " + x + " y = " + y + " row = " + rowSquare + " column = " + columnSquare); 
			for (let j = 0; j < 9; j++) {
				if (addedIndexes.includes(selectedRowFirstIdx+j)) {
					specifyAttributeForSelectedField(fields[selectedRowFirstIdx+j], selectedRowFirstIdx+j, 'filter: brightness(85%); color: #143380;');
				} else {
					specifyAttributeForSelectedField(fields[selectedRowFirstIdx+j], selectedRowFirstIdx+j, 'filter: brightness(85%);');
				}
				if (addedIndexes.includes(selectedColumnFirstIdx+j*9)) {
					specifyAttributeForSelectedField(fields[selectedColumnFirstIdx+j*9], selectedColumnFirstIdx+j*9, 'filter: brightness(85%); color: #143380;'); 
				} else {
					specifyAttributeForSelectedField(fields[selectedColumnFirstIdx+j*9], selectedColumnFirstIdx+j*9, 'filter: brightness(85%);'); 
				}
				if (addedIndexes.includes(selectedSquareFirstIdx+Math.floor(j/3)*9+j%3)) {
					specifyAttributeForSelectedField(fields[selectedSquareFirstIdx+Math.floor(j/3)*9+j%3], selectedSquareFirstIdx+Math.floor(j/3)*9+j%3, 'filter: brightness(85%); color: #143380;');
				} else {
					specifyAttributeForSelectedField(fields[selectedSquareFirstIdx+Math.floor(j/3)*9+j%3], selectedSquareFirstIdx+Math.floor(j/3)*9+j%3, 'filter: brightness(85%);');
				}
			}
			idxHolder = i;	
	}		
	
	function print() {
		var result = '';
		for (let y = 0; y < width; y++) {
			for (let x = 0; x < height; x++) {
				result += (sudoku[y*width+x] + ' '); 
			}
			result += '\n';
		}
		console.log(result);
	}
	
	function specifyAttributeForSelectedField(field, variable, descr) {
		//console.log(variable);
		// Trzecie pola dziewięcioelementowych kwadratów
		if ((variable+1) % 3 == 0 && (variable+1) % 9 != 0) {
			// Pierwsze rzędy dziewięcioelementowych kwadratów
			if ((variable+1) % 27 <= 9 && (variable+1) % 27 > 0 && (variable+1) > 9) {
					field.setAttribute('style', 'margin-right: 5px; margin-top: 5px;' + descr);
			} else {
					if ((variable+1) > 9) {
						field.setAttribute('style', 'margin-right: 5px; margin-top: 2px;' + descr);
					} else {
						field.setAttribute('style', 'margin-right: 5px;' + descr);
					}
			}
		} else if ((variable+1) % 9 == 0) {
			if ((variable+1) % 27 <= 9 && (variable+1) % 27 > 0 && (variable+1) > 9) {
					field.setAttribute('style', 'margin-top: 5px;' + descr);
			} else {
				if (variable+1 != 9) {
					field.setAttribute('style', 'margin-top: 2px;' + descr);
				} else {
					field.setAttribute('style', descr);
				}
			}
		} else { // Pierwsze i drugie pola dziewięcioelementowych kwadratów
			// Pierwsze rzędy dziewięcioelementowych kwadratów
			if ((variable+1) % 27 <= 9 && (variable+1) % 27 > 0 && (variable+1) > 9) {
					field.setAttribute('style', 'margin-right: 2px; margin-top: 5px;' + descr)
			} else {
					if ((variable+1) > 9) {
						field.setAttribute('style', 'margin-right: 2px; margin-top: 2px;' + descr);
					} else {
						field.setAttribute('style', 'margin-right: 2px;' + descr);
					}
			}
		}
	}
	
	function specifyAttributeForSelectedNumber(numberField, temp, descr) {
		// Pierwsze i drugie pole w każdym rzędzie
		if (temp % 3 == 2) {
			// Sprawdzenie czy to jest pierwszy rząd
			if (temp > 3) {
					numberField.setAttribute('style', 'margin-top: 5px; margin-right: 5px;' + descr);
			} else {
					numberField.setAttribute('style', 'margin-right: 5px; margin-top: 5px;' + descr);
			}
		} else if (temp % 3 == 1) {
			if (temp > 3) {
				numberField.setAttribute('style', 'margin-left: 5px; margin-right: 5px; margin-top: 5px;' + descr);
			} else {
				numberField.setAttribute('style', 'margin-left: 5px; margin-right: 5px; margin-top: 5px;' + descr);
			}
		} else {
			// Sprawdzenie czy to jest pierwszy rząd
			numberField.setAttribute('style', 'margin-top: 5px;' + descr);
		}
	}
	
	function createBoard() {
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const field = document.createElement('div');
				temp = y*width+x;
				field.setAttribute('id', temp);
				specifyAttributeForSelectedField(field, temp, '');
				gridContent.appendChild(field);
				fields[temp] = field;
			}
		}
	}
	createBoard();
	
	function prepareNumberGrid() {
		for (let y = 0; y < 3; y++) {
			for (let x = 0; x < 3; x++) {
				temp = y * 3 + x + 1;
				const numberField = document.createElement('div');
				numberField.innerHTML = temp;
				specifyAttributeForSelectedNumber(numberField, temp, '');
				numberField.addEventListener('mouseover', function(e) {
					// Listener dla siatki przycisków po prawej
					for (let i = 0; i < width; i++) {
						specifyAttributeForSelectedNumber(rightPanelNumbers[i], i+1, '');
					}
					var tmp = e.target.innerHTML;
					specifyAttributeForSelectedNumber(rightPanelNumbers[tmp-1], tmp, 'filter: brightness(85%);');
				});
				numberField.addEventListener('mouseout', function(e) {
					// Listener dla siatki przycisków po prawej
					for (let i = 0; i < width; i++) {
						specifyAttributeForSelectedNumber(rightPanelNumbers[i], i+1, '');
					}
				});
				numberField.addEventListener('click', function(e) {
					// Listener dla siatki przycisków po prawej
					for (let i = 0; i < width; i++) {
						specifyAttributeForSelectedNumber(rightPanelNumbers[i], i+1, '');
					}
					var tmp = e.target.innerHTML;
					specifyAttributeForSelectedNumber(rightPanelNumbers[tmp-1], tmp, 'filter: brightness(80%);');
					if (idxHolder != -1) {
						addedIndexes.push(parseInt(idxHolder));
						filledSudoku[parseInt(idxHolder)] = e.target.innerHTML;
						fields[parseInt(idxHolder)].innerHTML = filledSudoku[parseInt(idxHolder)];
						specifyAttributeForSelectedField(fields[parseInt(idxHolder)], parseInt(idxHolder), 'filter: brightness(85%); color: #143380;');
					}
					var isNotEnd = filledSudoku.includes(-1);
					if (!isNotEnd) {
						//console.log("!");
						checkButton.style.visibility = 'visible';
						boardCompleted = true;
					}
				});
				numberGrid.appendChild(numberField);
				rightPanelNumbers[temp-1] = numberField;
			}
		}
	}
	prepareNumberGrid();
	
	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max-min)) + min;
	}		
	
	function changeTwoNumbers() {
		let firstNum = getRandomInt(1, 10);
		let secondNum = getRandomInt(1, 10);
		
		while (firstNum == secondNum) {
			secondNum = getRandomInt(1, 10);
		}
		
		for (let i = 0; i < width*height; i++) {
			if (sudoku[i] == firstNum) { 
				sudoku[i] = secondNum;
			} else if (sudoku[i] == secondNum) {
				sudoku[i] = firstNum;
			}
		}			
	}
	
	function changeRows() {
		let firstNum = getRandomInt(1, 3);
		let secondNum = getRandomInt(1, 3);
		let thirdNum = getRandomInt(1, 3);
		
		while (secondNum == thirdNum) {
			thirdNum = getRandomInt(1, 3);
		}
		
		let firstIdx = (firstNum - 1) * 27 + (secondNum - 1) * 9;
		let secondIdx = (firstNum - 1) * 27 + (thirdNum - 1) * 9;
		for (let idx = 0; idx < 9; idx++) {
			temp = sudoku[firstIdx+idx];
			sudoku[firstIdx+idx] = sudoku[secondIdx+idx];
			sudoku[secondIdx+idx] = temp;
		}
	}
	
	function changeColumns() {
		let firstNum = getRandomInt(1, 3);
		let secondNum = getRandomInt(1, 3);
		let thirdNum = getRandomInt(1, 3);
		
		while (secondNum == thirdNum) {
			thirdNum = getRandomInt(1, 3);
		}
		
		let firstIdx = (firstNum - 1) * 3 + secondNum - 1;
		let secondIdx = (firstNum - 1) * 3 + thirdNum - 1;
		
		for (let idx = 0; idx < 81; idx += 9) {
			temp = sudoku[firstIdx+idx];
			sudoku[firstIdx+idx] = sudoku[secondIdx+idx];
			sudoku[secondIdx+idx] = temp;
		}
	}
	
	function generateBoard() {
		let iter = 0;
		for (let i = 0; i < 9; i++) {
			sudoku[i] = i+1;
			if (i+12 < 18) {
				sudoku[i+12] = i+1;
			} else {
				sudoku[i+12-9] = i+1;
			}
			if (i+24 < 27) {
				sudoku[i+24] = i+1;
			} else {
				sudoku[i+24-9] = i+1;
			}
			if (i+28 < 36) {
				sudoku[i+28] = i+1;
			} else {
				sudoku[i+28-9] = i+1;
			}
			if (i+40 < 45) {
				sudoku[i+40] = i+1;
			} else {
				sudoku[i+40-9] = i+1;
			}
			if (i+52 < 54) {
				sudoku[i+52] = i+1;
			} else {
				sudoku[i+52-9] = i+1;
			}
			if (i+56 < 63) {
				sudoku[i+56] = i+1;
			} else {
				sudoku[i+56-9] = i+1;
			}
			if (i+68 < 72) {
				sudoku[i+68] = i+1;
			} else {
				sudoku[i+68-9] = i+1;
			}
			if (i+80 < 81) {
				sudoku[i+80] = i+1;
			} else {
				sudoku[i+80-9] = i+1;
			}
		}
		
		while (iter < 50) {
			temp = getRandomInt(1, 6);
			if (temp == 1) {
				changeColumns();
				changeTwoNumbers();
			} else if (temp == 2) {
				changeRows();
				changeColumns();
			} else {
				changeTwoNumbers();
				changeColumns();
				changeRows();
			}
			iter++;
		}
		iter = 0;
		for (let i = 0; i < width*height; i++) {
			if (Math.random() < 0.5 && iter < 40) {
				fields[i].innerHTML = sudoku[i];
				filledSudoku[i] = sudoku[i];
				iter++;
			} else {
				filledSudoku[i] = -1;
				specifyAttributeForSelectedField(fields[i], i, '');
				fields[i].addEventListener('click', fieldEvent);
			}
		}
		startTimer();
		print();
	}
	generateBoard();
	
	// Włączenie czasomierza
	function startTimer() {
		measureTime = true;
		refreshTimer();
		startButton.style.visibility = 'hidden';
		stopButton.style.visibility = 'visible';
		if (boardCompleted) checkButton.style.visibility = 'visible';
		initialize();
	}
	
	// Działanie czasomierza
	function refreshTimer() {
		if (measureTime) {
			time.innerHTML = '';
			clock++;
			if (clock < 60) {
				if (clock < 10) {
					time.innerHTML = 'Czas: 0:0' + clock;
				} else {
					time.innerHTML = 'Czas: 0:' + clock;
				}
			} else {
				var minutes = Math.floor(clock / 60);
				var seconds = clock % 60;

				if (seconds < 10) {
					time.innerHTML = 'Czas: ' + minutes + ':0' + seconds;
				} else {
					time.innerHTML = 'Czas: ' + minutes + ':' + seconds;
				}
			}
			timeoutHolder = setTimeout(refreshTimer, 1000);
		}
	}

	// Wyłączenie czasomierza
	function stopTimer() {
		measureTime = false;
		for (let i = 0; i < width*height; i++) {
			fields[i].innerHTML = '';
			fields[i].removeEventListener('click', fieldEvent, false);
			specifyAttributeForSelectedField(fields[i], i, '');
		}
		idxHolder = -1;
		stopButton.style.visibility = 'hidden';
		checkButton.style.visibility = 'hidden';
		startButton.style.visibility = 'visible';
	}
	
});
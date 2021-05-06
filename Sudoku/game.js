document.addEventListener('DOMContentLoaded', () => {
	// Zmienne z html
	const gridContent = document.getElementById('gridContent');
	const numberGrid = document.getElementById('numberGrid');
	const time = document.getElementById('time');
	const stopButton = document.getElementById('stopTime');
	const startButton = document.getElementById('startTime');
	const checkButton = document.getElementById('checkButton');
	const playAgainButton = document.getElementById('playAgainButton');
	// Wymiary planszy
	const width = 9;
	const height = 9;
	// Tablica zawierająca pola z planszy sudoku
	var fields = Array(width*height);
	// Tablica zawierająca pola z prawego panelu
	var rightPanelNumbers = Array(width);
	// Tablica zawierająca cyfry na planszy sudoku
	var sudoku = Array(width*height);
	// Tablica zawierająca informacje o aktualnie wypełnionych polach na planszy
	var filledSudoku = Array(81);
	// Tablica zawierająca informacje o indeksach wybieranych przez użytkownika
	var addedIndexes = [];
	// Tablica zawierająca informacje o indeksach w których znajdują się błędy
	var errorIndexes = [];
	// Zmienna przechowująca indeks aktualnie wybranego pola z planszy sudoku
	var idxHolder = -1;
	// Zmienna służąca do przechowywania informacji o timeout
	var timeoutHolder;
	// Flaga do sprawdzania czy plansza jest uzupełniona (pomaga obsługiwać widoczność przycisków)
	var boardCompleted = false;
	// Flaga przechowująca informacje czy mierzony jest czas
	var measureTime = false;
	// Zmienna trzymająca ilość sekund od rozpoczęcia gry
	var clock = 0;
	// Zmienna pomocnicza
	var temp = -1;
	
	// Przypisanie funkcji do guziczków i inicjalizacja czasu
	time.innerHTML = 'Czas: 00:00';
	stopButton.onclick = stopTimer;
	startButton.onclick = startTimer;
	checkButton.onclick = checkFields;
	playAgainButton.onclick = refresh;
	
	// Funkcja przywracająca stan planszy sprzed zatrzymania czasu
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
	
	// Funkcja obsługująca przycisk 'Zagraj ponownie'
	function refresh() {
		boardCompleted = false;
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
		checkButton.style.visibility = 'hidden';
		clearTimeout(timeoutHolder);
		createBoard();
		generateBoard();
	}
	
	// Funkcja sprawdzająca czy nie powtarza się cyfra w rzędzie
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
	
	// Funkcja sprawdzająca czy nie powtarza się cyfra w kolumnie
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
	
	// Funkcja sprawdzająca czy nie powtarza się cyfra w dziewięcioelementowym kwadracie
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
	
	// Funkcja sprawdzająca czy to koniec gry. Jeżeli tak to niespodzianka, jeżeli nie to podkreśla pierwszy napotkany błąd
	function checkFields() {
		if (checkRows() && checkColumns() && checkSquares()) {
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
			startButton.style.visibility = 'hidden';
			
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
	
	// Funkcja zaznaczająca pola od których zależy aktualnie wybrane przez użytkownika pole (ciemniejsza teksturka po kliknięciu w pole sudoku)
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
	
	// Funkcja z dedykacją dla Natalii :) Zakomentuj lub usuń jak skończysz testy bazy
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
	
	// Funkcja umożliwiająca modyfikację kratki na planszy sudoku
	function specifyAttributeForSelectedField(field, variable, descr) {
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
	
	// Funkcja ułatwiająca modyfikację pojedyńczej kratki w prawym panelu
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
	
	// Funkcja tworząca widok planszy gry sudoku
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
	
	// Funkcja przygotowująca (modelująca) prawy panel z cyframi
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
	
	// Funkcja do zwracania losowej liczby całkowitej
	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max-min)) + min;
	}		
	
	// Funkcja zamieniająca miejscami wszystkie występienia wylosowanej pary liczb
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
	
	// Funkcja zamieniająca pojedyńcze rzędy w dziewięcioelementowych kwadratach
	function changeRows() {
		let firstNum = getRandomInt(1, 4);
		let secondNum = getRandomInt(1, 4);
		let thirdNum = getRandomInt(1, 4);
		
		while (secondNum == thirdNum) {
			thirdNum = getRandomInt(1, 4);
		}
		
		let firstIdx = (firstNum - 1) * 27 + (secondNum - 1) * 9;
		let secondIdx = (firstNum - 1) * 27 + (thirdNum - 1) * 9;
		for (let idx = 0; idx < 9; idx++) {
			temp = sudoku[firstIdx+idx];
			sudoku[firstIdx+idx] = sudoku[secondIdx+idx];
			sudoku[secondIdx+idx] = temp;
		}
	}
	
	// Funkcja zamieniająca rzędzy dziewięcioelementowych kwadratów
	function changeBiggerRows() {
		let firstNum = getRandomInt(1, 4);
		let secondNum = getRandomInt(1, 4);
		
		while (firstNum == secondNum) {
			secondNum = getRandomInt(1, 4);
		}
		
		let firstIdx = (firstNum - 1) * 27;
		let secondIdx = (secondNum - 1) * 27;
		
		for (let idx = 0; idx < width*3; idx++) {
			temp = sudoku[firstIdx+idx];
			sudoku[firstIdx+idx] = sudoku[secondIdx+idx];
			sudoku[secondIdx+idx] = temp;
		}
	}
	
	// Funkcja zamieniająca pojedyńcze kolumny w obrębie jednego dziewięcioelementowego kwadratu
	function changeColumns() {
		let firstNum = getRandomInt(1, 4);
		let secondNum = getRandomInt(1, 4);
		let thirdNum = getRandomInt(1, 4);
		
		while (secondNum == thirdNum) {
			thirdNum = getRandomInt(1, 4);
		}
		
		let firstIdx = (firstNum - 1) * 3 + secondNum - 1;
		let secondIdx = (firstNum - 1) * 3 + thirdNum - 1;
		
		for (let idx = 0; idx < 81; idx += 9) {
			temp = sudoku[firstIdx+idx];
			sudoku[firstIdx+idx] = sudoku[secondIdx+idx];
			sudoku[secondIdx+idx] = temp;
		}
	}
	
	// Funkcja zamieniająca ze sobą kolumny dziewięcioelementowych kwadratów
	function changeBiggerColumns() {
		let firstNum = getRandomInt(1, 4);
		let secondNum = getRandomInt(1, 4);
		
		while (firstNum == secondNum) {
			secondNum = getRandomInt(1, 4);
		}
		
		let firstIdx = (firstNum - 1) * 3;
		let secondIdx = (secondNum - 1) * 3;
			
		for (let i = 0; i < 3; i++) {
			for (let idx = 0; idx < width*height; idx+=9) {
				temp = sudoku[firstIdx+idx+i];
				sudoku[firstIdx+idx+i] = sudoku[secondIdx+idx+i];
				sudoku[secondIdx+idx+i] = temp;
			}
		}
	}
	
	// Funkcja tworząca planszę sudoku
	function generateBoard() {
		let iter = 0;
		// Utworzenie wyjściowej planszy sudoku, która zostanie poddana modyfikacją
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
		
		// Modyfikacje planszy sudoku
		while (iter < 50) {
			temp = getRandomInt(1, 6);
			if (temp == 1) {
				changeColumns();
			} else if (temp == 2) {
				changeRows();
			} else if (temp == 3) {
				changeBiggerRows();
			} else if (temp == 4) {
				changeBiggerColumns();
			} else {
				changeTwoNumbers();
			}
			iter++;
		}
		
		// Inicjalizacja tablicy filledSudoku
		for (let i = 0; i < width*height; i++) {
			filledSudoku[i] = -1;
		}
		
		// Odsłonięcie połowy losowo wybranych pól
		iter = 0;
		while (iter < 40) {
			temp = getRandomInt(1, 82);
			if (filledSudoku[temp] == -1) {
				fields[temp].innerHTML = sudoku[temp];
				filledSudoku[temp] = sudoku[temp];
				iter++;
			}
		}
		// Czas rusza zaraz po uruchomieniu gry
		startTimer();
		// Wypisanie wartości
		print();
	}
	generateBoard();
	
	// Włączenie czasomierza
	function startTimer() {
		measureTime = true;
		refreshTimer();
		// Zarządzanie widocznością przycisków
		startButton.style.visibility = 'hidden';
		stopButton.style.visibility = 'visible';
		if (boardCompleted) checkButton.style.visibility = 'visible';
		// Przywrócenie stanu planszy sprzed zatrzymania czasu
		initialize();
	}
	
	// Działanie czasomierza
	function refreshTimer() {
		if (measureTime) {
			// Modyfikacja napisu czasowego
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
			// Przypisanie timeout'a do zmiennej globalnej pozwala go zutylizować przed kolejną rozgrywką
			timeoutHolder = setTimeout(refreshTimer, 1000);
		}
	}

	// Wyłączenie czasomierza
	function stopTimer() {
		measureTime = false;
		// "Zakrycie" wszystkich pól, żeby gracz nie mógł planować kolejnych ruchów
		for (let i = 0; i < width*height; i++) {
			fields[i].innerHTML = '';
			// Usunięcie event listenera
			fields[i].removeEventListener('click', fieldEvent, false);
			specifyAttributeForSelectedField(fields[i], i, '');
		}
		// Wybór liczby z prawego panelu nie spowoduje modyfikacji wcześniej zaznaczonego pola
		idxHolder = -1;
		// Zarządzanie widocznością przycisków
		stopButton.style.visibility = 'hidden';
		checkButton.style.visibility = 'hidden';
		startButton.style.visibility = 'visible';
	}
	
});
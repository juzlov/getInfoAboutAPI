// объект в который записываются "грязные" данные из json
let eventBlocks = [];

function getDataFromJSON() {
  return fetch('./metadata2.json')
  .then((res) => res.json())
  .then((result) => result)
}

getDataFromJSON()
.then((result) => {
  if (result) {
    eventBlocks = result.apiSignatureToEvents;
    getNewArray();
  }
})


// объект в который записываются обработанные данные из json
let newData = [];

class SignToEvent {
  constructor (sign, event, shortName, trueIndex) {
    this.sign = sign;
    this.event = event;
    this.shortName = shortName;
    this.trueIndex = trueIndex;
  }
}

// преобразование входящих данных в более удобных массив с подписями разделенными точками, короткого имени
function getNewArray() {

  for (let i = 0; i<eventBlocks.length; i++) {
    
    let versionEvents = eventBlocks[i].events;
    let versionSignature = '';

    let type = eventBlocks[i].signature[0];
    let name = eventBlocks[i].signature[1];
    let descriptor = '';

    let shortName = '';

    function splitString(stringToSplit, separator) {
      const arrayOfStrings = stringToSplit.split(separator);

      shortName = arrayOfStrings[arrayOfStrings.length-1];
    }
    
    const slash = '/';
    
    splitString(name, slash);

    if (eventBlocks[i].signature[2]) {
      descriptor = eventBlocks[i].signature[2];
    }

    if (eventBlocks[i].signature[3]) {
      descriptor = descriptor + eventBlocks[i].signature[3];
    }

    if (eventBlocks[i].signature[4]) {
      descriptor = descriptor + eventBlocks[i].signature[4];
    }

    if (descriptor === '') {
      versionSignature = type + '.' + name;
    } else {
      versionSignature = type + '.' + name + '.' + descriptor;
    }
    
    newData[i] = new SignToEvent(versionSignature, versionEvents, shortName, i);
  }
}

// функция получения короткого имени для полного названия API
let shortName = '';

function getShortName(name) {

  function splitString(stringToSplit, separator) {
    const arrayOfStrings = stringToSplit.split(separator);
    return arrayOfStrings[arrayOfStrings.length-1];
  }

  shortName = splitString(name, '/');
}


// расшифровка значение события, вывод версии
function eventDecriptor(events, name, versionForSearch) {
  getShortName(name);
  name = shortName;

  for (let i = 0; i<events.length; i++) {
    const responseTable = document.querySelector('.response-table');
    const responseField = document.createElement('p');
    responseField.classList.add('response');

    if (events[i].startsWith('+')) {
      if (versionForSearch === undefined) {
        responseField.textContent = name + ' Added in version ' + events[i].slice(3);
        responseTable.appendChild(responseField);
      } 
      else if (events[i].slice(3) === versionForSearch) {
        responseField.textContent = name + ' Added in version ' + events[i].slice(3);
        responseTable.appendChild(responseField);
      }
    }

    if (events[i].startsWith('-')) {
      if (versionForSearch === undefined) {
        responseField.textContent = name + ' Deleted in version ' + events[i].slice(3);
        responseTable.appendChild(responseField);
      } 
      else if (events[i].slice(3) === versionForSearch) {
        responseField.textContent = name + ' Deleted in version ' + events[i].slice(3);
        responseTable.appendChild(responseField);
      }
    }

    if (events[i].startsWith('D:0')) {
      if (versionForSearch === undefined) {
        responseField.textContent = name + ' became Depreciated in version ' + events[i].slice(5);
        responseTable.appendChild(responseField);
      } 
      else if (events[i].slice(5) === versionForSearch) {
        responseField.textContent = name + ' became Depreciated in version ' + events[i].slice(5);
        responseTable.appendChild(responseField);
      }
    }

    if (events[i].startsWith('D:1')) {
      if (versionForSearch === undefined) {
        responseField.textContent = name + ' became Depreciated for removal in version ' + events[i].slice(9);
        responseTable.appendChild(responseField);
      } 
      else if (events[i].slice(9) === versionForSearch) {
        responseField.textContent = name + ' became Depreciated for removal in version ' + events[i].slice(9);
        responseTable.appendChild(responseField);
      } 
    }

    if (events[i].startsWith('ND')) {
      if (versionForSearch === undefined) {
        responseField.textContent = name + ' stopped being Depreciated in version ' + events[i].slice(4);
        responseTable.appendChild(responseField);
      } 
      else if (events[i].slice(4) === versionForSearch) {
        responseField.textContent = name + ' stopped being Depreciated in version ' + events[i].slice(4);
        responseTable.appendChild(responseField);
      }
    }
  }
}

// функция вывода доступных методов API в конкретной версии
function eventShortDecriptor (name, version) {
  const responseTable = document.querySelector('.response-table');
  const responseField = document.createElement('p');
  responseField.classList.add('response');

  responseField.textContent = name + ' available in version ' + version;
  responseTable.appendChild(responseField);
}


// функция поиска по имени API
function searchByEventName(name) {
  const responseTable = document.querySelector('.response-table');
  responseTable.innerHTML = '';

  for (let i = 0; i<eventBlocks.length; i++) {
    if (name == newData[i].shortName) {
      eventDecriptor(newData[i].event, name);
    }
  }
} 


// функция поиска списка изменений в конкретной версии
function searchByVersion(version) {
  const responseTable = document.querySelector('.response-table');
  responseTable.innerHTML = '';
  
  for (let i = 0; i<eventBlocks.length; i++) {
    let vers = '';
    let indexOfCorrectVesrion = i;
    const colon = ':';

    function splitString(stringToSplit, separator) {
      let strings = [];

      for (let i = 0; i < stringToSplit.length; i++) {
        strings.push(stringToSplit[i].split(separator)[2]);
      }

      vers = strings;
    }
   
    splitString(eventBlocks[i].events, colon);

    for (let i = 0; i < vers.length; i++) {
      if (vers[i] === version) {
        eventDecriptor(eventBlocks[indexOfCorrectVesrion].events, eventBlocks[indexOfCorrectVesrion].signature[1], vers[i]);
      }
    }   
  }
} 


// функция сокращения значения версии(без названия продукта)
function shortVersion(version) {
  let index = version.lastIndexOf('-');
    if (index > 0) {
        return version.substring(index + 1)
    }
    return version
}


// функция сравнения двух версий(выдает 1, 0 или -1)
function compareVersions(firstVersion, secondVersion) {
  if (firstVersion === secondVersion) {
    return 0;
  }

  const firstVersionComponents = firstVersion.split(".");
  const secondVersionComponents = secondVersion.split(".");

  const minLength = Math.min(firstVersionComponents.length, secondVersionComponents.length);

  // loop while the components are equal
  for (var i = 0; i < minLength; i++) {
      // First bigger than second
      if (parseInt(firstVersionComponents[i]) > parseInt(secondVersionComponents[i])) {
          return 1;
      }

      // Second bigger than first
      if (parseInt(firstVersionComponents[i]) < parseInt(secondVersionComponents[i])) {
          return -1;
      }
  }

  // If one a prefix of the other, the longer one is greater.
  if (firstVersionComponents.length > secondVersionComponents.length) {
      return 1;
  }

  if (firstVersionComponents.length < secondVersionComponents.length) {
      return -1;
  }

  // Otherwise they are the same.
  return 0;
}



// функция поиска по любой версии

let responeObject = [];

function ResponseEvent(events, trueIndex) {
  this.events = events;
  this.trueIndex = trueIndex;
}


function searchByAnyVersion(version) {

  const responseTable = document.querySelector('.response-table');
  responseTable.innerHTML = '';

  responeObject = [];

  const shortVers = shortVersion(version);

  let finalObject = [];

  // получение объекта finalObject с изменениями в других версиях
  for (let i=0; i<newData.length; i++) {
    
    // если кол-во эвентов меньше одного, то сначала проверяем такие методы
    if (newData[i].event.length === 1) {
      
      // проверка если версия, с которой сравниваем, более старая или такая же
      if (compareVersions(shortVers, shortVersion(newData[i].event[0])) === 1 || compareVersions(shortVers, shortVersion(newData[i].event[0])) === 0) {
        
        //если начинается с + то добавляем в выходной объект
        if (newData[i].event[0].startsWith('+')) {
          finalObject.push(newData[i]);
        } 
        
        //если начинается с - то пропускаем. Уберу эту часть после того, как разберемся с D0, D1, ND, NE
        else if (newData[i].event[0].startsWith('-')) {

        }
        
        // тут будет проверка на другие условия, типа на D0, D1, ND, NE
        else {
          console.log('1 event, older or equal version with other condition', newData[i], newData[i].event[0].startsWith('+'));
        }
      }
      
      // проверка если версия, с которой сравниваем, более новая
      else if (compareVersions(shortVers, shortVersion(newData[i].event[0])) === -1){
        
        //если начинается с - то добавляем в выходной объект, т.к. метод работает с первой версии
        if (newData[i].event[0].startsWith('-')) {
          finalObject.push(newData[i]);
        } 
        
        //если начинается с + то пропускаем. Уберу эту часть после того, как разберемся с D0, D1, ND, NE
        else if (newData[i].event[0].startsWith('+')) {
          
        }
        // тут будет проверка на другие условия, типа на D0, D1, ND, NE
        else {
          console.log('1 event, newer version with other condition', newData[i]);
        }
      } 
    } 

    // если кол-во эвентов больше одного, то проверяем такие методы
    else {
      
      // для каждого эвента внутри объекта сравниваем версии с искомой
      newData[i].event.forEach(function(item) {

        // проверка если версия, с которой сравниваем, более старая или такая же
        if (compareVersions(shortVers, shortVersion(item)) === 1 || compareVersions(shortVers, shortVersion(item)) === 0) {

          // если начинается с + то добавляем в выходной объект
          if (item.startsWith('+')) {
            finalObject.push(newData[i]);
          } 
          
          // однако, если начинается с - то удаляем этот метод из готового объекта(сравнение по Trueindex который записывается при начальном парсе json). Возможно будет проблема в будущем, надо тестировать.
          else if (item.startsWith('-')) {
            for (let index = 0; index < finalObject.length; index++) {
              if (newData[i].event === finalObject[index].event) {
                finalObject.splice(index, 1);
              }
            }
          }
          
          // дальнейшая проверка вызывает вопросы, нужна помощь
          else {
            console.log('more than 1 event, version is older with other condition', newData[i]);
          }
        }
        
        // дальнейшая проверка вызывает вопросы, нужна помощь
        else {
          console.log('more than 1 event, version newer', newData[i]);
        }
      })
    }
  }

  // каждый объект отправляем на отрисовку
  finalObject.forEach(function(item) {
    eventShortDecriptor(item.shortName, shortVers)
  })
  console.log(finalObject);
} 


// вызов поиска изменений в конкретной версии
function showVersionChanges() {
  searchByVersion(document.querySelector('#search-version-changes').value);
}

const buttonChanges = document.querySelector('.button_version-changes');
buttonChanges.addEventListener('click', showVersionChanges);


// вызов поиска доступных API в этой версии
function showAvailableApis() {
  searchByAnyVersion(document.querySelector('#search-version-apis').value);
}

const buttonApis = document.querySelector('.button_search-version-apis');
buttonApis.addEventListener('click', showAvailableApis);


// вызов поиска по имени API
function searchByApiName() {
  searchByEventName(document.querySelector('#search-api').value);
}

const buttonApiName = document.querySelector('.button_search-api');
buttonApiName.addEventListener('click', searchByApiName);

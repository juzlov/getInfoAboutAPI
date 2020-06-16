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
  }
})


// объект в который записываются обработанные данные из json
let newData = [];

function SignToEvent(sign, event, shortName) {
  this.sign = sign;
  this.event = event;
  this.shortName = shortName;
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
    
    let eventSign = new SignToEvent(versionSignature, versionEvents, shortName);
    
    newData[i] = eventSign;
  }
}

// функция получения короткого имени для полного названия API
let shortName = '';

function getShortName(name) {
  
  function splitString(stringToSplit, separator) {
    const arrayOfStrings = stringToSplit.split(separator);
    shortName = arrayOfStrings[arrayOfStrings.length-1];
  }

  const slash = '/';
  
  splitString(name, slash);
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


// функция поиска по имени API
function searchByEventName(name) {
  getNewArray();
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
  let strings = [];
  let separator = '-';
 
  strings.push(version.split(separator))

  if (strings[0].length === 2) {
    return strings[0][1];
  } else {
    return strings[0][2];
  }
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
  getNewArray();
  const responseTable = document.querySelector('.response-table');
  responseTable.innerHTML = '';

  responeObject = [];

  const shortVers = shortVersion(version);
  compareVersions(shortVers, '193.2956.37');

  let ver = '';

  // получение объекта responseObject с изменениями в более старых версиях
  for (let i=0; i<newData.length; i++) {
    newData[i].event.forEach(function(item) {
      ver = shortVersion(item);

      if (compareVersions(shortVers, ver) === 1 || compareVersions(shortVers, ver) === 0) {
        let newEvent = new ResponseEvent(ver, i);
        responeObject.push(newEvent);
      } 

    });
  }

  // получили объект responseObject, в нем записаны events с более старыми версиями и индекс события из главного объекта. В дальнешем можно используя этот индекс достать информацию о нужных нам эвентах.
  console.log(responeObject);
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

// to get language request like this
// let locale = $.cookie('language');

const set_keyboard_language = function (locale) {
  if (locale === 'fr') {
    console.log('Yes French, ' + locale);
    $('.spanish').hide();
    $('.french').show();
  } else if (locale === 'es') {
    console.log('Yes Spanish, ' + locale);
    $('.french').hide();
    $('.spanish').show();
  } else {
    console.log('Yes English, ' + locale);
  }
  
};
if ($.cookie('language')) {
  set_keyboard_language($.cookie('language'));
} else {
  $.cookie('language', 'en', {path: '/'});
  set_keyboard_language('en');
}

// Key events add as we go
let KEY = {
  ENTER: 13,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40
};

class KeyboardTabs {
  up(i) {
    // Im in the first row
    if (i < this.elementPerRow) {
      return; // cant spend time on this for now
    }
    if (i >= this.space) {
      switch (i) {
        case this.space:
          return this.lastRowMap[4];
          break;
        case this.back:
          return this.lastRowMap[6];
          break;
        case this.search:
          return this.lastRowMap[9];
        default:
          console.log('Index ', i, ' is not valid');
          return this.space; //shouldn't happen
          break;
      }
    }
    return i - this.elementPerRow;
  }
  down(i){
    if (i <= this.tabs - (this.elementPerRow + 3)) {
      return i + this.elementPerRow;
    }
    // if it is any item in the last row has to go down to menu buttons
    else if (i > this.tabs - (this.elementPerRow + 3) && i < this.space) {
      // item that should move to space
      if(this.lastRowMap.indexOf(i) >= 8){
        return this.search;
      } else if (this.lastRowMap.indexOf(i) > 5) {
        return this.back;
      }
      else {
        return this.space;
      }
    } else { // moving down from menu
      // lets look if there is anything after my container
      if ($(`[tabindex="${this.tabs + 1}"]`) !== null) {
        return this.tabs + 1;
      }
    }
    return;
  }
  constructor(totalTabs, elementsPerRow = 13) {
    this.tabs = totalTabs;
    this.elementPerRow = elementsPerRow;
    this.rows = Math.ceil((this.tabs - 3) / this.elementPerRow);
    this.search = $('#search-button')[0].tabIndex;
    this.back = $('#backspace')[0].tabIndex;
    this.space = $('#space')[0].tabIndex;
    this.symbol = $('#symbols')[0].tabIndex;
    this.upper = $('#uppercase')[0].tabIndex;
    this.lower = $('#lowercase')[0].tabIndex;

    // dynamic compute last row for nav purpose
    this.lastRowMap = [];
    // 4 elements should go to space, 4 to backspace and 5 search
    if (this.tabs > 1) {
      let lastRowElIndex = (this.rows - 1) * this.elementPerRow;
      // loop through the last row until you have no more then go back to the
      // prev row and start looping from the beginning till you reach
      // max el per row collecting ids
      while (lastRowElIndex <= this.symbol &&
      this.lastRowMap.length < this.elementPerRow) {
        this.lastRowMap.push(lastRowElIndex);
        lastRowElIndex++;
      }
      if (this.lastRowMap.length < this.elementPerRow) {
        let secondToLastRowIndex = this.tabs - (this.elementPerRow + 2);
        while (this.lastRowMap.length < this.elementPerRow) {
          this.lastRowMap.push(secondToLastRowIndex);
          secondToLastRowIndex++;
        }
      }
    }
  }
}

function findLastElement(elem) {
  if (elem === null) {
    return 0;
  }
  if (elem.lastElementChild !== null && elem.lastElementChild.children.length > 1) {
    return findLastElement(elem.lastElementChild.lastElementChild);
  }
  else {
    return elem.tabIndex || 0;
  }
}

/*
 it would need a parent container to be initialized
 The first navigational element in the page
 it needs to keep an structure that allows for navigation

 div parentElement
  div containerClass
  div containerClass
    div childContainer
    div childContainer
    div childContainer
  div containerClass
*/
class KeyboardNav {
  events = [];
  containerClassName = '';
  parentElement = {};
  target = {};
  elementsContained = '';

  left() {
    let current = document.activeElement;
    let prev = current.previousElementSibling;
    if (prev === null) {
      prev = current.parentElement.previousElementSibling;
      if (prev === null) {
        return; // no more elements
      }
    }
    if (prev.children !== null && prev.children.length > 1) {
      prev = prev.lastElementChild;
    }
    if (prev.tabIndex >= 0) {
      $(`[tabindex="${prev.tabIndex}"]`).focus();
    }
  }
  right() {
    let current = document.activeElement;
    let next = current.nextElementSibling;
    if (next === null) {
      next = current.parentElement.nextElementSibling;
      if (next === null) {
        return; // no more elements
      }
    }
    if (next.children !== null && next.children.length > 1) {
      next = next.firstElementChild;
    }
    if (next.tabIndex !== null) {
      $(`[tabindex="${next.tabIndex}"]`).focus();
    }
  }

  // up and down will have to be setup by user
  up() {
    let current = document.activeElement;
    let tabindex = this.target.up(current.tabIndex);
    $(`[tabindex="${tabindex}"]`).focus();
  }
  down() {
    let current = document.activeElement;
    let tabindex = this.target.down(current.tabIndex);
    $(`[tabindex="${tabindex}"]`).focus();
  }

  handler(event) {
    if (this.events[event.keyCode]) {
      this.events[event.keyCode]();
    }
  }

  constructor(containerClassName, elementContainedClassName) {
    this.setParentContainer(containerClassName);
    this.setElementsContained(elementContainedClassName);

    // Initializing the events for the element/s
    if (Array.isArray(elementContainedClassName)) {
      elementContainedClassName.forEach(elem => {
        $(`.${elem}`).keyup((e) => {
          this.handler(e);
        });
      });
    } else {
      $(`.${this.containerClassName}`).keyup((e) => {
        this.handler(e);
      });
    }
    // adding default behavior (can be change by replacing events)
    this.addEvent(KEY.LEFT, () => this.left());
    this.addEvent(KEY.RIGHT, () => this.right());
    this.addEvent(KEY.UP, () => this.up());
    this.addEvent(KEY.DOWN, () => this.down());
  }
  setParentContainer(className) {
    this.containerClassName = className;
    // check if the element is available
    try {
      this.parentElement =
          document.getElementsByClassName(this.containerClassName);
      if (this.parentElement[0] === undefined) {
        throw new Error("class: " + className + " not available");
      }
      this.target = new KeyboardTabs(findLastElement(this.parentElement[0]));
    }
    catch (e) {
      console.log(e);
    }
  }
  setElementsContained(classNames) {
    this.elementsContained = classNames;
  }
  addEvent(eventCode, action) {
    if(eventCode&& action) {
      this.events[eventCode] = action;
    }
  }
}


// TODO: Implement this later

// class PageNavigation {
//   navChilden = [];
//   setMainContainer(className) {
//     this.mainContainer = `.${className}`;
//   }
//   constructor(containerClass, elementsContained){
//     this.setMainContainer(containerClass);
//     elementsContained.forEach(elem => {
//       this.navChilden.push(new KeyboardNav())
//     })
//   }
//
//   // they keyEvent up and down have to check if they are at the first or last
//   // element to jump to prev or next element
// }

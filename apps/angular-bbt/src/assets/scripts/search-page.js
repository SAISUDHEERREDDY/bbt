// lenguages supported (add more to the object to support more)
let lenguage = {
    en: [],
    fr: [
        'é',
        'è',
        'ç',
        'à',
        'ë',
        'ê'
    ],
    es: [
        'á',
        'é',
        'í',
        'ñ',
        'ó',
        'ú',
        'ü',
        '¿',
        '¡'
    ]
};

let keyboardNav;   // navigation for videos
let searchNav; // navigation for keyboard

let locale = $.cookie('language'); // current language


// Builds the div with the space, backspace and search buttons
function buildMenu(html) {
    html.innerHtml += `<div class="keyboard-options-container symbol-selector">
                <div id="lowercase" 
                    tabindex="${html.tab++}" 
                    onclick="buildKeyboard('#lowercase')" class="option-lowercase">
                    abc
                </div>
                <div id="uppercase" tabindex="${html.tab++}" 
                onclick="buildKeyboard('#uppercase')" 
                class="option-uppercase">ABC</div>
                <div id="symbols" tabindex="${html.tab++}" class="option-symbols">#+-</div>
            </div>
            <div class="keyboard-movement symbol-selector">
                <div class="button space" tabindex="${html.tab++}" id="space" data-i18n="space">space</div>
                <div class="button backspace" tabindex="${html.tab++}" id="backspace" data-i18n="backspace">backspace</div>
                <div class="button search-button" tabindex="${html.tab++}" id="search-button" data-i18n="search">search</div>
            </div>`;
}

function playVideo(obj, path) {
    var videoSrc = $(obj).attr('id');
    if (videoSrc != "missing") {
        //$.cookie('currentfolder', rootfldr.name);
        $.cookie('currentvideo', videoSrc);
        if (path === undefined)
            path = "category[1]";

        if (window.location.host == "127.0.0.1") {
            alert("EPG host: " + window.location.host + ", videoSrc=" + videoSrc);
            qml.qmlLog("src="+videoSrc+",content_id=0,name=" + $(obj).find('.thumbDescName').text());
            qml.qmlPlay(videoSrc, "video", $(obj).find('.thumbDescName').text(), 0);
        } else {
            alert("EPG host: " + window.location.host + ", videoSrc=" + videoSrc);
            //window.location.href = "PlayVideo.html?path=" + path;
            //alert("BBT host: " + window.location.host + ", name=" + $(obj).find('.thumbDescName').text());
            window.open("PlayVideo.html?path=" + path);
        }
    }
}

// builds the numbers in the keyboard
function buildNumbers(html) {
    let i = 1;
    while(i <= 9) {
        html.innerHtml +=
            `<div class="letter" tabindex="${html.tab++}">${i}</div>`;
        i++;
    }
    html.innerHtml +=
        `<div class="letter" tabindex="${html.tab++}">0</div>`;
}

// builds the symbols in the keyboard
function buildSymbolds(html) {
    let symbols = [
        '~',
        '!',
        '@',
        '#',
        '$',
        '%',
        '^',
        '&amp;',
        '*',
        '(',
        ')',
        '_',
        '+'
    ];
    for(let i = 0; i < symbols.length; i++) {
        html.innerHtml +=
            `<div class="symbol" tabindex="${html.tab++}">${symbols[i]}</div>`;
    }
}

// Builds the keyboard. Uses language object to determine what letter 2 add
function buildLetters(html, mode) {
    for(let i = 1; i < 27; i++) {
        let char = String.fromCharCode(i + 96);
        char = mode === '#uppercase'? char.toUpperCase() : char;
        html.innerHtml +=
            `<div class="letter" tabindex="${html.tab++}">${char}</div>`;
    }
    for(let i = 0; i < lenguage[locale].length; i++) {
        let char = lenguage[locale][i];
        char = mode === '#uppercase'? char.toUpperCase() : char;
        html.innerHtml +=
            `<div class="letter" tabindex="${html.tab++}">${char}</div>`;
    }
}

// changes the class when one of the sub menus is selected
function swapcase(itemSelected) {
    //find already selected and remove class
    $('.keyboard-options-container')
        .find('.option-selected')
        .removeClass('option-selected');

    $(itemSelected).addClass('option-selected');
};

// create the type of keyboard where itemSel is lowercase uppercase
function buildKeyboard(itemSel) {
    let html = {
        tab: 0,
        innerHtml: ''
    };

    if (itemSel !== '#symbols') {
        buildLetters(html, itemSel);
    } else {
        buildSymbolds(html, )
    }
    buildNumbers(html);
    buildMenu(html);
    document.getElementById('keyboard').innerHTML = html.innerHtml;
    swapcase(itemSel);

    $('.button-search-delete-all').click(function () {
        $('#search').val('');
    });
    // Keyboard is build on the fly we need to attach events every time
    $('.letter').click(letterPressed);
    $('.symbol').click(letterPressed);
    $('.backspace').click(letterPressed);
    $('.space').click(letterPressed);

    // just for testing
    $('#uppercase').click(() => buildKeyboard('#uppercase'));
    $('#lowercase').click(() => buildKeyboard('#lowercase'));
    $('#symbols').click(() => buildKeyboard('#symbols'));
    $('#search-button').click(() => getData(document.getElementById('searchResult')));
    // end testing

    keyboardNav = new KeyboardNav(
        'keyboard',
        [
            'symbol',
            'letter',
            'num',
            'option-lowercase',
            'option-uppercase',
            'option-symbols',
            'space',
            'backspace',
            'search-button',

        ]
    );
    // the only event need it
    keyboardNav.addEvent(KEY.ENTER, () => letterPressed());

    // only on build keyboard select the first letter
    $(`[tabindex="0"]`).focus();
}

// what to do when a letter is press
function letterPressed() {
    let textBox = document.getElementById('search');
    let id = document.activeElement.getAttribute('id');
    switch (id) {
        case 'space':
            textBox.value = textBox.value + ' ';
            break;
        case 'backspace':
            if (textBox.value.length) {
                let last =  textBox.value.length - 1;
                textBox.value = textBox.value.substr(0, last);
            }
            break;
        case 'uppercase':
            buildKeyboard('#uppercase');
            $('#uppercase').focus();
            break;
        case 'lowercase':
            buildKeyboard('#lowercase');
            $('#lowercase').focus();
            break;
        case 'search-button':
            getData(document.getElementById('searchResult'));
            $('#search-button').focus();
            break;
        case 'symbols':
            buildKeyboard('#symbols');
            $('#symbols').focus();
            break;
        default:
            textBox.value += document.activeElement.innerHTML;
            break;
    }
}

function getData(domElement) {
    const url = 'http://10.131.123.143/video_player/site_search?search_name=' +
    `${$('#search').val()}&format=json`;
    // fetch(url + '?search=' + search)
    //     .then(()=>{
    //         domElement.innerHTML = 'Search return no results';
    //     })
    //     .then(
    //         /* run the code from down there */
    //     );
    fetch(url)
        .then((res) => res.json(), (rej) => {
            console.log("Error: ", rej);
        })
        .then((data) => {
            let div = '';
            let searchTab = keyboardNav.target.tabs + 1;

            for(let i = 0; i < data.length; i++) {
                div += `<li class="thumbContainer" 
                            tabindex="${searchTab + i}" 
                            id="${data[i].full_path}">
                           <div> 
                              <img class="thumbStill" 
                              src="${data[i].thumbpath}"
                               onError="this.onerror=null;this.src='/bbt/images/missing_thumb.png';"
                               alt>
                              <div class="thumbFooter">
                                <div class="thumbDescName video-footer">${data[i].descname}</div>
                                <div class="thumbIconDuration video-duration">
                                    <i class="fas fa-film"></i>
                                    <span class="thumDuration">${data[i].duration}</span>                               
                                </div>
                              </div>
                          </div>
                      </li>`;
            }

            let totalSearchTabs = searchTab + data.length;
            domElement.innerHTML = div;

            searchNav = new KeyboardNav(
                'search-results-container',
                'thumbContainer'
            );
            searchNav.addEvent(KEY.UP, () =>{
                let current = document.activeElement;
                let tabindex = current.tabIndex;
                /* For now I will look at the size of the container to determine
                * if I have 2 or 5 elements displayed
                * */
                if (document.activeElement.parentElement.offsetWidth <= 1024) {
                    if (tabindex - 2 < searchTab) {
                        $(`[tabindex="${searchTab - 2}"]`).focus();
                    } else {
                        $(`[tabindex="${tabindex - 2}"]`).focus();
                    }
                } else {
                    if (tabindex - 5 < searchTab) {
                        $(`[tabindex="${searchTab - 2}"]`).focus();
                    } else {
                        $(`[tabindex="${tabindex - 5}"]`).focus();
                    }
                }
            });

            searchNav.addEvent(KEY.DOWN,  () => {
                let current = document.activeElement;
                let tabindex = current.tabIndex;
                if (document.activeElement.parentElement.offsetWidth <= 1024) {
                    if (tabindex + 2 <= totalSearchTabs) {
                        $(`[tabindex="${tabindex + 2}"]`).focus();
                    }
                } else {
                    if (tabindex + 5 <= totalSearchTabs) {
                        $(`[tabindex="${tabindex + 5}"]`).focus();
                    }
                }
            });

            $(".thumbContainer").click(function () {
                playVideo(this);
            });

        },
            (rej) => {
            console.log("Rejection: ", rej);
        });
}

// FUNCTIONS NEED IT FOR DYNAMIC MOVEMENT
// function whiting(origElX, oriElW, candidateElX) {
//     return origElX - (oriElW/2) <= candidateElX &&
//         candidateElX <= origElX + oriElW;
// }

// offsetTop = Y & offsetLeft = X
// function findNextNode(candidateEl, origElW, origElX, oriElY) {
//     //                    width   candidate X coordinate
//     if (whiting(origElX, origElW, candidateEl.offsetLeft) &&
//         // candidate Y > original Y
//         candidateEl.offsetTop > oriElY) {
//         return candidateEl;
//     } else {
//         let next = candidateEl.nextElementSibling;
//         if (next === null || next === undefined) {
//             next = candidateEl.parentElement.nextElementSibling;
//         }
//         if (next.children.length > 0) {
//             next = next.firstElementChild;
//         }
//
//         return findNextNode(next, origElW, origElX, oriElY);
//     }
// }
//
//
// function findPrevNode(candidateEl, origElW, origElX, oriElY) {
//     //                    width   candidate X coordinate
//     if (whiting(origElX, origElW, candidateEl.offsetLeft) &&
//         // candidate Y > original Y
//         candidateEl.offsetTop < oriElY) {
//         return candidateEl;
//     } else {
//         let prev = candidateEl.previousElementSibling;
//         if (prev === null || prev === undefined) {
//             prev = candidateEl.parentElement.previousElementSibling;
//         }
//         if (prev.children.length > 0) {
//             prev = prev.lastElementChild;
//         }
//
//         return findPrevNode(prev, origElW, origElX, oriElY);
//     }
// }

// function left() {
//     let current = document.activeElement;
//     let prev = current.previousElementSibling;
//     if (prev === null) {
//         prev = current.parentElement.previousElementSibling;
//         if (prev === null) {
//             return; // no more elements
//         }
//     }
//     if (prev.children !== null && prev.children.length > 0) {
//         prev = prev.lastElementChild;
//     }
//     if (prev.tabIndex >= 0) {
//         $(`[tabindex="${prev.tabIndex}"]`).focus();
//     }
// }
//
// function right() {
//     let current = document.activeElement;
//     let next = current.nextElementSibling;
//     if (next === null) {
//         next = current.parentElement.nextElementSibling;
//         if (next === null) {
//             return; // no more elements
//         }
//     }
//     if (next.children !== null && next.children.length > 0) {
//         next = next.firstElementChild;
//     }
//     if (next.tabIndex !== null) {
//         $(`[tabindex="${next.tabIndex}"]`).focus();
//     }
// }
//
// function up() {
//     let current = document.activeElement;
//     let tabindex = target.up(current.tabIndex);
//     $(`[tabindex="${tabindex}"]`).focus();
// }
// function down() {
//     let current = document.activeElement;
//     let tabindex = target.down(current.tabIndex);
//     $(`[tabindex="${tabindex}"]`).focus();
// }
// This is a dynamic way to move between elements on a page it has bugs still
// so it has to be implemented later.

// function down(keyNav, paddinOrMaring = 0) {
//     let current = document.activeElement;
//     let upElem = findNextNode(
//         current,
//         current.offsetWidth,
//         current.offsetLeft,
//         current.offsetTop
//     );
//     let tabIndex = upElem.tabIndex;
//
//     if (tabIndex <= keyNav.totalElementCount) {
//         $("[tabindex=" + tabIndex + "]").focus()
//     }
// }
//
// function up(keyNav, paddinOrMaring = 0) {
//
//     // Top is the y axis and Left is x axis
//     let current = document.activeElement;
//     let upElem = findPrevNode(
//         current,
//         current.offsetLeft,
//         current.offsetTop // - (current.offsetHeight / 2)
//     );
//     let tabIndex = upElem.tabIndex;
//
//     if (tabIndex >= 0) {
//         $("[tabindex=" + tabIndex + "]").focus()
//     }
// }

// END OF FUNCTIONS NEED IT FOR DYNAMIC MOVEMENT

$(document).ready(function(){
    buildKeyboard('#lowercase');
});

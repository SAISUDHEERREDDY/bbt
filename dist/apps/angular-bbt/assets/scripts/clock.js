const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const days = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
];
let date = new Date();
let y = date.getFullYear();
let m = months[date.getMonth()];
let day = days[date.getDay()];
let ddate = date.getDate();


function update() {
  let date = new Date();
  
  //Gets the hours switched to 12 hour format if 0 chooses 12
  let hours = date.getHours() === 0
    ? 12
    : date.getHours() > 12
      ? date.getHours() - 12
      : date.getHours();
  //Gets the minutes if less than 10 it pads with a 0
  let minutes = date.getMinutes() < 10
    ? '0' + date.getMinutes()
    : date.getMinutes();
  
  document.getElementById('ampm').innerHTML =
    date.getUTCHours() < 12 ? 'AM' : 'PM';
  document.getElementById('hours').innerHTML = hours.toString();
  document.getElementById('minutes').innerHTML = minutes;
}

update();
window.setInterval(update, 1000);

let dateformat = '<span id=day data-i18n="'+day+'">' + day + '</span>. '+
  '<span id="day-date" class="dayDate" data-i18n="'+m+'">'+m+'</span>' +
   '<span class="dayDate">. ' +ddate+ ', </span>' +
  '<span id="year">'+ y +'</span>';
$('#date').html(dateformat);

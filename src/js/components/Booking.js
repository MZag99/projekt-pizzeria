import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(bookingContainer) {
    const thisBooking = this;

    thisBooking.render(bookingContainer);
    thisBooking.initWidgets();
    thisBooking.getData();
  }
  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking: settings.db.url + '/'
        + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/'
        + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/'
        + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };
    //console.log(urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    //console.log('thisBooking.booked',thisBooking.booked);
    thisBooking.updateDOM();
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    if(typeof thisBooking.pickedTables == 'undefined' || thisBooking.checkTable() === null){
      alert('Wybierz stolik!');
    }

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.dom.hourOutput.innerHTML,
      table: thisBooking.checkTable(),
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: thisBooking.starters,
      phone: thisBooking.dom.phone.value,
      address:thisBooking.dom.address.value,
    };

    const options = { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }, 
      body: JSON.stringify(payload) 
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then (function(parsedResponse){
        thisBooking.makeBooked(parsedResponse.date, parsedResponse.hour, parsedResponse.duration, parsedResponse.table);
      })
      .catch(error => console.error(error));

  }

  checkTable() {
    const thisBooking = this;

    if (typeof thisBooking.pickedTables[0] != 'undefined') {
      return parseInt(thisBooking.pickedTables[0]);
    }
    else {
      return null;
    }
  }

  checkStarters(){
    const thisBooking = this;

    thisBooking.starters = [];

    for(let starter of thisBooking.dom.starters){
      if(starter.checked){
        thisBooking.starters.push(starter.value);
      }
    }
  }

  bookTable(event) {
    const thisBooking = this;

    const table = event.target;

    if (table.classList.contains('table') && !table.classList.contains(classNames.booking.tableBooked)) {
      if (!table.classList.contains(classNames.booking.tablePicked)) {
        thisBooking.resetTables();
        const id = table.getAttribute('data-table');
        table.classList.add(classNames.booking.tablePicked);
        thisBooking.pickedTables.push(id);
      }
      else {
        thisBooking.resetTables();
      }
    }
    else if (table.classList.contains(classNames.booking.tableBooked)) {
      alert('Stolik niedostępny!');
    }
  }
  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      //console.log(hourBlock);
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  resetTables() {
    const thisBooking = this;

    for (let table of thisBooking.dom.tables) {
      table.classList.remove(classNames.booking.tablePicked);
    }
    thisBooking.pickedTables = [];
  }

  render(bookingContainer) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = bookingContainer;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.dateInput = thisBooking.dom.wrapper.querySelector('.date-picker');
    thisBooking.dom.hourInput = thisBooking.dom.wrapper.querySelector('.hour-picker');
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tables.wrapper = thisBooking.dom.wrapper.querySelector(select.booking.floor);
    thisBooking.dom.hourOutput = thisBooking.dom.wrapper.querySelector(select.widget.hourPicker.output);
    thisBooking.dom.dateOutput = thisBooking.dom.wrapper.querySelector(select.widget.datePicker.input).value;
    thisBooking.dom.submit = thisBooking.dom.wrapper.querySelector(select.booking.submit);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.tel);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.dateInput);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourInput);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
      thisBooking.resetTables();
    });

    thisBooking.dom.tables.wrapper.addEventListener('click', function (event) {
      thisBooking.bookTable(event);
    });
    thisBooking.dom.submit.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.checkStarters();
      thisBooking.sendBooking();
    });
  }
}
export default Booking;
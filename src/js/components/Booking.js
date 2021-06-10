import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(bookingContainer){
    const thisBooking = this;

    thisBooking.render(bookingContainer);
    thisBooking.initWidgets();
  }
  render(bookingContainer){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
        
    thisBooking.dom = {};
    thisBooking.dom.wrapper = bookingContainer;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.dateInput = thisBooking.dom.wrapper.querySelector('.date-picker');
    thisBooking.dom.hourInput = thisBooking.dom.wrapper.querySelector('.hour-picker');
  }
  initWidgets(){
    const thisBooking = this;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    
    new AmountWidget(thisBooking.dom.peopleAmount);
    new AmountWidget(thisBooking.dom.hoursAmount);
    new DatePicker(thisBooking.dom.dateInput);
    new HourPicker(thisBooking.dom.hourInput);
    console.log(thisBooking.dom.peopleAmount);
  }
}
export default Booking;
import {select, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';

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
    }
    initWidgets(){
        const thisBooking = this;

        thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    
        new AmountWidget(thisBooking.dom.peopleAmount);
        new AmountWidget(thisBooking.dom.hoursAmount);
        console.log(thisBooking.dom.peopleAmount);
    }
}
export default Booking;
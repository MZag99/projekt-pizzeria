import {select, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;
    thisProduct.id = id,
    thisProduct.data = data,
    thisProduct.dom = {};
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }
  prepareCartProductParams(){
    const thisProduct = this;
    const cartProductParams = {};
    const formData = utils.serializeFormToObject(thisProduct.dom.form);

    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      const paramObj = cartProductParams[paramId] = {};
      paramObj.label = param.label;
      const optionObj = paramObj.options = {};
      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];

        if (formData[paramId].includes(optionId)) {
          optionObj[optionId] = option.label; 
        }
      }
    }
    return cartProductParams;
  }
  prepareCartProduct(){
    const thisProduct = this;

    const productSummary = {};
    productSummary.id = thisProduct.id;
    productSummary.name = thisProduct.data.name;
    productSummary.amount = thisProduct.amountWidget.value;
    productSummary.priceSingle = thisProduct.priceSingle;
    productSummary.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    productSummary.params = thisProduct.prepareCartProductParams();
    console.log(productSummary);
    return productSummary;
  }
  addToCart(){
    const thisProduct = this;
    const preparedObj = thisProduct.prepareCartProduct();
    //app.cart.add(preparedObj);
  
    const event = new CustomEvent('add-to-cart',{
      bubbles:true,
      detail:{
        product:thisProduct.prepareCartProduct(),
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
  renderInMenu() {
    const thisProduct = this;

    //generate HTML based on template
    const generatedHTML = templates.menuProduct(thisProduct.data);
    //create element using utils.createElementFromHTML
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    //find menu container
    const menuContainer = document.querySelector(select.containerOf.menu);
    //add element to menu
    menuContainer.appendChild(thisProduct.element);
  }
  getElements() {
    const thisProduct = this;

    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
  initAccordion() {
    const thisProduct = this;
    thisProduct.dom.accordionTrigger.addEventListener('click', function (event) {
      /* prevent default action for event */
      event.preventDefault();
      /* find active product (product that has active class) */
      const activeProduct = document.querySelector('.product.active');
      // toggle active class of clicked element
      thisProduct.element.classList.toggle('active');
      /* if there is active product and it's not thisProduct.element, remove class active from it */
      if (activeProduct != thisProduct.element) {
        activeProduct.classList.remove('active');
      }
    });
  }
  initOrderForm() {
    const thisProduct = this;
    thisProduct.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.dom.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.dom.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });

  }
  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
    thisProduct.dom.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }
  processOrder() {
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.dom.form);

    let price = thisProduct.data.price;
    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];
      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        const optionImg = thisProduct.element.querySelector('img.' + paramId + '-' + optionId);

        if (formData[paramId].includes(optionId)) {
          if (optionImg != null) {
            optionImg.classList.add('active');
          }
          //optionImg.classList.add('active');
          if (!option.hasOwnProperty('default')) {
            price = price + option.price;
          }
        }
        else if (!formData[paramId].includes(optionId)) {
          if (optionImg != null) {
            optionImg.classList.remove('active');
          }
          if (option.hasOwnProperty('default')) {
            price = price - option.price;
          }
        }
      }
    }
    thisProduct.priceSingle = price;
    price *= thisProduct.amountWidget.value;
    // update calculated price in the HTML
    thisProduct.dom.priceElem.innerHTML = price;
  }
}
export default Product;
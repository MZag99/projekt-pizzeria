import {settings, select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    console.log('New Cart',thisCart);
  }
  add(menuProduct){
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    const list = thisCart.dom.productList;
    list.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }
  getElements(element){
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.form = document.querySelector(select.cart.form);
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = document.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = document.querySelector(select.cart.deliveryFee);
    thisCart.dom.subTotalPrice = document.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = document.querySelector(select.cart.totalPrice);
    thisCart.dom.totalPriceBottom = document.querySelector(select.cart.totalPriceBottom);
    thisCart.dom.totalNumber = document.querySelector(select.cart.totalNumber);
  }
  initActions(){
    const thisCart = this;

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });
  }
  sendOrder(){
    const thisCart = this;
      
    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {
      address:document.querySelector(select.cart.address).value,
      phone:document.querySelector(select.cart.phone).value,
      totalPrice: thisCart.dom.totalPrice.innerHTML,
      subTotalPrice: thisCart.dom.subTotalPrice.innerHTML,
      totalNumber:thisCart.dom.totalNumber.innerHTML,
      deliveryFee:thisCart.dom.deliveryFee.innerHTML,
      products:[]
    };
    for(let prod of thisCart.products){
      payload.products.push(prod.getData());
    }
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
        console.log('parsedResponse: ', parsedResponse);
      })
      .catch(error => console.error(error));
  }
  update(){
    const thisCart = this;
    console.log(thisCart.products);

    const deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0; 
    let subTotalPrice = 0;
    for(let product of thisCart.products){
      totalNumber = totalNumber + product.amountWidget.value;
      subTotalPrice = subTotalPrice + (product.priceSingle * product.amountWidget.value);
    }
    if(subTotalPrice != 0){
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.subTotalPrice.innerHTML = subTotalPrice;
      thisCart.dom.totalPrice.innerHTML = subTotalPrice + deliveryFee;
      thisCart.dom.totalPriceBottom.innerHTML = subTotalPrice + deliveryFee;
    }
    else{
      thisCart.dom.deliveryFee.innerHTML = 0;
      thisCart.dom.totalPrice.innerHTML = subTotalPrice;
      thisCart.dom.totalPriceBottom.innerHTML = subTotalPrice;
    }
    thisCart.dom.totalNumber.innerHTML = totalNumber;
    console.log('total price:', thisCart.dom.totalPrice.innerHTML, 'total number: ', totalNumber);
  }
  remove(product){
    const thisCart = this;

    const productDom = product.dom.wrapper;
    productDom.remove();
    const indexOfProduct = thisCart.products.indexOf(product);
    thisCart.products.splice(indexOfProduct, 1);
    console.log(thisCart.products);
    thisCart.update();
  }
}
export default Cart;
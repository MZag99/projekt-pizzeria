const templates = {
  bookTemplate: Handlebars.compile(document.querySelector('#template-book').innerHTML),
};

class Bookslist{
constructor(book){
const thisBookslist = this;

thisBookslist.dom = {},
thisBookslist.favoriteBooks = [],
thisBookslist.filtersArray = []
thisBookslist.rating = dataSource.books[book].rating;
thisBookslist.initData(book);
thisBookslist.getElements();
thisBookslist.initActions();
thisBookslist.determineRatingBgc();
}
getElements(){
  const thisBookslist = this;

  thisBookslist.dom.booksWrapper = document.querySelector('.books-list');
  thisBookslist.dom.fillBar = thisBookslist.element.querySelector('.book__rating__fill');
  thisBookslist.dom.filters = document.querySelector('.filters form');
}
initData(book){
  const thisBookslist = this;

    const generatedHTML = templates.bookTemplate(dataSource.books[book]);
    thisBookslist.element = utils.createDOMFromHTML(generatedHTML);
    const booksContainer = document.querySelector('.books-list');
    booksContainer.appendChild(thisBookslist.element);
}
initActions(){
  const thisBookslist = this;

  const booksWrapper = thisBookslist.dom.booksWrapper;
  const filters = thisBookslist.dom.filters;
  filters.addEventListener('click', function(event){
    const target = event.target;
    if(target.tagName == 'INPUT' && target.getAttribute('name') === 'filter' && target.getAttribute('type') === 'checkbox'){
      if(target.checked){
        thisBookslist.filtersArray.push(target.getAttribute('value'));
      }
      else if(!target.checked){
        const index = thisBookslist.filtersArray.indexOf(target.getAttribute('value'));
        delete thisBookslist.filtersArray[index];
      }
      thisBookslist.filterBooks(target.getAttribute('value'));
    }
  });
  booksWrapper.addEventListener('dblclick', function(event){
    const bookLink = event.target.offsetParent;
    if(bookLink.classList.contains('book__image')){
      const id = bookLink.getAttribute('data-id');
      if(!bookLink.classList.contains('favorite')){
        bookLink.classList.add('favorite');
        thisBookslist.favoriteBooks.push(id);
      }
      else{
        bookLink.classList.remove('favorite');
        const arrId = thisBookslist.favoriteBooks.indexOf(id);
        delete thisBookslist.favoriteBooks[arrId];
      }
      console.log(thisBookslist.favoriteBooks);
    }
  });
}
filterBooks(value){
  const thisBookslist = this;

  for(let book of dataSource.books){
    if(!book.details[value] && thisBookslist.filtersArray.includes(value)){
      const targetBook = document.querySelector('[data-id="' + book.id + '"]');
      targetBook.classList.add('hidden');
    }
    else if(!book.details[value] && !thisBookslist.filtersArray.includes(value)){
      const targetBook = document.querySelector('[data-id="' + book.id + '"]');
      targetBook.classList.remove('hidden');
    }
  }
}
determineRatingBgc(){
  const thisBookslist = this;
  
  if(thisBookslist.rating < 6){
    thisBookslist.dom.fillBar.style.background = 'linear-gradient(to bottom,  #fefcea 0%, #f1da36 100%)';
  }
  else if(thisBookslist.rating > 6 && thisBookslist.rating <= 8){
    thisBookslist.dom.fillBar.style.background = 'linear-gradient(to bottom, #b4df5b 0%, #b4df5b 100%)';
  }
  else if(thisBookslist.rating > 8 && thisBookslist.rating <= 9){
    thisBookslist.dom.fillBar.style.background = 'linear-gradient(to bottom, #299a0b 0%, #299a0b 100%)';
  }
  else if(thisBookslist.rating > 9){
    thisBookslist.dom.fillBar.style.background = 'linear-gradient(to bottom, #ff0084 0%,#ff0084 100%)';
  }
  thisBookslist.dom.fillBar.style.width = '' + (thisBookslist.rating * 10) + '%';
}
}

for(let book in dataSource.books){
  const app = new Bookslist(book);
}

import './css/styles.css';
import { fetchCountries } from './fetchCountries';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { refs } from './refs';

const DEBOUNCE_DELAY = 300;
const debounce = require('lodash.debounce');

refs.inputSearch.addEventListener(
  'input',
  debounce(onInputChange, DEBOUNCE_DELAY)
);
//Функция для слушателя событий инпута
function onInputChange(event) {
  //Чтобы не перезагружалась страница
  event.preventDefault();
  //Если пользователь полностью очищает поле поиска, то HTTP-запрос не выполняется, а разметка списка стран или информации о стране пропадает.
  if (refs.inputSearch === '') {
    return;
  }
  refs.countryInfo.innerHTML = '';
  refs.countryList.innerHTML = '';
  //Вызов функции
  fetchCountries()
    /// .then(allCountries) - ссылка на функцию, когда буде вызываться прийдет результат то есть страны или одна страна
    .then(allCountries => {
      //Отфильтрованные страны из функции filteredList
      const filteredCountries = filteredList(allCountries);
      //Если в ответе бэкенд вернул больше чем 10 стран, в интерфейсе пояляется уведомление о том, что имя должно быть более специфичным.
      if (filteredCountries.length > 10) {
        return Notify.info(
          'Too many matches found. Please enter a more specific name.'
        );

        //Если бэкенд вернул от 2-х до 10-х стран, под тестовым полем отображается список найденных стран. Каждый элемент списка состоит из флага и имени страны.
      } else if (
        filteredCountries.length >= 2 &&
        filteredCountries.length <= 10
      ) {
        return nameAndFlagsOfCountries(filteredCountries);
        //Если результат запроса это массив с одной страной, в интерфейсе отображается разметка карточки с данными о стране: флаг, название, столица, население и языки.
      } else if (filteredCountries.length === 1) {
        return dataForOneCountry(filteredCountries);
        //Если пользователь ввёл имя страны которой не существует, бэкенд вернёт не пустой массив, а ошибку со статус кодом 404 - не найдено.
      } else {
        Notify.failure('Oops, there is no country with that name');
      }
    })
    .catch(error => {
      console.log('catch');
      console.log(error.message);
    });
}

//Функция для: если бэкенд вернул от 2-х до 10-х стран
function nameAndFlagsOfCountries(allCountries) {
  const dataOfCountry = allCountries
    .map(country => {
      return `<h2 class="country-name"><img src="${country.flags.svg}" alt="" width="30" > ${country.name.official}</h2>`;
    })
    .join('');
  refs.countryInfo.innerHTML = '';
  refs.countryList.innerHTML = dataOfCountry;
}

//Функция для: если результат запроса это массив с одной страной
function dataForOneCountry(allCountries) {
  const dataOfCountry = allCountries
    .map(country => {
      return `<h2 class="country-name"><img src="${
        country.flags.svg
      }" alt="" width="30" > ${country.name.official}</h2>
        <li class="country-info-item">
          <p class="country-text">Capital: <span class="sp-text">${
            country.capital[0]
          }</span></p>
        </li>
        <li class="country-info-item">
          <p class="country-text">Population: <span class="sp-text">${
            country.population
          }</span></p>
        </li>
        <li class="country-info-item">
          <p class="country-text">Languages: <span class="sp-text">${Object.values(
            country.languages
          )}</span></p>
        </li>
  `;
    })
    .join('');
  refs.countryList.innerHTML = '';
  refs.countryInfo.innerHTML = dataOfCountry;
}
//Функция для отбора(фильтрации) стран при вводе в инпуте
function filteredList(allCountries) {
  const filter = refs.inputSearch.value.trim().toLowerCase();
  console.log(refs.inputSearch.value.trim().toLowerCase());
  //Фильтрация по имени страны
  const filteredName = allCountries.filter(country =>
    country.name.official.toLowerCase().includes(filter)
  );
  return filteredName;
}

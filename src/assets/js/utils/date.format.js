/**
 * Created by Oleh on 07.12.2016.
 */
(function(){

  const DEFAULT_FORMAT_TEMPLATE = 'dd EEE MMM yyyy';

  /**
   * @desc format date with passed template
   *
   * @param [template] {string} - template for date
   * @param [locale] {string} - locale for names of week and month. default is 'en'
   *
   * @return {string} formatted date
   */
  Date.prototype.format = function(template, locale) {
    template = template || DEFAULT_FORMAT_TEMPLATE;


    locale = locale || 'en';
    if (LOCALES.indexOf(locale) < 0)
      locale = 'en';

    var d = this;
    var date = d.getDate(),
      day = d.getDay(),
      month = d.getMonth(),
      year = d.getYear(),
      seconds = d.getSeconds(),
      minutes = d.getMinutes(),
      hours = d.getHours(),
      hours_s = (hours > 12 ? hours - 12 : hours);

    var params = {
      yyyy: 1900 + year,
      yy: (1900 + year + '').substr(2),
      dd: date,
      d: (date > 9 ? date : '0'+date),
      HH: (hours > 9 ? hours : '0'+hours),
      H: hours,
      hh: (hours_s > 9 ? hours_s : '0' + hours_s),
      h: hours_s,
      mm: (minutes > 9 ? minutes : '0' + minutes),
      m: minutes,
      ss: (minutes > 9 ? minutes : '0' + minutes),
      s: seconds,
      a: (hours < 12 ? 'am' : 'pm'),

      MMMM: MONTH[locale].long[month],
      MMM: MONTH[locale].short[month],
      MM: (month > 8 ? month+1 : '0'+(1+month)),
      M: month + 1,
      EEEE: DAYS[locale].long[day],
      EEE: DAYS[locale].short[day]
    };

    for (var key in params) {
      template = template.replace(key, params[key]);
    }

    return template;
  };

  /**
   * @description add new localized days and month
   *
   * @param locale {string} - locale name
   * @param months {object} - object with long and short month names
   * @param days {object} - object with long and short day names
   */
  Date.add_locale = function(locale, months, days) {
    if (LOCALES.indexOf(locale) > -1) {
      throw new Error('this locale already implemented');
    }

    LOCALES.push(locale);
    MONTH[locale] = months;
    DAYS[locale] = days;
  };

  var LOCALES = ['uk', 'en'];

  var MONTH = {
    en: {
      short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      long: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    }, uk: {
      short: ["Січ", "Лют", "Бер", "Кві", "Тра", "Бер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"],
      long: ["Січеня", "Лютого", "Березеня", "Квітеня", "Травеня", "Червеня", "Липеня", "Серпеня", "Вересеня", "Жовтежя", "Листопада", "Груденя"]
    }
  };

  var DAYS = {
    en: {
      short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      long: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    }, uk: {
      short: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
      long: ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "Пятниця", "Субота"]
    }
  };
})();
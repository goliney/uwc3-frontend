//////////////////////////////////////////////////////
///        UWC3 . Frontend. Sergey Goliney         ///
//////////////////////////////////////////////////////

/* Набор вспомогательных утилит */

//Список ответов тех поддержки
var support_care = [
    'Перезапустіть ваш пристрій.',
    'Я так і думав',
    'Ваше питання дуже важливе для нас',
    'Залишайтесь на зв’язку',
    '...цікаво, а що сьогодні в їдальні на обід',
    'Ну все, мій терпець урвався!!! Я звільняюсь!!!',
    'Ви хочете про це поговорити?',
    'А до мережі ви його підключили?',
    'Як я Вас розумію...'
]

//Проверка мобильного устройства
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

//Уменьшить ширину строки. Функция заменяет в середину строки <span>...</span>
function reduceStringWidth(textHolder) {
    /*
    Уменьшить длину текста. Принимает DOM элемента, в котором заменяет
    центральный символ на многоточие (...)
     */
    var separator = textHolder.getElement('.separator');
    if (separator) {
        separator.destroy();
    } else {
        textHolder.set('title', textHolder.get('text'))
    }
    var text = textHolder.get('text');
    separator = '<span class="separator">...</span>';
    var middle_index = (text.length / 2).floor();
    text = text.substr(0,middle_index) + separator + text.substr(middle_index+1);
    textHolder.set('html', text);
}


function validateEmail(email) {
    /*
    Проверка валидности электронного адрема
    Принимает:  [string]
    Возвращает: [bool]
     */
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


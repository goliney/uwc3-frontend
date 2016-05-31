//////////////////////////////////////////////////////
///        UWC3 . Frontend. Sergey Goliney         ///
//////////////////////////////////////////////////////

/* Utils */

//Список ответов тех поддержки
var support_care = [
    "Have you tried turning it off and on again?",
    "Just as I thought",
    "So intriguing, go on...",
    "Stay on line, please...",
    "...цікаво, а що сьогодні в їдальні на обід",
    "I can't take it anymore!!! I quit!!!",
    "Do you want to talk about it?",
    "Did you plug it in?",
    "Oh, it's you again",
    "Fine",
    "I understand you so deeply..."
];

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


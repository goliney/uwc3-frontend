//////////////////////////////////////////////////////
///        UWC3 . Frontend. Sergey Goliney         ///
//////////////////////////////////////////////////////

/* Класс виджета */

var Widget = new Class({
    Implements:[Options, Events],
    options:{
        element:'widget',           //идентификатор виджета
        content:'widget-content',   //идентификатор содержимого виджета
        toggler:'widget-toggler',   //идентификатор переключателя виджета
        //начальные координаты виджета
        defaultPosition:{
            'x':276,
            'y':75
        },
        //верстка тела сообщения
        message_content:'<div class="title">\
                             <b class="sender">{sender}</b>\
                             <span class="datetime">({time}):</span>\
                         </div>\
                         <div class="text">\
                             {text}\
                         </div>',
        //верстка тела вложения файла в сообщении
        file_attach:'<i class="icon-attachment"></i> <a target="_blank" href="{link}">{filename}</a>'
    },
    initialize:function (options) {
        this.setOptions(options);
        this.waitAnimation = null;
        this.waitResponse = null;
        this.status = 'chatting';   //статус виджета (chatting|farewell)
        this.textarea = $(this.options.element).getElement('textarea[name=message]'); //поле ввода сообщения

        (function () {
            //задержка для того, чтобы IE справился
            this.hideWidget(true);
            $(this.options.element).removeClass('transparent');
        }).delay(50, this);

        this.isMobile = isMobile.any();
        //Если моб.устройство - используем стандартный скролл
        if (!this.isMobile) {
            //Перемещение виджета по экрану
            this.drag = new Drag($(this.options.element), {
                handle:$('widget-title'),
                onBeforeStart:function (el) {
                    this.calcDragBounds();
                }.bind(this),
                onSnap:function (el) {
                    this.blockScroll();
                }.bind(this),
                onComplete:function (el) {
                    var position = $(this.options.element).getPosition();
                    if (position.y < 0) {
                        position.y = 0;
                        $(this.options.element).setPosition(position);
                    }
                    this.unblockScroll();
                }.bind(this)
            });
        }

        this.clearWidget();
        this.addWidgetEvents();

    },
    addWidgetEvents:function () {
        /*
        Навесить события на элементы виджета
         */

        //Нажатие на переключатель виджета
        $(this.options.toggler).addEvent('click', function (event) {
            event.stop();
            if (this.scroll) {
//                this.scroll.terminate();
//                this.scroll.element.removeEvents();
                this.scroll = null;
            }
            this.showWidget();
            if (!this.isMobile)
                this.textarea.focus();
            this.clearWidget();
            this.hideToggler();
        }.bind(this));

        //Отправить сообщение по нажатию enter в поле ввода
        this.textarea.addEvent('keydown', function (event) {
            if (event.key == 'enter') {
                this.sendMessage();
                event.stop();
            }
        }.bind(this));

        $(this.options.element).addEvents({

            //нажатие на кнопку закрытия виджета
            'click:relay(button.close)':function (event) {
                this.hideWidget();
                this.textarea.value = '';

                var wait = window.setTimeout(function () {
                    this.status = this.status == 'chatting' ? 'farewell' : 'chatting';
                    if (this.status == 'farewell') {
                        this.showWidget();
                    }
                }.bind(this), 750);
            }.bind(this),

            //нажатие на кнопку "вкласти файл"
            'click:relay(.attach)':function (event) {
                event.stop();
                $('upload-file').click(); //вызов диалога выбора файла
            }.bind(this),

            //нажатие на выбранный файл
            'click:relay(.file)':function () {
                this.clearFileInput();
            }.bind(this),

            //отправка сообщения
            'submit:relay(.controls.chatting form)':function (event) {
                event.stop();
                this.sendMessage();
            }.bind(this),

            //отправка эл. адреса для получения копии диалога на почту
            'submit:relay(.controls.farewell form)':function (event) {
                event.stop();
                var email = $(event.target).getElement('input').value;
                if (validateEmail(email)) {
                    this.sendDialog($(event.target).getElement('input').value);
                }
            }.bind(this),

            //набор текста в поле ввода эл. адреса
            'keyup:relay(input.email)':function (event) {
                var is_valid_email = validateEmail(event.target.value);
                $(event.target).getNext('[type=submit]').set('disabled', !is_valid_email);
            }.bind(this)
        });

    },
    showWidget:function (immediately) {
        /*
        Показать виджет. Если не получен аргумент immediately,
        виджет появляется мгновенно, без анимации
         */
        var position = this.isMobile ? {x: 0, y: 0} : this.options.defaultPosition;
        $(this.options.element).setPosition(position);
        clearInterval(this.waitAnimation);
        if (!immediately) {
            this.animateWidget('fadeInLeft');
            this.waitAnimation = window.setTimeout(function () {
                $(this.options.element).set('class', this.status);
                this.unblockScroll();
            }.bind(this), 750);
        } else {
            this.unblockScroll();
        }
    },
    hideWidget:function (immediately) {
        /*
         Скрыть виджет. Если не получен аргумент immediately,
         виджет скрывается мгновенно, без анимации
         */
        this.blockScroll();
        clearInterval(this.waitAnimation);
        if (!immediately) {
            this.animateWidget('fadeOutRight');
            this.waitAnimation = window.setTimeout(function () {
                $(this.options.element).set('class', this.status);
                $(this.options.element).setPosition({x:-9999, y:-9999});
                this.showToggler();
            }.bind(this), 750);
        } else {
            $(this.options.element).setPosition({x:-9999, y:-9999});
        }
    },
    animateWidget:function (animation) {
        /*
        Применить анимацию к виджету
         */
        $(this.options.element).set('class', this.status).addClass('animated ' + animation);
    },
    showToggler:function () {
        /*
        Показать переключатель виджета
         */
        //Показываем только когда окончательно закрыли виджет
        if (this.status == 'farewell')
            $(this.options.toggler).setStyle('left', 0);
    },
    hideToggler:function () {
        /*
        Скрыть переключатель виджета
         */
        $(this.options.toggler).setStyle('left', -50);
    },
    checkScroll:function () {
        /*
        Проверка состояния скролла у содержимого виджета.
         */
        //Не создаем скролл сразу, т.к. вылетает в IE
        var content = $(this.options.content);
        if (content.scrollHeight > content.clientHeight && !this.isMobile && !this.scroll) {
            this.scroll = new Scrollable(content);
            this.scroll.showContainer(true);
        }
    },
    blockScroll:function () {
        /*
        Заблокировать скролл для предотвращения появления его при анимации виджета
         */
        if (!this.isMobile && this.scroll) {
            $(this.scroll.container).addClass('hide');
        }
    },
    unblockScroll:function () {
        /*
        Разблокировать скролл
         */
        if (!this.isMobile && this.status == 'chatting' && this.scroll) {
            $(this.scroll.container).removeClass('hide');
            this.scroll.reposition();
        }
    },
    scrollBottom:function () {
        /*
        Прокрутить содержимое виджета вниз
         */
        if (!this.isMobile) {
            if (this.scroll) {
                this.scroll.scrollBottom();
            }
        } else {
            //Не работает на андроиде: http://code.google.com/p/android/issues/detail?id=19625
            $(this.options.content).scrollTop = $(this.options.content).scrollHeight;
        }
    },
    calcDragBounds:function () {
        /*
        Вычислить границы перемещения виджета
         */
        var docSize = $(window).getSize();
        var widgetSize = $(this.options.element).getSize();
        this.drag.options.limit = {
            x:[0, docSize.x - widgetSize.x],
            y:[0, docSize.y - widgetSize.y - 20] //20 - стрелочка нижняя
        };
    },
    clearFileInput:function () {
        /*
        Очистить поле вложения файла
         */
        $('upload-file').getParent().set('html', $('upload-file').getParent().get('html'));
        this.fitFilename();
        $('upload-file').addEvent('change', function () {
            this.fitFilename()
        }.bind(this));
    },
    fitFilename:function () {
        /*
        Отформатировать блок вложенного файла до размеров, вмещающихся в свободное пространство
         */
        var fileWrap = $(this.options.element).getElement('.file');
        var filenameHolder = $(this.options.element).getElement('.filename');
        var filename = $('upload-file').value.replace("C:\\fakepath\\", "");
        filenameHolder.set('text', filename);
        if (filename) {
            fileWrap.removeClass('hide');
        } else {
            fileWrap.addClass('hide');
        }
        while (!this.fileIsFitEnough()) {
            reduceStringWidth(filenameHolder);
        }
    },
    fileIsFitEnough:function () {
        /*
        Проверка, вмещается ли блок вложенного файла в свободное пространство
         */
        var file = $(this.options.element).getElement('.file-attach .file');
        var button = $(this.options.element).getElement('[type=submit]');
        var fileRightSide = file.getPosition().x + file.getSize().x;
        var buttonLeftSide = button.getPosition().x;
        //Если правая граница блока пересекается с левой границей кнопки "отправить", то false
        return fileRightSide + 5 < buttonLeftSide;
    },
    sendMessage:function () {
        /*
        Отправка сообщения. Fake метод для демонстрации отправки сообщения.
        Никаких запросов не отправляется
         */
        if ($('upload-file').value.length || this.textarea.value.length) {
            var message_object = {
                sender:'Ви',
                time:new Date().format('%d.%m.%Y %H:%M:%S'),
                text:this.textarea.value
            }
            //Если есть вложение файла
            if ($('upload-file').value.length) {
                message_object['attachment'] = $('upload-file').value.replace("C:\\fakepath\\", "");
                this.clearFileInput();
            }
            this.printMessage('outcoming', message_object);
            this.textarea.value = '';

            clearInterval(this.waitResponse);
            this.waitResponse = window.setTimeout(function () {
                this.receiveMessage();
            }.bind(this), 800);
        }
        if (!this.isMobile)
            this.textarea.focus();
    },
    receiveMessage:function (message_text) {
        /*
        Получить сообщение. Fake метод для демонстрации получения сообщения.
        Никаких запросов не оправляется. Выбирается случайный ответ
         */
        var message_text = message_text == null ? support_care.getRandom() : message_text;
        var message_object = {
            'sender':'Пiдтримка',
            'time':new Date().format('%d.%m.%Y %H:%M:%S'),
            'text':message_text
        }
        this.printMessage('incoming', message_object);
    },
    printMessage:function (type, message_object) {
        /*
        Отобразить сообщение
         */
        var message_class = 'message '.concat(type)
        var message = new Element('div', {
            'class':message_class,
            'html':this.options.message_content.substitute(message_object)
        })
        if (message_object.attachment !== undefined) {
            var attachment = new Element('div.attachment', {
                'html':this.options.file_attach.substitute({
                    'link':'#' + message_object.attachment,
                    'filename':message_object.attachment
                })
            }).inject(message);
        }
        message.inject($(this.options.element).getElement('.messages'));
        this.checkScroll();
        this.scrollBottom();
    },
    sendDialog:function (email) {
        /*
        Метод заглушка для отправки диалога на почту. Вызывает закрытие виджета
         */
        $(this.options.element).getElement('.close').click();
    },
    clearWidget:function () {
        /*
        Очистить содержимое виджета от старых диалогов, сформировать начальное сообщение
         */
        $(this.options.element).getElement('.messages').empty();
        this.clearFileInput();
        this.receiveMessage('Доброго дня, чим можу допомогти?');
    }
});

window.addEvent('load', function () {
    var widget = new Widget();
});
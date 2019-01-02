(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery, window, document);
    }
}(function($, window, document, undefined) {

    var layerId = 0;
    var animateEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    var transitionEnd = 'webkitTransitionEnd transitionend oTransitionEnd MSTransitionEnd msTransitionEnd';
    /**
        common：通用方法
    */

    var common = {
        toggleClass: function(className, target) {

            var el = target instanceof $ ? target : $(target);

            el.hasClass(className) ? el.removeClass(className) : el.addClass(className);
        },
        isPlaceholder: function() {
            var input = document.createElement('input');
            return 'placeholder' in input;
        },
        throttle: function(func, wait, options) {
            var context, args, result;
            var timeout = null;
            // 上次执行时间点
            var previous = 0;
            if (!options) options = {};
            // 延迟执行函数
            var later = function() {
                // 若设定了开始边界不执行选项，上次执行时间始终为0
                previous = options.leading === false ? 0 : new Date().getTime();
                timeout = null;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            };
            return function() {
                var now = new Date().getTime();
                // 首次执行时，如果设定了开始边界不执行选项，将上次执行时间设定为当前时间。
                if (!previous && options.leading === false) previous = now;
                // 延迟执行时间间隔
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                // 延迟时间间隔remaining小于等于0，表示上次执行至此所间隔时间已经超过一个时间窗口
                // remaining大于时间窗口wait，表示客户端系统时间被调整过
                if (remaining <= 0 || remaining > wait) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = now;
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                    //如果延迟执行不存在，且没有设定结尾边界不执行选项
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        },
        debounce: function(func, wait, immediate) {
            var timeout, args, context, timestamp, result;

            var later = function() {
                var last = new Date().getTime() - timestamp;
                if (last < wait && last > 0) {
                    timeout = setTimeout(later, wait - last);
                } else {
                    timeout = null;
                    if (!immediate) {
                        result = func.apply(context, args);
                        if (!timeout) context = args = null;
                    }
                }
            };

            return function() {
                context = this;
                args = arguments;
                timestamp = new Date().getTime();
                var callNow = immediate && !timeout;
                if (!timeout) timeout = setTimeout(later, wait);
                if (callNow) {
                    result = func.apply(context, args);
                    context = args = null;
                }

                return result;
            };
        }
    };

    /**
        全局组件：pub/sub
    */
    var o = $({});

    $.sub = function() {
        o.on.apply(o, arguments);
    };

    $.unsub = function() {
        o.off.apply(o, arguments);
    };

    $.pub = function() {
        o.trigger.apply(o, arguments);
    };


    $.extend({
        loading: function(options, mobile,context) {
            // 当参数长度大于1，则使用CSS3 loading效果
            // context是执行环境
            var arg = arguments;
            var type = arg.length > 1;
            var display = arg[0];
            var $context = context || $('body');
            var loadingStr = '<div class="IUI-loading">'+(type ? '<div class="loader-inner ball-clip-rotate"><div></div></div>' : '<img src="http://img.yi114.com/201571121314_382.gif" width="32" height="32">')+'</div>';
            if(display){
                $context.append('<div class="IUI-loading-backdrop"></div>'+loadingStr);
            }else{
                $context.find('.IUI-loading-backdrop,.IUI-loading').remove();
            }

        },
        tip: function(options) {

            var param = $.extend({
                obj: "#global-tip",
                text: '',
                timeout: 3000,
                status: true,
                position: null,
                padding: 5,
                callback: null
            }, options);

            var obj = param.obj instanceof $ ? param.obj : $(param.obj);
            var status = param.status ? 'success' : 'error';
            var count = obj.data('count') || 1;
            var id = new Date().getTime();
            var objWidth = obj.outerWidth();
            var objHeight = obj.outerHeight();
            var _x = obj.offset().left;
            var _y = obj.offset().top;
            var tip;

            clearTimeout(obj.data('count'));

            if (param.position === 'custom') {
                if (typeof obj.attr('data-tip') === 'undefined') {

                    $('<div class="tips" id="tip_' + id + '" style="left:' + _x + 'px;top:' + (_y + objHeight + 5) + 'px"></div>').appendTo('body');
                    obj.attr('data-tip', id);

                }
                tip = $('#tip_' + obj.attr('data-tip'));

            }

            var target = param.position === 'custom' ? tip : obj;

            target.html('<span class="' + status + '">' + param.text + '</span>').removeClass('hide');

            obj.data('count', setTimeout(function() {

                target.addClass('hide');

                param.callback ? param.callback() : '';

            }, param.timeout));

        },
        alert: function(options) {

            var $body = $('body');

            var defaults = {
                title: '标题',
                content: ':( 您尚未填写内容',
                confirmText: '确定',
                cancelText: '取消',
                closeBtn: false,
                shadow: true,
                animateClass: 'fadeInDown',
                type: 'confirm',
                status: 'default',
                before: function() {},
                confirm: function() {},
                cancel: function() {}
            };
            var config = $.extend({}, defaults, options);
            var len=$body.find('.IUI-alert-container').length;
            if(len>0){
              return false;
            }
            var container = create();
            var deferred = {
                showAlert: function() {
                    show(container);
                },
                hideAlert: function() {
                    hide(container);
                },
                target: container
            };

            if (!$.alertBackdrop) {
                $.alertBackdrop = $('<div class="IUI-alert-backdrop hide"></div>');
                $body.append($.alertBackdrop);
            }


            if (config.shadow) {
                $body.on('touchstart.iui-alert click.iui-alert', '.IUI-alert-container', function(event) {
                    event.preventDefault();
                    hide(container);
                });
            }

            $body.on('touchstart.iui-alert click.iui-alert', '.IUI-alert-main', function(event) {
                event.stopPropagation();
            });

            container.on('touchstart.iui-alert click.iui-alert', '.IUI-alert-confirm', function(event) {

                if (config.type === 'alert') {

                    if (config.cancel.call(this, deferred) === false) {
                        return false;
                    }

                    hide(container);

                    return false;
                }

                if (config.confirm.call(this, deferred) === false) {
                    return false;
                }

            });

            container.on('touchstart.iui-alert click.iui-alert', '.IUI-alert-cancel,.IUI-alert-close', function(event) {

                if (config.cancel.call(this, deferred) === false) {
                    return false;
                }

                hide(container);
            });

            function show(target) {
                $.alertBackdrop.removeClass('hide');
                target.removeClass('hide');
                target.find('.IUI-alert-main').addClass(config.animateClass);
            }

            function hide(target) {
                $body.off('touchstart.iui-alert click.iui-alert');
                target.off('touchstart.iui-alert click.iui-alert').remove();
                $.alertBackdrop.addClass('hide');
            }

            function create() {
                var isConfirm = config.type === 'confirm';

                var _closeBtn = '<span class="IUI-alert-close"></span>';

                var _confirmBtn = '<a href="javascript:;" class="btn btn-sm btn-primary IUI-alert-confirm">' + config.confirmText + '</a>';

                var _cancelBtn = '<a href="javascript:;" class="btn btn-sm btn-default IUI-alert-cancel">' + config.cancelText + '</a>';

                var _header = '<div class="IUI-alert-header">' + config.title + (config.closeBtn ? _closeBtn : '') + '</div>';

                var _content = '<div class="IUI-alert-content">' + config.content + '</div>';

                var _footer = '<div class="IUI-alert-footer">' + _confirmBtn + (isConfirm ? _cancelBtn : '') + '</div>';

                var _main = _header + _content + _footer;

                var $container = $('<div class="IUI-alert-container hide"><div class="IUI-alert-main ' + config.status + '">' + _main + '</div></div>');
                $body[0].appendChild($container[0]);

                return $container;

            }

            if (config.before.call(this, deferred) === false) {
                return false;
            }

            show(container);

        },
        cookie: function(key, value, options) {
            if (arguments.length > 1 && String(value) !== "[object Object]") {
                options = jQuery.extend({}, options);

                if (value === null || value === undefined) {
                    options.expires = -1;
                }

                if (typeof options.expires === 'number') {
                    var days = options.expires,
                        t = options.expires = new Date();
                    t.setDate(t.getDate() + days);
                }

                value = String(value);

                return (document.cookie = [
                    encodeURIComponent(key), '=',
                    options.raw ? value : encodeURIComponent(value),
                    options.expires ? '; expires=' + options.expires.toUTCString() : '',
                    options.path ? '; path=' + options.path : '',
                    options.domain ? '; domain=' + options.domain : '',
                    options.secure ? '; secure' : ''
                ].join(''));
            }

            // key and possibly options given, get cookie...
            options = value || {};
            var result, decode = options.raw ? function(s) {
                return s;
            } : decodeURIComponent;
            return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
        }
    });




    /**
        IUI:组件集合

        调用：
        $(selector).IUI('layer',params);
    */

    var IUI = {
        layer: function(options) {
            var defaults = {
                container: 'body',
                close: '.btn-cancel,.btn-close',
                vertical: true,
                cache: false,
                shadow: true,
                confirm: '.btn-confirm',
                offsetWidth: 'auto',
                offsetHeight: 'auto',
                url: $(this).attr('data-url') || false,
                dataType: $(this).attr('data-dataType') || 'html',
                animateClass: 'fadeInDown',
                successCall: function() {},
                errorCall: function() {},
                confirmCall: function() {},
                cancelCall: function() {}
            };
            var $this = this;
            var $body = $('body');
            var config = $.extend({}, defaults, options);
            var $container = config.container === 'body' ? $body : $(config.container);
            var $content = $this.find('.layer-content');
            var $backdrop = $('<div class="layer-backdrop"></div>');
            var closeHandle = config.close;
            var screenH = document.documentElement.clientHeight;
            var deferred = {
                target: $this,
                content: $content,
                setting: config,
                id: layerId++,
                showLayer: function() {
                    $this.removeClass('hide');
                    $this.after($backdrop);
                    this.resize();
                    $content.addClass(config.animateClass);
                    $this.trigger('layer.show',[this]);
                },
                hideLayer: function() {
                    $this.addClass('hide');
                    $content.removeClass(config.animateClass);
                    $body.removeClass('layer-open').find('.layer-backdrop').remove();
                    $this.trigger('layer.hide',[this]);
                },
                resize: function() {
                    var $content = $this.find('.layer-content');
                    var outerHeight = parseInt($content.css('margin-bottom')) * 2;
                    var _contentHeight = $content.outerHeight() + outerHeight;
                    if (config.vertical && _contentHeight < screenH) {
                        $body.removeClass('layer-open');
                        $content.css({
                            'top': '50%',
                            'margin-top': -(_contentHeight / 2)
                        });
                        return false;
                    }

                    $body.addClass('layer-open');
                    $content.removeAttr('style').css({
                        'width': _width,
                        'height': _height
                    });
                },
                ajaxLoad: function() {
                    var _url = config.url || '?';
                    var _method = $this.attr('data-method') || 'GET';
                    var _dataType = config.dataType;
                    var _this = this;

                    if (config.cache && $this.data('success')) {
                        _this.showLayer();
                        return false;
                    }

                    $.loading(true,true);
                    $this.data('success', 1);
                    $.ajax({
                        url: _url,
                        type: _method,
                        dataType: config.dataType,
                        data: config.data
                    }).then(function(res) {
                        $.loading(false);
                        config.successCall.apply($this, [res, this, deferred]);
                        _this.showLayer();
                    }, function(err) {
                        $.loading(false);
                        _this.hideLayer();
                        config.errorCall.apply($this, [err, this, deferred]);
                    });
                }
            };

            var _width = Number($this.attr('data-width')) || config.offsetWidth;
            var _height = Number($this.attr('data-height')) || config.offsetHeight;

            $content.css({
                'width': _width,
                'height': _height

            });


            $this.on('click.iui-layer', config.confirm, function(event) {
                config.confirmCall.apply($this, [event, this, deferred]);
                return false;
            });

            if (config.shadow) {
                $this.on('click.iui-layer', function(event) {
                    if ($body.find('.layer-loading').length) {
                        return false;
                    }
                    deferred.hideLayer();
                    config.cancelCall.apply($this, [event, this, deferred]);
                    return false;
                });
            }

            //阻止事件冒泡
            $this.on('click.iui-layer', '.layer-content', function(event) {
                event.stopPropagation();
            });

            //绑定关闭事件
            $this.on('click.iui-layer', config.close, function(event) {
                deferred.hideLayer();
                config.cancelCall.apply($this, [event, this, deferred]);
                return false;
            });

            return deferred;
        },
        tab: function(options) {
            return this.each(function() {
                var defaults = {
                    item: '.tab-item',
                    content: '.tab-content',
                    current: 'active',
                    handle: 'click',
                    afterShow: function() {},
                    beforeShow: function() {},
                    animate: false,
                    animateDelay: 50,
                    optimize: true,
                    autoPlay: true
                };

                var $this = $(this);
                var config = $.extend({}, defaults, options);
                var $items = $this.find(config.item);
                var $contents = $this.find(config.content);
                var time = null;
                var _index = 0;
                var _len = $items.length;
                if (!$items.length) {
                    return;
                }


                init($items.eq(0));

                $this.on(config.handle, config.item, function(event) {
                    event.preventDefault();
                    var _this = $(this);
                    config.beforeShow.apply(_this, [event, config]);
                    init(_this);
                    config.afterShow.apply(_this, [event, config]);
                });


                function init(current, isLoop) {
                    _index = $items.index(current);
                    $items.removeClass(config.current);
                    $contents.removeClass(config.current);
                    $items.eq(_index).addClass(config.current);
                    $contents.eq(_index).addClass(config.current);

                    if (config.animate) {
                        $contents.removeClass(config.animate);
                        setTimeout(function() {
                            $contents.eq(_index).addClass(config.animate);
                        }, config.animateDelay);
                    }
                }

            });
        },
        emailSuffix: function(options) {
            return this.each(function() {
                var defaults = {
                    container: 'body',
                    style: 'global',
                    item: '.email-item',
                    current: 'checked',
                    emails: ['163.com', '126.com', 'qq.com', 'gmail.com', 'sina.com', '139.com', '189.com', 'sohu.com'],
                    delay: 300,
                    offsetLeft: $(this).offset().left,
                    offsetTop: $(this).offset().top,
                    offsetWidth: $(this).outerWidth(),
                    offsetHeight: $(this).outerHeight(),
                    checkedCall: function() {}
                };
                var $this = $(this);
                var config = $.extend({}, defaults, options);
                var $list = $('<ul class="email-list hide"></ul>');
                var $body = $(config.container);
                var time = null;
                var listHtml = function(arr, input) {

                    var _str = '';
                    var _val = input.value || null;
                    var _prefix = _val ? _val.split('@')[0] : false;
                    var _suffix = _val ? _val.split('@')[1] : false;

                    for (var i = 0, email; email = arr[i++];) {

                        if ((_prefix && !_suffix) || _suffix && email.indexOf(_suffix) !== -1) {
                            _str += '<li class="email-item" data-value="' + _prefix + '@' + email + '">' + _prefix + '@' + email + '</li>';
                        }

                    }
                    return _str;
                };

                var keyEvent = function(keyCode, target, obj) {
                    var tmp = [38, 40];
                    if ($.inArray(keyCode, tmp) === -1 || target.hasClass('hide')) {
                        return false;
                    }
                    var direction = $.inArray(keyCode, tmp) >= 1 ? true : false;
                    var $target = target;
                    var len = $target.find('li').length;
                    var $targetCurrent = $target.find('li.checked');
                    $target.find('li').removeClass('checked');

                    if (direction) {
                        //down
                        if ($targetCurrent.length && $targetCurrent.index() !== len - 1) {
                            $targetCurrent.next().addClass('checked');
                        } else {
                            $target.find('li').eq(0).addClass('checked');
                        }
                    } else {
                        //up
                        if ($targetCurrent.index() > 0) {
                            $targetCurrent.prev().addClass('checked');
                        } else {
                            $target.find('li').eq(len - 1).addClass('checked');
                        }
                    }

                    obj.val($.trim($target.find('li.checked').text()));

                    config.checkedCall.apply($this, [event, config]);
                };
                var resize = function() {
                    var _left = config.offsetLeft;
                    var _top = config.offsetTop;
                    var _width = config.offsetWidth;
                    $list.css({
                        left: _left,
                        top: _top + config.offsetHeight,
                        width: _width
                    });
                };

                resize();

                if (config.style === 'global') {
                    $body.append($list);
                    $(window).on('resize.emailSuffix', resize);
                } else {
                    $this.parent().append($list);
                }

                $this.on('keyup.emailSuffix', function(event) {
                    var _val = this.value;
                    if (_val.charAt(0) !== '@' && _val.split('@').length === 2 && $.inArray(event.keyCode, [40, 38, 13]) === -1) {
                        var _str = listHtml(config.emails, this);

                        $list.html(_str).removeClass('hide').find('li').eq(0).addClass('checked');

                    } else if ($.inArray(event.keyCode, [40, 38, 13]) === -1) {
                        $list.html('').addClass('hide');
                    }
                });

                $this.on('keydown.emailSuffix', function(event) {
                    var $selected = $list.find('li.checked');
                    keyEvent(event.keyCode, $list, $this);
                    if (event.keyCode === 13) {
                        event.preventDefault();
                        $selected.length ? $this.val($.trim($selected.text())) : '';
                        $list.addClass('hide');
                    }
                });

                $this.on('blur.emailSuffix', function(event) {
                    time = setTimeout(function() {
                        $list.addClass('hide');
                    }, config.delay);
                });

                $list.on('click', config.item, function(event) {
                    event.preventDefault();
                    clearTimeout(time);
                    $this.val($(this).attr('data-value')).focus();
                    $list.addClass('hide');
                    config.checkedCall.apply($this, [event, config]);
                    return false;
                });
            });


        },
        tooltip: function(options) {

            var defaults = {
                content: '[data-tooltip]',
                animateClass: 'fadeIn',
                template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-body"></div></div>'
            };

            var config = $.extend(defaults, options);

            return this.each(function(index, ele) {
                var content = config.content;
                var animateClass = config.animateClass;
                $(ele).on('mouseenter', content, function() {
                    var $ele = $(this);
                    var _ele = this;
                    var _elePosi = _ele.getBoundingClientRect();
                    var _eleLeft = _elePosi.left;
                    var _eleTop = _elePosi.top;
                    var _eleWidth = _ele.offsetWidth;
                    var _eleHeight = _ele.offsetHeight;

                    var _tipDirec = $ele.attr('data-direction') || 'top',
                        distance = $ele.attr('data-distance') * 1 || 5,
                        title = $ele.attr('data-title');
                    var $tip = $ele.after($(config.template)).next('.tooltip').addClass(_tipDirec + ' ' + animateClass);
                    $tip.find('.tooltip-body').text(title);
                    var _tipWidth = $tip[0].offsetWidth;
                    var _tipHeight = $tip[0].offsetHeight;


                    var left, top;

                    if (_tipDirec == 'top') {
                        left = _eleLeft + (_eleWidth - _tipWidth) / 2;
                        top = _eleTop - _tipHeight - distance;
                    } else if (_tipDirec == 'right') {
                        left = _eleLeft + _eleWidth + distance;
                        top = _eleTop + (_eleHeight - _tipHeight) / 2;
                    } else if (_tipDirec == 'bottom') {
                        left = _eleLeft + (_eleWidth - _tipWidth) / 2;
                        top = _eleTop + _eleHeight + distance;
                    } else if (_tipDirec == 'left') {
                        left = _eleLeft - _tipWidth - distance;
                        top = _eleTop + (_eleHeight - _tipHeight) / 2;
                    }

                    $tip.css({
                        'top': top,
                        'left': left
                    });
                });

                $(ele).on('mouseleave', content, function() {
                    $(this).siblings('.tooltip').remove();
                });

            });
        },
        returnTop: function(options) {
            var defaults = {
                container: '.returnTop-box',
                target: '.returnTop-btn',
                showTop: 100,
                bottom: 50,
                delay: 300
            };
            var $this = $(this);
            var $window = $(window);
            var config = $.extend({}, defaults, options);
            var $target = $this.find(config.target);
            var scrollPosition = function(obj, target) {

                if (target > config.showTop && obj.hasClass('hide')) {
                    obj.removeClass('hide');
                }

                if (target < config.showTop && !obj.hasClass('hide')) {
                    obj.addClass('hide');
                }

                return false;

            };

            scrollPosition($target, $window.scrollTop());

            $this.css({
                'bottom': config.bottom
            });

            $window.on('scroll', function(event) {
                scrollPosition($target, $(window).scrollTop());
            });

            $this.on('click', config.target, function(event) {
                $("body,html").stop().animate({
                    scrollTop: 0
                }, config.delay);
                return false;
            });

        },
        placeholder: function(options) {
            return this.each(function() {
                var isSupport = common.isPlaceholder();
                if (isSupport) {
                    return false;
                }

                var defaults = {
                    target: '.form-control',
                    cloneClass: 'clone-password'
                };
                var $this = $(this);
                var $window = $(window);
                var config = $.extend({}, defaults, options);



                $this.find(config.target).each(function(index, el) {
                    var _placeholder = $(el).attr('placeholder');
                    var $el = $(el);
                    if (el.type === 'password') {

                        var $clone = $('<input class="' + config.target.slice(1) + '" type="text">');

                        $el.css({
                            'display': 'none'
                        });

                        $clone.addClass(config.cloneClass)
                            .val(_placeholder);
                        $el.parent().append($clone);
                    } else {
                        el.value = _placeholder;
                    }
                });

                $this.find(config.target).on({
                    focus: function(event) {
                        if ($(this).hasClass('clone-password')) {
                            $(this).css({
                                'display': 'none'
                            });
                            $(this).parent().find('input[type=password]').css({
                                'display': 'block'
                            }).focus();
                            return false;
                        }

                        if (this.value === $(this).attr('placeholder')) {
                            this.value = '';
                        }
                    },
                    blur: function(event) {
                        if ($(this).attr('type') === 'password' && !this.value) {
                            $(this).css({
                                'display': 'none'
                            });
                            $(this).parent().find('.clone-password').css({
                                'display': 'block'
                            });
                            return false;
                        }

                        if (!this.value) {
                            this.value = $(this).attr('placeholder');
                        }
                    }
                });
            });
        },
        ajaxForm: function(options) {
            return this.each(function() {
                var defaults = {
                    url: $(this).attr('action'),
                    method: $(this).attr('method') || 'POST',
                    type: $(this).attr('data-type') || 'json',
                    before: function() {},
                    success: function() {},
                    error: function() {},
                    pending: function() {}

                };

                var $this = $(this);
                var $fields = $this.find('input');
                var config = $.extend({}, defaults, options);

                $this.data('deferred', config);

                $this.on('submit', function(event) {
                    event.preventDefault();
                    $fields.blur();
                    if ($this.hasClass('disabled')) {

                        config.pending.call($this, config);

                        return false;
                    }

                    var beforeResult = config.before.call($this, event, config);

                    if (beforeResult === false) {
                        return false;
                    }
                    $this.addClass('disabled');
                    $.ajax({
                        url: config.url,
                        type: config.method,
                        // dataType: config.type,
                        data: $this.serialize()
                    }).then(function(res) {
                        $this.removeClass('disabled');
                        config.success.call($this, res, config);
                    }, function(err) {
                        $this.removeClass('disabled');
                        config.error.call($this, err, config);
                    });
                });

            });
        }

    };

    $.fn.IUI = function() {
        var arg = arguments;
        var method = arguments[0];
        if (IUI[method]) {
            method = IUI[method];
            arg = Array.prototype.slice.call(arg, 1);
        } else if (typeof(method) == 'object' || !method) {
            for (var name in method) {
                IUI = $.extend(IUI, method);
                method = IUI[name];
                break;
            }
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.IUI Plugin');
            return this;
        }
        return method.apply(this, arg);
    };

}));

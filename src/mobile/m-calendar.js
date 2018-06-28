(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    ui.MCalendar = core.inherits(
        ui.InputControl,
        'ui-mobile-calendar',
        function (el, options) {
            util.setDefault(options, 'enter', 'bottom');

            var popupEl = dom.create({
                    className: options.classes.join('-popup ') + 'ui-popup ui-hide'
                }),
                children = dom.children(el);

            ui.InputControl.call(this, el, options);

            this.setPopup(core.$fastCreate(this.Popup, popupEl, this, {ext: {'m-confirm': true}}));

            this._aOptions = [];
            children.forEach(function (item) {
                dom.addClass(item, this.Options.CLASS);
                popupEl.getControl().getBody().appendChild(item);
                this._aOptions.push(core.$fastCreate(this.Options, item, this, core.getOptions(item)));
            }, this);

            this._uYear = this._aOptions[0];
            this._uMonth = this._aOptions[1];
            this._uDate = this._aOptions[2];
        },
        {
            Popup: core.inherits(
                ui.Control,
                {
                    $cache: function (style) {
                        ui.Control.prototype.$cache.call(this, style);
                        this.getParent()._uYear.cache();
                        this.getParent()._uMonth.cache();
                        this.getParent()._uDate.cache();
                    }
                }
            ),
            Options: core.inherits(
                ui.Control,
                'ui-mobile-calendar-options',
                function (el, options) {
                    ui.Control.call(this, el, options);

                    var values = options.values;

                    if ('string' === typeof values) {
                        values = values.split(/[\-,]/);
                    }
                    values[0] = +values[0];
                    values[1] = +values[1];
                    if (values[2]) {
                        values[2] = +values[2];
                    } else {
                        values[2] = 1;
                    }
                    for (var i = values[0], ret = [];; i += values[2]) {
                        ret.push('<div class="' + options.classes.join('-item ') + 'ui-item">' + (options.format ? util.stringFormat(options.format, i) : i) + '</div>');
                        if (i === values[1]) {
                            break;
                        }
                    }
                    this.setContent(ret.join(''));

                    this._aItems = [];
                    dom.children(el).forEach(function (item) {
                        this._aItems.push(core.$fastCreate(this.Item, item, this));
                    }, this);

                    this.setOptionSize(3);
                },
                {
                    Item: core.inherits(
                        ui.Control,
                        {
                            $focus: function (event) {
                                ui.Control.prototype.$focus.call(this, event);
                                var parent = this.getParent();
                                if (parent._cSelect) {
                                    parent._cSelect.alterClass('-selected');
                                }
                                this.alterClass('+selected');
                                parent._cSelect = this;
                            }
                        }
                    )
                },
                ui.MScroll,
                ui.MOptions,
                {
                    $dragend: function (event) {
                        ui.MScroll.Methods.$dragend.call(this, event);
                        core.dispatchEvent(this.getParent(), 'change');
                    },
                    getValue: function () {
                        /\d+/.test(this._aItems[Math.floor(-this.getY() / this.$$itemHeight) + 3].getContent());
                        return +RegExp.lastMatch;
                    }
                }
            ),
            $confirm: function () {
                this.setValue(this._uYear.getValue() + '-' + this._uMonth.getValue() + '-' + this._uDate.getValue());
            },
            $change: function () {
                var days = new Date(this._uYear.getValue(), this._uMonth.getValue(), 0).getDate();
                if (this._uDate.getValue() > days) {
                    this._uDate.getBody().style.top = (4 - days) * this._uDate.$$itemHeight + 'px';
                }
                for (var day = 28; day <= 31; day++) {
                    this._uDate._aItems[day - 1][day <= days ? 'show' : 'hide']();
                }
                this._uDate.$alterItems();
            }
        },
        ui.MPopup
    );
}());

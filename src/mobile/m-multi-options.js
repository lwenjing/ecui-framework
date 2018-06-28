//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    ui.MMultiOptions = core.inherits(
        ui.InputControl,
        function (el, options) {
            util.setDefault(options, 'enter', 'bottom');
            util.setDefault(options, 'mask', '0.5');

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
        },
        {
            Popup: core.inherits(
                ui.Control,
                {
                    $cache: function (style) {
                        ui.Control.prototype.$cache.call(this, style);
                        this.getParent()._aOptions.forEach(function (item) {
                            item.cache();
                        });
                    }
                }
            ),
            Options: core.inherits(
                ui.Control,
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
                        ret.push('<div ui="value:' + i + '" class="' + options.classes.join('-item ') + 'ui-item">' + (options.format ? util.stringFormat(options.format, i) : i) + '</div>');
                        if (i === values[1]) {
                            break;
                        }
                    }
                    this.setContent(ret.join(''));

                    this._aItems = [];
                    dom.children(el).forEach(function (item) {
                        this._aItems.push(core.$fastCreate(this.Item, item, this, core.getOptions(item)));
                    }, this);

                    this.setOptionSize(3);
                },
                {
                    Item: core.inherits(
                        ui.Control,
                        function (el, options) {
                            ui.Control.call(this, el, options);
                            this._sValue = options.value || this.getContent();
                        },
                        {
                            $focus: function (event) {
                                ui.Control.prototype.$focus.call(this, event);
                                this.getParent().setSelected(this);
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
                        return this._cSelect ? this._cSelect._sValue : '';
                    },
                    setSelected: function (item) {
                        item = item || null;
                        if (this._cSelect !== item) {
                            if (this._cSelect) {
                                this._cSelect.alterClass('-selected');
                            }
                            if (item) {
                                item.alterClass('+selected');
                            }
                            this._cSelect = item;
                        }
                    },
                    setValue: function (value) {
                        value = String(value);
                        for (var i = 0, item; item = this._aItems[i]; i++) {
                            if (item._sValue === value) {
                                this.getBody().style.top = (3 - i) * this.$$itemHeight + 'px';
                                this.setSelected(item);
                                break;
                            }
                        }
                    }
                }
            )
        },
        {
            getOptions: function (index) {
                return this._aOptions[index];
            }
        },
        ui.MPopup
    );
//{if 0}//
}());
//{/if}//

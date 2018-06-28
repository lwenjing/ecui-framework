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
                    className: this.Popup.CLASS + 'ui-popup ui-hide',
                    innerHTML: '<div class="' + this.Options.CLASS + '"></div><div class="' + this.Options.CLASS + '"></div><div class="' + this.Options.CLASS + '"></div>'
                }),
                list = dom.children(popupEl);

            ui.InputControl.call(this, el, options);

            this.setPopup(core.$fastCreate(this.Popup, popupEl, this));

            this._uYear = core.$fastCreate(this.Options, list[0], this, {values: [2000, 2040]});
            this._uMonth = core.$fastCreate(this.Options, list[1], this, {values: [1, 12]});
            this._uDate = core.$fastCreate(this.Options, list[2], this, {values: [1, 31]});
        },
        {
            Popup: core.inherits(
                ui.Control
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
                        ret.push('<div class="' + options.classes.join('-item') + '">' + i + '</div>');
                        if (i === values[1]) {
                            break;
                        }
                    }
                    this.setContent(ret.join(''));

                    this._aItems = [];
                    dom.children(el).forEach(function (item) {
                        this._aItems.push(core.$fastCreate(ui.Item, item, this));
                    }, this);

                    this.setOptionSize(3);
                },
                ui.MScroll,
                ui.MOptions,
                {
                    $dragend: function (event) {
                        ui.MOptions.Methods.$dragend.call(this, event);
                        var parent = this.getParent();
                        if (this === parent._uYear || this === parent._uMonth) {
                            var year = parent._uYear.getValue(),
                                month = parent._uMonth.getValue();
                            if (year && month) {
                                var days = new Date(year, month, 0).getDate(),
                                    oldDays = parent._uDate.getLength();

                                if (days < oldDays) {
                                    if (parent._uDate.getValue() > days) {
                                        parent._uDate.setValue(days);
                                    }
                                    for (; days < oldDays; days++) {
                                        parent._uDate._aItems[days].hide();
                                    }
                                } else if (days > oldDays) {
                                    for (; oldDays < days; oldDays++) {
                                        parent._uDate._aItems[oldDays].show();
                                    }
                                }
                                parent._uDate.$alterItems();
                            }
                        }
                    }
                }
            ),
            getValue: function () {
                var year = this._uYear.getValue(),
                    month = this._uMonth.getValue(),
                    date = this._uDate.getValue();
                return year && month && date ? new Date(year, month - 1, date) : null;
            }
        },
        ui.MPopup
    );
}());

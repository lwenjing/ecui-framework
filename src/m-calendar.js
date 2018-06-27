(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    ui.MCalendar = core.inherits(
        ui.Control,
        'ui-mobile-calendar',
        function (el, options) {
            el.innerHTML = '<div class="' + ui.MOptions.CLASS + 'ui-mobile-calender-year"></div><div class="' + ui.MOptions.CLASS + 'ui-mobile-calender-month"></div><div class="' + ui.MOptions.CLASS + 'ui-mobile-calender-date"></div>';
            ui.Control.call(this, el, options);
            var list = dom.children(el);
            this._uYear = core.$fastCreate(this.Options, list[0], this, {values: [2000, 2040], optionSize: 7});
            this._uMonth = core.$fastCreate(this.Options, list[1], this, {values: [1, 12], optionSize: 7});
            this._uDate = core.$fastCreate(this.Options, list[2], this, {values: [1, 31], optionSize: 7});
            this._aItems = this._uDate.getItems();
        },
        {
            Options: core.inherits(
                ui.MOptions,
                {
                    $dragend: function (event) {
                        ui.MOptions.prototype.$dragend.call(this, event);
                        var parent = this.getParent();
                        if (this === parent._uYear || this === parent._uMonth) {
                            var year = parent._uYear.getValue(),
                                month = parent._uMonth.getValue();
                            if (year && month) {
                                parent._uDate.preventAlterItems();
                                var days = new Date(year, month, 0).getDate(),
                                    oldDays = parent._uDate.getLength();

                                if (days < oldDays) {
                                    if (parent._uDate.getValue() > days) {
                                        parent._uDate.setValue(days);
                                    }
                                    for (; days < oldDays; days++) {
                                        parent._uDate.remove(parent._aItems[days]);
                                    }
                                } else if (days > oldDays) {
                                    for (; oldDays < days; oldDays++) {
                                        parent._uDate.add(parent._aItems[oldDays]);
                                    }
                                }
                                parent._uDate.premitAlterItems();
                                parent._uDate.alterItems();
                            }
                        }
                    }
                }
            ),
            $cache: function (style, cacheSize) {
                ui.Control.prototype.$cache.call(this, style, cacheSize);
                this._uYear.cache(true, true);
                this._uMonth.cache(true, true);
                this._uDate.cache(true, true);
            },
            getValue: function () {
                var year = this._uYear.getValue(),
                    month = this._uMonth.getValue(),
                    date = this._uDate.getValue();
                return year && month && date ? new Date(year, month - 1, date) : null;
            }
        }
    );
}());

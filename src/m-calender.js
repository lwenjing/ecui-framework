(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    ui.MCalender = core.inherits(
        ui.Control,
        'ui-mobile-calender',
        function (el, options) {
            el.innerHTML = '<div class="' + ui.MScroll.CLASS + 'ui-mobile-calender-year"></div><div class="' + ui.MScroll.CLASS + 'ui-mobile-calender-month"></div><div class="' + ui.MScroll.CLASS + 'ui-mobile-calender-date"></div>';
            ui.Control.call(this, el, options);
            var list = dom.children(el);
            this._uYear = core.$fastCreate(this.Scroll, list[0], this, {values: [2000, 2040], optionSize: 7});
            this._uMonth = core.$fastCreate(this.Scroll, list[1], this, {values: [1, 12], optionSize: 7});
            this._uDate = core.$fastCreate(this.Scroll, list[2], this, {values: [1, 31], optionSize: 7});
        },
        {
            Scroll: core.inherits(
                ui.MScroll,
                {
                    $change: function (event) {
                        ui.MScroll.prototype.$change.call(this, event);
                        var parent = this.getParent();
                        if (this === parent._uYear || this === parent._uMonth) {
                            var year = parent._uYear.getValue(),
                                month = parent._uMonth.getValue();
                            if (year && month) {
                                var date = new Date(year, month, 0);
                                
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
            },
            init: function (options) {
                ui.Control.prototype.init.call(this, options);
                this._uYear.init(options);
                this._uMonth.init(options);
                this._uDate.init(options);
            }
        }
    );
}());

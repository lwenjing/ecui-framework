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
            this._uYear = core.$fastCreate(ui.MScroll, list[0], this, {values: [2000, 2040], optionSize: 7});
            this._uMonth = core.$fastCreate(ui.MScroll, list[1], this, {values: [1, 12], optionSize: 7});
            this._uDate = core.$fastCreate(ui.MScroll, list[2], this, {values: [1, 31], optionSize: 7});
        },
        {
            $cache: function (style, cacheSize) {
                ui.Control.prototype.$cache.call(this, style, cacheSize);
                this._uYear.cache(false, true);
                this._uMonth.cache(false, true);
                this._uDate.cache(false, true);
            },
            getValue: function () {

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

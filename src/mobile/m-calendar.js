//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui;
//{/if}//
    ui.MCalendar = core.inherits(
        ui.MMultiOptions,
        'ui-mobile-calendar',
        function (el, options) {
            ui.MMultiOptions.call(this, el, options);

            this._uYear = this.getOptions(0);
            this._uMonth = this.getOptions(1);
            this._uDate = this.getOptions(2);
        },
        {
            $change: function () {
                var days = new Date(+this._uYear.getValue(), +this._uMonth.getValue(), 0).getDate();
                if (this._uDate.getValue() > days) {
                    this._uDate.setValue(days);
                }
                for (var day = 28; day <= 31; day++) {
                    this._uDate._aItems[day - 1][day <= days ? 'show' : 'hide']();
                }
                this._uDate.$alterItems();
            },

            $click: function (event) {
                ui.MMultiOptions.prototype.$click.call(this, event);
                var value = this.getValue();
                if (value) {
                    value = value.split('-');
                    this._uYear.setValue(value[0]);
                    this._uMonth.setValue(value[1]);
                    this._uDate.setValue(value[2]);
                } else {
                    value = new Date();
                    this._uYear.setValue(value.getFullYear());
                    this._uMonth.setValue(value.getMonth() + 1);
                    this._uDate.setValue(value.getDate());
                }
                core.dispatchEvent(this, 'change');
            },

            $confirm: function () {
                this.setValue(this._uYear.getValue() + '-' + this._uMonth.getValue() + '-' + this._uDate.getValue());
            }
        }
    );
//{if 0}//
}());
//{/if}//

/*
@example
<div ui="type:calendar-input"></div>
_bRequired  是否必填
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    var Calendar = core.inherits(
            ui.Calendar,
            {
                /**
                 * @override
                 */
                $dateclick: function (event) {
                    ui.Calendar.prototype.$dateclick.call(this, event);
                    var parent = this.getParent();
                    parent.setValue(event.date.getFullYear() + '-' + (event.date.getMonth() + 1) + '-' + event.date.getDate());
                    core.triggerEvent(parent, 'input', event);
                    this.hide();
                },

                /**
                 * @override
                 */
                $hide: function (event) {
                    ui.Calendar.prototype.$hide.call(this, event);
                    this.$setParent();
                },

                /**
                 * @override
                 */
                $show: function (event) {
                    ui.Calendar.prototype.$show.call(this, event);
                    this.$setParent(ui.Popup.getOwner());
                    this.setDate(this.getParent().getDate());
                }
            }
        );

    /**
     * 日历输入框控件。
     * 提供日期的选择输入功能，所有的日历输入框控件共享一个日历选择弹层。
     * @control
     */
    ui.CalendarInput = core.inherits(
        ui.Text,
        'ui-calendar-input',
        function (el, options) {
            ui.InputControl.call(this, el, options);
              this._bRequired = !!options.required;
            this.getInput().readOnly = true;
            this.setPopup(core.getSingleton(Calendar, dom.create({className: Calendar.CLASS + 'ui-popup ui-hide'})));
        },
        {
            /**
             * 获取日期对象。
             * @public
             *
             * @return {Date} 控件对象
             */
            getDate: function () {
                var list = this.getValue().split('-');
                return list.length < 3 ? undefined : new Date(+list[0], +list[1] - 1, +list[2]);
            },
            $validate: function () {
                ui.InputControl.prototype.$validate.call(this);
                if (this.getValue() === '' &&  this._bRequired) {
                    core.triggerEvent(this, 'error');
                    return false;
                }
            },
        },
        ui.Popup
    );
}());

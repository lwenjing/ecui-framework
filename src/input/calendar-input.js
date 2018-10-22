/*
@example
<div ui="type:calendar-input"></div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        util = core.util,
        ui = core.ui;
//{/if}//
    var Calendar = core.inherits(
            ui.Calendar,
            true,
            function (el, options) {
                dom.addClass(el, 'ui-popup ui-hide');
                ui.Calendar.call(this, el, options);
            },
            {
                /**
                 * @override
                 */
                $dateclick: function (event) {
                    ui.Calendar.prototype.$dateclick.call(this, event);
                    var parent = this.getParent();
                    parent.setValue(event.date);
                    core.dispatchEvent(parent, 'input', event);
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
            ui.Text.call(this, el, options);
            this.getInput().readOnly = true;
            this.setPopup(core.getSingleton(Calendar));
        },
        {
            /**
             * @override
             */
            $blur: function (event) {
                ui.Text.prototype.$blur.call(this, event);
                this.getPopup().hide();
            },

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

            /**
             * @override
             */
            setValue: function (value) {
                if ('number' === typeof value) {
                    value = new Date(value);
                }
                if (value instanceof Date) {
                    value = value.getFullYear() + '-' + ('0' + (value.getMonth() + 1)).slice(-2) + '-' + ('0' + value.getDate()).slice(-2);
                }
                ui.Text.prototype.setValue.call(this, value);
            }
        },
        ui.Popup
    );

    /**
     * 年月视图控件。
     * @control
     */
    ui.Month = core.inherits(
        ui.Control,
        'ui-month-view',
        function (el, options) {
            dom.addClass(el, 'ui-popup ui-calendar ui-hide');
            el.innerHTML = util.stringFormat(
                '<table><thead>{1}</thead><tbody>{0}{0}{0}</tbody></table>',
                util.stringFormat(
                    '<tr>{0}{0}{0}{0}</tr>',
                    '<td class="' + options.classes.join('-date ') + '"></td>'
                ),
                util.stringFormat(
                    '<tr>{0}{0}{0}{0}</tr>',
                    '<td class="' + options.classes.join('-title ') + '"></td>'
                )
            );

            ui.Control.call(this, el, options);

            this._aCells = Array.prototype.slice.call(el.getElementsByTagName('TD')).map(function (item, index) {
                return core.$fastCreate(index < 4 ? ui.Control : this.Month, item, this, { value: index - 4 });
            }, this);

            this.MONTHS.forEach(function (item, index) {
                this._aCells[index + 4].getBody().innerHTML = item;
            }, this);

            // 生成日历控件结构
            dom.insertHTML(
                el,
                'AFTERBEGIN',
                '<div class="' + options.classes.join('-header ') + '"><div class="' +
                    options.classes.join('-title ') + '"></div><div class="' +
                    options.classes.join('-prev-year ') + ui.Button.CLASS + '">&lt;&lt;</div><div class="' +
                    options.classes.join('-next-year ') + ui.Button.CLASS + '">&gt;&gt;</div></div>'
            );
            // 获取el所有直属节点
            var headers = dom.children(el.firstChild);
            // 定义头部展示区
            this._eTitle = headers[0];
            core.$fastCreate(this.Button, headers[1], this, {move: -1});
            core.$fastCreate(this.Button, headers[2], this, {move: 1});

            this._oDate = new Date();
            this._nYear = this._oDate.getFullYear();
        },
        {
            /**
             * 控件头部展示格式。
             */
            TITLEFORMAT: '{0}年',
            MONTHS: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],

            /**
             * 日期部件。
             * @unit
             */
            Month: core.inherits(
                ui.Control,
                function (el, options) {
                    ui.Control.call(this, el, options);
                    this._sValue = +options.value;
                },
                {
                    /**
                     * 点击时，根据单元格类型触发相应的事件。
                     * @override
                     */
                    $click: function (event) {
                        var parent = this.getParent();

                        parent._nMonth = this._sValue;
                        parent._oDate = new Date(parent._nYear, parent._nMonth);
                        event.date = parent._oDate;
                        core.dispatchEvent(parent, 'change', event);
                    }
                }
            ),

            /**
             * 日历前进后退部件。
             * options 属性：
             * move    前进后退月份的偏移值，需要改变一年设置为12
             * @unit
             */
            Button: core.inherits(
                ui.Button,
                function (el, options) {
                    ui.Button.call(this, el, options);
                    this._nMove = options.move;
                },
                {
                    /**
                     * @override
                     */
                    $click: function (event) {
                        ui.Button.prototype.$click.call(this, event);
                        this.getParent().move(this._nMove);
                    }
                }
            ),

            /**
             * @override
             */
            $change: function (event) {
                core.dispatchEvent(this.getParent(), 'input', event);
                this.getParent().setValue(this._oDate);
                this.hide();
            },

            /**
             * 日历显示移动指定的月份数。
             * 参数为正整数则表示向当前月份之后的月份移动，负数则表示向当前月份之前的月份移动，设置后日历控件会刷新以显示新的日期。
             * @public
             *
             * @param {number} offsetMonth 日历移动的月份数
             */
            move: function (move) {
                this._nYear += move;
                this.setTitle();
            },

            /**
             * 日期点击事件。
             * event 属性
             * date  点击的日期
             * @event
             */
            $dateclick: util.blank,

            /**
             * @override
             */
            $ready: function (event) {
                ui.Control.prototype.$ready.call(this, event);
                this.setTitle();
            },
            setTitle: function () {
                this._eTitle.innerHTML = util.stringFormat(this.TITLEFORMAT, this._nYear);
            },

            /**
             * 获取全部的日期对象。
             * @public
             *
             * @return {Array} 日期对象列表
             */
            getDays: function () {
                return this._aCells.slice(4);
            },

            /**
             * 获取当前选择的日期。
             * @public
             *
             * @return {Date} 日期对象
             */
            getDate: function () {
                return this._oDate;
            },

            /**
             * 获取日历控件当前显示的月份。
             * @public
             *
             * @return {number} 月份(1-12)
             */
            getMonth: function () {
                return this._nMonth + 1;
            },

            /**
             * 获取日历控件当前显示的年份。
             * @public
             *
             * @return {number} 年份(19xx-20xx)
             */
            getYear: function () {
                return this._nYear;
            },

            /**
             * 设置当前选择的日期，并切换到对应的月份。
             * @public
             *
             * @param {Date} date 日期
             */
            setDate: function (date) {
                this._oDate = date ? new Date(date.getTime()) : undefined;
                date = date || new Date();
                this._nYear = date.getFullYear();
                this._nMonth = date.getMonth();
                this.setTitle();
            },

            /**
             * @override
             */
            $hide: function (event) {
                ui.Control.prototype.$hide.call(this, event);
                this.$setParent();
            },

            /**
             * @override
             */
            $show: function (event) {
                ui.Control.prototype.$show.call(this, event);
                this.$setParent(ui.Popup.getOwner());
            }
        }
    );
    ui.MonthInput = core.inherits(
        ui.Text,
        'ui-calendar-input',
        function (el, options) {
            ui.Text.call(this, el, options);
            this.getInput().readOnly = true;
            this.setPopup(core.getSingleton(ui.Month));
        },
        {
            /**
             * @override
             */
            $blur: function (event) {
                ui.Text.prototype.$blur.call(this, event);
                this.getPopup().hide();
            },

            /**
             * 获取日期对象。
             * @public
             *
             * @return {Date} 控件对象
             */
            getDate: function () {
                var list = this.getValue().split('-');
                return list.length < 2 ? undefined : new Date(+list[0], +list[1] - 1);
            },

            /**
             * @override
             */
            setValue: function (value) {
                if ('number' === typeof value) {
                    value = new Date(value);
                }
                if (value instanceof Date) {
                    value = value.getFullYear() + '-' + ('0' + (value.getMonth() + 1)).slice(-2);
                }
                ui.Text.prototype.setValue.call(this, value);
            }
        },
        ui.Popup
    );
}());

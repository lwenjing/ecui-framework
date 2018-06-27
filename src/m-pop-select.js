/*
@example
<select ui="type:m-pop-select" name="sex">
    <option value="male" selected="selected">男</option>
    <option value="female">女</option>
</select>
或
<div ui="type:m-pop-select;name:sex;value:male">
    <div ui="value:male">男</div>
    <div ui="value:female">女</div>
</div>

@fields
_cSelected    - 当前选中的选项
_uText        - 下拉框的文本框
_uOptions     - 下拉选择框
_bRequired    - 是否必须选择
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//

    /**
     * 下拉框控件。
     * 扩展了原生 SelectElement 的功能，允许指定下拉选项框的最大选项数量，在屏幕显示不下的时候，会自动显示在下拉框的上方。在没有选项时，下拉选项框有一个选项的高度。下拉框控件允许使用键盘与滚轮操作，在下拉选项框打开时，可以通过回车键或鼠标点击选择，上下键选择选项的当前条目，在关闭下拉选项框后，只要拥有焦点，就可以通过滚轮上下选择选项。
     * options 属性：
     * optionSize     下拉框最大允许显示的选项数量，默认为5
     * required       是否必须选择
     * @control
     */
    ui.MPopSelect = core.inherits(
        ui.$select,
        'ui-mobile-pop-select',
        function (el, options) {
            util.setDefault(options, 'enter', 'bottom');

            var values = options.values;

            if (values) {
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
                    ret.push('<div>' + i + '</div>');
                    if (i === values[1]) {
                        break;
                    }
                }
                this.setContent(ret.join(''));
            }

            ui.$select.call(this, el, options);

            this.$getSection('Options')._nRadius = Math.floor((options.optionSize || 5) / 2);
        },
        {
            /**
             * 选项框部件。
             * @unit
             */
            Options: core.inherits(
                ui.$select.prototype.Options,
                [
                    function (el, options) {
                        dom.insertBefore(dom.create({
                            className: options.classes.join('-mask ')
                        }), this.getBody());
                    }
                ],
                {
                    /**
                     * 选项控件发生变化的处理。
                     * @protected
                     */
                    $alterItems: function () {
                        var select = this.getParent(),
                            itemHeight = select.$$itemHeight,
                            top = this._nNormalTop = -itemHeight * (select.getLength() - this._nRadius - 1),
                            bottom = this._nNormalBottom = itemHeight * this._nRadius;

                        this.setScrollRange(
                            {
                                top: this._nMinTop = top - itemHeight * 2,
                                right: 0,
                                bottom: this._nMaxBottom = bottom + itemHeight * 2,
                                left: 0
                            }
                        );
                        this.setRange({
                            top: top,
                            bottom: bottom,
                            stepY: itemHeight
                        });
                    },

                    /**
                     * 拖拽的惯性时间计算。
                     * @protected
                     *
                     * @param {Object} speed 速度对象，x/y 值分别表示 x/y 方向上的速度分量
                     */
                    $draginertia: function (speed) {
                        speed = speed.y;
                        if (!speed) {
                            return 0;
                        }

                        var y = util.toNumber(this.getBody().style.top),
                            sy = speed * 0.5 / 2,  // 计划0.5秒动画结束
                            expectY = Math.round(y + sy),
                            itemHeight = this.getParent().$$itemHeight;

                        if (expectY < this._nNormalTop) {
                            expectY = Math.max(this._nMinTop, expectY);
                        } else if (expectY > this._nNormalBottom) {
                            expectY = Math.min(this._nMaxBottom, expectY);
                        } else {
                            expectY = Math.round(expectY / itemHeight) * itemHeight;
                        }
                        //计算实际结束时间
                        return (expectY - y) * 2 / speed;
                    },

                    /**
                     * @override
                     */
                    $dragmove: function (event) {
                        ui.$select.prototype.Options.prototype.$dragmove.call(this, event);
                        var select = this.getParent();
                        core.setFocused(select.getItem(Math.round(-event.y / select.$$itemHeight) + this._nRadius));
                    },

                    /**
                     * @override
                     */
                    $show: function (width, height) {
                        ui.$select.prototype.Options.prototype.$show.call(this, width, height);
                        height = this.getParent().$$itemHeight * (this._nRadius * 2 + 1);
                        this.getMain().style.height = height + 'px';
                        this.$$height = height;
                        var select = this.getParent();
                        this.getBody().style.top = (this._nNormalBottom - select.$$itemHeight * select.getItems().indexOf(select.getSelected())) + 'px';
                    }
                },
                ui.MScroll
            ),

            /**
             * 选项部件。
             * @unit
             */
            Item: core.inherits(
                ui.$select.prototype.Item,
                {
                    $activate: function (event) {
                        ui.$select.prototype.Item.prototype.$activate.call(this, event);
                        core.dispatchEvent(this.getParent().$getSection('Options'), 'activate', event);
                    }
                }
            ),

            /**
             * @override
             */
            $cache: function (style, cacheSize) {
                ui.$select.prototype.$cache.call(this, style, cacheSize);
                this.$$itemHeight = util.toNumber(core.getCustomStyle(style, 'item-height'));
            }
        },
        ui.MPopup
    );
}());

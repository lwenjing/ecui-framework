/*
选项框操作集合。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    function getItems(options) {
        return dom.children(options.getBody()).map(function (item) {
            return item.getControl();
        }).filter(function (item) {
            return item.isShow();
        });
    }

    ui.MOptions = {
        NAME: '$MOptions',

        SUPER: ui.MScroll,

        constructor: function (el, options) {
            dom.addClass(el, 'ui-mobile-options');
            this.$MOptionsData.mask = dom.insertBefore(dom.create({
                className: options.classes.join('-mask ') + 'ui-mobile-options-mask'
            }), this.getBody());
        },

        Methods: {
            /**
             * 选项控件发生变化的处理。
             * @protected
             */
            $alterItems: function () {
                var top = -this.$$itemHeight * (getItems(this).length - this._nOptionSize - 1),
                    bottom = this.$$itemHeight * this._nOptionSize;

                this.setScrollRange(
                    {
                        top: top - this.$$itemHeight * 2,
                        right: 0,
                        bottom: bottom + this.$$itemHeight * 2,
                        left: 0
                    }
                );
                this.setRange({
                    top: top,
                    bottom: bottom,
                    stepY: this.$$itemHeight
                });
            },

            /**
             * @override
             */
            $cache: function (style) {
                this.$MOptions.$cache.call(this, style);
                this.$$itemHeight = util.toNumber(core.getCustomStyle(style, 'item-height'));
                this.$alterItems();
            },

            /**
             * 拖拽的惯性时间计算。
             * @protected
             *
             * @param {object} speed 速度对象，x/y 值分别表示 x/y 方向上的速度分量
             */
            $draginertia: function (speed) {
                speed = speed.y;
                if (!speed) {
                    return 0;
                }

                var y = util.toNumber(this.getBody().style.top),
                    sy = speed * 0.5 / 2,  // 计划0.5秒动画结束
                    expectY = Math.round(y + sy),
                    scrollRange = this.getScrollRange(),
                    range = this.getRange();

                if (expectY < range.top) {
                    expectY = Math.max(scrollRange.top, expectY);
                } else if (expectY > range.bottom) {
                    expectY = Math.min(scrollRange.bottom, expectY);
                } else {
                    expectY = Math.round(expectY / this.$$itemHeight) * this.$$itemHeight;
                }
                //计算实际结束时间
                return (expectY - y) * 2 / speed;
            },

            /**
             * @override
             */
            $dragmove: function (event) {
                this.$MOptions.$dragmove.call(this, event);
                this.setSelected(getItems(this)[Math.round(-event.y / this.$$itemHeight) + this._nOptionSize]);
            },

            /**
             * @override
             */
            $show: function () {
                this.$MOptions.$show.call(this);
                var height = this.$$itemHeight * (this._nOptionSize * 2 + 1);
                dom.parent(this.getBody()).style.height = height + 'px';
                this.$$height = height + this.getMinimumHeight();
            },

            /**
             * 获取被选中的选项控件。
             * @public
             *
             * @return {ecui.ui.Item} 选项控件
             */
            getSelected: function () {
                return this._cSelected || null;
            },

            /**
             * 设置下拉框允许显示的选项数量。
             * @public
             *
             * @param {number} value 显示的选项数量，必须大于 1
             */
            setOptionSize: function (value) {
                this._nOptionSize = value;
            },

            /**
             * @override
             */
            setPosition: function (x, y) {
                this.$MOptions.setPosition.call(this, x, y);
                this.$MOptionsData.mask.style.top = this.getMain().scrollTop + 'px';
            },

            /**
             * 设置选中控件。
             * @public
             *
             * @param {ecui.ui.MMultiOptions.Options.Item} item 选中的控件
             */
            setSelected: function (item) {
                item = item || null;
                if (this._cSelect !== item) {
                    if (this._cSelect) {
                        this._cSelect.alterStatus('-selected');
                    }
                    if (item) {
                        item.alterStatus('+selected');
                        core.setFocused(item);
                    } else {
                        core.setFocused(this);
                    }
                    this._cSelect = item;
                }
            }
        }
    };
}());

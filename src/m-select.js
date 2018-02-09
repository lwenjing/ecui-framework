(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    function setSelected(select, item) {
        if (select._cSelected !== item) {
            if (select._cSelected) {
                select._cSelected.alterClass('-selected');
                select._cSelected = null;
            }
            if (item) {
                item.alterClass('+selected');
                select._cSelected = item;
            }
        }
    }

    ui.MSelect = core.inherits(
        ui.MScroll,
        'ui-mobile-select',
        function (el, options) {
            ui.MScroll.constructor.call(this, el, options);

            var values = options.values;

            if (values) {
                if ('string' === typeof values) {
                    values = values.split(',');
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
            dom.insertBefore(dom.create({
                className: options.classes.join('-mask ')
            }), this.getBody());

            this._nRadius = Math.floor(options.optionSize / 2);
            this.$initItems();
        },
        {
            Item: core.inherits(
                ui.Item,
                'ui-mobile-select-item'
            ),
            $alterItems: function () {
                var top = this._nNormalTop = -this._nItemHeight * (this.getLength() - this._nRadius - 1),
                    bottom = this._nNormalBottom = this._nItemHeight * this._nRadius;

                this.setRange(
                    {
                        top: this._nMinTop = top - this._nItemHeight * 2,
                        right: 0,
                        bottom: this._nMaxBottom = bottom + this._nItemHeight * 2,
                        left: 0
                    },
                    [top, 0, bottom, 0, this._nItemHeight]
                );

                if (this._cSelected && !this._cSelected.getParent()) {
                    this.getBody().style.top = top + 'px';
                    setSelected(this, this.getItems().pop());
                }
            },
            $cache: function (style, cacheSize) {
                ui.MScroll.prototype.$cache.call(this, style, cacheSize);
                this._nItemHeight = this.getItem(0).getMain().offsetHeight;
            },
            $draginertia: function () {
                var speed = core.getYSpeed();
                if (!speed) {
                    return 0;
                }

                var y = util.toNumber(this.getBody().style.top),
                    sy = speed * 0.5 / 2,  // 计划0.5秒动画结束
                    expectY = Math.round(y + sy);

                if (expectY < this._nNormalTop) {
                    expectY = Math.max(this._nMinTop, expectY);
                } else if (expectY > this._nNormalBottom) {
                    expectY = Math.min(this._nMaxBottom, expectY);
                } else {
                    expectY = Math.round(expectY / this._nItemHeight) * this._nItemHeight;
                }
                //计算实际结束时间
                return (expectY - y) * 2 / speed;
            },
            $dragmove: function (event) {
                ui.MScroll.prototype.$dragmove.call(this, event);
                setSelected(this, this.getItem(Math.round(-event.y / this._nItemHeight) + this._nRadius));
            },
            $initStructure: function (width, height) {
                height = this._nItemHeight * (this._nRadius * 2 + 1);
                this.getMain().style.height = height + 'px';
                ui.MScroll.prototype.$initStructure.call(this, width, height);
            },
            $ready: function (event) {
                ui.MScroll.prototype.$ready.call(this, event);
                this.setValue(event.options.value);
            },
            $resize: function () {
                ui.MScroll.prototype.$resize.call(this);
                this.getMain().style.height = '';
            },
            getValue: function () {
                return this._cSelected ? this._cSelected.getContent() : null;
            },
            setValue: function (value) {
                if (value !== undefined) {
                    value = String(value);
                    for (var i = 0, items = this.getItems(); i < items.length; i++) {
                        if (items[i].getContent() === value) {
                            setSelected(this, items[i]);
                            this.getBody().style.top = this._nNormalBottom - this._nItemHeight * i;
                            return;
                        }
                    }
                }
                setSelected(this, null);
                this.getBody().style.top = (this._nNormalBottom + this._nItemHeight) + 'px';
            }
        },
        ui.Items
    );
}());

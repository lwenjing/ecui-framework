/*
移动端弹出操作集合，提供了从4个不同的方向飞入界面指定位置的操作，弹出层控件支持 enter 与 scale 初始化选项。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    var namedMap = {},
        position = {
            top: [-1, 0],
            bottom: [1, 0],
            left: [0, -1],
            right: [0, 1]
        };

    ui.MPopup = {
        NAME: '$MPopup',

        constructor: function (el, options) {
            var data = namedMap[this.getUID()] = position[options.enter || 'right'] || position.right,
                scale = options.scale;
            data[2] = scale ? Math.max(0, 1 - (scale.indexOf('%') > 0 ? +scale.slice(0, -1) / 100 : +scale)) : 0;

            if (!this.constructor.POPUP) {
                this.constructor.POPUP = core.$fastCreate(
                    ui.Control,
                    document.body.appendChild(
                        dom.create(
                            {
                                className: 'ui-mobile-popup ui-hide',
                            }
                        )
                    )
                );
            }
        },

        Methods: {
            /**
             * @override
             */
            $cache: function (style, cacheSize) {
                this.$MPopup.$cache.call(this, style, cacheSize);
                if (this.constructor.POPUP) {
                    this.constructor.POPUP.cache(true, true);
                }
            },

            /**
             * @override
             */
            $click: function (event) {
                this.$MPopup.$click.call(this, event);

                var view = util.getView(),
                    data = namedMap[this.getUID()],
                    popup = this.constructor.POPUP,
                    el = popup.getOuter(),
                    style = el.style,
                    width = view.width * data[1],
                    height = view.height * data[0];

                style.top = (document.body.scrollTop + height) + 'px';
                style.left = (document.body.scrollLeft + width) + 'px';
                popup.setSize(view.width, view.height);

                ecui.effect.grade('round:this.style.left->' + (document.body.scrollLeft + width * data[2]) + ';round:this.style.top->' + (document.body.scrollTop + height * data[2]), 1000, {$: el});

                if (!dom.getParent(el)) {
                    // 第一次显示时需要进行下拉选项部分的初始化，将其挂载到 DOM 树中
                    document.body.appendChild(el);
                    popup.cache(true, true);
                }

                popup.show();
            },

            /**
             * @override
             */
            $dispose: function () {
                delete namedMap[this.getUID()];
                this.$MPopup.$dispose.call(this);
            },

            /**
             * @override
             */
            $repaint: function (event) {
                this.$MPopup.$repaint.call(this, event);
                if (this.constructor.POPUP.isShow()) {
                    var view = util.getView();
                    this.constructor.POPUP.setSize(view.width, view.height);
                }
            }
        }
    };
}());

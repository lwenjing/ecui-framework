/*
Popup - 定义弹出层相关的基本操作。
弹出操作集合，提供了基本的点击显示/关闭操作，通过将 ecui.ui.Popup 对象下的方法复制到类的 prototype 属性下继承接口，最终对象要正常使用需要通过 setPopup 方法设置自己关联的弹出层。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    var namedMap = {};

    ui.Popup = {
        '': '$Popup',

        /**
         * @override
         */
        $click: function (event) {
            this.$Popup.$click.call(this, event);
            var popup = namedMap[this.getUID()];
            if (event.getControl() === this) {
                if (popup.isShow()) {
                    popup.hide();
                } else {
                    var el = popup.getOuter();
                    if (!dom.getParent(el)) {
                        // 第一次显示时需要进行下拉选项部分的初始化，将其挂载到 DOM 树中
                        document.body.appendChild(el);
                        this.cache(false, true);
                        if (this.$initPopup) {
                            this.$initPopup();
                        }
                    }

                    popup.show();
                }
            }
        },

        /**
         * @override
         */
        $dispose: function () {
            var popup = namedMap[this.getUID()],
                el = popup.getOuter();
            if (el) {
                popup.hide();
                dom.remove(el);
            }
            delete namedMap[this.getUID()];
            this.$Popup.$dispose.call(this);
        },

        /**
         * @override
         */
        $repaint: function (event) {
            this.$Popup.$repaint.call(this, event);
            if (namedMap[this.getUID()].isShow()) {
                this.setPopupPosition();
            }
        },

        /**
         * @override
         */
        $scroll: function (event) {
            this.$Popup.$scroll.call(this, event);

            var popup = namedMap[this.getUID()];
            if (event.getNative().type === 'mousedown' && !dom.contain(popup.getOuter(), event.target)) {
                // ie6/7/8下有可能scroll事件是由mousedown点击滚动条触发的
                popup.hide();
            }
        },

        /**
         * 设置控件的弹出层。
         * @public
         *
         * @param {ecui.ui.Control} control
         */
        setPopup: function (control) {
            namedMap[this.getUID()] = control;
        },

        /**
         * 设置控件的弹出层显示的位置。
         * @public
         */
        setPopupPosition: function () {
            var pos = dom.getPosition(this.getOuter()),
                popup = namedMap[this.getUID()],
                popupTop = pos.top + this.getHeight(),
                popupHeight = popup.getHeight();

            // 如果浏览器下部高度不够，将显示在控件的上部
            popup.setPosition(pos.left, popupTop + popupHeight <= util.getView().bottom ? popupTop : pos.top - popupHeight);
        }
    };
}());

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
    /**
     * 设置控件的弹出层显示的位置。
     * @public
     */
    function setPopupPosition() {
        this.cache(true);

        var pos = dom.getPosition(owner.getOuter()),
            popupTop = pos.top + owner.getHeight(),
            popupHeight = this.getHeight(),
            view = util.getView();

        // 如果浏览器下部高度不够，将显示在控件的上部
        this.setPosition(pos.left, popupTop + popupHeight <= view.bottom ? popupTop : Math.max(pos.top - popupHeight, view.top));
    }

    var namedMap = {},
        owner;

    ui.Popup = {
        NAME: '$Popup',

        getOwner: function () {
            return owner;
        },

        Methods: {
            /**
             * 下拉框控件失去激活时，隐藏弹层。
             * @override
             */
            $blur: function (event) {
                this.$Popup.$blur.call(this, event);
                namedMap[this.getUID()].hide();
            },

            /**
             * @override
             */
            $cache: function (style, cacheSize) {
                this.$Popup.$cache.call(this, style, cacheSize);
                var popup = namedMap[this.getUID()];
                if (dom.getParent(popup.getOuter())) {
                    popup.cache(true, true);
                }
            },

            /**
             * @override
             */
            $click: function (event) {
                this.$Popup.$click.call(this, event);
                var popup = namedMap[this.getUID()];
                if (event.getControl() === this) {
                    owner = this;

                    if (popup.isShow()) {
                        popup.hide();
                    } else {
                        var el = popup.getOuter();
                        if (!dom.getParent(el)) {
                            // 第一次显示时需要进行下拉选项部分的初始化，将其挂载到 DOM 树中
                            document.body.appendChild(el);
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
                var el = namedMap[this.getUID()].getMain();
                if (el) {
                    dom.remove(el);
                }
                this.setPopup();
                this.$Popup.$dispose.call(this);
            },

            /**
             * @override
             */
            $repaint: function (event) {
                this.$Popup.$repaint.call(this, event);

                var popup = namedMap[this.getUID()];
                if (popup.isShow()) {
                    setPopupPosition.call(popup);
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
                var popup = namedMap[this.getUID()];
                if (popup) {
                    core.removeEventListener(popup, 'show', setPopupPosition);
                    delete namedMap[this.getUID()];
                }
                if (control) {
                    core.addEventListener(control, 'show', setPopupPosition);
                    namedMap[this.getUID()] = control;
                }
            }
        }
    };
}());

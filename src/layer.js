/*
@example
<div ui="type:dialog">
  <!-- 这里放滚动的内容 -->
  ...
</div>

@fields
_bModal      - 是否使用showModal激活
_uTitle     - 标题栏
_uClose     - 关闭按钮
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    var dialogs = [],    // 当前显示的全部窗体
        modalCount = 0;  // 当前showModal的窗体数

    /**
     * 刷新所有显示的窗体的zIndex属性。
     * @private
     *
     * @param {ecui.ui.Dialog} dialog 窗体控件
     */
    function refresh(dialog) {
        util.remove(dialogs, dialog);
        dialogs.push(dialog);

        // 改变当前窗体之后的全部窗体z轴位置，将当前窗体置顶
        var num = dialogs.length - modalCount;
        dialogs.forEach(function (item, index) {
            item.getOuter().style.zIndex = index >= num ? 32769 + (index - num) * 2 : 4095 + index;
        });
    }

    /**
     * 窗体控件。
     * 定义独立于文档布局的内容区域，如果在其中包含 iframe 标签，在当前页面打开一个新的页面，可以仿真浏览器的多窗体效果，避免了使用 window.open 在不同浏览器下的兼容性问题。多个窗体控件同时工作时，当前激活的窗体在最上层。窗体控件的标题栏默认可以拖拽，窗体可以设置置顶方式显示，在置顶模式下，只有当前窗体可以响应操作。窗体控件的 z-index 从4096开始，页面开发请不要使用大于或等于4096的 z-index 值。
     * @control
     */
    ui.Layer = core.inherits(
        ui.Control,
        'ui-layer',
        {
            /**
             * 销毁窗体时需要先关闭窗体，并不再保留窗体的索引。
             * @override
             */
            $dispose: function () {
                if (dialogs.indexOf(this) >= 0) {
                    // 窗口处于显示状态，需要强制关闭
                    this.$hide();
                }
                ui.Control.prototype.$dispose.call(this);
            },

            /**
             * 窗体控件获得焦点时需要将自己置于所有窗体控件的顶部。
             * @override
             */
            $focus: function () {
                ui.Control.prototype.$focus.call(this);
                refresh(this);
            },

            /**
             * 窗体隐藏时将失去焦点状态，如果窗体是以 showModal 方式打开的，隐藏窗体时，需要恢复页面的状态。
             * @override
             */
            $hide: function () {
                // showModal模式下隐藏窗体需要释放遮罩层
                var i = dialogs.indexOf(this);
                if (i >= 0) {
                    dialogs.splice(i, 1);

                    if (i > dialogs.length - modalCount) {
                        if (this._bModal) {
                            if (i === dialogs.length) {
                                core.mask();
                            } else {
                                // 如果不是最后一个，将遮罩层标记后移
                                dialogs[i]._bModal = true;
                            }
                            this._bModal = false;
                        }
                        modalCount--;
                    }
                    core.loseFocus(this);
                }

                ui.Control.prototype.$hide.call(this);
            },

            /**
             * 窗体显示时将获得焦点状态。
             * @override
             */
            $show: function () {
                dialogs.push(this);
                ui.Control.prototype.$show.call(this);
                core.setFocused(this);
            },

            /**
             * 如果窗体是以 showModal 方式打开的，只有位于最顶层的窗体才允许关闭。
             * @override
             */
            hide: function () {
                for (var i = dialogs.indexOf(this), item; item = dialogs[++i]; ) {
                    if (item._bModal) {
                        return false;
                    }
                }
                return ui.Control.prototype.hide.call(this);
            },

            /**
             * showModal 时如果窗体不置顶都设置为不可用。
             * @override
             */
            isDisabled: function () {
                if (modalCount > 0) {
                    return dialogs[dialogs.length - 1] !== this;
                }
                return ui.Control.prototype.isDisabled.call(this);
            },

            /**
             * @override
             */
            setBodySize: function (width, height) {
                ui.Control.prototype.setBodySize.call(this, width, height + this._uTitle.getHeight());
            },

            /**
             * @override
             */
            show: function () {
                if (modalCount && dialogs.indexOf(this) < dialogs.length - modalCount) {
                    // 如果已经使用showModal，对原来不是showModal的窗体进行处理
                    modalCount++;
                }

                var result = ui.Control.prototype.show.call(this);
                if (!result) {
                    refresh(this);
                }
                return result;
            },
        }
    );
}());

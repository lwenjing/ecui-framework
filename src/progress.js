/*
Progress - 定义进度显示的基本操作。
进度条控件，继承自基础控件，面向用户显示一个任务执行的程度。

进度条控件直接HTML初始化的例子:
<div ui="type:progress;rate:0.5"></div>

属性
_eText - 内容区域
_eMask - 完成的进度比例内容区域
*/
//{if 0}//
(function () {
    var core = ecui,
        ui = core.ui;
//{/if}//
    function flush() {
        var rate = this._nValue / this._nMax;
        if (this._sText) {
            var text = this._sText.replace(/[*$#]/g, function (ch) {
                    return ch === '*' ? this._nMax : ch === '$' ? this._nValue : Math.round(rate * 100);
                });
            this._eText.innerHTML = this._eMask.innerHTML = text;
        }
        this._eMask.style.clip = 'rect(0px,' + (rate * this.getWidth()) + 'px,' + this.getHeight() + 'px,0px)';
    }

    /**
     * 初始化进度条控件。
     * options 对象支持的属性如下：
     * rate 初始的百分比
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Progress = core.inherits(
        ui.Control,
        'ui-progress',
        function (el, options) {
            ui.Control.call(this, el, options);

            this._sText = el.innerHTML.trim();
            el.innerHTML = '<div class="' + options.classes.join('-text ') + '"></div><div class="' + options.classes.join('-mask ') + '"></div>';

            this._eText = el.firstChild;
            this._eMask = el.lastChild;

            this._nMax = options.max || 100;
            this._nValue = options.value || 0;

            flush.call(this);
        },
        {
            /**
             * @override
             */
            $dispose: function () {
                this._eText = this._eMask = null;
                ui.Control.prototype.$dispose.call(this);
            },

            /**
             * 设置进度条的数值。
             * @public
             *
             * @param {number} value 进度条的数值
             */
            setValue: function (value) {
                this._nValue = Math.max(Math.max(0, value), this._nMax);
                flush.call(this);
            }
        }
    );
//{if 0}//
}());
//{/if}//

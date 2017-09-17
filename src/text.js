/*
Text - 定义文本输入数据的基本操作。
文本输入框控件，继承自输入框控件，允许对输入的数据内容格式进行限制。

文本输入框控件直接HTML初始化的例子:
<input ui="type:text" name="test" />
或:
<div ui="type:text;name:test;value:test">
    <!-- 如果ec中不指定name,value，也可以在input中指定 -->
    <input name="test" value="test" />
</div>

属性
_bTrim        - 字符串是否需要过滤两端空白
_nMinLength   - 允许提将近最小长度
_nMaxLength   - 允许提交的最大长度
_nMinValue    - 允许提交的最小值
_nMaxValue    - 允许提交的最大值
_oRegExp      - 允许提交的格式正则表达式
_ePlaceHolder - 为空时的提示信息标签
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    /**
     * 初始化格式化输入框控件。
     * options 对象支持的属性如下：
     * trim 是否进行前后空格过滤，默认为 true (注：粘贴内容也会进行前后空格过滤)
     * len [aaa,bbb]表示数字允许的最小(aaa)/最大(bbb)长度
     * num [aaa,bbb]表示数字允许的最小(aaa)/最大(bbb)值
     * regexp 正则表达式，自动在两端添加^与$
     *
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Text = core.inherits(
        ui.InputControl,
        'ui-text',
        function (el, options) {
            ui.InputControl.call(this, el, options);

            this._bTrim = options.trim !== false;
            if (options.len && options.len.charAt(0) === '[') {
                el = options.len.slice(1, -1).split(',');
                this._nMinLength = +el[0];
                this._nMaxLength = +el[1];
            }
            if (options.num && options.num.charAt(0) === '[') {
                el = options.num.slice(1, -1).split(',');
                this._nMinValue = +el[0];
                this._nMaxValue = +el[1];
            }
            if (options.regexp) {
                this._oRegExp = new RegExp('^' + options.regexp + '$');
            }

            if (ieVersion < 10) {
                el = this.getInput();
                options = dom.getAttribute(el, 'placeholder');
                if (options) {
                    this._ePlaceHolder = dom.insertBefore(
                        dom.create(
                            {
                                className: 'ui-placeholder',
                                innerHTML: options
                            }
                        ),
                        el
                    );
                }
            }
        },
        {
            /**
             * 控件失去焦点事件的默认处理。
             * 控件失去焦点时默认调用 $blur 方法，删除控件在 $focus 方法中添加的扩展样式 -focus。如果控件处于可操作状态(参见 isEnabled)，blur 方法触发 onblur 事件，如果事件返回值不为 false，则调用 $blur 方法。
             * @protected
             */
            $blur: function () {
                ui.InputControl.prototype.$blur.call(this);
                this.validate();
            },

            /**
             * @override
             */
            $cache: function (style, cacheSize) {
                ui.InputControl.prototype.$cache.call(this, style, cacheSize);
                if (this._ePlaceHolder) {
                    style = dom.getStyle(this._ePlaceHolder);
                    this.$$placeholder = [util.toNumber(style.paddingTop), util.toNumber(style.paddingRight), util.toNumber(style.paddingBottom), util.toNumber(style.paddingLeft)];
                }
            },

            /**
             * @override
             */
            $dispose: function () {
                this._ePlaceHolder = null;
                ui.InputControl.prototype.$dispose.call(this);
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.InputControl.prototype.$initStructure.call(this, width, height);
                var input = this.getInput();
                input.style.width = width + 'px';
                input.style.height = height + 'px';
                if (this._ePlaceHolder) {
                    this._ePlaceHolder.style.width = width - this.$$placeholder[1] - this.$$placeholder[3] + 'px';
                    this._ePlaceHolder.style.height = height - this.$$placeholder[0] - this.$$placeholder[2] + 'px';
                }
            },

            /**
             * 控件内容改变事件的默认处理。
             * @protected
             */
            $input: function () {
                ui.InputControl.prototype.$input.call(this);
                if (this._ePlaceHolder) {
                    this.alterClass(this.getValue() ? '-empty' : '+empty');
                }
            },

            /**
             * @override
             */
            $ready: function () {
                ui.InputControl.prototype.$ready.call(this);
                if (this._ePlaceHolder) {
                    this.alterClass(this.getValue() ? '-empty' : '+empty');
                }
            },

            /**
             * 输入框控件提交前的默认处理。
             * @protected
             *
             * @param {Event} event 事件对象
             */
            $submit: function (event) {
                ui.InputControl.prototype.$submit.call(this, event);
                if (!this.validate()) {
                    event.preventDefault();
                }
            },

            /**
             * 获取当前当前选区的结束位置。
             * @public
             *
             * @return {number} 输入框当前选区的结束位置
             */
            getSelectionEnd: ieVersion ? function () {
                var range = document.selection.createRange().duplicate();

                range.moveStart('character', -this._eInput.value.length);
                return range.text.length;
            } : function () {
                return this._eInput.selectionEnd;
            },

            /**
             * 获取当前选区的起始位置。
             * @public
             *
             * @return {number} 输入框当前选区的起始位置，即输入框当前光标的位置
             */
            getSelectionStart: ieVersion ? function () {
                var range = document.selection.createRange().duplicate(),
                    length = this._eInput.value.length;

                range.moveEnd('character', length);
                return length - range.text.length;
            } : function () {
                return this._eInput.selectionStart;
            },

            /**
             * 设置输入框光标的位置。
             * @public
             *
             * @param {number} pos 位置索引
             */
            setCaret: ieVersion ? function (pos) {
                var range = this._eInput.createTextRange();
                range.collapse();
                range.select();
                range.moveStart('character', pos);
                range.collapse();
                range.select();
            } : function (pos) {
                this._eInput.setSelectionRange(pos, pos);
            },

            /**
             * 检测输入框当前的值是否合法。
             * @public
             *
             * @return {boolean} 当前值是否合法
             */
            validate: function () {
                var err = {},
                    value = this.getValue(),
                    length = value.length,
                    result = true;

                value = +value;
                if (this.onvalidate && this.onvalidate(err)) {
                    result = false;
                }
                if (this._nMinLength > length) {
                    err.minLength = this._nMinLength;
                    result = false;
                }
                if (this._nMaxLength < length) {
                    err.maxLength = this._nMaxLength;
                    result = false;
                }
                if (this._nMinValue > value) {
                    err.minValue = this._nMinValue;
                    result = false;
                }
                if (this._nMaxValue < value) {
                    err.maxValue = this._nMaxValue;
                    result = false;
                }
                if ((this._oRegExp && !this._oRegExp.test(value)) || (isNaN(value) && (this._nMinValue !== undefined || this._nMaxValue !== undefined))) {
                    err.format = true;
                    result = false;
                }

                if (!result) {
                    core.triggerEvent(this, 'error', null, [err]);
                }
                return result;
            }
        }
    );
}());

/*
Upload - 文件上传控件。
文件上传控件，继承自基础控件。

标签控件直接HTML初始化的例子:
<label ui="type:upload"></label>

属性
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 初始化标签控件。
     * options 对象支持的属性如下：
     * for 被转发的控件 id
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Upload = core.inherits(
        ui.Control,
        'ui-upload',
        function (el, options) {
            ui.Control.call(this, el, options);
            this._sUrl = options.url;
            this._eFile = el.appendChild(dom.setInput(null, options.name, 'file'));
            this._uProgress = core.$fastCreate(ui.Progress, dom.create(ui.Progress.CLASS));

            this._uProgress.setParent(this);
            this._uProgress.setRate(0);

            var control = this;

            dom.addEventListener(this._eFile, 'change', function () {
                var file = this.files[0],
                    reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    var data = new FormData();
                    data.append(this.name, file);

                    ecui.io.ajax(control._sUrl, {
                        method: 'post',
                        data: data,
                        onupload: function (event) {
                            control._uProgress.setRate(event.loaded / event.total, Math.round(event.loaded * 100 / event.total) + '%');
                        },
                        onsuccess: function (data) {
                            console.log(data);
                        },
                        onerror : function (code, msg) {
                            window.alert(msg);
                        }
                    });
                };
            });
        },
        {
            $dispose: function () {
                this._eFile = null;
                ui.Control.prototype.$dispose.call(this);
            }
        }
    );
//{if 0}//
}());
//{/if}//
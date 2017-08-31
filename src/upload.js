/*
Upload - 文件上传控件。
文件上传控件，继承自基础控件。

标签控件直接HTML初始化的例子:
<label ui="type:upload">
    <input type="file" name="file">
    <div ui="type:progress"></div>
</label>

属性
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    function fileChangeHandler() {
        var reader = new FileReader(),
            name = this._eFile.name,
            file = this._eFile.files[0],
            progress = core.query(function (item) {
                return item instanceof ui.Progress && item.getParent() === this;
            }, this)[0];

        reader.readAsDataURL(file);
        reader.onload = function () {
            var data = new FormData();
            data.append(name, file);

            ecui.io.ajax(this._sUrl, {
                method: 'POST',
                data: data,
                onupload: progress ? function (event) {
                    progress.setMax(event.total);
                    progress.setValue(event.loaded);
                } : undefined,
                onsuccess: function (data) {
                    console.log(data);
                },
                onerror : function (code, msg) {
                    window.alert(msg);
                }
            });
        }.bind(this);
    }

    /**
     * 初始化标签控件。
     * options 对象支持的属性如下：
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
            this._eFile = el.getElementsByTagName('INPUT')[0];
        },
        {
            $dispose: function () {
                this._eFile = null;
                ui.Control.prototype.$dispose.call(this);
            },

            init: function (options) {
                ui.Control.prototype.init.call(this, options);
                dom.addEventListener(this._eFile, 'change', fileChangeHandler.bind(this));
            }
        }
    );
//{if 0}//
}());
//{/if}//
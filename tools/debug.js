(function () {
    var oldDisposeFn = ecui.ui.InputControl.prototype.$dispose,
        oldReadyFn = ecui.ui.InputControl.prototype.$ready;

    function setData(name, value) {
        if (localStorage[name] !== value) {
            localStorage[name] = value;
        }
    }

    ecui.ui.InputControl.prototype.$dispose = function () {
        var name = ecui.esr.getLocation() + '_debug_' + this.getName();

        if (this._eInput) {
            if (this instanceof ecui.ui.Radio) {
                if (this.isChecked()) {
                    setData(name, this.getValue());
                }
            } else if (this instanceof ecui.ui.Checkbox) {
                setData(name, this.isChecked() ? '1' : '');
            } else {
                setData(name, this.getValue());
            }
        }
        oldDisposeFn.call(this);
    };

    ecui.ui.InputControl.prototype.$ready = function (options) {
        var name = ecui.esr.getLocation() + '_debug_' + this.getName();

        if (localStorage[name]) {
            if (this instanceof ecui.ui.Radio) {
                if (localStorage[name] === this.getValue()) {
                    this.setChecked(true);
                }
            } else if (this instanceof ecui.ui.Checkbox) {
                this.setChecked(!!localStorage[name]);
            } else {
                this.$setValue(localStorage[name]);
            }
        }
        oldReadyFn.call(this, options);
    };
}());
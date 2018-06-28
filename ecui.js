var ecui;
(function () {    document.write('<script type="text/javascript" src="src/adapter.js"></script>');

    document.write('<script type="text/javascript" src="src/core.js"></script>');
    document.write('<script type="text/javascript" src="src/control.js"></script>');
    document.write('<script type="text/javascript" src="src/input/input-control.js"></script>');

    document.write('<script type="text/javascript" src="src/imp/items.js"></script>');
    document.write('<script type="text/javascript" src="src/imp/popup.js"></script>');

    document.write('<script type="text/javascript" src="src/adv/input-group.js"></script>');
    document.write('<script type="text/javascript" src="src/base/button.js"></script>');
    document.write('<script type="text/javascript" src="src/adv/submit.js"></script>');
    document.write('<script type="text/javascript" src="src/adv/cancel.js"></script>');
    document.write('<script type="text/javascript" src="src/adv/layer.js"></script>');
    document.write('<script type="text/javascript" src="src/base/dialog.js"></script>');
    document.write('<script type="text/javascript" src="src/input/label.js"></script>');
    document.write('<script type="text/javascript" src="src/base/month-view.js"></script>');
    document.write('<script type="text/javascript" src="src/adv/progress.js"></script>');
    document.write('<script type="text/javascript" src="src/adv/progress-bar.js"></script>');
    document.write('<script type="text/javascript" src="src/adv/progress-circle.js"></script>');
    document.write('<script type="text/javascript" src="src/base/tab.js"></script>');
    document.write('<script type="text/javascript" src="src/base/table.js"></script>');
    document.write('<script type="text/javascript" src="src/base/tree-view.js"></script>');

    document.write('<script type="text/javascript" src="src/input/text.js"></script>');
    document.write('<script type="text/javascript" src="src/input/checkbox.js"></script>');
    document.write('<script type="text/javascript" src="src/input/radio.js"></script>');
    document.write('<script type="text/javascript" src="src/base/abstract-select.js"></script>');
    document.write('<script type="text/javascript" src="src/input/select.js"></script>');
    document.write('<script type="text/javascript" src="src/input/combox.js"></script>');
    document.write('<script type="text/javascript" src="src/adv/listbox.js"></script>');

    document.write('<script type="text/javascript" src="src/base/calendar.js"></script>');
    document.write('<script type="text/javascript" src="src/input/calendar-input.js"></script>');
    document.write('<script type="text/javascript" src="src/adv/locked-table.js"></script>');
    document.write('<script type="text/javascript" src="src/adv/check-tree.js"></script>');
    document.write('<script type="text/javascript" src="src/input/multilevel-select.js"></script>');
    document.write('<script type="text/javascript" src="src/base/upload.js"></script>');

    document.write('<script type="text/javascript" src="src/adv/messagebox.js"></script>');

    document.write('<script type="text/javascript" src="src/extend/anchor.js"></script>');
    document.write('<script type="text/javascript" src="src/extend/decorate.js"></script>');
    document.write('<script type="text/javascript" src="src/extend/effect.js"></script>');
    document.write('<script type="text/javascript" src="src/extend/etpl.js"></script>');
    document.write('<script type="text/javascript" src="src/extend/esr.js"></script>');

    document.write('<script type="text/javascript" src="src/imp/m-scroll.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-panel.js"></script>');
    document.write('<script type="text/javascript" src="src/imp/m-popup.js"></script>');
    document.write('<script type="text/javascript" src="src/imp/m-options.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-select.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-calendar.js"></script>');
    document.write('<script type="text/javascript" src="src/mobile/m-list-view.js"></script>');

    document.write('<script type="text/javascript" src="src/mobile/m-photo-hotspot.js"></script>');

//{if 0}//
    var ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
    document.write('<script type="text/javascript" src="tools/debug.js"></script>');
    if (ieVersion < 9) {
        document.write('<script type="text/javascript" src="tools/html5shiv.js"></script>');
    }
    document.write('<script type="text/javascript" src="tools/less.js"></script>');
    document.write('<script type="text/javascript" src="tools/less-funcs.js"></script>');
//{/if}//
}());

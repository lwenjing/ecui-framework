[1mdiff --git a/src/control.js b/src/control.js[m
[1mindex 129a774..4dbaa28 100755[m
[1m--- a/src/control.js[m
[1m+++ b/src/control.js[m
[36m@@ -227,7 +227,6 @@[m [m$$padding           - 内填充宽度缓存[m
                     }[m
                 } catch (ignore) {[m
                 }[m
[31m-                core.removeControlListener(this);[m
                 this._eMain.getControl = null;[m
                 this._eMain = this._eBody = null;[m
                 // 取消 $ready 的操作，防止控件在 onload 结束前被 dispose，从而引发 $ready 访问的信息错误的问题[m
[1mdiff --git a/src/core.js b/src/core.js[m
[1mindex 1afcbf6..32b4650 100755[m
[1m--- a/src/core.js[m
[1m+++ b/src/core.js[m
[36m@@ -1254,7 +1254,12 @@[m
                     item.ondispose();[m
                     item.ondispose = util.blank;[m
                 }[m
[32m+[m[32m                if (item.getUID() === 'ecui-242') {[m
[32m+[m[32m                    console.log(eventListeners);[m
[32m+[m[32m                    console.log(eventListeners['ecui-242#dispose']);[m
[32m+[m[32m                }[m
                 core.triggerEvent(item, 'dispose');[m
[32m+[m[32m                core.removeControlListener(item);[m
             });[m
         },[m
 [m
[36m@@ -1911,9 +1916,7 @@[m
             // 检查事件是否被监听[m
             if (listeners = eventListeners[uid + '#' + name]) {[m
                 listeners.forEach(function (item) {[m
[31m-                    if (item) {[m
[31m-                        item.apply(control, args);[m
[31m-                    }[m
[32m+[m[32m                    item.apply(control, args);[m
                 });[m
             }[m
 [m
[1mdiff --git a/src/esr.js b/src/esr.js[m
[1mindex 8e331ab..18cfe9f 100644[m
[1m--- a/src/esr.js[m
[1m+++ b/src/esr.js[m
[36m@@ -801,7 +801,12 @@[m
             }[m
 [m
             core.addEventListener(control, 'dispose', function () {[m
[31m-                util.remove(autoRender[value[1]], this);[m
[32m+[m[32m                for (var i = 0, item; item = autoRender[value[1]][i]; i++) {[m
[32m+[m[32m                    if (item[0] === this) {[m
[32m+[m[32m                        autoRender[value[1]].splice(i, 1);[m
[32m+[m[32m                        break;[m
[32m+[m[32m                    }[m
[32m+[m[32m                }[m
             });[m
 [m
             if (context[value[1]] !== undefined) {[m

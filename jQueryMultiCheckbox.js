/*
 * jqueryMultiCheckbox.js
 *
 * Copyright (c) 2010 Tomohiro Okuwaki (http://www.tinybeans.net/blog/)
 * Licensed under MIT Lisence:
 * http://www.opensource.org/licenses/mit-license.php
 * http://sourceforge.jp/projects/opensource/wiki/licenses%2FMIT_license
 *
 * Since:   2010-06-22
 * Update:  2011-01-07
 * version: 0.11
 * Comment: ラベルをソートできるようにした（ハッシュ指定の場合はキーを基準にソート）
 *
 * jQuery 1.3 later (maybe...)
 * 
 */
(function($){
    $.fn.multicheckbox = function(options){
        var op = $.extend({}, $.fn.multicheckbox.defaults, options);

        // 初期化
        var $self = this,
            rcomma = new RegExp(" *, *","g");
            self_val = $self.val() ? $self.val().replace(rcomma,",") : "";

        $self[op.show]().val(self_val);

        var checked = self_val ? self_val.split(",") : [],
            checked_count = checked.length,
            container_class = op.tags ? "mcb-container mcb-tags" : "mcb-container";
            $container = $("<span></span>").addClass(container_class);
            

        // チェックボックスをクリックしたとき
        function checkboxClick(){
            var value = $self.val() ? $self.val().replace(rcomma,",") + ",": "",
                $cb = $(this);
                
            if ($cb.is(":checked")) {
                $cb.closest("label").addClass("mcb-label-checked");
                $self.val(value + $cb.val());
            } else {
                $cb.closest("label").removeClass("mcb-label-checked");
                var reg = new RegExp("," + $cb.val() + ",","g");
                value = "," + value;
                $self.val(value.replace(reg,",").replace(/^,|,$/g,""));
            }
        }
        // チェックボックスとラベルを生成
        function makeCheckbox(val,label,count,must){
            var $cb = $("<input/>").attr({"type":"checkbox","value":val}).addClass("mcb").click(checkboxClick);
            var $label = $("<label></label>").addClass("mcb-label");
            if (count > 0) {
                checked = $.grep(checked, function(elm,idx){
                    if (val == elm) {
                        $cb.attr("checked","checked");
                        $label.addClass("mcb-label-checked");
                        return false;
                    }
                    return true;
                });
            }
            if (must) {
                $cb.attr("checked","checked");
                $label.addClass("mcb-label-checked");
            }
            $label.text(label).prepend($cb);
            $self[op.insert]($container.append($label));
        }
        // ユーザーが追加したラベルを生成
        function makeAddCheckbox(arry){
            if (arry.length == 0) return;
            for (var i = -1,n = arry.length; ++i < n;) {
                makeCheckbox(arry[i],arry[i],0,true);
            }
            
        }
        // ユーザーが項目を追加できるようにする
        function addCheckbox(){
            if (!op.add) return;
            var $cb = $("<input/>")
                    .attr({"type":"checkbox","value":"","checked":"checked"})
                    .addClass("mcb")
                    .click(checkboxClick);
            var $input = $("<input/>")
                    .attr({"type":"text","value":"+"})
                    .addClass("mcb-add-input")
                    .focus(function(){
                        if ($(this).val() === "+") $(this).val("");
                    })
                    .blur(function(){
                        if ($(this).val() === "") $(this).val("+");
                    })
                    .keydown(function(e){
                        var keycode = e.which || e.keyCode; 
                        if (keycode == 13) {
                            var value = $(this).val().replace(/^[ 　]*|[ 　]*$/g,"").replace(/[ 　]*:[ 　]*/g,":"), label;
                            if (!value) return;
                            var obj = value.match(/([^:]+)(:)([^:]+)/);
                            if (obj) {
                                value = obj[1];
                                label = obj[3];
                            }
                            $(this).hide().before($cb.val(value),label);
                            $cb.attr({"checked":"checked"}).click().attr({"checked":"checked"});
                            addCheckbox();
                        }
                    });
            var $label = $("<label></label>")
                    .addClass("mcb-label mcb-add-label")
                    .append($input);
            $($container).append($label);
        }
        // 連想配列のキーを並べ替える
        function sortHashKey(obj,rule){ // rule = "ascend","descend"
            var keys = [], values = [];
            for (var key in obj) {
                keys.push(key);
            }
            switch (rule) {
                case "ascend": 
                    keys.sort();
                    break;
                case "descend": 
                    keys.sort();
                    keys.reverse();
                    break;
                default:
                    keys.sort();
                    break;
            }
            return keys;
        }
        
        // 実行する
        if (typeof(op.label) == "object") {
            if (op.sort != "") {
                var sortRule = sortHashKey(op.label,op.sort);
                for (var i = -1, n = sortRule.length; ++i < n;) {
                    makeCheckbox(sortRule[i],op.label[sortRule[i]],checked_count,false);
                }
                makeAddCheckbox(checked);
            } else {
                for (var key in op.label) {
                    makeCheckbox(key,op.label[key],checked_count,false);
                }
                makeAddCheckbox(checked);
            }
            addCheckbox();
        } else {
            var checks = (op.label == "") ? $self.attr("title") : op.label,
                checks = checks.split(",");
                if (op.sort == "ascend") {
                    checks.sort();
                } else if (op.sort == "descend") {
                    checks.sort();
                    checks.reverse();
                }
            for (var i = -1, n = checks.length; ++i < n;) {
                makeCheckbox(checks[i],checks[i],checked_count,false);
            }
            makeAddCheckbox(checked);
            addCheckbox();
        }
        return $self;
    };    
    $.fn.multicheckbox.defaults = {
        show: "hide", // "hide" or "show" 元のテキストフィールドを非表示にするか否か
        label: "", // カンマ区切りの文字列か{"key1":"value1","key2":"value2"}のハッシュ
        insert: "before", // "before" or "after"
        add: false, // ユーザーがチェックボックスを追加できるようにする場合はtrue
        tags: false, // タグデザインを適用する場合はtrue
        sort: "" // "ascend"（昇順）,"descend"（降順）
    };
    
})(jQuery);

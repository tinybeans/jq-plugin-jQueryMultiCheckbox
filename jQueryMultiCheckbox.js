/*
 * jqueryMultiCheckbox.js
 *
 * Copyright (c) Tomohiro Okuwaki (http://www.tinybeans.net/blog/)
 * Licensed under MIT Lisence:
 * http://www.opensource.org/licenses/mit-license.php
 * http://sourceforge.jp/projects/opensource/wiki/licenses%2FMIT_license
 *
 * Since:   2010-06-22
 * Update:  2012-03-05
 * version: 0.13
 *
 * jQuery 1.3 later (maybe...)
 *
 */
(function($){
    $.fn.multicheckbox = function(options){
        var op = $.extend({}, $.fn.multicheckbox.defaults, options);

        return this.each(function(idx){

            var self = this, $self = $(this), selfVals = (this.value !== '') ? this.value.split(','): [];
            var checked = [];
            if (selfVals.length > 0) {
                for (var i = 0, n = selfVals.length; i < n; i++) {
                    selfVals[i] = $.trim(selfVals[i]);
                    checked[i] = $.trim(selfVals[i]);
                }
            }
            var containerClass = (op.skin === 'tags') ? 'mcb-container mcb-skin-tags' : 'mcb-container';
            var $container = $('<span class="' + containerClass+ '">test</span>');
            $self[op.insert]($container);

            var labels = [], checkboxs = [];
            // labelオプションがオブジェクトの場合
            if (typeof op.label === 'object') {
                if (op.sort === '') {
                    for (var key in op.label) {
                        var boolCheck = boolCheckSplice(key, selfVals);
                        labels.push(makeLabel(key, op.label[key], boolCheck));
                    }
                } else {
                    checkboxs = sortHashKey(op.label, op.sort);
                    for (var i = 0, n = checkboxs.length; i < n; i++) {
                        var key = checkboxs[i];
                        var boolCheck = boolCheckSplice(key, selfVals);
                        labels.push(makeLabel(key, op.label[key], boolCheck));
                    }
                }
            // labelオプションがカンマ区切りのテキストもしくは空の場合
            } else if (typeof op.label === 'string') {
                checkboxs = (op.label === '') ? $self.attr('title').split(',') : op.label.split(',');
                if (checkboxs.length === 1 && checkboxs[0] === '') {
                    checkboxs = [];
                }
                for (var i = 0, n = checkboxs.length; i < n; i++) {
                    checkboxs[i] = $.trim(checkboxs[i]);
                }
                if (op.sort == 'ascend') {
                    checkboxs.sort();
                } else if (op.sort === 'descend') {
                    checkboxs.sort();
                    checkboxs.reverse();
                }
                for (var i = 0, n = checkboxs.length; i < n; i++) {
                    var boolCheck = boolCheckSplice(checkboxs[i], selfVals);
                    labels.push(makeLabel(checkboxs[i], checkboxs[i], boolCheck));
                }
            }
            if (selfVals.length > 0) {
                for (var i = 0, n = selfVals.length; i < n; i++) {
                    labels.push(makeLabel(selfVals[i], selfVals[i], true));
                }
            }
            // addオプションがtrueの場合（ユーザー追加可能の場合）
            if (op.add && op.skin == false) {
                labels.push('<input class="mcb-add-item" type="text" value="+" />');
            } else if (op.add) {
                labels.push('<input class="mcb-add-item" type="text" value="" />');
            }
            $container
                .html(labels.join(''))
                .find('input:checkbox')
                    .bind('click', checkboxClick);

            $self[op.show]();

            $.data(self, 'mcb-lists', checked);

            // ユーザーが項目を追加できるようにする
            if (op.add) {
                $container.find('input.mcb-add-item')
                    .focus(function(){
                        if ($(this).val() === '+' && op.skin == false) $(this).val('');
                    })
                    .blur(function(){
                        if ($(this).val() === '' && op.skin == false) $(this).val('+');
                    })
                    .keydown(function(e){
                        var keycode = e.which || e.keyCode;
                        if (keycode == 13) {
                            var value = $(this).val(),
                                label;
                            if (!value) return;
                            if (value.indexOf(':') > 0) {
                                var obj = value.split(':');
                                value = $.trim(obj[0]);
                                label = $.trim(obj[1]);
                            } else {
                                label = value;
                            }
                            $(this).val('')
                                .before(makeLabel(value, label, true))
                                .prev()
                                    .children('input:checkbox').click(checkboxClick);
                            var checked = $.data(self, 'mcb-lists');
                            checked.push(value);
                            $.data(self, 'mcb-lists', checked);
                            $self.val(checked.join(','));
                            return false;
                        }
                    });
            }

            function boolCheckSplice(key, arry){
                var idx = $.inArray(key, arry);
                if (idx >= 0) {
                    arry.splice(idx, 1);
                    return true;
                } else {
                    return false;
                }
            }

            // label, input:checkbox の挿入
            function makeLabel(value, label, bool_checked){
                var classname = bool_checked ? ' mcb-label-checked': '';
                var checked = bool_checked ? ' checked="checked"': '';
                return [
                    '<label class="mcb-label' + classname + '">',
                        '<input class="mcb-checkbox" type="checkbox" value="' + value + '"' + checked + ' />',
                        label,
                    '</label>'
                ].join('');
            }

            // チェックボックスをクリックしたとき
            function checkboxClick(){
                var checked = $.data(self, 'mcb-lists'),
                    $cb = $(this),
                    value = $cb.val();
                if ($cb.is(':checked')) {
                    checked.push(value);
                    $.data(self, 'mcb-lists', checked);
                    $self.val(checked.join(','));
                    $cb.closest('label').addClass('mcb-label-checked');
                } else {
                    checked = $.grep(checked, function(v, i){
                        return value == v;
                    }, true);
                    $.data(self, 'mcb-lists', checked);
                    $self.val(checked.join(','));
                    $cb.closest('label').removeClass('mcb-label-checked');
                }
            }

            // 連想配列のキーを並べ替える
            function sortHashKey(obj, rule){ // rule = 'ascend','descend'
                var keys = [], values = [];
                for (var key in obj) {
                    keys.push(key);
                }
                switch (rule) {
                    case 'ascend':
                        keys.sort();
                        break;
                    case 'descend':
                        keys.sort();
                        keys.reverse();
                        break;
                }
                return keys;
            }
        });
    };
    $.fn.multicheckbox.defaults = {
        show: 'hide', // 'hide' or 'show' 元のテキストフィールドを非表示にするか否か
        label: '', // カンマ区切りの文字列か{'key1':'value1','key2':'value2'}のハッシュ
        insert: 'before', // 'before' or 'after'
        add: false, // ユーザーがチェックボックスを追加できるようにする場合はtrue
        skin: false, // タグデザインを適用する場合は'tags'
        sort: '' // 'ascend'（昇順）,'descend'（降順）
    };

})(jQuery);

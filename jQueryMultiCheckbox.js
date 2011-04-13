/*
 * jqueryMultiCheckbox.js
 *
 * Copyright (c) 2010 Tomohiro Okuwaki (http://www.tinybeans.net/blog/)
 * Licensed under MIT Lisence:
 * http://www.opensource.org/licenses/mit-license.php
 * http://sourceforge.jp/projects/opensource/wiki/licenses%2FMIT_license
 *
 * Since:   2010-06-22
 * Update:  2011-04-13
 * version: 0.12 for MTAppjQuery.js
 *
 * jQuery 1.3 later (maybe...)
 * 
 */
(function($){
    $.fn.multicheckbox = function(options){
        var op = $.extend({}, $.fn.multicheckbox.defaults, options);

        return this.each(function(idx){

            var $self = $(this),
                self = $self.get(0);

            var container_class = op.skin ? 'mcb-container mcb-skin-tags' : 'mcb-container';
            $self[op.insert]('<span class="' + container_class+ '">test</span>');
            var $container = (op.insert == 'before') ? $self.prev(): $self.next();

            // label, input:checkbox の挿入
            var mcb_label = function(value, label, bool_checked){
                var checked_class = bool_checked ? ' mcb-label-checked': '';
                var checked_attr = bool_checked ? ' checked="checked"': '';
                return [
                    '<label class="mcb-label' + checked_class + '">',
                        '<input class="mcb-checkbox" type="checkbox" name="' + value + '" value="' + value + '"' + checked_attr + ' />',
                        label,
                    '</label>'
                ].join('');
            }

            var label_html = [],
                checkboxs = [];
            if (typeof(op.label) == 'object') {
                if (op.sort != '') {
                    checkboxs = sortHashKey(op.label, op.sort);
                    for (var i = 0, n = checkboxs.length; i < n; i++) {
                        var key = checkboxs[i];
                        label_html.push(mcb_label(key, op.label[key]));
                    }
                } else {
                    for (var key in op.label) {
                        label_html.push(mcb_label(key, key));
                    }
                }
            } else {
                checkboxs = (op.label == '') ? $self.attr('title').split(',') : op.label.split(',');
                for (var i = 0, n = checkboxs.length; i < n; i++) {
                    checkboxs[i] = $.trim(checkboxs[i]);
                }
                if (op.sort == 'ascend') {
                    checkboxs.sort();
                } else if (op.sort == 'descend') {
                    checkboxs.sort();
                    checkboxs.reverse();
                }
                for (var i = 0, n = checkboxs.length; i < n; i++) {
                    label_html.push(mcb_label(checkboxs[i], checkboxs[i]));
                }
            }
            if (op.add) {
                label_html.push('<input class="mcb-add-item" type="text" value="+" />');
            }
            $container.html(label_html.join(''));

            // チェック済みのチェックボックスにチェックを入れる
            var checked = $self.val() ? $self.val().split(',') : [],
                checked_count = checked.length;

            for (var i = 0; i < checked_count; i++) {
                checked[i] = $.trim(checked[i]);
            }

            $container.find('input:checkbox').val(checked).click(checkboxClick);

            $self[op.show]();

            $.data(self, 'mcb-lists', checked);

            // ユーザーが項目を追加できるようにする
            if (op.add) {
                $container.find('input.mcb-add-item')
                    .focus(function(){
                        if ($(this).val() == '+') $(this).val('');
                    })
                    .blur(function(){
                        if ($(this).val() == '') $(this).val('+');
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
                                .before(mcb_label(value, label, true))
                                .prev()
                                    .children('input:checkbox').click(checkboxClick);
                            checked.push(value);
                            $.data(self, 'mcb-lists', checked);
                            $self.val(checked.join(','));
                        }
                    });
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
            function sortHashKey(obj,rule){ // rule = 'ascend','descend'
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
                    default:
                        keys.sort();
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

/*! iptools-jquery-offcanvas - v0.0.7 - 2016-03-14
* https://github.com/interactive-pioneers/iptools-jquery-offcanvas
* Copyright © 2016 Interactive Pioneers GmbH; Licensed GPL-3.0 */
!function(a){"use strict";function b(b,c){this.settings=a.extend({},n,c),this.$element=a(b);var d=i(this);if(""!==d)throw new Error(k+": "+d);this.id=this.$element.attr("id"),this.$open=a("[data-"+l.open+'="'+this.id+'"]'),this.$close=a("[data-"+l.close+'="'+this.id+'"]'),f(this),j(this),this.$element.trigger(h("initialized"))}function c(a){var b=a.data;b.settings["static"]&&b.toggle(!0),b.$element.addClass(p+q.initialized)}function d(a){a.data.toggle(!0,a),a.stopPropagation()}function e(a){a.data.toggle(!1,a),a.stopPropagation()}function f(a){a.$element.addClass(a.settings.baseClass+o[a.settings.type].baseClass)}function g(a){return"."+p+a}function h(a){return a+"."+k}function i(b){return""===a.trim(b.$element.attr("id"))?"Required attr `id` missing on element!":"undefined"==typeof o[b.settings.type]?"Invalid type `"+b.settings.type+"` given!":""}function j(a){a.$element.on(h("initialized"),null,a,c),a.$element.on(h("open"),null,a,d),a.$element.on(h("close"),null,a,e),a.$open.on(h("click"),null,a,d),a.$close.on(h("click"),null,a,e)}var k="iptOffCanvas",l={open:"offcanvas-open",close:"offcanvas-close"},m=function(){return!0},n={baseClass:"offcanvas",type:"right",single:!0,"static":!1,staticCondition:m},o={top:{baseClass:"--top",activeClass:"--top--active"},right:{baseClass:"--right",activeClass:"--right--active"},bottom:{baseClass:"--bottom",activeClass:"--bottom--active"},left:{baseClass:"--left",activeClass:"--left--active"}},p="offcanvas",q={content:"__content",initialized:"--initialized"};b.prototype.isActive=function(){return this.$element.hasClass(this.settings.baseClass+o[this.settings.type].activeClass)},b.prototype.toggle=function(b,c){var d,e=this.settings.baseClass+o[this.settings.type].activeClass;"undefined"==typeof b&&(b=!this.isActive()),this.settings.single&&b&&a(g(q.initialized)).each(function(){d=a(this).data("plugin_"+k),d.settings["static"]&&d.settings.staticCondition()||a(this).trigger(h("close"))});var f="";b&&!this.isActive()?f="opened":!b&&this.isActive()&&(f="closed"),""!==f&&this.$element.trigger(h(f),c),this.$element.toggleClass(e,b)},b.prototype.destroy=function(){this.$open.off("."+k),this.$close.off("."+k),this.$element.off("."+k).removeData("plugin_"+k)},a.fn[k]=function(c){return this.each(function(){a.data(this,"plugin_"+k)||a.data(this,"plugin_"+k,new b(this,c))})}}(jQuery);
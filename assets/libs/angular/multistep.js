var angularMultiStepForm=function(t){"use strict";function e(e,i,n,r,s,o){return{restrict:"EA",scope:!0,controller:["$scope",function(t){this.setStepContainer=function(t){this.stepContainer=t}}],link:{pre:function(t,e,i){t.formSteps=t.$eval(i.steps).map(function(t){return new s(t)}),t.stepTitles=t.formSteps.map(function(t){return t.title})},post:function(i,s,a,c){function l(){e.leave(s),C=!0,i.$destroy()}function p(t){return function(){C=!0,i.$eval(t)}}s.addClass("multi-step-container");var d=a.onFinish?p(a.onFinish):l,u=a.onCancel?p(a.onCancel):l,h=a.onStepChange?function(){return i.$eval(a.onStepChange)}:t.noop,f=c.stepContainer,m=r(i.$eval(a.searchId));if(m.augmentScope(i),a.controller){var v=n(a.controller,{$scope:i,$element:s,multiStepFormInstance:m});a.controllerAs&&(i[a.controllerAs]=v)}var S=i.$eval(a.initialStep),$=void 0,I=void 0,x=void 0,A=void 0,C=!1;i.$on("$destroy",function(){C||(C=!0,m.deferred.reject())}),m.start(i.formSteps).then(d,u,function(n){var r=n.newStep,s=n.oldStep,a=t.isDefined(s)?r<s?"step-backward":"step-forward":"step-initial",c=i.formSteps[r-1],l=o(c,m,i);f.removeClass("step-forward step-backward step-initial").addClass(a),$&&e.cancel($),I&&e.cancel(I),x&&x.$destroy(),A&&($=e.leave(A)),l.then(function(t){h(),x=t.scope,A=t.element,A.scrollTop=0,f.scrollTop=0,I=e.enter(A,f)},function(){throw new Error("Could not load step "+r)})}),m.setInitialIndex(S)}}}}function i(e){return{restrict:"A",require:"^form",link:function(i,n,r,s){var o=r.formStepValidity?e(r.formStepValidity).bind(i,i):i.$setValidity;i.$watch(function(){return s.$valid},function(e){t.isDefined(e)&&o(e)})}}}function n(){return{restrict:"EA",require:"^^multiStepContainer",scope:!1,link:function(t,e,i,n){e.addClass("multi-step-body"),n.setStepContainer(e)}}}function r(e,i,n,r,s,o){function a(e){if(e.template)return t.isFunction(e.template)||t.isArray(e.template)?r.$invoke(e.template):e.template;var i=t.isFunction(e.templateUrl)||t.isArray(e.templateUrl)?r.$invoke(e.templateUrl):e.templateUrl;return n.get(i,{cache:o})}function c(t,e,i){var n=t.$new(e.isolatedScope);return i.augmentScope(n),n}return function(n,o,l){var p=t.element("<div>").addClass("form-step"),d=void 0,u={};return u.$template=a(n),t.forEach(n.resolve,function(t,e){u[e]=r.invoke(t)}),s.all(u).then(function(r){r=t.extend({},n.locals,r),r.$template=r.$template.data||r.$template,p.html(r.$template);var s=c(l,n,o);return n.controller&&(r.$scope=s,r.multiStepFormInstance=o,n.isolatedScope&&(r.multiStepFormScope=l),d=i(n.controller,r),n.controllerAs&&(s[n.controllerAs]=d),p.data("$stepController",d)),e(p)(s),{element:p,scope:s}})}}function s(){return function(t){if(!t.template&&!t.templateUrl)throw new Error("Either template or templateUrl properties have to be provided for multi step form"+t.title);this.title=t.title,this.data=t.data||{},this.controller=t.controller,this.controllerAs=t.controllerAs,this.template=t.template,this.templateUrl=t.templateUrl,this.isolatedScope=t.isolatedScope||!1,this.resolve=t.resolve||{},this.locals=t.locals||{},this.hasForm=t.hasForm||!1,this.valid=!1,this.visited=!1}}function o(t,e,i){function n(n){var r=this;this.searchId=n,angular.isDefined(n)&&i.$on("$locationChangeSuccess",function(t){var i=parseInt(e.search()[r.searchId]);isNaN(i)||r.activeIndex===i||r.setActiveIndex(parseInt(i))}),this.steps=[],this.getSteps=function(){return this.steps},this.deferred=t.defer(),this.start=function(t){if(!t||!t.length)throw new Error("At least one step has to be defined");return this.steps=t,this.deferred.promise},this.cancel=function(){this.deferred.reject("cancelled")},this.finish=function(){this.deferred.resolve()},this.getActiveIndex=function(){return this.activeIndex},this.setInitialIndex=function(t){var i=void 0;return angular.isDefined(t)?this.setActiveIndex(t):this.searchId&&(i=parseInt(e.search()[this.searchId]),!isNaN(i))?this.setActiveIndex(i):void this.setActiveIndex(1)},this.setActiveIndex=function(t){this.searchId&&(this.activeIndex?e.search(this.searchId,t):e.search(this.searchId,t).replace()),this.deferred.notify({newStep:t,oldStep:this.activeIndex}),this.activeIndex=t},this.getActiveStep=function(){if(this.activeIndex)return this.steps[this.activeIndex-1]},this.isFirst=function(){return 1===this.activeIndex},this.isLast=function(){return this.activeIndex===this.steps.length},this.nextStep=function(){this.isLast()||this.setActiveIndex(this.activeIndex+1)},this.previousStep=function(){this.isFirst()||this.setActiveIndex(this.activeIndex-1)},this.setValidity=function(t,e){var i=this.steps[(e||this.activeIndex)-1];i&&(i.valid=t)},this.augmentScope=function(t){var e=this;["cancel","finish","getActiveIndex","setActiveIndex","getActiveStep","getSteps","nextStep","previousStep","isFirst","isLast","setValidity"].forEach(function(i){t["$"+i]=e[i].bind(e)})}}return function(t){return new n(t)}}t="default"in t?t["default"]:t;var a=["$animate","$q","$controller","multiStepForm","FormStep","formStepElement",e],c=["$parse",i],l=["$compile","$controller","$http","$injector","$q","$templateCache",r],p=["$q","$location","$rootScope",o],d=t.module("multiStepForm",[]);return d.directive("formStepValidity",c).directive("multiStepContainer",a).directive("stepContainer",n).factory("formStepElement",l).factory("FormStep",s).factory("multiStepForm",p),d}(angular);

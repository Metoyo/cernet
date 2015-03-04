define(['jquery', 'angular'], function ($, angular) {
  'use strict';

  angular.module('cernetApp.directives.Bnslideshow', [])
  	.directive('bnSlideShow', function () {
      return {
//      	template: '<div></div>',
      	restrict: 'A',
      	link: function postLink(scope, element, attrs) {
          var slideTarget = '.' + attrs.slideShowTarget,
            slideText = attrs.slideShowText,
            slideDirection = attrs.slideShowDirt;
          element.on('click', function(){
            if(slideDirection == 'left'){ //向左滑动展开
              element.next(slideTarget).animate({width: 'toggle'});
            }
            else{ //向下滑动展开
              var eltTxt = element.text();
              if(slideText){ //用在考务里面的试卷列表
                element.text(eltTxt == '关闭' ? slideText : '关闭');
                element.closest('div').next(slideTarget).slideToggle();
              }
              else{
                element.next(slideTarget).slideToggle();
              }
            }
          });
      	}
      };
  	});
});

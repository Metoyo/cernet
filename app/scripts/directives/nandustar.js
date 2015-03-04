define(['jquery', 'angular'], function ($, angular) {
  'use strict';
  angular.module('cernetApp.directives.Nandustar', [])
    .directive('nanduStar', function () {
      return {
        restrict: 'A',
        link: function postLink(scope, element, attrs) {
          var targetA = element.find('a'),
            nanduTarget = element.find('.nandu-input'),
            hoverIdx, hoverCss, clickCss;
          targetA.hover(function(){
            hoverIdx = $(this).index() + 1;
            hoverCss = 'starHover' + hoverIdx;
            element.addClass(hoverCss);
            element.removeClass(clickCss);
            $(this).click(function(){
              for(var i = 1; i <= 5; i++){
                var rmCss = 'starClick' + i;
                element.removeClass(rmCss);
              }
              clickCss = 'starClick' + hoverIdx;
              element.addClass(clickCss);
              nanduTarget.val(clickCss.slice(-1));
            });
          },function(){
            element.removeClass(hoverCss);
            element.addClass(clickCss);
          });
        }
      };
    });
});

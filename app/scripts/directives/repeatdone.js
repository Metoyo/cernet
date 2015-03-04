define(['angular'], function (angular) {
  'use strict';

  angular.module('cernetApp.directives.Repeatdone', [])
  	.directive('repeatDone', function () {
      return function(scope, element, attrs) {
        if (scope.$last) setTimeout(function(){
          scope.$emit('onRepeatLast', element, attrs);
        }, 1);
      };
  	});
});

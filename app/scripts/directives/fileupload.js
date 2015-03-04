define(['angular'], function (angular) {
  'use strict';

  angular.module('cernetApp.directives.Fileupload', [])
  	.directive('fileUpload', function () {
      return {
//      	template: '<div></div>',
//      	restrict: 'E',
      	link: function postLink(scope, element, attrs) {
          element.bind('change', function (event) {
            var files = event.target.files;
            //iterate files since 'multiple' may be specified on the element
            for (var i = 0;i<files.length;i++) {
              //emit event upward
              scope.$emit("fileSelected", { file: files[i] });
            }
          });
      	}
      };
  	});
});

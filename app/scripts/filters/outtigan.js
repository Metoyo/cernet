define(['angular'], function (angular) {
  'use strict';

  angular.module('cernetApp.filters.Outtigan', [])
  	.filter('outTiGan', function () {
      return function (input, txId) {
        var newCont,
          reg = new RegExp('<\%{.*?}\%>', 'g');
        if(txId == 6){
          newCont = input.replace(reg, function(arg) {
            var text = arg.slice(2, -2),
              textJson = JSON.parse(text),
              _len = textJson.size,
              i, xhStr = '';
            for(i = 0; i < _len; i ++ ){
              xhStr += '_';
            }
            return xhStr;
          });
          return newCont;
        }
        else{
          return input;
        }
      };
  	});
});

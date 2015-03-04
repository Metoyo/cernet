define(['angular'], function (angular) {
  'use strict';

  angular.module('cernetApp.services.Urlredirect', [])
    .factory('urlRedirect', ['$rootScope', '$location', '$q',  function ($rootScope, $location, $q) {
      // Service logic
      // ...

      function checkIfUrlApplied(currentPath, nextPath) {
        var deferred = $q.defer();
        // async call, resolved after ajax request completes
        if(currentPath === nextPath) {
          deferred.resolve();
        } else {
          if(!$rootScope.$$phase) { // 触发浏览器重定向路由
            $location.path(nextPath); // 重定向至登陆界面
            $rootScope.$apply();
            deferred.resolve();
          } else {
            deferred.reject();
          }
        }
        return deferred.promise;
      }

      function redirectUrl(currentPath, nextPath) {
        var checkUrlAppliedPromise = checkIfUrlApplied(currentPath, nextPath);
        checkUrlAppliedPromise.then(function() { /* success callback*/},
          function() { // error callback
            setTimeout(function() {
              redirectUrl(currentPath, nextPath);
            }, 20);
          });
      }

      // Public API here
      return {
        goTo: function (currentPath, nextPath) {
          return redirectUrl(currentPath, nextPath);
        }
      };
    }]);
});

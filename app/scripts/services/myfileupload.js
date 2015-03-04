define(['angular'], function (angular) {
  'use strict';

  angular.module('cernetApp.services.Myfileupload', [])
	.service('Myfileupload', ['$http', function Myfileupload($http) {
      this.uploadFileAndFieldsToUrl = function(file, fields, uploadUrl){
        var fd = new FormData();
        for(var j = 1; j <= file.length; j++){
          fd.append('file' + j, file[j - 1]);
        }
        for(var i = 0; i < fields.length; i++){
          fd.append(fields[i].name, fields[i].data)
        }
        return $http.post(uploadUrl, fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
        })
          .success(function(data){
            return data;
          })
          .error(function(error){
            return error;
          });
      }
	}]);
});

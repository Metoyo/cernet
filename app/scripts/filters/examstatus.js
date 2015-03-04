define(['angular'], function (angular) {
  'use strict';

  angular.module('cernetApp.filters.Examstatus', [])
  	.filter('examStatus', function () {
      return function (stat) {
        var txtStatus;
        switch (stat)
        {
          case -1:
            txtStatus = "删除";
            break;
          case 0:
            txtStatus = "等待发布";
            break;
          case 1:
            txtStatus = "测试中";
            break;
          case 2:
            txtStatus = "已发布报名";
            break;
          case 3:
            txtStatus = "考试已发布";
            break;
          case 4:
            txtStatus = "正在考试";
            break;
          case 5:
            txtStatus = "考试结束";
            break;
          case 6:
            txtStatus = "已公布成绩";
            break;
        }
      	return txtStatus;
      };
  	});
});

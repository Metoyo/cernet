/*jshint unused: vars */
define(['angular', 'angular-mocks', 'app'], function(angular, mocks, app) {
  'use strict';

  describe('Service: DataService', function () {

    // load the service's module
    beforeEach(module('cernetApp.services.DataService'));

    // instantiate service
    var DataService;
    beforeEach(inject(function (_DataService_) {
      DataService = _DataService_;
    }));

    it('should do something', function () {
      expect(!!DataService).toBe(true);
    });

  });
});

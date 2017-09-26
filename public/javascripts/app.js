(function(ng){
  var app = ng.module('app', []);
  function AppCtrl($scope, $http, $location) {
    var self = this;
    $scope.curProp = null;
    this.propsList = [];
    this.result = [];

    this.addProp = function() {
      if ( $scope.curProp ) {
        self.propsList.push({
          key: $scope.curProp,
          title: 'New title'
        });
      }
    }
    this.generate = function(){
      var keys = self.propsList.map(function(item){
        return item.key;
      });
      var path = location.pathname.split('/');
      $http.get('/dynamics-crm/dashboard/entity/' + path[path.length - 1], {
        keys: keys
      })
      .then(function(result){
        self.result = result.data.data;
        console.log(self.result);
      });
    }
    this.removeProp = function($index) {
      self.propsLis = self.propsList.splice($index, 1);
    }
  }
  app.controller('AppCtrl',['$scope', '$http', '$location', AppCtrl]);
})(angular)
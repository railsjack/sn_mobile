'use strict';
snApp
  .controller('activePatientsController', function($scope, $rootScope, $location, $http, Api, dbService, OfflineDBAction) {
    
    $rootScope.menuTitle = 'Active Loved Ones';
    if(wcsLocalStorage.has('currentUser')){
      $rootScope.user = wcsLocalStorage.get('currentUser');
    }else{
      $location.path('/');
      return;
    }
	
    $scope.dialog_title1 = "";
    $scope.dialog_title2 = "";
    $scope.dialog_button1 = '';
    $scope.dialog_button2 = '';

    if($rootScope.user.company.provider_type=='Home_Health') {
      $scope.dialog_title1 = 'Arrival';
      $scope.dialog_title2 = 'Departure';
      $scope.dialog_button1 = 'Arrival';
      $scope.dialog_button2 = 'Departure';
    }
    if($rootScope.user.company.provider_type=='Transport') {
      $scope.dialog_title1 = 'Pick Up';
      $scope.dialog_title2 = 'Drop Off';
      $scope.dialog_button1 = 'Pick up';
      $scope.dialog_button2 = 'Drop off';
    }

	$scope.open_allpatients = function(){
    	$location.path('/allpatients');
    }

    $scope.select_patient = function(lovedone) {
		//alert('trip started');
		if(!$rootScope.forceShiftStatus()) {
			return;
		}
		else {
			if(!isConnected()) {
				var offlineRecord = new OfflineDBAction();
				offlineRecord.employe_id = $rootScope.user.id;
				offlineRecord.loved_one_id = lovedone.id;
				offlineRecord.latitude = gLat;
				offlineRecord.longitude = gLng;
				offlineRecord.trip_id = lovedone.trip_id;
				//alert('active patents.js: select_patient::>' + offlineRecord.trip_id + ',' + lovedone.trip_id);
				offlineRecord.temp_trip_id = -1;
				offlineRecord.trip_status = 'started';
				offlineRecord.timestamp = $.now();
				offlineRecord.sync_status = 0;
				offlineRecord.employe_state = '';
				
				offlineRecord.save(lovedone);
			} else {
				
				var trip_data = {status: 'started', start_latitude:gLat, start_longitude:gLng};
				var promise = Api.post(apiURL+"/trip/update/"+lovedone.trip.id, {lovedone_id: lovedone.id, employee_id: $rootScope.user.id, trip: trip_data });
				promise.then(function(data) {
					
					$('#departure'+lovedone.trip.id).removeClass('disabled');
					$('#pick'+lovedone.trip.id).prop("disabled", true);
					$('#remove'+lovedone.trip.id).prop("disabled", true);
					
					$rootScope.init();
					
				});
			}
		}
		
    };

    $rootScope.unselect_patient = function(lovedone){
		if(!$rootScope.forceShiftStatus()) {
			return;
		}
		else {
			if(!isConnected()) {
				var offlineRecord = new OfflineDBAction();
				offlineRecord.employe_id = $rootScope.user.id;
				offlineRecord.loved_one_id = lovedone.id;
				offlineRecord.latitude = gLat;
				offlineRecord.longitude = gLng;
				offlineRecord.trip_id = lovedone.trip_id;
				//alert('active patents.js: unselect_patient::>' + offlineRecord.trip_id + ',' + lovedone.trip_id);
				offlineRecord.temp_trip_id = -1;
				offlineRecord.trip_status = 'completed';
				offlineRecord.timestamp = $.now();
				offlineRecord.sync_status = 0;
				offlineRecord.employe_state = '';
				
				offlineRecord.save(lovedone);
			} else {

				var trip_data = {status: 'completed', end_latitude:gLat, end_longitude:gLng};
				var promise = Api.post(apiURL+"/trip/update/"+lovedone.trip.id, {lovedone_id: lovedone.id, employee_id: $rootScope.user.id, trip: trip_data});
				promise.then(function(data) {
					console.log(JSON.stringify(data));
					if($rootScope.user.active_lovedones.length == 1) {
						$rootScope.show_end_shift_confirmation_popup();
					}
					$rootScope.init();
				});
			}
		}
	
    };
	
    $scope.unset_as_active = function(lovedone) {
		if(!$rootScope.forceShiftStatus()) {
			return;
		}
		else {
			if(!isConnected()) {
				var offlineRecord = new OfflineDBAction();
				offlineRecord.employe_id = $rootScope.user.id;
				offlineRecord.loved_one_id = lovedone.id;
				offlineRecord.latitude = gLat;
				offlineRecord.longitude = gLng;
				offlineRecord.trip_id = lovedone.trip_id;
				//alert('active patents.js: unset_as_active::>' + offlineRecord.trip_id + ',' + lovedone.trip_id);
				offlineRecord.temp_trip_id = -1;
				offlineRecord.trip_status = 'removed';
				offlineRecord.timestamp = $.now();
				offlineRecord.sync_status = 0;
				offlineRecord.employe_state = '';
				
				offlineRecord.save(lovedone);
			} else {
			
			  var promise = Api.post(apiURL+"/trip/delete/"+lovedone.trip.id, {});
			  promise.then(function(data){
				console.log(JSON.stringify(data));
				
				if($rootScope.user.active_lovedones.length == 1) {
					$location.path('/allpatients');
				} else {
					$rootScope.init();
				}
			  });
		  
			}
		}
      
    };
	
	gLoading = true;
	$rootScope.init();

    $scope.test_geolocation = function(){
      cordova.exec(function(result){
        alert( [result.latitude,
                result.longitude]);
      }, function(){
        
      }, "Geolocation", "getGeolocationInfo", []);
    }
  })

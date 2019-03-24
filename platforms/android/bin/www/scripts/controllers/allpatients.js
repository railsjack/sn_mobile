'use strict';
snApp
	.controller('allPatientsController', function($scope, $rootScope, $location, Api, dbService, OfflineDBAction) {
    
    $rootScope.menuTitle = 'All Loved Ones';
    $scope.selected_lovedone = null;
    
	if(wcsLocalStorage.has('currentUser')){
		$rootScope.user = wcsLocalStorage.get('currentUser');
	}else{
		$location.path('/');
	return;
	}
    
    gLoading = true;
	/*if(!isConnected()) {
		dbService.fetchLovedOnesFromDB();
	}*/
	
	$scope.show_patient_dialog = function(lovedone){

    $scope.selected_lovedone = lovedone;
	 
	  $('.patient-dialog-overlay').show();
	  $scope.searchText = '';
	};

    $scope.close_patient_dialog = function() {
      $('.patient-dialog-overlay').hide();
    };

	$scope.set_as_active = function(lovedone) {
		if(!$rootScope.forceShiftStatus()) {
			$scope.close_patient_dialog();
			return;
		}
		else {
			if(!isConnected()) {
				var offlineRecord = new OfflineDBAction();
				offlineRecord.employe_id = $rootScope.user.id;
				offlineRecord.loved_one_id = lovedone.id;
				offlineRecord.latitude = gLat;
				offlineRecord.longitude = gLng;
				offlineRecord.trip_id = -1;
				//alert('ALL patents.js: set_as_active::>' + offlineRecord.trip_id + ',' + lovedone.trip_id);
				offlineRecord.temp_trip_id = -1;
				offlineRecord.trip_status = 'active';
				offlineRecord.timestamp = $.now();
				offlineRecord.sync_status = 0;
				offlineRecord.employe_state = '';
				offlineRecord.guid = generateUniqueGUID();
				
				offlineRecord.save(lovedone);
			} else {
				var trip_data = { 
					employee_id: $rootScope.user.id, 
					lovedone_id: lovedone.id, 
					lovedone: lovedone, 
					status: 'active',
					state: $rootScope.user.company.state,
					latitude: gLat, 
					longitude: gLng
				};
			
				var promise = Api.post(apiURL+"/trip/new", {trip: trip_data});
				promise.then(function(trip){
					var user = wcsLocalStorage.get('currentUser');
					$scope.close_patient_dialog();
						console.log('Active::>'+JSON.stringify(trip));
						$rootScope.init();
				});
			}
		}
	}
	
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
				//alert('ALL patents.js: unset_as_active::>' + offlineRecord.trip_id + ',' + lovedone.trip_id);
				offlineRecord.temp_trip_id = -1;
				offlineRecord.trip_status = 'removed';
				offlineRecord.timestamp = $.now();
				offlineRecord.sync_status = 0;
				offlineRecord.employe_state = '';
				
				offlineRecord.save(lovedone);
			} else {
			
			  var promise = Api.post(apiURL+"/trip/delete/"+lovedone.trip.id, {});
			  promise.then(function(data){
					console.log('Remove::> '+JSON.stringify(data));
					$rootScope.init();
			  });
		  
			}
		}
      
    };
	
    $rootScope.init();
	
	})



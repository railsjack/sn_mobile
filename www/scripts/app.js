wcsLocalStorage.set('isLoggedIn', !!wcsLocalStorage.get('isLoggedIn'));

var snApp = angular.module('snApp', ['ngRoute', 'ngAnimate', 'ngTouch', 'mobile-angular-ui', 'ui.bootstrap'] );

var gLat = 50, gLng = 50;

var doRefresh = true;
var isDBInitialized = false;
var shiftStatusUpdated = false;
var isListeningLocation = false;

var db;

var DATA_REFRESH_INTERVAL = 3000;
var MAX_INTERVAL_LOVED_ONES = 3000;
var mSinceLastLovedOnesDBUpdate = 0;



 // var apiURL = 'http://172.16.1.214:3000/api';
  // var apiURL = 'http://safetynotice.com:3002/api';
   //var apiURL = 'http://safetynotice.vteamslabs.com/api';
   var apiURL = 'http://10.28.84.73:3000/api';
  
	snApp.config(['$httpProvider', function($httpProvider) {
            $httpProvider.defaults.useXDomain = true;
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
          }])
		.run(function($rootScope, $location, Api, dbService) {
            
            $rootScope.user = {
                lovedones: [],
                active_lovedones: [],
				shift_status:false,
            };
						
			$rootScope.locationListenerId = 0;

    		$rootScope.isLoggedIn = wcsLocalStorage.get('currentUser')!=null && wcsLocalStorage.get('currentUser')!="";
            
            $rootScope.is_taken_by_me = function(lovedone){ 
              var taken = where($rootScope.user.active_lovedones,'id', lovedone.id);
              if(!taken) return false;
              return taken.selected_by_me;
            };
            $rootScope.is_already_taken = function(lovedone){
              if(lovedone==null) return false;
              return where($rootScope.user.active_lovedones, 'id', lovedone.id);
            };
			
			$rootScope.getShiftStatus = function() {
				
				if(!isConnected()) {
					var shift_status = wcsLocalStorage.get('shift_status');
					if(shift_status == 1) {
						$rootScope.user.shift_status = true;
					} else {
						$rootScope.user.shift_status = false;
					}
					shiftStatusUpdated = true;
				}
				else {
					var shiftPromise = Api.post(apiURL + '/employee/activity?employee_id=' + +$rootScope.user.id);
					shiftPromise.then(function(data) {
						//alert('CURRENT STATUS:: '+JSON.stringify(data));
						if(data.activity == 'shift_started') {
							$rootScope.user.shift_status = true;
							wcsLocalStorage.set('shift_status','1');
						} else {
							$rootScope.user.shift_status = false;
							wcsLocalStorage.set('shift_status','0');
						}
						shiftStatusUpdated = true;
					});
				}
			};
			
			$rootScope.endShift = function() {
				$rootScope.hide_end_shift_confirmation_popup();
				$rootScope.show_end_shift_confirmation_popup_2();

			}
			
			$rootScope.endShift2 = function() {
				
				if(!isConnected()) {
					
				} else {
					var shiftPromise = Api.post(apiURL + '/employee/activity?employee_id=' + +$rootScope.user.id + '&shift_completed=true');
					shiftPromise.then(function(data) {
						//alert('End Shift:: '+JSON.stringify(data));
						$rootScope.hide_end_shift_confirmation_popup_2();
						$rootScope.getShiftStatus();
					});
				}
			}
			
			$rootScope.startShift = function() {
				if(!isConnected()) {
					
				} else {
					var shiftPromise = Api.post(apiURL + '/employee/activity?employee_id=' + +$rootScope.user.id + '&shift_started=true');
					shiftPromise.then(function(data) {
						//alert('Start Shift:: '+JSON.stringify(data));
						$rootScope.getShiftStatus();
					});
				}
			}
			
			$rootScope.toggleShiftStatus = function() {
				if($rootScope.user.shift_status) {
					$rootScope.show_end_shift_confirmation_popup();
				} else {
					$rootScope.startShift();
				}
			}
			
			$rootScope.startListeningForLocation = function() {
				locationListenerId = setInterval(function() {
				if(!wcsLocalStorage.get('isLoggedIn')) return;
				  navigator.geolocation.getCurrentPosition(
					  $rootScope.onSuccessForLocation,
					  $rootScope.onErrorForLocation_High,
					  {maximumAge:600000, timeout:5000, enableHighAccuracy: true}
					  );
				}, 6000);
			};
			
			$rootScope.onSuccessForLocation = function(position) {
				var lat = position.coords.latitude, lng=position.coords.longitude;
				gLat = lat;
				gLng = lng;
				
				if(!isConnected()) {
					dbService.logLocation();
				}
			}
			
			$rootScope.onErrorForLocation_High = function(error) {
				//alert(JSON.stringify(res));
			}
	
            $rootScope.init = function() {
				
				$rootScope.logtime = $.now();
				
				if(!$rootScope.isLoggedIn) return;
					
				if(!shiftStatusUpdated) {
					$rootScope.getShiftStatus();
				}
				
				if(!isListeningLocation) {
					isListeningLocation = true;
					$rootScope.startListeningForLocation();
				}
				
				if(!isConnected()) {
				   dbService.fetchLovedOnesFromDB();
				
				  return;
				}

				var latitude = gLat, longitude=gLng;
				var promise = Api.post(apiURL+'/employee/'+$rootScope.user.id+'/lovedones',{location:{latitude: latitude, longitude: longitude}});
				promise.then(function(data) {
					var lovedones = (data.lovedones);
					var employees = (data.employees);
					var active_trips = (data.active_trips);
					
					var selected_emps = {};
					for(var i in employees){
					  selected_emps['lovedone_'+employees[i][1]] = parseInt(employees[i][0]);
					}
					
					var selected_trips = {};
					for(var i in active_trips){
					  selected_trips['lovedone_'+active_trips[i][1]] = [active_trips[i][0], active_trips[i][2]];
					}
					$rootScope.user.lovedones = [];
					$rootScope.user.active_lovedones = [];
					
					
					for(var k in lovedones){
					  var selected = selected_emps['lovedone_'+lovedones[k].id]>0;
					  var selected_by_me = selected_emps['lovedone_'+lovedones[k].id] == $rootScope.user.id && $rootScope.user.id!=undefined;
					  var trip = selected_trips['lovedone_'+lovedones[k].id];
					  
					
					  lovedones[k].name = lovedones[k].last_name + ", " + lovedones[k].first_name;
					  lovedones[k].middle_initial = lovedones[k].middle_initial || "";
					  lovedones[k].date_of_birth = moment(lovedones[k].date_of_birth).format('MM/DD/YYYY');
					  lovedones[k].selected = selected;
					  lovedones[k].selected_by_me = selected_by_me;
					  if(trip!==undefined)
						lovedones[k].trip = {id: trip[0], status: trip[1]};
					
					  $rootScope.user.lovedones.push(lovedones[k]);
					  if(selected) 
						$rootScope.user.active_lovedones.push(lovedones[k]);
					}
					
					var timestamp = $.now();
					if(timestamp - mSinceLastLovedOnesDBUpdate >= MAX_INTERVAL_LOVED_ONES) {
						//console.log('save to db time reached');
						mSinceLastLovedOnesDBUpdate = timestamp;
						dbService.saveLovedOnesToDB($rootScope.user.lovedones, $rootScope.user.active_lovedones);
					}
					
					wcsLocalStorage.set('currentUser', $rootScope.user);
					
					});
            };


		})
        .controller('appController', function($scope, $rootScope, $location, $http, dbService){
            $scope.open_allpatients = function(){
              	$location.path('/allpatients');
            }
            $scope.open_activepatients = function(){
                $location.path('/activepatients');
            }
            $scope.logout = function(){
	
			  if($rootScope.user.active_lovedones.length > 0) {
				$scope.hide_logout_popup();
				//alert('There is 1 Active Loved One.  Please complete the encounter before logging out.');
				$scope.show_logout_active_patients_popup();
				return;  
			  }
			
				
              wcsLocalStorage.destroy('currentUser');
              $rootScope.user = null;
              $rootScope.isLoggedIn = false;
              $rootScope.$evalAsync();
              //$location.path('/');
              wcsLocalStorage.set('isLoggedIn', false);
			  navigator.app.exitApp();
            }
			
			$scope.hide_logout_popup = function() {
				$('.logout-confirmation-dialog-overlay').hide();
				
			}
			$scope.show_logout_popup = function() {
				$('.logout-confirmation-dialog-overlay').show();
			}
			$scope.hide_logout_active_patients_popup = function() {
				$('.lotout-active-patients-dialog-overlay').hide();
				
			}
			$scope.show_logout_active_patients_popup = function() {
				$('.lotout-active-patients-dialog-overlay').show();
			}
			$rootScope.show_end_shift_confirmation_popup = function() {
				$('.end-shift-confirmation-dialog-overlay').show();
			}
			$rootScope.hide_end_shift_confirmation_popup = function() {
				$('.end-shift-confirmation-dialog-overlay').hide();
			}
			$rootScope.show_end_shift_confirmation_popup_2 = function() {
				$('.end-shift-confirmation-dialog-overlay-2').show();
			}
			$rootScope.hide_end_shift_confirmation_popup_2 = function() {
				$('.end-shift-confirmation-dialog-overlay-2').hide();
			}
			
        })
        .directive('ngEnter', function() {
            return function(scope, element, attrs) {
                element.bind("keydown keypress", function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter, {'event': event});
                    });

                    event.preventDefault();
                }
            });
        };
    });

function onErrorForLocation_Low(error){
  cordova.exec(function(location){
    gLat = location.latitude;
    gLng = location.longitude;
  }, function(){
    //$('#geo').show();
	//alert('onErrorForLocation_Low ');
    //$('#geo').val("Error! "+JSON.stringify(arguments));
  }, "Geolocation", "getGeolocationInfo", []);
}

function without(array, key, value){
  var newArray = [];
  for(var k in array){
    if(array[k][key] !== value){
      newArray.push(array[k]);
    }
  }
  return newArray;
}

function where(obj, key, value){
  var ret = false;
  for(var k in obj){
    if(typeof obj[k][key]!=='undefined' && obj[k][key].toString() === value.toString()) {
      ret = obj[k]; break;
    }
  }
  return ret;
}

function set_where(obj, key, value, key1, value1){
  var success = false;
  for(var k in obj){
    if(typeof obj[k][key]!=='undefined' && obj[k][key].toString() === value.toString()) {
      obj[k][key1] = value1; success=true; break;
    }
  }
  return success;
}

function existed(obj, key, value){
  var matched = false;
  for(var k in obj){
    if(typeof obj[k][key]!=='undefined' && obj[k][key].toString() === value.toString()){
      matched = true; break;
    }
  }
  return matched;
}

function isConnected() {
	var networkState = navigator.connection.type;

	var states = {};
	states[Connection.UNKNOWN]  = 'Unknown connection';
	states[Connection.ETHERNET] = 'Ethernet connection';
	states[Connection.WIFI]     = 'WiFi connection';
	states[Connection.CELL_2G]  = 'Cell 2G connection';
	states[Connection.CELL_3G]  = 'Cell 3G connection';
	states[Connection.CELL_4G]  = 'Cell 4G connection';
	states[Connection.CELL]     = 'Cell generic connection';
	states[Connection.NONE]     = 'No network connection';

	if(networkState == Connection.WIFI || networkState == Connection.CELL_2G || networkState == Connection.CELL_3G 
			|| networkState == Connection.CELL_4G || networkState == Connection.CELL) {
		return true;
	}
	return false;
	//alert('Connection type: ' + states[networkState]);
}

function enablePlugins() {
	cordova.plugins.backgroundMode.enable();
	cordova.plugins.backgroundMode.setDefaults({ text:'Doing geolocation tracking.'});
}

function startDataRefreshLoop() {
	if(reloadInterval) clearInterval(reloadInterval);
	var reloadInterval = setInterval(function() {
		if(!doRefresh) {
			return;
		}
		gLoading=false;
		$('#btn-refresh').trigger('click');
	}, DATA_REFRESH_INTERVAL);	
	
}


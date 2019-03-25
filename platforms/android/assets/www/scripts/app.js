wcsLocalStorage.set('isLoggedIn', !!wcsLocalStorage.get('isLoggedIn'));

var snApp = angular.module('snApp', ['ngRoute', 'ngAnimate', 'ngTouch', 'mobile-angular-ui', 'ui.bootstrap'] );

var pushNotification;

var gLat = 0, gLng = 0;

var gLat1 = 25.925937, gLng1 = -80.293579;
var fLat = 31.554606, fLng = 74.357158;
var nLat = 31.462199, nLng = 74.294221;

var doRefresh = true;
var isDBInitialized = false;
var shiftStatusUpdated = false;
var isListeningLocation = false;

var db;

var DATA_REFRESH_INTERVAL = 60*1000*2;	// 2 minutes
var LOCATION_UPDATE_INTERVAL = 1000 * 10;	// 10 seconds
var MAX_INTERVAL_LOVED_ONES = 3000;
var mSinceLastLovedOnesDBUpdate = 0;

var mSound;

var bgGeo;
var bgGeoStarted = false;
var provder = '';
var syncCallSent = false;

    //var apiURL = 'http://safetynotice.herokuapp.com/api';
  	var apiURL = 'http://app.safetynotice.com/api';
		//var apiURL = 'http://d4649cc6.ngrok.io/api';
		//var apiURL = 'http://safetynotice.vteamslabs.com/api';
		//var apiURL = 'http://10.28.84.73:3000/api';
  
	snApp.config(['$httpProvider', function($httpProvider) {
            $httpProvider.defaults.useXDomain = true;
            delete $httpProvider.defaults.headers.common['X-Requested-With'];
          }])
		.run(function($rootScope, $location, Api, dbService) {
            
      $rootScope.user = {
          lovedones: [],
          active_lovedones: [],
          shift_status:false,
          shift_date:'',
      };

			$rootScope.locationListenerId = 0;

			// $rootScope.isLoggedIn = wcsLocalStorage.get('currentUser')!=null && wcsLocalStorage.get('currentUser')!="";
			
	   	$rootScope.isLoggedIn = wcsLocalStorage.get('isLoggedIn');
            
			if(device.platform.toLowerCase() === "android") {
				mSound = new Media('file:///android_asset/www/sound/notify.mp3');
			} 
			else {
				mSound = new Media('sound/notify.mp3');
			}
			
      $rootScope.is_taken_by_me = function(lovedone){ 
        var taken = where($rootScope.user.active_lovedones,'id', lovedone.id);
        if(!taken) return false;
        return taken.selected_by_me;
      };
			
      $rootScope.is_already_taken = function(lovedone){
        if(lovedone==null) return false;
			  return lovedone.selected;
        //return where($rootScope.user.active_lovedones, 'id', lovedone.id);
      };
			
			$rootScope.endEncounterViaPush = function(selected_push) {
				$rootScope.hideElement('.feature-8-dialog-overlay');
				
				var lovedone = {};
				lovedone['id'] = selected_push.lovedone_id;
				lovedone['trip'] = {};
				lovedone.trip['id'] = selected_push.trip_id;
				
				if(!isConnected()) {
					return;
				}
				
				var pushPromise = Api.post(apiURL + '/employee/notification_response?trip_id=' + selected_push.trip_id);
				pushPromise.then(function(data) {

					if(data.status) {
						$rootScope.unselect_patient(lovedone);
					}
					
				});
	
			}
			
			$rootScope.snoozPushForTrip = function(selected_push) {
				$rootScope.hideElement('.feature-8-dialog-overlay');
				
				if(!isConnected()) {
					return;
				}
				
				var pushPromise = Api.post(apiURL + '/employee/notification_response?trip_id=' + selected_push.trip_id);
				pushPromise.then(function(data) {
					
				});
			}
			
			$rootScope.handlePush = function(e) {
				
				if(!$rootScope.isLoggedIn) {
					return;
				}
				
				if(e.event == 'registered') {
					
					$rootScope.sendPushIdToServer(e);
					
				} else if(e.event == 'message') {
					
					//alert('Push Notification::> ' + JSON.stringify(e));
					
					var pushMsg = toPushMsg(e);
					if(pushMsg['type'] == 8) {
						$rootScope.selected_push = pushMsg;
						
						$rootScope.hide_logout_popup();
						$rootScope.hide_logout_active_patients_popup();
						$rootScope.hide_end_shift_confirmation_popup();
						$rootScope.hide_end_shift_confirmation_popup_2();
						$rootScope.hide_no_shift_active_patients_popup();
						$rootScope.hide_shift_not_ended_popup();
						$rootScope.hide_end_shift_with_active_lovedones_popup();
						
						$rootScope.showElement('.feature-8-dialog-overlay');
						
						mSound.play();
						
					} else if(pushMsg['type'] == 9) {
						$rootScope.init();
					}
					
				}
			}
			
			$rootScope.sendPushIdToServer = function(e) {
				if ( e.regid.length <= 0 ) {
					return;
				}
				
				//var savedRegId = wcsLocalStorage.get('reg_id');
				
				//if( typeof(savedRegId) == 'undefined' || savedRegId == '' || savedRegId != e.regid ) {
					gLoading = false;
					var pushPromise = Api.post(apiURL + '/employee/device_registration?employee_id=' + $rootScope.user.id + '&reg_id=' + e.regid + '&reg_type=' + device.platform);
					
					pushPromise.then(function(data) {

						if(typeof(data.status) != 'undefined' && data.status == 1) {
							wcsLocalStorage.set('reg_id', e.regid);
						}
					});
					
				//} else {
					// do nothing. We already have sent this id to server.
					//alert('No need to register');
				//}

			}
			
			$rootScope.isSafeToLeave = function() {
				
				for(var i in $rootScope.user.active_lovedones) {
					if($rootScope.user.active_lovedones[i].selected && $rootScope.user.active_lovedones[i].selected_by_me) {
						return false;
					}
				}
				return true;
				
			}
			
			$rootScope.forceShiftStatus = function() {		// popup will show up if user has not started his shift and try to do some encounter.
				if($rootScope.user.shift_status) {
					return true;
				} else {
					$rootScope.show_no_shift_active_patients_popup();
					return false;
				}
			}
			
			$rootScope.getShiftStatus = function() {
				$rootScope.user.shift_status = wcsLocalStorage.get('shift_status') == 0 ? false : true;
				if(!isConnected()) {
					
					var shift_status = wcsLocalStorage.get('shift_status');
					if(shift_status == 1) {
						$rootScope.setShiftDate(wcsLocalStorage.get('shift_date'));
					} else {
						$rootScope.setShiftDate(wcsLocalStorage.get('shift_date'));
					}
					$rootScope.user.shift_status = wcsLocalStorage.get('shift_status') == 0 ? false : true;
					shiftStatusUpdated = true;
					
				}
				else {
					gLoading = false;
					var shiftPromise = Api.post(apiURL + '/employee/activity?employee_id=' + +$rootScope.user.id);
					shiftPromise.then(function(data) {
						
						// alert(JSON.stringify(data));
						
						if( typeof(data) == 'undefined' || data == '' || typeof(data.activity) == 'undefined') {
							
							$rootScope.user.shift_status = false;
							wcsLocalStorage.set('shift_status','0');
							$rootScope.setShiftDate(wcsLocalStorage.get('shift_date'));
							return;
							
						}
						if(data.activity == 'shift_started' || data.activity == 'existing_shift_updated') {
							
							$rootScope.user.shift_status = true;
							wcsLocalStorage.set('shift_status','1');
							$rootScope.setShiftDate(data.start_date);
							
							
						} else if(data.activity == 'no_shift_started') {
							
							$rootScope.user.shift_status = false;
							wcsLocalStorage.set('shift_status','0');
							$rootScope.setShiftDate(data.end_date);
							
						}
						else {
							
							$rootScope.user.shift_status = wcsLocalStorage.get('shift_status') == 0 ? false : true;
							// wcsLocalStorage.set('shift_status','0');
							
							$rootScope.setShiftDate(data.end_date);
						}
						shiftStatusUpdated = true;
					});
				}
			};
			
			$rootScope.getShiftDate = function() {
				if($rootScope.user.shift_date == null || typeof($rootScope.user.shift_date) == 'undefined' || $rootScope.user.shift_date == 'null') {
					return '';
				} else {
					return $rootScope.user.shift_date;
				}
			}
			
			$rootScope.setShiftDate = function(date) {
				if(typeof(date) == 'undefined' || date == '') {
					$rootScope.user.shift_date = 'xxxx/xx/xx';
					wcsLocalStorage.set('shift_date', $rootScope.user.shift_date);
				} else {
					$rootScope.user.shift_date = date;
					wcsLocalStorage.set('shift_date', date);
				}
			}		
			
			$rootScope.startShift = function() {
				if(!isConnected()) {
					
					$rootScope.user.shift_status = true;
					wcsLocalStorage.set('shift_status','1');
					dbService.saveOfflineShiftLog($rootScope.user.id, 1, $.now());
					$rootScope.setShiftDate(getFormattedCurrentDate());
					
				} else {
					var shiftPromise = Api.post(apiURL + '/employee/activity?employee_id=' + $rootScope.user.id + '&shift_started=true' + '&latitude=' + gLat + '&longitude=' + gLng);
					shiftPromise.then(function(data) {
						console.log('startShift() > '+JSON.stringify(data));
						$rootScope.getShiftStatus();
					});
				}
			}
			
			$rootScope.endShift = function() {
				
				$rootScope.hide_end_shift_confirmation_popup();
				$rootScope.show_end_shift_confirmation_popup_2();

			}
			
			$rootScope.endShift2 = function() {
				
				if(!$rootScope.isSafeToLeave()) {
					//return;
					$rootScope.hide_end_shift_confirmation_popup_2();
					$rootScope.show_end_shift_with_active_lovedones_popup();
					return;
				}
				
				if(!isConnected()) {
					
					$rootScope.user.shift_status = false;
					wcsLocalStorage.set('shift_status','0');
					$rootScope.hideElement('.end-shift-confirmation-dialog-overlay-2');
					// save shift change to local database
					dbService.saveOfflineShiftLog($rootScope.user.id, 0, $.now());
					$rootScope.setShiftDate(getFormattedCurrentDate());
					
					//if($rootScope.user.active_lovedones.length == 0) {
						$location.path('/allpatients');
					//}
					
				} else {
					
					$rootScope.enforceEndShift(false);
					
				}
			}
			
			$rootScope.enforceEndShift = function(doLogout) {
				var shiftPromise = Api.post(apiURL + '/employee/activity?employee_id=' + $rootScope.user.id + '&shift_completed=true');
				shiftPromise.then(function(data) {

					wcsLocalStorage.set('shift_status','0');
					
					if(doLogout) {
						$rootScope.hideElement('.shift-not-ended-dialog-overlay');
						$rootScope.enforceLogout();
					} 
					else {
						
						$rootScope.hide_end_shift_confirmation_popup_2();
					
						if($rootScope.user.active_lovedones.length == 0) {
							$location.path('/allpatients');
						}
						$rootScope.getShiftStatus();
					}
					
				});
			}
			
			$rootScope.toggleShiftStatus = function() {
				if($rootScope.user.shift_status) {
					$rootScope.show_end_shift_confirmation_popup();
				} else {
					$rootScope.startShift();
				}
			}
			
			$rootScope.enforceLogout = function() {
				
				  wcsLocalStorage.destroy('currentUser');
				  wcsLocalStorage.set('isLoggedIn', false);
				  
				  $rootScope.user = null;
				  $rootScope.isLoggedIn = false;
				  $rootScope.$evalAsync();
				  
				  if(device.platform == 'android' || device.platform == 'Android' || device.platform == 'amazon-fireos') {
					  navigator.app.exitApp();
				  } else {
					  $rootScope.hideElement('.shift-not-ended-dialog-overlay');
					  $rootScope.hide_end_shift_confirmation_popup_2();
					  $rootScope.hide_logout_popup();
					  $location.path('/');
				  }
				  
				  bgGeo.stop();
				  bgGeoStarted = false;
				  
			}
			
			$rootScope.updateLocationToServer = function() {
				console.log('Start of updateLocationToServer() ' + gLat + ' :: ' + gLng);
				if(!wcsLocalStorage.get('isLoggedIn')) {
					 return;
				}
				if(gLat == 0 || gLng == 0) {
					console.log('RETURN of updateLocationToServer() ' + gLat + ' :: ' + gLng);
					return;
				}
				if(!isConnected()) {
					dbService.logLocation();
				} else {
					console.log('GOING TO UPDATE updateLocationToServer() ' + gLat + ' :: ' + gLng);
					gLoading = false;
					var prom = Api.post(apiURL+'/employee/'+$rootScope.user.id+'/current_location', {latitude: gLat, longitude: gLng, provder: provder});
					prom.then(function(data) {
						 console.log('updateLocationToServer()<::> ' + JSON.stringify(data) + 'gLat:' + gLat + ', gLng' + gLng);
					});
				}
				
			};
			
			$rootScope.startListeningForLocation = function() {
				//alert('startListeningForLocation');
				$rootScope.locationListenerId = setInterval(function() {
				
					/*if(!wcsLocalStorage.get('isLoggedIn')) {
						 return;
					}*/
				  navigator.geolocation.getCurrentPosition(
					  $rootScope.onSuccessForLocation,
					  $rootScope.onErrorForLocation_High,
					  {maximumAge:600000, timeout:15000, enableHighAccuracy: true}
					  );
				}, 5000);
				
			};
			
			$rootScope.onSuccessForLocation = function(position) {
				var lat = position.coords.latitude, lng=position.coords.longitude;
				gLat = lat;
				gLng = lng;
				provider = position.coords.provider;
				//console.log('onSuccessForLocation::>' + gLat + ',  ' + gLng + ', provider:');
				//console.log('updating location...');
				
			}
			
			$rootScope.onErrorForLocation_High = function(error) {
				console.log(JSON.stringify(error));
			}
			
			$rootScope.syncOfflineDataToServer = function() {
				dbService.getLogData($rootScope.getLogDataCallBack);
			}
			
			$rootScope.getLogDataCallBack = function(dBData) {
				console.log('getLogDataCallBack()');
				//var ws = Api.post(apiURL + '/employee/'+$rootScope.user.id+'/data_syncing', {data:JSON.stringify(dBData)});
				var ws = Api.post(apiURL + '/employee/data_syncing', {data:JSON.stringify(dBData)});
				ws.then(function(response) {
					
					// alert(JSON.stringify(response));
					syncCallSent = true;
					dbService.clearOfflineData($rootScope.offlineDBClearCallBack);
					
				});
				
			}
			
			$rootScope.offlineDBClearCallBack = function() {
				$rootScope.init();
			}
			
            $rootScope.init = function() {
				console.log('init() called...');
				
				if(isConnected() && !syncCallSent) {
					$rootScope.syncOfflineDataToServer();
					return;
				}
				
				if(!$rootScope.isLoggedIn) return;
	
				$rootScope.getShiftStatus();
				
				if(!bgGeoStarted) {
					console.log('bgGeo NOT started. trying to restart...');
					if(typeof(bgGeo) == 'undefined' || bgGeo == null) {
						setupLocationPlugin();
					} else {
						bgGeo.start();
						bgGeoStarted = true;
						console.log('bgGeo started...');
					}
				}
				
				registerForPushNotification();
							
				if(!isConnected()) {
				   dbService.fetchLovedOnesFromDB();
				
				  return;
				}

				var latitude = gLat, longitude=gLng;
				//var promise = Api.post(apiURL+'/employee/'+$rootScope.user.id+'/lovedones',{location:{latitude: latitude, longitude: longitude}});
				gLoading = true;
				var promise = Api.post(apiURL+'/employee/'+$rootScope.user.id+'/lovedones', '');
				promise.then(function(data) {
					//console.log('ServerData ' + JSON.stringify(data));
					//alert(''+JSON.stringify(data));
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
					  if(selected && selected_by_me) 
						$rootScope.user.active_lovedones.push(lovedones[k]);
					}
					
					//if(timestamp - mSinceLastLovedOnesDBUpdate >= MAX_INTERVAL_LOVED_ONES) {
						//console.log('save to db time reached');
						//mSinceLastLovedOnesDBUpdate = timestamp;
						dbService.saveLovedOnesToDB($rootScope.user.lovedones, $rootScope.user.active_lovedones);
					//}
					

					
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
			  if( !$rootScope.isSafeToLeave() ) {
					$rootScope.hide_logout_popup();
					$rootScope.show_logout_active_patients_popup();

					return;  
			  }
			  if( $rootScope.user.shift_status ) {
				  	$rootScope.hide_logout_popup();
   			      	$rootScope.show_shift_not_ended_popup();
				
					return;  
			  }
			
			  
			  $rootScope.enforceLogout();
			  
            }
			
			$rootScope.hide_logout_popup = function() {
				$('.logout-confirmation-dialog-overlay').hide();
				
			}
			$rootScope.show_logout_popup = function() {
				$('.logout-confirmation-dialog-overlay').show();
			}
			$rootScope.hide_logout_active_patients_popup = function() {
				$('.logout-active-patients-dialog-overlay').hide();
			}
			$rootScope.show_logout_active_patients_popup = function() {
				$('.logout-active-patients-dialog-overlay').show();	
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
			$rootScope.show_no_shift_active_patients_popup = function() {
				$('.no-active-shift--dialog-overlay').show();
			}
			$rootScope.hide_no_shift_active_patients_popup = function() {
				$('.no-active-shift--dialog-overlay').hide();
			}
			$rootScope.cancelShiftEndStep1 = function() {
				if($rootScope.user.active_lovedones.length == 0) {
					$location.path('/allpatients');
				}
				$rootScope.hide_end_shift_confirmation_popup();
			}
			$rootScope.cancelShiftEndStep2 = function() {
				if($rootScope.user.active_lovedones.length == 0) {
					$location.path('/allpatients');
				}
				$rootScope.hide_end_shift_confirmation_popup_2();
			}
			$rootScope.hide_shift_not_ended_popup = function() {
				$('.shift-not-ended-dialog-overlay').hide();
				$scope.hide_logout_popup();
				
			}
			$rootScope.show_shift_not_ended_popup = function() {
				$('.shift-not-ended-dialog-overlay').show();
			}
			$rootScope.hide_end_shift_with_active_lovedones_popup = function() {
				$('.end-shift-with-active-lovedones-dialog-overlay').hide();
			}
			
			$rootScope.show_end_shift_with_active_lovedones_popup = function() {
				$('.end-shift-with-active-lovedones-dialog-overlay').show();
			}
			
			$rootScope.showElement = function(element) {
				$(element).show();
			}
			
			$rootScope.hideElement = function(element) {
				$(element).hide();
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
  }, function() {
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

function startLocationRefreshLoop() {
	
	if(locationReloadInterval) clearInterval(locationReloadInterval);
	
	var locationReloadInterval = setInterval(function() {
		
		$('#btn-location').trigger('click');
		
	}, LOCATION_UPDATE_INTERVAL);	
	
}

function enablePlugins() {
	
	document.addEventListener("online", onOnline, false);
	document.addEventListener("offline", onOffline, false);
	
	cordova.plugins.backgroundMode.enable();
	cordova.plugins.backgroundMode.setDefaults({ text:'Doing geolocation tracking...'});

	/*if(!isListeningLocation) {
		isListeningLocation = true;
		var scope = angular.element(document.getElementById('btn-push')).scope();
		scope.$apply(function() {
			scope.startListeningForLocation();
		});
		
	}*/
	
	setupLocationPlugin();
	
	
	if(wcsLocalStorage.get('isLoggedIn')) {
		registerForPushNotification();
	}
	
	setTimeout(function() {
		CheckGPS.check(function(){},
		  function(){
			//GPS is disabled!
			alert("Your device's GPS is not enabled. Please enable GPS from your device settings.");
			
		  });
	}, 3000);
	
}

function setupLocationPlugin() {
	window.navigator.geolocation.getCurrentPosition(function(location) {
       console.log('Location from Phonegap ' + JSON.stringify(location));
    });
	
	bgGeo = window.plugins.backgroundGeoLocation;
	
	/**
    * This would be your own callback for Ajax-requests after POSTing background geolocation to your server.
    */
    var yourAjaxCallback = function(response) {
        ////
        // IMPORTANT:  You must execute the #finish method here to inform the native plugin that you're finished,
        //  and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
        // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
        //
        //
        bgGeo.finish();
    };
	
	/**
    * This callback will be executed every time a geolocation is recorded in the background.
    */
    var callbackFn = function(location) {
        console.log('[ios] didUpdateLocations():  ' + location.latitude + ', ' + location.longitude);
		
		gLat = location.latitude;
		gLng = location.longitude;
		
        // Do your HTTP request here to POST location to your server.
        //
        //
        //yourAjaxCallback.call(this);
		//bgGeo.finish();
    };
	
	var failureFn = function(error) {
        console.log('BackgroundGeoLocation error');
    }

    // BackgroundGeoLocation is highly configurable.
    bgGeo.configure(callbackFn, failureFn, {
        url: '', // <-- only required for Android; ios allows javascript callbacks for your http
        params: {                                               // HTTP POST params sent to your server when persisting locations.
            foo: 'bar'
        },
        desiredAccuracy: 10,
        stationaryRadius: 0,
        distanceFilter: 1,
        debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
		stopOnTerminate: true // <-- enable this to clear background location settings when the app terminates
    });

    // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
    bgGeo.start();
	bgGeoStarted = true;
	console.log('setupLocationPlugin():: bgGeo started.');
	
	if (device.platform == 'android' || device.platform == 'Android' ||	device.platform == 'amazon-fireos' ) {
	
		setInterval(function() {
			bgGeo.get(function(data) {

					gLat = data.location.latitude;
					gLng = data.location.longitude;
					provder = data.location.provider;
									
					console.log('[android] location update:>  '+gLat + ', ' + gLng); 
	
				}, function(error) {
					//alert(error);
				}
			);
		}, LOCATION_UPDATE_INTERVAL);
	
	}

    // If you wish to turn OFF background-tracking, call the #stop method.
    // bgGeo.stop()
	
}

function onOnline() {
    // Handle the online event
	/*if(!wcsLocalStorage.get('isLoggedIn')) {
		return;
	}*/
	
	var scope = angular.element(document.getElementById('btn-push')).scope();
	scope.$apply(function() {
		scope.syncOfflineDataToServer();
	});
}

function onOffline() {
    // Handle the offline event
	if(!wcsLocalStorage.get('isLoggedIn')) {
		return;
	}
	
	var scope = angular.element(document.getElementById('btn-push')).scope();
	scope.$apply(function() {
		scope.init();
	});
	
	
}

function registerForPushNotification() {
	try {
		pushNotification = window.plugins.pushNotification;
		
		if (device.platform == 'android' || device.platform == 'Android' ||	device.platform == 'amazon-fireos' ) {
			pushNotification.register(successHandler, errorHandler, {"senderID":"520928485818","ecb":"onNotification"});		// required!
		} else {
			pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});	// required!
		}
	} catch (err) { 
		//txt="There was an error on this page.\n\n";
		//txt+="Error description: " + err.message + "\n\n";
		//alert(txt);
	} 
}

// handle APNS notifications for iOS
function onNotificationAPN(e) {
	
	//mSound.play();

	if (e.alert) {
		 //$("#app-status-ul").append('<li>push-notification: ' + e.alert + '</li>');
		 // showing an alert also requires the org.apache.cordova.dialogs plugin
		 //navigator.notification.alert(e.alert);
	}
	if (e.sound) {
		// playing a sound also requires the org.apache.cordova.media plugin
		var snd = new Media(e.sound);
		snd.play();
	}
	
	if (e.badge) {
		//pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
	}
	
	var scope = angular.element(document.getElementById('btn-push')).scope();
	scope.$apply(function() {
		var payload = {event:'message', payload:e};
		scope.handlePush(payload);
	});
	
	//console.log('sound playing...');
	
}


// handle GCM notifications for Android
function onNotification(e) {

	//console.log('onNotification(): '+JSON.stringify(e));
	
	var scope = angular.element(document.getElementById('btn-push')).scope();
	scope.$apply(function() {
		scope.handlePush(e);
	});
	
	
	
	switch( e.event )
	{
		case 'registered':
		if ( e.regid.length > 0 )
		{
			//alert(JSON.stringify(e));
			//console.log(JSON.stringify(e));
			// Your GCM push server needs to know the regID before it can push to this device
			// here is where you might want to send it the regID for later use.
			//console.log("regID = " + e.regid);
		}
		break;
		
		case 'message':
 			//mSound.play();
			
			// if this flag is set, this notification happened while we were in the foreground.
			// you might want to play a sound to get the user's attention, throw up a dialog, etc.
			if (e.foreground)
			{
				  
					// on Android soundname is outside the payload. 
						// On Amazon FireOS all custom attributes are contained within payload
						var soundfile = e.soundname || e.payload.sound;
						// if the notification contains a soundname, play it.
						// playing a sound also requires the org.apache.cordova.media plugin
						//var my_media = new Media("/android_asset/www/"+ soundfile);
						//my_media.play();
				
			}
			else
			{	// otherwise we were launched because the user touched a notification in the notification tray.
				/*if (e.coldstart)
					$("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
				else
				$("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');*/
				
				
			}
				
		break;
		
		case 'error':
			//console.log("error = " + 	console.log(JSON.stringify(e)));
		break;
		
		default:
			//console.log("default = " + 	console.log(JSON.stringify(e)));
		break;
	}
}

function tokenHandler (result) {
	// Your iOS push server needs to know the token before it can push to this device
	// here is where you might want to send it the token for later use.
	
	var scope = angular.element(document.getElementById('btn-push')).scope();
	scope.$apply(function() {
		var e = {regid: result, event: 'registered'};
		scope.handlePush(e);
	});
}

function successHandler (result) {
	//console.log('successHandler'+JSON.stringify(result));
}

function errorHandler (error) {
	//console.log('errorHandler'+JSON.stringify(error));
}

function toPushMsg(e) {
	//alert(JSON.stringify(e));
	var obj = {};
	obj['type'] = e.payload.tp;
	//alert(obj['type']);
	if(obj['type'] == 8) {
		//alert('inside if ');
		obj['lovedone_name'] = e.payload.ln;
		obj['lovedone_id'] = e.payload.lid;
		obj['trip_id'] = e.payload.tid;
		obj['employe_id'] = e.payload.eid;
	} 
	else if (obj['type'] == 9) {
		// alert(JSON.stringify(e));
	}
	return obj;
}

function generateUniqueGUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}

function getFormattedCurrentDate() {
	var d = new Date();

	var month = d.getMonth()+1;
	var day = d.getDate();
	var year = d.getFullYear();
	var hrs = d.getHours();
	var mins = d.getMinutes();
	
	return '' + (month<10?'0'+month:month) + '-' + (day<10?'0'+day:day) + '-' + year.toString().substr(2,2) + ' ' + (hrs<10?'0'+hrs:hrs) + ':' + (mins<10?'0'+mins:mins);
	
}
'use strict';
var gLoading = true;
angular.module('snApp')
  .service('Api', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope, endpoint, params){
    this.get = function(endpoint, params) {
      var deferred = $q.defer();
      if(gLoading)$('.loading').show();
      $http({
        url: endpoint,
        method: "GET",
        headers: {
          'content-type':'application/json'
        },
        params: params
      }).
      success(function(data, status, headers, config) {
        //console.log('success');
        //console.dir(data);
        deferred.resolve(data);
      }).
      error(function(data, status, headers, config) {
        //console.log('failed');
        deferred.resolve(data);
      }).
      finally(function(){
        $('.loading').hide(); gLoading = true;
      });
      return deferred.promise;
    };
    this.post = function(endpoint, params) {
      var deferred = $q.defer();
      //console.log(params);
      if(gLoading)$('.loading').show();
      $http({
        url: endpoint,
        method: "POST",
        headers: {
          'content-type':'application/json'
        },
        data: params
      }).
      success(function(data, status, headers, config) {
        //console.log('success');
        //console.log(data)
        deferred.resolve(data);
      }).
      error(function(data, status, headers, config) {
        //console.log('failed');
        //console.dir(data);
        deferred.resolve(data);
      }).
      finally(function(){
        $('.loading').hide(); gLoading = true;
      });
      return deferred.promise;
    };
    this.put = function(endpoint, params) {
      var deferred = $q.defer();
      if(gLoading)$('.loading').show();
      $http({
        url: endpoint,
        method: "PUT",
        headers: {
          'content-type':'application/json'
        },
        data: params
        }).
        success(function(data, status, headers, config) {
          //console.log('success');
          ////console.log(data);
        deferred.resolve(data);
        }).
        error(function(data, status, headers, config) {
          //console.log('failed');
          //console.dir(data);
          deferred.resolve(data);
        }).
        finally(function(){
          $('.loading').hide(); gLoading = true;
        });
        return deferred.promise;
    };
    this.patch = function(endpoint, params) {
      var deferred = $q.defer();
      if(gLoading)$('.loading').show();
      $http({
        url: endpoint,
        method: "PATCH",
        headers: {
          'content-type':'application/json'
        },
        data: params
        }).
        success(function(data, status, headers, config) {
          //console.log('success');
          ////console.log(data);
        deferred.resolve(data);
        }).
        error(function(data, status, headers, config) {
          //console.log('failed');
          //console.dir(data);
          deferred.resolve(data);
        }).
        finally(function(){
          $('.loading').hide(); gLoading = true;
        });
        return deferred.promise;
    };
    this.del = function(endpoint, params) {
      var deferred = $q.defer();
      if(gLoading)$('.loading').show();
      $http({
        url: endpoint,
        method: "DELETE",
        headers: {
          'content-type':'application/json'
        },
        data: params
        }).
        success(function(data, status, headers, config) {
          //console.log('success');
          ////console.log(data['data']);
          deferred.resolve(data);
        }).
        error(function(data, status, headers, config) {
          //console.log('failed');
          ////console.log(data);
          deferred.resolve(data);
        }).
        finally(function(){
          $('.loading').hide(); gLoading = true;
        });
        return deferred.promise;
    };
  }]);
  
  
  angular.module('snApp').factory("dbService", ["$rootScope", function($rootScope) {
		var db = {};
		db.initDB = function() {
			console.log('initializing db...');
			db = window.sqlitePlugin.openDatabase({name: "snapp_offline_db", createFromLocation: 1});
			isDBInitialized = true;
			
			db.saveLovedOnesToDB = function(lovedones, active_lovedones) {
				if(!isDBInitialized) {
					return;
				}
				
				db.transaction(function(tx) {
					
					if(lovedones.length == 0) {
						console.log('LENGTH is 0');
						return;
					}
					tx.executeSql('DELETE FROM loved_ones');
					
					for(var j in lovedones) {
						var l = lovedones[j];
						//alert(JSON.stringify(l));
						var selected = 0;
						var selected_by_me = 0;
						if(l.selected) {
							selected = 1;
						}
						if(l.selected_by_me) {
							selected_by_me = 1;
						}
						var trip_id = -1;
						for(var i in active_lovedones) {
							var b = active_lovedones[i];
							if(b.id == l.id) {
								trip_id = b.trip.id;
							}
						}
						tx.executeSql("INSERT INTO loved_ones (loved_one_id, name, date_of_birth, status, middle_initial, selected, selected_by_me, first_name, last_name, trip_id) VALUES (?,?,?,?,?,?,?,?,?,?)", 
						[l.id, l.name, l.date_of_birth, 0, l.middle_initial, selected, selected_by_me, l.first_name, l.last_name, trip_id], function(tx, res) {
							
						});
						
					}
					
					for(var i in active_lovedones) {
						var b = active_lovedones[i];
						//alert(JSON.stringify(b));
						var selected = 0;
						var selected_by_me = 0;
						if(b.selected) {
							selected = 1;
						}
						if(b.selected_by_me) {
							selected_by_me = 1;
						}
						
						tx.executeSql("INSERT INTO loved_ones (loved_one_id, name, date_of_birth, status, middle_initial, selected, selected_by_me, trip_id, employe_id, trip_status, first_name, last_name) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", 
						[b.id, b.name, b.date_of_birth, 1, b.middle_initial, selected, selected_by_me, b.trip.id, $rootScope.user.id, b.trip.status, b.first_name, b.last_name], function(tx, res) {
							//console.log('INSERT: ACTIVE_loved_one' + res.insertId);
						});
					}
					
					//console.log('Data saved for offline use.');
					
				});
				
				
			};
		
			db.fetchLovedOnesFromDB = function() {
				if(!isDBInitialized) {
					return;
				}
				
				db.transaction(function(tx) {
					tx.executeSql("SELECT * FROM loved_ones WHERE status = 0",[], function(ttx, res) {

						var loved_ones = [];
						$rootScope.user.lovedones = [];
						
						//console.log('fetchLovedonesDB S:> '+JSON.stringify(res));
						
						for(var i = 0; i < res.rows.length; i++) {
						
							var obj = res.rows.item(i);
							
							// console.log('OBJ:> S'+JSON.stringify(obj));
							
							loved_ones[i] = {id:-1, name:'', date_of_birth:'', selected:false, selected_by_me:false, middle_initial:'', first_name:'', last_name:'', trip_id:0, employe_id:0, status:0, db_id:-1, guid:''};
							
							loved_ones[i].db_id = obj.db_id;
							loved_ones[i].id = obj.loved_one_id;
							loved_ones[i].name = obj.name;
							loved_ones[i].date_of_birth = obj.date_of_birth;
							if(obj.selected == 1) {
								loved_ones[i].selected = true;
							} else {
								loved_ones[i].selected = false;
							}
							if(obj.selected_by_me == 1) {
								loved_ones[i].selected_by_me = true;
							} else {
								loved_ones[i].selected_by_me = false;
							}
							loved_ones[i].middle_initial = obj.middle_initial;
							loved_ones[i].first_name = obj.first_name;
							loved_ones[i].last_name = obj.last_name;
							loved_ones[i].status = 0;
							loved_ones[i].guid = obj.guid;
							loved_ones[i].trip_id = obj.trip_id;
							
							//console.log('OBJ:> AFTER COPY S:> '+ JSON.stringify(loved_ones[i]));
							
							//$rootScope.user.lovedones.push(loved_ones[i]);
							
						}
						$rootScope.$apply(function() {
							
							$rootScope.user.lovedones = loved_ones;
							console.log('fetchLovedonesDB SIMPLE:> '+JSON.stringify($rootScope.user.lovedones));
						});
						
						//alert('LOVED ONES: ' + JSON.stringify($rootScope.user.lovedones));

					});
					
					tx.executeSql("SELECT * FROM loved_ones WHERE status = 1", [], function(tx, ress) {
						
						var active_loved_ones = [];
						$rootScope.user.active_lovedones = [];
						//console.log('fetchLovedonesDB AC:> '+JSON.stringify(ress));
						for(var i = 0; i < ress.rows.length; i++) {
							
							var obj = ress.rows.item(i);
							//alert('OBJ:> AC '+JSON.stringify(obj));
							
							active_loved_ones[i] = {id:-1, name:'', date_of_birth:'', selected:true, selected_by_me:true, middle_initial:'', trip_id:0, employe_id:-1, status:1, first_name:'', 
							last_name:'', db_id:-1, trip:{}, guid:''};

							active_loved_ones[i].db_id = obj.db_id;
							active_loved_ones[i].id = obj.loved_one_id;
							active_loved_ones[i].name = obj.name;
							active_loved_ones[i].date_of_birth = obj.date_of_birth;
							if(obj.selected == 0) {
								active_loved_ones[i].selected = false;
							} else {
								active_loved_ones[i].selected = true;
							}
							if(obj.selected_by_me == 0) {
								active_loved_ones[i].selected_by_me = false;
							} else {
								active_loved_ones[i].selected_by_me = true;
							}
							active_loved_ones[i].middle_initial = obj.middle_initial;
							active_loved_ones[i].trip_id = obj.trip_id;
							active_loved_ones[i].employe_id = obj.employe_id;
							active_loved_ones[i].status = 1;
							active_loved_ones[i].trip = {id: obj.trip_id, status: obj.trip_status};
							
							active_loved_ones[i].first_name = obj.first_name;
							active_loved_ones[i].last_name = obj.last_name;
							active_loved_ones[i].guid = obj.guid;
							//alert('OBJ:> AC '+JSON.stringify(active_loved_ones[i]));
							//$rootScope.user.active_lovedones.push(active_loved_ones[i]);
							
						}
						$rootScope.$apply(function() {
							$rootScope.user.active_lovedones = active_loved_ones;
							console.log('fetchLovedonesDB ACTIVE:> '+JSON.stringify($rootScope.user.active_lovedones));
						});
												
					});
				});
				
			};
			
			db.saveAction = function(action, lovedone) {
				if(!isDBInitialized) {
					return;
				}
				//$('.loading').show();
				db.transaction(function(tx) {
					var mGUID = ( typeof(lovedone.guid) == 'undefined' || lovedone.guid == '' || lovedone.guid==null ) ? (action.trip_id == -1 ? action.guid : '') : lovedone.guid;
					
					console.log('saveAction()::> GUID '+ mGUID + ',  Action::> ' + JSON.stringify(action) + ',   lovedone::> ' + JSON.stringify(lovedone));
					// save the record to the offline log to sync later
					tx.executeSql("INSERT INTO actions_log (employe_id, loved_one_id, trip_id, temp_trip_id, lat, lng, user_state, trip_status, timestamp, sync_state, guid) " + 
					"VALUES (?,?,?,?,?,?,?,?,?,?,?) ", 
					[action.employe_id, action.loved_one_id, action.trip_id, action.temp_trip_id, action.latitude, action.longitude, action.employe_state, action.trip_status, action.timestamp, action.sync_state,	mGUID]
					, function(tx, res) {
						//console.log('action log saved...' + JSON.stringify(action) + ' :: ' + JSON.stringify(lovedone));
						// if user has activated some customer, update the active state and add to active loved ones
						if(action.trip_status == 'active') {
							
							var updateQuery = "UPDATE loved_ones SET selected = 1 , selected_by_me = 1 WHERE loved_one_id = " + action.loved_one_id;
							tx.executeSql(updateQuery, [], function(tx, res) {
								
								//console.log("UPDATE rows result = " + JSON.stringify(res));
								
							}, function(error) {
								//console.log("Error processing SQL : " + error.code);
							});
							
							
							var insertQuery = "INSERT INTO loved_ones (loved_one_id, name, date_of_birth, status, middle_initial, selected, selected_by_me, trip_id, employe_id, trip_status, first_name, last_name, guid) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";

							tx.executeSql(insertQuery, 
								[action.loved_one_id, lovedone.name, lovedone.date_of_birth, 1, lovedone.middle_initial, 1, 1, action.trip_id, action.employe_id, "active", lovedone.first_name, lovedone.last_name, mGUID],
								 function(tx, res) {
									
									//console.log('INSERT: ACTIVE_loved_one :' + res.insertId);
									
									tx.executeSql("UPDATE loved_ones SET guid = '" + mGUID + "' WHERE loved_one_id = " + action.loved_one_id, [], function(tx, res) {
										//alert(JSON.stringify(res));
										$rootScope.$apply(function() {
											$rootScope.init();
										
										});
										
									});

								});
							
							$('.patient-dialog-overlay').hide();
							
						}
						else if(action.trip_status == 'started') {
							
							if(typeof(lovedone.db_id) == 'undefined') {
								return;
							}
							
							lovedone.trip = {id:action.trip_id, status:'started'};
							
							var updateQuery = "UPDATE loved_ones SET trip_status = 'started' WHERE loved_one_id = " + lovedone.id;
							tx.executeSql(updateQuery, [], function(tx, res) {
								
								$rootScope.$apply(function() {
									$rootScope.init();
								});
								
							}, function(error) {
								
							});
						}
						else if(action.trip_status == 'completed') {
							
							if(typeof(lovedone.db_id) == 'undefined') {
								return;
							}
							
							lovedone.trip = {id:action.trip_id, status:'completed'};
							
							var updateQuery = "DELETE FROM loved_ones WHERE db_id = " + lovedone.db_id;
							tx.executeSql(updateQuery, [], function(tx, res) {
									
							}, function(error) {
								
							});
							
							var updateQuery2 = "UPDATE loved_ones SET trip_status = '-1', selected = 0 , selected_by_me = 0, trip_id = -1, guid = '' WHERE loved_one_id = " + lovedone.id;
							tx.executeSql(updateQuery2, [], function(tx, res) {
								
								$rootScope.$apply(function() {
									$rootScope.init();
								});
								
							}, function(error) {
								
							});
							
						}
						else if(action.trip_status == 'removed') {
							if(typeof(lovedone.db_id) == 'undefined') {
								return;
							}
							lovedone.trip = {id:action.trip_id, status:'removed'};
							
							var deleteQuery = "DELETE FROM loved_ones WHERE loved_one_id = " + lovedone.id + ' AND status = 1';
							tx.executeSql(deleteQuery, [], function(tx, res) {
								
								var updateQuery = "UPDATE loved_ones SET selected = 0, selected_by_me = 0, trip_id = -1, guid = '' WHERE loved_one_id = " + action.loved_one_id;
								tx.executeSql(updateQuery, [], function(tx, res) {
									
									$rootScope.$apply(function() {
										$rootScope.init();
									});
									
								}, function(error) {
									
								});
								
							}, function(error) {
								
							});
							
							
						}
						//console.log('Action saved to offline log history.');
					});
				});
			};
			
			db.logLocation = function() {
				db.transaction(function(tx) {
					var insertQuery = "INSERT INTO location_tracking_log (employe_id, lat, lng, timestamp, sync_state) VALUES(?,?,?,?,?)";
					tx.executeSql(insertQuery, [$rootScope.user.id, gLat, gLng, $.now(), 0], function(tx, res) {
						
					});
				});
			};
			
			
			db.getLogData = function(callback) {
				
				var logData = {};
				
				db.transaction(function(tx) {
					
					tx.executeSql("SELECT * FROM actions_log", [], function(tx, res) {
						
						logData['actions'] = [];
						
						for(var i = 0; i < res.rows.length; i++) {
							
							var obj = res.rows.item(i);
							/*console.log('=============================================\n');
							console.log(JSON.stringify(obj));
							console.log('=============================================\n');*/
							logData.actions.push(obj);
							
							
						}
						
						logData['location_log'] = [];
						
						tx.executeSql("SELECT * FROM location_tracking_log", [], function(tx, res) {
							for(var i = 0; i < res.rows.length; i++) {
							
								var obj = res.rows.item(i);
								
								logData.location_log.push(obj);
							
							}
							
							console.log('*******************************\n'+JSON.stringify(logData) + '\n*******************************\n');
							
							callback(logData);
						});
						
						
		
					});
					
				});
				
			}
			
		};
		
		
		db.initDB();
		
		return db;
		
	}]);
	
	// Define a class like this
angular.module("snApp").factory("OfflineDBAction",  function($rootScope, dbService) {
	
	function OfflineDBAction() {
	
		this.employe_id = -1;
		this.loved_one_id = -1;
		this.latitude = -1;
		this.longitude = -1;
		this.trip_id = -1;
		this.temp_trip_id = -1;
		this.trip_status = 'none';
		this.timestamp = -1;
		this.sync_status = -1;
		this.employe_state = 'none';
		this.guid = '';
	
	}
	
	OfflineDBAction.prototype.save = function(lovedone) {
		dbService.saveAction(this, lovedone);
	}
	
	return (OfflineDBAction);
	
});



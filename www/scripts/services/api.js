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
				//alert('update in progresss');
	
				db.transaction(function(tx) {
					//console.log($rootScope.user.id);
					//console.log('DELETE FROM loved_ones executing...');
					
					if(lovedones.length == 0) {
						console.log('LENGTH is 0');
						return;
					}
					tx.executeSql('DELETE FROM loved_ones');
					
					for(var j in lovedones) {
						var l = lovedones[j];
						var selected = 0;
						var selected_by_me = 0;
						if(l.selected) {
							selected = 1;
						}
						if(l.selected_by_me) {
							selected_by_me = 1;
						}
						//console.log(l.id +  l.name + l.date_of_birth + l.middle_initial + l.selected + l.selected_by_me + '');
						tx.executeSql("INSERT INTO loved_ones (loved_one_id, name, date_of_birth, status, middle_initial, selected, selected_by_me, first_name, last_name) VALUES (?,?,?,?,?,?,?,?,?)", 
						[l.id, l.name, l.date_of_birth, 0, l.middle_initial, selected, selected_by_me, l.first_name, l.last_name], function(tx, res) {
							//console.log('INSERT: loved_one:' + res.insertId);
						});
						
					}
					//console.log('length: ' + active_lovedones.length);
					//alert(' lart' + $rootScope.user);
					for(var i in active_lovedones) {
						var b = active_lovedones[i];
						var selected = 0;
						var selected_by_me = 0;
						if(b.selected) {
							selected = 1;
						}
						if(b.selected_by_me) {
							selected_by_me = 1;
						}
						//console.log($rootScope.user.id + '');
						//console.log('active_loved_one' + b.id + ', '+ b.name + ', ' + b.date_of_birth+ ', ' + b.middle_initial+ ', ' + b.selected+ ', ' + b.selected_by_me+ ', ' + b.trip.id +', ' + b.trip.status);
						tx.executeSql("INSERT INTO loved_ones (loved_one_id, name, date_of_birth, status, middle_initial, selected, selected_by_me, trip_id, employe_id, trip_status, first_name, last_name) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", 
						[b.id, b.name, b.date_of_birth, 1, b.middle_initial, selected, selected_by_me, b.trip.id, $rootScope.user.id, b.trip.status, b.first_name, b.last_name], function(tx, res) {
							//console.log('INSERT: ACTIVE_loved_one' + res.insertId);
						});
					}
					
					
					
				});
			};
		
			db.fetchLovedOnesFromDB = function() {
				if(!isDBInitialized) {
					return;
				}
				//$('.loading').show();
				db.transaction(function(tx) {
					tx.executeSql("SELECT * FROM loved_ones WHERE status = 0",[], function(ttx, res) {
						//console.log('SELECT STATEMETN EXECUTED>> records: ' + res.rows.length);
						var loved_ones = [];
						$rootScope.user.lovedones = [];
						console.log(''+res.rows.length);
						for(var i = 0; i < res.rows.length; i++) {
						
							var obj = res.rows.item(i);
							
							loved_ones[i] = {id:'', name:'', date_of_birth:'', selected:false, selected_by_me:false, middle_initial:'', first_name:'', last_name:'', trip_id:0, employe_id:0, status:'', db_id:-1};
							
							loved_ones[i].db_id = obj.db_id;
							loved_ones[i].id = obj.loved_one_id;
							//console.log(loved_ones[i].id);
							loved_ones[i].name = obj.name;
							//console.log(loved_ones[i].name);
							loved_ones[i].date_of_birth = obj.date_of_birth;
							//console.log(loved_ones[i].id);
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
							//console.log(loved_ones[i].selected_by_me);
							loved_ones[i].middle_initial = obj.middle_initial;
							//console.log(loved_ones[i].middle_initial);
							loved_ones[i].first_name = obj.first_name;
							loved_ones[i].last_name = obj.last_name;
							
							
							$rootScope.user.lovedones.push(loved_ones[i]);
							
						}
						//$rootScope.user.lovedones = loved_ones;

					});
					
					tx.executeSql("SELECT * FROM loved_ones WHERE status = 1", [], function(tx, ress) {
						//console.log('SELECT STATEMENT EXECUTED >> active records: ' + ress.rows.length);
						var active_loved_ones = [];
						$rootScope.user.active_lovedones = [];
						for(var i = 0; i < ress.rows.length; i++) {
							var obj = ress.rows.item(i);
							
							active_loved_ones[i] = {id:0, name:'', date_of_birth:'', selected:true, selected_by_me:true, middle_initial:'', trip_id:0, employe_id:0, status:'', first_name:'', last_name:'', db_id:-1, trip:{}};

							active_loved_ones[i].db_id = obj.db_id;
							active_loved_ones[i].id = obj.loved_one_id;
							//console.log('id'+ active_loved_ones[i].id);
							active_loved_ones[i].name = obj.name;
							//console.log('name: '+active_loved_ones[i].name);
							active_loved_ones[i].date_of_birth = obj.date_of_birth;
							//console.log('DOB'+active_loved_ones[i].date_of_birth);
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
							//console.log('middle: ' + active_loved_ones[i].middle_initial);
							active_loved_ones[i].trip_id = obj.trip_id;
							//console.log('trip_id' + active_loved_ones[i].trip_id);
							active_loved_ones[i].employe_id = obj.employe_id;
							//console.log('emp_id: ' + active_loved_ones[i].employe_id)
							active_loved_ones[i].status = obj.trip_status;
							//console.log('status' + active_loved_ones[i].status);
							active_loved_ones[i].trip = {id: obj.trip_id, status: obj.trip_status};
							
							active_loved_ones[i].first_name = obj.first_name;
							active_loved_ones[i].last_name = obj.last_name;
							
							$rootScope.user.active_lovedones.push(active_loved_ones[i]);
							
						}
						
						var ctime = $.now();
						console.log(ctime - $rootScope.logtime + ' time');
						//$('.loading').hide();
						
						//$rootScope.user.active_lovedones = active_loved_ones;
					});
				});
				
			};
			
			db.saveAction = function(action, lovedone) {
				if(!isDBInitialized) {
					return;
				}
				//$('.loading').show();
				db.transaction(function(tx) {
					
					// save the record to the offline log to sync later
					tx.executeSql("INSERT INTO actions_log (employe_id, loved_one_id, trip_id, temp_trip_id, lat, lng, user_state, trip_status, timestamp, sync_state) " + 
					"VALUES (?,?,?,?,?,?,?,?,?,?) ", 
					[action.employe_id, action.loved_one_id, action.trip_id, action.temp_trip_id, action.latitude, action.longitude, action.employe_state, action.trip_status, action.timestamp, action.sync_state]
					, function(tx, res) {

						// if user has activated some customer, update the active state and add to active loved ones
						if(action.trip_status == 'active') {
							
							var updateQuery = "UPDATE loved_ones SET selected = 1 , selected_by_me = 1 WHERE loved_one_id = " + action.loved_one_id;
							tx.executeSql(updateQuery, [], function(tx, res) {
								console.log("UPDATE rows result = " + JSON.stringify(res));
							}, function(error) {
								console.log("Error processing SQL : " + error.code);
							});
							
							
							var insertQuery = "INSERT INTO loved_ones (loved_one_id, name, date_of_birth, status, middle_initial, selected, selected_by_me, trip_id, employe_id, trip_status, first_name, last_name) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";

							tx.executeSql(insertQuery, 
								[action.loved_one_id, lovedone.name, lovedone.date_of_birth, 1, lovedone.middle_initial, 1, 1, action.trip_id, action.employe_id, "active", lovedone.first_name, lovedone.last_name],
								 function(tx, res) {
										console.log('INSERT: ACTIVE_loved_one' + res.insertId);
										//$rootScope.init();
							});
							
							$('.patient-dialog-overlay').hide();
							
						}
						else if(action.trip_status == 'started') {
							if(typeof(lovedone.db_id) == 'undefined') {
								//alert('db_id undefined');
								return;
							}
							//alert('in started block');
							lovedone.trip = {id:action.trip_id, status:'started'};
							
							var updateQuery = "UPDATE loved_ones SET trip_status = 'started' WHERE db_id = " + lovedone.db_id;
							//alert(updateQuery);
							tx.executeSql(updateQuery, [], function(tx, res) {
								//alert(JSON.stringify(res));
								//$rootScope.init();
							}, function(error) {
								//alert(JSON.stringify(error));
							});
						}
						else if(action.trip_status == 'completed') {
							if(typeof(lovedone.db_id) == 'undefined') {
								return;
							}
							lovedone.trip = {id:action.trip_id, status:'completed'};
							
							var updateQuery = "UPDATE loved_ones SET trip_status = 'completed' WHERE db_id = " + lovedone.db_id;
							//alert(updateQuery);
							tx.executeSql(updateQuery, [], function(tx, res) {
								//alert(JSON.stringify(res));
								//$rootScope.init();
							}, function(error) {
								//alert(JSON.stringify(error));
							});
						}
						else if(action.trip_status == 'removed') {
							if(typeof(lovedone.db_id) == 'undefined') {
								return;
							}
							lovedone.trip = {id:action.trip_id, status:'removed'};
							
							var deleteQuery = "DELETE FROM loved_ones WHERE db_id = " + lovedone.db_id;
							//alert(updateQuery);
							tx.executeSql(deleteQuery, [], function(tx, res) {
								//alert('DELETE: '+JSON.stringify(res));
								
								var updateQuery = "UPDATE loved_ones SET selected = 0, selected_by_me = 0 WHERE loved_one_id = " + action.loved_one_id;
								//alert(updateQuery);
								tx.executeSql(updateQuery, [], function(tx, res) {
									//alert('UPDATE: '+JSON.stringify(res));
									//$rootScope.init();
									
								}, function(error) {
									//alert('UPDATE ERROR: '+JSON.stringify(error));
								});
								
							}, function(error) {
								//alert('DELETE ERROR: '+JSON.stringify(error));
							});
							
							
						}
						//$('.loading').hide();
					});
				});
			};
			
			
			db.logLocation = function() {
				db.transaction(function(tx) {
					var insertQuery = "INSERT INTO location_tracking_log (employe_id, lat, lng, timestamp, sync_state) VALUES(?,?,?,?,?)";
					tx.executeSql(insertQuery, [$rootScope.user.id, gLat, gLng, $.now(), 0], function(tx, res) {
						//alert('LOCATION:: ' + JSON.stringify(res));
					});
				});
			};
			
			
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
	
	}
	
	OfflineDBAction.prototype.save = function(lovedone) {
		dbService.saveAction(this, lovedone);
	}
	
	return (OfflineDBAction);
	
});



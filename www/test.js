window.sqlitePlugin = {
	openDatabase: function(){ 
		return {
			saveLovedOnesToDB: '', 
			transaction: function() {

			}
		}
	}
}
window.device = {platform: 'android'}
window.Media = function(){}
Connection = {
	UNKNOWN: 0,
	ETHERNET: 1,
	WIFI: 2,
	CELL_2G: 3,
	CELL_3G: 4,
	CELL_4G: 5,
	CELL : 6,
	NONE: 7
}
window.bgGeo = {
	configure: '', 
	start: function(){},
	stop: function(){}
};
navigator.app = {
	exitApp: function(){}
}
angular.bootstrap(document, ['snApp']);
angular.element(document.querySelector(".navbar-fixed-bottom")).scope()
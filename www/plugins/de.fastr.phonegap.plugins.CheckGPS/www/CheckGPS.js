cordova.define("de.fastr.phonegap.plugins.CheckGPS.CheckGPS", function(require, exports, module) { exports.check=function(success, error, options){
		options = options || {};
		options.alert = false || options.alert;
		cordova.exec(success, error, "CheckGPS", "check", [options.alert]);
};

});

var wcsLocalStorage = {
    set: function(name, data) {
        window.localStorage.setItem(name, JSON.stringify(data));
    },

    get: function(name) {
        if(window.localStorage.getItem(name)==="undefined") return {};
        return JSON.parse(window.localStorage.getItem(name));
    },

    destroy: function(name) {
        return window.localStorage.removeItem(name);
    },

    clear: function() {
        return window.localStorage.clear();
    },

    has: function(name) {
        return name in window.localStorage;
    }
};
function DateFormat(formatString, date){
    if (typeof date=='undefined'){
    	var DateToFormat = new Date();
    } else {
        var DateToFormat = date;
    }
    var DAY         = DateToFormat.getDate();
    var DAYidx      = DateToFormat.getDay();
    var MONTH       = DateToFormat.getMonth()+1;
    var MONTHidx    = DateToFormat.getMonth();
    var YEAR        = DateToFormat.getYear();
    var FULL_YEAR   = DateToFormat.getFullYear();
    var HOUR        = DateToFormat.getHours();
    var MINUTES     = DateToFormat.getMinutes();
    var SECONDS     = DateToFormat.getSeconds();

    var arrMonths = new Array("January","February","March","April","May","June","July","August","September","October","November","December");
    var arrDay=new Array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday');
    var strMONTH;
    var strDAY;
    var strHOUR;
    var strMINUTES;
    var strSECONDS;
    var Separator;

    if(parseInt(MONTH)< 10 && MONTH.toString().length < 2)
        strMONTH = "0" + MONTH;
    else
        strMONTH=MONTH;
    if(parseInt(DAY)< 10 && DAY.toString().length < 2)
        strDAY = "0" + DAY;
    else
        strDAY=DAY;
    if(parseInt(HOUR)< 10 && HOUR.toString().length < 2)
        strHOUR = "0" + HOUR;
    else
        strHOUR=HOUR;
    if(parseInt(MINUTES)< 10 && MINUTES.toString().length < 2)
        strMINUTES = "0" + MINUTES;
    else
        strMINUTES=MINUTES;
    if(parseInt(SECONDS)< 10 && SECONDS.toString().length < 2)
        strSECONDS = "0" + SECONDS;
    else
        strSECONDS=SECONDS;
    
    var result = "";
    switch (formatString){
        case "MIN-SEC":
        	if(MINUTES > 0) {
        		result = MINUTES.toString() + ' MIN ' + strSECONDS + ' SEC';
        	} else {
        		result = strSECONDS + ' SEC';
        	}
            break;
        default:
        	break;
    }
    return result;
}


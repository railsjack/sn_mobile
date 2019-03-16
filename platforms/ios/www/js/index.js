//

$(function(){
  document.addEventListener("deviceready", onDeviceReady, false);
});

function onDeviceReady() {

  console.log("onDeviceReady");

      navigator.geolocation.getCurrentPosition(
      onSuccessForLocation,
      onErrorForLocation_High,
      {maximumAge:600000, timeout:5000, enableHighAccuracy: true}
      );


//alert(device.version);
 // window.plugin.backgroundMode.enable();
  //window.plugin.backgroundMode.configure({ text:'Doing geolocation tracking'});

	//cordova.plugins.backgroundMode.enable();
	//cordova.plugins.backgroundMode.setDefaults({ text:'Doing geolocation tracking.'});

  setInterval(function(){
    if(!wcsLocalStorage.get('isLoggedIn')) return;
      navigator.geolocation.getCurrentPosition(
      onSuccessForLocation,
      onErrorForLocation_High,
      {maximumAge:600000, timeout:5000, enableHighAccuracy: true}
      );
   }, 6000);
  

}

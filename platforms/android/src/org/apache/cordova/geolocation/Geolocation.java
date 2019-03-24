package org.apache.cordova.geolocation;

import java.util.TimeZone;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaInterface;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.provider.Settings;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;
import android.widget.Toast;

public class Geolocation extends CordovaPlugin implements LocationListener {
    public static final String TAG = "Geolocation";

    public static String platform;                            // Geolocation OS
    public static String uuid;                                // Geolocation UUID

    private static final String ANDROID_PLATFORM = "Android";
    private static final String AMAZON_PLATFORM = "amazon-fireos";
    private static final String AMAZON_DEVICE = "Amazon";

    private Context mContext;
    private Criteria mCriteria;
    // flag for GPS status
    boolean isGPSEnabled = false;

    // flag for network status
    boolean isNetworkEnabled = false;

    // flag for GPS status
    boolean canGetLocation = false;

    private Location mLocation; // location
    private LocationListener mLocationListener;
    // Declaring a Location Manager
    protected LocationManager locationManager;

    /**
     * Constructor.
     */
    public Geolocation() {
    }

    /**
     * Sets the context of the Command. This can then be used to do things like
     * get file paths associated with the Activity.
     *
     * @param cordova The context of the main Activity.
     * @param webView The CordovaWebView Cordova is running in.
     */
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
		Toast.makeText(cordova.getActivity(), "Getting location...", Toast.LENGTH_LONG).show();
        //this.mContext = getApplicationContext();
        this.mContext = cordova.getActivity().getApplicationContext();
        try{
            
            locationManager = (LocationManager) mContext.getSystemService(cordova.getActivity().LOCATION_SERVICE);
            mCriteria = new Criteria();
            mCriteria.setAccuracy(Criteria.ACCURACY_FINE); 
            mCriteria.setAltitudeRequired(true); 
            mCriteria.setBearingRequired(true);
            mCriteria.setSpeedRequired(true); 
            mCriteria.setCostAllowed(false); 

        }catch(Exception e){
            e.printStackTrace();
        }
    }

    /**
     * Executes the request and returns PluginResult.
     *
     * @param action            The action to execute.
     * @param args              JSONArry of arguments for the plugin.
     * @param callbackContext   The callback id used when calling back into JavaScript.
     * @return                  True if the action was valid, false if not.
     */
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("getGeolocationInfo")) {

            String bestProvier = locationManager.getBestProvider(mCriteria, true);
            locationManager.requestLocationUpdates(bestProvier, 0, 0,  this);
            if (locationManager != null) {
                mLocation = locationManager.getLastKnownLocation(bestProvier);
                if(mLocation!=null){
                    JSONObject r = new JSONObject();
                    r.put("latitude", mLocation.getLatitude());
                    r.put("longitude", mLocation.getLongitude());
                    callbackContext.success(r);
                }else{
                    return false;
                }
            }else{
                return false;
            }
        }
        else {
            return false;
        }
        return true;
    }

    //--------------------------------------------------------------------------
    // LOCAL METHODS
    //--------------------------------------------------------------------------

    /**
     * Get the OS name.
     * 
     * @return
     */
    public String getPlatform() {
        String platform;
        if (isAmazonGeolocation()) {
            platform = AMAZON_PLATFORM;
        } else {
            platform = ANDROID_PLATFORM;
        }
        return platform;
    }

    /**
     * Get the geolocation's Universally Unique Identifier (UUID).
     *
     * @return
     */
    public String getUuid() {
        String uuid = Settings.Secure.getString(this.cordova.getActivity().getContentResolver(), android.provider.Settings.Secure.ANDROID_ID);
        return uuid;
    }

    public String getModel() {
        String model = android.os.Build.MODEL;
        return model;
    }

    public String getProductName() {
        String productname = android.os.Build.PRODUCT;
        return productname;
    }

    /**
     * Get the OS version.
     *
     * @return
     */
    public String getOSVersion() {
        String osversion = android.os.Build.VERSION.RELEASE;
        return osversion;
    }

    public String getSDKVersion() {
        @SuppressWarnings("deprecation")
        String sdkversion = android.os.Build.VERSION.SDK;
        return sdkversion;
    }

    public String getTimeZoneID() {
        TimeZone tz = TimeZone.getDefault();
        return (tz.getID());
    }

    /**
     * Function to check if the geolocation is manufactured by Amazon
     * 
     * @return
     */
    public boolean isAmazonGeolocation() {
        if (android.os.Build.MANUFACTURER.equals(AMAZON_DEVICE)) {
            return true;
        }
        return false;
    }

    @Override
    public void onLocationChanged(Location location) {
        // TODO Auto-generated method stub
        
    }

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {
        // TODO Auto-generated method stub
        
    }

    @Override
    public void onProviderEnabled(String provider) {
        // TODO Auto-generated method stub
        
    }

    @Override
    public void onProviderDisabled(String provider) {
        // TODO Auto-generated method stub
        
    }

}

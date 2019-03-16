<?php
    header("Cache-Control: no-cache, must-revalidate");
    header("Access-Control-Allow-Origin: *");
?>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="white">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- Bootstrap -->
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
    <!-- JQuery Mobile -->
    <script type="text/javascript" src="js/jquery.min.js"></script>
    <link rel="stylesheet" href="css/jquery.mobile-1.4.3.min.css">
    <!-- Angular Mobile UI CSS -->
    <link rel="stylesheet" href="css/mobile-angular-ui-hover.min.css" />
    <link rel="stylesheet" href="css/mobile-angular-ui-base.min.css" />
    <link rel="stylesheet" href="css/mobile-angular-ui-desktop.min.css" />
    <!-- Angular Transitions -->
    <link rel="stylesheet" href="css/angular-transitions/view/animations.1.1.5.css">
    <link rel="stylesheet" href="css/angular-transitions/view/animations.1.2.0.css">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/quotes.css">
    <link rel="stylesheet" href="css/style.css?_=1">

    <!-- JQuery Mobile -->
    <!-- <script type="text/javascript" src="js/jquery.mobile-1.4.3.min.js"></script> -->
    <!-- AngularJS & Bootstrap core JavaScript -->
    <script type="text/javascript" src="js/bootstrap.min.js"></script>
    <script type="text/javascript" src="js/angular.min.js"></script>
    <script type="text/javascript" src="js/angular-route.min.js"></script>
    <script type="text/javascript" src="js/angular-animate.min.js"></script>
    <script type="text/javascript" src="js/angular-touch.min.js"></script>
    <script type="text/javascript" src="js/mobile-angular-ui.min.js"></script>
    <script type="text/javascript" src="js/ui-bootstrap-tpls-0.11.0.min.js"></script>
    <script type="text/javascript" src="js/moment-with-locales.min.js"></script>
    
    <!-- Custom Script -->
    <script type="text/javascript" src="js/functions.js"></script>

    <script type="text/javascript" src="scripts/app.js?_=5"></script>
    <script type="text/javascript" src="scripts/routing.js?_=5"></script>
    <script type="text/javascript" src="scripts/services/api.js?_=5"></script>

    <script type="text/javascript" src="scripts/controllers/login.js?_=5"></script>
    <script type="text/javascript" src="scripts/controllers/register.js?_=5"></script>
    <script type="text/javascript" src="scripts/controllers/allpatients.js?_=5"></script>
    <script type="text/javascript" src="scripts/controllers/activepatients.js?_=5"></script>
    <script type="text/javascript" src="scripts/controllers/settings.js?_=5"></script>


    <script type="text/javascript">
        function onLoad() {
            console.log('onLoad...');
            document.addEventListener("deviceready", onDeviceReady, false);
        }
        function onDeviceReady() {
            document.addEventListener("pause", onPause, false);
            document.addEventListener("resume", onResume, false);
        }
        var bPaused = false;
        function onPause() {
            bPaused = true;
        }
        function onResume(){
            bPaused = false;
        }
        
    </script>
  </head>
  <body onload="onLoad()" ng-app="snApp">
    <div class="notifications" onclick="$(this).hide();" style="display: none;"></div>
    <div ng-view class="generalContent" temp-effect="at-view-fade-in at-view-fade-out"></div>
    <h4 style="position: absolute;z-index: 10000; background-color: rgba(255,255,255,.7); display: none;">
      <span>{{ (chatSocketStatus?"C":"") }}</span></h4>
    
    <div class="connecting" style="display: none;">
        Loading ...
    </div>
  </body>
</html>


    function onLoad() {
        if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
            document.addEventListener('deviceready', checkFirstUse, false);
        } else {
            checkFirstUse();
        }
    }

  var admobid = {};
  if( /(android)/i.test(navigator.userAgent) ) { // for android & amazon-fireos
    admobid = {
      banner: 'ca-app-pub-1683858134373419/7790106682', // or DFP format "/6253334/dfp_example_ad"
      interstitial: 'ca-app-pub-9249695405712287/5288129821'
    };
  } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // for ios
    admobid = {
      banner: 'ca-app-pub-1683858134373419/7790106682', // or DFP format "/6253334/dfp_example_ad"
      interstitial: 'ca-app-pub-9249695405712287/8955912090'
    };
  }

    function initApp() {
        if (!AdMob) { alert('admob plugin not ready'); return; }
        initAd();
        //display interstitial at startup
        loadInterstitial();
    }
    function initAd() {
        var defaultOptions = {
            position: AdMob.AD_POSITION.BOTTOM_CENTER,
            bgColor: 'black', // color name, or '#RRGGBB'
            isTesting: false // set to true, to receiving test ad for testing purpose
        };
        AdMob.setOptions(defaultOptions);
        registerAdEvents();
    }
    // optional, in case respond to events or handle error
    function registerAdEvents() {
        // new events, with variable to differentiate: adNetwork, adType, adEvent
        document.addEventListener('onAdFailLoad', function (data) {
            document.getElementById('screen').style.display = 'none';     
        });
        document.addEventListener('onAdLoaded', function (data) { });
        document.addEventListener('onAdPresent', function (data) { });
        document.addEventListener('onAdLeaveApp', function (data) { });
        document.addEventListener('onAdDismiss', function (data) { 
            document.getElementById('screen').style.display = 'none';     
        });
    }

    function createSelectedBanner() {
          AdMob.createBanner({adId:admobid.banner});
    }

    function loadInterstitial() {
        AdMob.prepareInterstitial({ adId: admobid.interstitial, isTesting: false, autoShow: true });
    }

   function checkFirstUse()
    {
        $('#simplemenu').sidr();
        $("span").remove();
        $(".dropList").select2();
        window.ga.startTrackerWithId('UA-88579601-9', 1, function(msg) {
            window.ga.trackView('Home');
        });
        initApp();
        askRating();
        //document.getElementById('screen').style.display = 'none';     
    }

function askRating()
{
  AppRate.preferences = {
  openStoreInApp: true,
  useLanguage:  'en',
  usesUntilPrompt: 10,
  promptAgainForEachNewVersion: true,
  storeAppURL: {
                ios: '1296111737',
                android: 'market://details?id=com.annarbor.free'
               }
};
 
AppRate.promptForRating(false);
}


function loadDirections() {
    $('.js-next-bus-results').html('').hide(); // reset output container's html
    document.getElementById('btnSave').style.visibility = "hidden";
    $("#routeStopSelect").attr("disabled", "");
    $("#routeStopSelect").val('0');
    $("#message").text('');
    $.ajax(
          {
              type: "GET",
              url: "http://www.theride.org/DesktopModules/AATA.EndPoint/Proxy.ashx",
              data: "method=routedirs&routeid=" + $("#routeSelect").val(),
              contentType: "application/json;	charset=utf-8",
              dataType: "json",
              success: function (msg) {
                  if (msg == null || msg.length == 0) {
                      return;
                  }

                  var directions = msg['bustime-response'].dir;
                  var list = $("#routeDirectionSelect");
                  $(list).empty();
                  $(list).append($("<option disabled/>").val("0").text("- Select Direction -"));
                  if(directions.length > 1) {
                  for(var x in directions)
                      $(list).append($("<option />").val(directions[x].id).text(directions[x].name));    
                  }
                  else {
                      $(list).append($("<option />").val(directions.id).text(directions.name));    
                  }
                  
                  $(list).removeAttr('disabled');
                  $(list).val('0');
              },
              error: function () {
              }
          }
        );
        $("span").remove();
        $(".dropList").select2();
    }


function loadStops() {
    $('.js-next-bus-results').html('').hide(); // reset output container's html
    document.getElementById('btnSave').style.visibility = "hidden";
    $("#message").text('');
    $.ajax(
          {
              type: "GET",
              url: "http://www.theride.org/DesktopModules/AATA.EndPoint/Proxy.ashx",
              data: "d=" + $("#routeDirectionSelect").val().replace('+', '%2b').split(' ').join('+') + "&method=getstopsbyrouteanddirection&routeid=" + $("#routeSelect").val(),
              contentType: "application/json;	charset=utf-8",
              dataType: "json",
              success: function (msg) {
                  if (msg == null || msg.length == 0) {
                      return;
                  }

                  var list = $("#routeStopSelect");
                  $(list).empty();
                  $(list).append($("<option disabled/>").val("0").text("- Select Stop -"));
                  $.each(msg, function (index, item) {
                      $(list).append($("<option />").val(item.StopId).text(item.Name));
                  });
                  $(list).removeAttr('disabled');
                  $(list).val('0');
              },
              error: function () {
              }
          }
        );
        $("span").remove();
        $(".dropList").select2();
}

function loadArrivals() {
    var outputContainer = $('.js-next-bus-results');
    var results = "";
    $.ajax(
          {
              type: "GET",
              url: "http://www.theride.org/DesktopModules/AATA.EndPoint/Proxy.ashx",
              data: "method=getpredictionsfromxml&stpid=" + $("#routeStopSelect").val(),
              contentType: "application/json;	charset=utf-8",
              dataType: "json",
              success: function (output) {
                  if (output == null || output.length == 0 || output['bustime-response'].error != null) {
                      //$(outputContainer).html('').hide(); // reset output container's html
                      document.getElementById('btnSave').style.visibility = "hidden";
                      results = results.concat('<p>' + output['bustime-response'].error.msg + '</p>');
                  }
                  else {
                      var predictions = output['bustime-response'].prd;
                      if (predictions == null) {
                          results = results.concat("<p> Oops. Something went wrong. Please check if there is a new app version.</p>");
                      }
                      else if (predictions.length > 1) {
                          for (var x in predictions) {
                              if (predictions[x].rt == $("#routeSelect").val()) {
                                  var arrivalTime = "";
                                  if (predictions[x].prdctdn == 'DUE') {
                                      arrivalTime = "< 1 min";
                                  }
                                  else if (predictions[x].prdctdn == 'DLY') {
                                      arrivalTime = "DELAYED";
                                  }
                                  else {
                                      arrivalTime = predictions[x].prdctdn + "min";
                                  }
                                  results = results.concat("<p>To: " + predictions[x].des + " - " + arrivalTime + "</p>");
                              }
                          }
                      }
                      else {
                          if (predictions.rt == $("#routeSelect").val()) {
                                  var arrivalTime = "";
                                  if (predictions.prdctdn == 'DUE') {
                                      arrivalTime = '< 1 min';
                                  }
                                  else if (predictions.prdctdn == 'DLY') {
                                      arrivalTime = 'DELAYED';
                                  }
                                  else {
                                      arrivalTime = predictions.prdctdn + "min";
                                  }                              
                                  results = results.concat("<p>To: " + predictions.des + " - " + arrivalTime + "</p>");
                          }
                      }

                      if (results == "") {
                          results = results.concat("<p> No upcoming arrivals.</p>");
                      }
                      document.getElementById('btnSave').style.visibility = "visible";
                  }
                      $(outputContainer).html(results).show();
              }
          });
}

function loadFaves()
{
    window.location = "Favorites.html";
    window.ga.trackView('Favorites');
}
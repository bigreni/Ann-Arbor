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
      interstitial: 'ca-app-pub-9249695405712287/4904986440'
    };
  } else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // for ios
    admobid = {
      banner: 'ca-app-pub-1683858134373419/7790106682', // or DFP format "/6253334/dfp_example_ad"
      interstitial: 'ca-app-pub-9249695405712287/7995195971'
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

        });
        document.addEventListener('onAdLoaded', function (data) { });
        document.addEventListener('onAdPresent', function (data) { });
        document.addEventListener('onAdLeaveApp', function (data) { });
        document.addEventListener('onAdDismiss', function (data) { });
    }

    function createSelectedBanner() {
          AdMob.createBanner({adId:admobid.banner});
    }

    function loadInterstitial() {
        AdMob.prepareInterstitial({ adId: admobid.interstitial, isTesting: true, autoShow: true });
    }

   function checkFirstUse()
    {
        $('#simplemenu').sidr();
        $("span").remove();
        $(".dropList").select2();

        initApp();
        askRating();
    }

function askRating()
{
  AppRate.preferences = {
  openStoreInApp: true,
  useLanguage:  'en',
  usesUntilPrompt: 10,
  promptAgainForEachNewVersion: true,
  storeAppURL: {
                ios: '1225698349',
                android: 'market://details?id=com.annarbor.withads'
               }
};
 
AppRate.promptForRating(false);
}


function loadDirections() {
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
                  $.each(directions, function (index, item) {
                      $(list).append($("<option />").val(item).text(item));
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


function loadStops() {
    $.ajax(
          {
              type: "GET",
              url: "http://www.theride.org/DesktopModules/AATA.EndPoint/Proxy.ashx",
              data: "d=" + $("#routeDirectionSelect").val().split(' ').join('+') + "&method=getstopsbyrouteanddirection&routeid=" + $("#routeSelect").val(),
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

    $.ajax(
          {
              type: "GET",
              url: "http://www.theride.org/DesktopModules/AATA.EndPoint/Proxy.ashx",
              data: "method=getpredictionsfromxml&stpid=" + $("#routeStopSelect").val(),
              contentType: "application/json;	charset=utf-8",
              dataType: "json",
              success: function (output) {
                  if (output == null || output.length == 0) {
                      $(outputContainer).html('').hide(); // reset output container's html
                      document.getElementById('btnSave').style.visibility = "hidden";
                  }
                  else {
                      var results = "";
                      var predictions = output.stop.pre;
                      if(predictions == null)
                      {
                        results = results.concat("<p> No upcoming arrivals.</p>");
                      }
                      else if (predictions.length > 1) {
                          $.each(predictions, function (index, item) {
                              if (item.rd == $("#routeSelect").val()) {
                                  results = results.concat("<p>To: " + item.fd + " - " + item.pt + " " + item.pu + "</p>");
                              }
                          });
                      }
                      else
                      {
                          if (predictions.rd == $("#routeSelect").val()) {
                              results = results.concat("<p>To: " + predictions.fd + " - " + predictions.pt + " " + predictions.pu + "</p>");
                          }
                      }
                      if(results == "")
                      {
                          results = results.concat("<p> No upcoming arrivals.</p>");
                      }
                      $(outputContainer).html(results).show();
                      document.getElementById('btnSave').style.visibility = "visible";
                  }
              }
          });
}
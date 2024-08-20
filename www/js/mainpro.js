    function onLoad() {
        if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
            document.addEventListener('deviceready', checkFirstUse, false);
        } else {
            notFirstUse();
        }
    }

    function initApp() {
        if (/(android)/i.test(navigator.userAgent)){
            interstitial = new admob.InterstitialAd({
                //dev
                adUnitId: 'ca-app-pub-3940256099942544/1033173712'
                //prod
                //adUnitId: 'ca-app-pub-9249695405712287/5288129821'
              });
            }
            else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document)) {
                interstitial = new admob.InterstitialAd({
                    //dev
                    adUnitId: 'ca-app-pub-3940256099942544/4411468910'
                    //prod
                    //adUnitId: 'ca-app-pub-9249695405712287/8955912090'
                  });
            }
            registerAdEvents();
            interstitial.load();
    }

    // optional, in case respond to events or handle error
    function registerAdEvents() {
        // new events, with variable to differentiate: adNetwork, adType, adEvent
        document.addEventListener('admob.ad.load', function (data) {
            document.getElementById("screen").style.display = 'none';    
        });
        document.addEventListener('admob.ad.loadfail', function (data) {
            document.getElementById("screen").style.display = 'none'; 
        });
        document.addEventListener('admob.ad.show', function (data) { 
            document.getElementById("screen").style.display = 'none';     
        });
        document.addEventListener('admob.ad.dismiss', function (data) {
            document.getElementById("screen").style.display = 'none';     
        });
    }

   function checkFirstUse()
    {
        $(".dropList").select2();
        initApp();
        checkPermissions();
        askRating();
        //document.getElementById('screen').style.display = 'none';     
    }

   function notFirstUse()
    {
        $(".dropList").select2();
        document.getElementById('screen').style.display = 'none';     
    }

    function checkPermissions(){
        const idfaPlugin = cordova.plugins.idfa;
    
        idfaPlugin.getInfo()
            .then(info => {
                if (!info.trackingLimited) {
                    return info.idfa || info.aaid;
                } else if (info.trackingPermission === idfaPlugin.TRACKING_PERMISSION_NOT_DETERMINED) {
                    return idfaPlugin.requestPermission().then(result => {
                        if (result === idfaPlugin.TRACKING_PERMISSION_AUTHORIZED) {
                            return idfaPlugin.getInfo().then(info => {
                                return info.idfa || info.aaid;
                            });
                        }
                    });
                }
            });
    }

function askRating()
{
    const appRatePlugin = AppRate;
    appRatePlugin.setPreferences({
        reviewType: {
            ios: 'AppStoreReview',
            android: 'InAppBrowser'
            },
    useLanguage:  'en',
    usesUntilPrompt: 10,
    promptAgainForEachNewVersion: true,
    storeAppURL: {
                ios: '1296111737',
                android: 'market://details?id=com.annarbor.free'
               }
    });
    
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
              url: "https://www.theride.org/api/ServiceData",
              data: "method=routedirs&routeid=" + $("#routeSelect").val(),
            //   contentType: "application/json;	charset=utf-8",
              dataType: "json",
              success: function (msg) {
                  if (msg == null || msg.length == 0) {
                      $("#message").text('TheRide is currently having issues with real-time arrivals. We are working on fixing the issue. Thank you for your patience.');
                      return;
                  }

                  var directions = msg['bustime-response'].dir;
                  var list = $("#routeDirectionSelect");
                  $(list).empty();
                  $(list).append($("<option disabled/>").val("0").text("- Select Direction -"));
                  if (directions.length > 1) {
                      for (var x in directions)
                          $(list).append($("<option />").val(directions[x].id).text(directions[x].name));
                  }
                  else {
                      $(list).append($("<option />").val(directions.id).text(directions.name));
                  }

                  $(list).removeAttr('disabled');
                  $(list).val('0');
                  $("#message").text('');
              },
              error: function () {
                  $("#message").text('TheRide is currently having issues with real-time arrivals. We are working on fixing the issue. Thank you for your patience.');
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
              url: "https://www.theride.org/api/ServiceData",
              data: "d=" + $("#routeDirectionSelect").val().replace('+', '%2b').split(' ').join('+') + "&method=getstopsbyrouteanddirection&routeid=" + $("#routeSelect").val(),
            //   contentType: "application/json;	charset=utf-8",
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
    showAd();
    var outputContainer = $('.js-next-bus-results');
    var results = "";
    $.ajax(
          {
              type: "GET",
              url: "https://www.theride.org/api/ServiceData",
              data: "method=getpredictionsfromxml&stpid=" + $("#routeStopSelect").val(),
            //   contentType: "application/json;	charset=utf-8",
              dataType: "json",
              success: function (output) {
                  if (output == null || output.length == 0 || output['bustime-response'].error != null) {
                      //$(outputContainer).html('').hide(); // reset output container's html
                      document.getElementById('btnSave').style.visibility = "hidden";
                      results = results.concat('<p>' + output['bustime-response'].error[0].msg + '</p>');
                  }
                  else {
                      var predictions = output['bustime-response'].prd;
                      if (predictions == null) {
                          results = results.concat("<p> Oops. Something went wrong. Please check if there is a new app version.</p>");
                      }
                      else if (predictions.length > 0) {
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
    showAd();
    window.location = "Favorites.html";
}

function showAd()
{
    document.getElementById("screen").style.display = 'block';     
    interstitial.show();
    document.getElementById("screen").style.display = 'none'; 
}

function saveFavorites()
{
    var favStop = localStorage.getItem("Favorites");
    var newFave = $('#routeSelect option:selected').val() + ">" + $("#routeDirectionSelect option:selected").val() + ">" + $("#routeStopSelect option:selected").val() + ":" + $('#routeSelect option:selected').text() + " > " + $("#routeDirectionSelect option:selected").text() + " > " + $("#routeStopSelect option:selected").text();
        if (favStop == null)
        {
            favStop = newFave;
        }   
        else if(favStop.indexOf(newFave) == -1)
        {
            favStop = favStop + "|" + newFave;               
        }
        else
        {
            $("#message").text('Stop is already favorited!!');
            return;
        }
        localStorage.setItem("Favorites", favStop);
        $("#message").text('Stop added to favorites!!');
}

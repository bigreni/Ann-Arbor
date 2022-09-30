function loadFavorites()
{
    var favStop = localStorage.getItem("Favorites");
    var arrFaves = favStop.split("|");
    var arrStops = null;
    var arrIds;
    var text = "";
    for (i = 0; i < arrFaves.length; i++) 
    {
        arrStops = arrFaves[i].split(":");
        arrIds = arrStops[0].split(">");
        text = '<li><button onclick=removeFavorite(' + i + '); style="background-color:red; border:none;float:right;">&#x2718;</button><a href="javascript:loadFaveArrivals(' + arrIds[0] + ",'" + arrIds[1] + "'," + arrIds[2] +')"; class="langOption"><h4 class="selectLanguage">' + arrStops[1] + '</h4></a></li>';
	    $("#lstFaves").append(text);
    }
}

function removeFavorite(index)
{
    var favStop = localStorage.getItem("Favorites");
    var arrFaves = favStop.split("|");
    if(arrFaves.length > 1)
    {
        arrFaves.splice(index, 1);
        var faves = arrFaves.join("|");
        localStorage.setItem("Favorites", faves);
    }
    else
    {
        localStorage.removeItem("Favorites");
    }
    location.reload();
}

function loadFaveArrivals(route,direction,stop)
{
    var outputContainer = $('.js-next-bus-results');
    var results = "";

    $.ajax(
          {
              type: "GET",
              url: "http://www.theride.org/DesktopModules/AATA.EndPoint/Proxy.ashx",
              data: "method=getpredictionsfromxml&stpid=" + stop,
              contentType: "application/json;	charset=utf-8",
              dataType: "json",
              success: function (output) {
                  if (output == null || output.length == 0 || output['bustime-response'].error != null) {
                      results = results.concat('<p>' + output['bustime-response'].error.msg + '</p>');
                  }
                  else {
                      var predictions = output['bustime-response'].prd;
                      if (predictions == null) {
                          results = results.concat("<p> Oops. Something went wrong. Please check if there is a new app version.</p>");
                      }
                      else if (predictions.length > 1) {
                          for (var x in predictions) {
                              if (predictions[x].rt == route) {
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
                          if (predictions.rt == route) {
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
                  }
                  $(outputContainer).html(results).show();
              },
              error: function () {
                  results = results.concat("<p> TheRide is currently having issues with real-time arrivals. We are working on fixing the issue. Thank you for your patience.</p>");
                  $(outputContainer).html(results).show();
              }               
          });
}


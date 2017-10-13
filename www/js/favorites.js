function loadFavorites()
{
    $('#simplemenu').sidr();
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

    $.ajax(
          {
              type: "GET",
              url: "http://www.theride.org/DesktopModules/AATA.EndPoint/Proxy.ashx",
              data: "method=getpredictionsfromxml&stpid=" + stop,
              contentType: "application/json;	charset=utf-8",
              dataType: "json",
              success: function (output) {
                  if (output == null || output.length == 0) {
                      $(outputContainer).html('').hide(); // reset output container's html
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
                              if (item.rd == route) {
                                  results = results.concat("<p>To: " + item.fd + " - " + item.pt + " " + item.pu + "</p>");
                              }
                          });
                      }
                      else
                      {
                          if (predictions.rd == route) {
                              results = results.concat("<p>To: " + predictions.fd + " - " + predictions.pt + " " + predictions.pu + "</p>");
                          }
                      }
                      if(results == "")
                      {
                          results = results.concat("<p> No upcoming arrivals.</p>");
                      }
                      $(outputContainer).html(results).show();
                  }
              }
          });
}


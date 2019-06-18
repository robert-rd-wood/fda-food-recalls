// Define variable to hold response data for filtering use
var responseData;

// Function to build state recall count and count of recalls by recalling firm
function buildRecalls (recalls) {

  // Variables to hold state names, abbreviations, totals, and recall details
  var stateArray = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "Puerto Rico"];
  var initialsArray = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "PR"];
  var stateRecallCount = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  var stateRecallDetails = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];

  // Variables to hold recalling firm names and totals
  var firmName = [];
  var firmCount = [];

  // Loop through all recall objects
  for (var i=0; i<recalls.length; i++) {

    // If the firm is already listed, increment the associated count
    if (firmName.includes(recalls[i].recalling_firm)) {
      firmCount[firmName.indexOf(recalls[i].recalling_firm)] += 1;
    }
    // Else create a new entry in both the Name and Count arrays
    else {
      firmName.push(recalls[i].recalling_firm);
      firmCount.push(1);
    }

    // Remove commas from "distribution_pattern" string
    var distPattern = recalls[i].distribution_pattern.replace(/,/g, "");
    // Split the "distribution_pattern" by spaces
    var distPatternArray = distPattern.split(" ");

    // j is the index of the current state being evaluated
    for (var j=0; j<stateArray.length; j++) {
      // If the distribution pattern contains "nationwide"
      if (distPatternArray.includes("nationwide") || distPatternArray.includes("Nationwide")) {
        // Increment the current state recall count
        stateRecallCount[j] += 1;
        // Add recall details to stateRecallDetails array
        stateRecallDetails[j].push({"recalling_firm": recalls[i].recalling_firm,
          "product_description": recalls[i].product_description,
          "reason_for_recall": recalls[i].reason_for_recall,
          "classification": recalls[i].classification});
      }
      // Otherwise check if the distribution pattern contains the state name or initials
      else if (distPatternArray.includes(stateArray[j]) || distPatternArray.includes(initialsArray[j])) {
        // Increment the current state recall count
        stateRecallCount[j] += 1;
        // Add recall details to stateRecallDetails array
        stateRecallDetails[j].push({"recalling_firm": recalls[i].recalling_firm,
          "product_description": recalls[i].product_description,
          "reason_for_recall": recalls[i].reason_for_recall,
          "classification": recalls[i].classification});
      }
    }
  }

  // Update statesData to set "density" property to the recall count for each state
  // Add recall details for each state
  for (var i=0; i<stateArray.length; i++) {
    statesData.features[i].properties.density = stateRecallCount[i];
    statesData.features[i].properties.recallDetails = stateRecallDetails[i];
  }

  // Zip and sort firmName and firmCount arrays in descending order by firmCount
  var a = firmCount;
  var b = firmName;
  var zipped = [];

  // zip
  for (var i=0; i<firmCount.length; i++)
  {
      zipped.push({firmCount: firmCount[i], firmName: firmName[i]});
  }

  zipped.sort(function (x, y)
  {
      return y.firmCount - x.firmCount;
  });

  // unzip
  var z;
  for (i=0; i<zipped.length; i++)
  {
      z = zipped[i];
      firmCount[i] = z.firmCount;
      firmName[i] = z.firmName;
  }

  // Return the top 10 firms and counts (if there are more than 10)
  if (firmName.length > 10) {
    firmName = firmName.slice(0,10);
    firmCount = firmCount.slice(0,10);
  }

  // Build object including updated statesData, firmName and firmCount (to be returned)
  var returnData = {"statesData": statesData,
                  "firmName": firmName,
                  "firmCount": firmCount};

  return returnData;
}

// Function to query the endpoint with all current user input variables
function queryEndpoint(class1,class2,class3,normalize) {

  // Query the endpoint for most recent 100 food recalls
  d3.json("https://api.fda.gov/food/enforcement.json?sort=recall_initiation_date:desc&limit=100").then( function(data){

    // Assign response data to global variable
    responseData = data.results;

    // Call function to filter data
    var filteredData = filterData(data.results,class1,class2,class3);

    // Call function to build recall object
    var graphData = buildRecalls(filteredData);

    // Call function to build bar chart
    buildBar(graphData.firmName,graphData.firmCount);

    // Call function to build choropleth map
    buildChoropleth(graphData.statesData,normalize);

    // use Moment.js and findDateRange function to get start and end date
    var endDate = moment(findDateRange(responseData)[0],"YYYYMMDD").format('LL');
    var startDate = moment(findDateRange(responseData)[1],"YYYYMMDD").format('LL');

    // Update span next to button to display count and date range of query results
    d3.select('#last-updated').html(`Showing ${responseData.length} records from<br>${startDate} to ${endDate}`);

  });

}

// Function to find min and max date from query response
function findDateRange(responseData) {
  var max = 0;
  var min = 100000000;
  for(var i = 0; i < responseData.length; i++){
    max = Math.max(parseFloat(responseData[i].recall_initiation_date),max);
    min = Math.min(parseFloat(responseData[i].recall_initiation_date),min);
  };
  return [max,min];

}

// Function to update charts with all current user input variables
// Triggered on check box events
function updateCharts(class1,class2,class3,normalize) {

    // Call function to filter data
    var filteredData = filterData(responseData,class1,class2,class3);

    // Call function to build recall object
    var graphData = buildRecalls(filteredData);

    // Call function to build bar chart
    buildBar(graphData.firmName,graphData.firmCount);

    // Call function to build choropleth map
    buildChoropleth(graphData.statesData,normalize);

}


function filterData(results,class1,class2,class3) {

  var resultsArray = [];

  // Error handling if all boxes are unchecked
  if (!class1 && !class2 && !class3) {
    class1 = true;
    class2 = true;
    class3 = true;
  }

  // If "Class I" box is checked
  if (class1) {
    // Loop through array
    for (var i=0; i<results.length; i++) {
      // If current item in array also has classification of Class I
      if (results[i].classification == "Class I") {
        // Append result to results array
        resultsArray.push(results[i]);
      }
    }
  }
  // If "Class II" box is checked
  if (class2) {
    // Loop through array
    for (var i=0; i<results.length; i++) {
      // If current item in array also has classification of Class I
      if (results[i].classification == "Class II") {
        // Append result to results array
        resultsArray.push(results[i]);
      }
    }
  }
  // If "Class III" box is checked
  if (class3) {
    // Loop through array
    for (var i=0; i<results.length; i++) {
      // If current item in array also has classification of Class I
      if (results[i].classification == "Class III") {
        // Append result to results array
        resultsArray.push(results[i]);
      }
    }
  }

  // Return filtered array
  return resultsArray;
}

// Function to build bar chart with json data returned from the /data endpoint
function buildBar(barGraphNames,barGraphValues) {

  // Define trace for bar chart
  var trace1 = {
    x: barGraphNames,
    y: barGraphValues,
    opacity: .7,
    marker: {
      color: "#f16913"
    },
    type: "bar"
  };

  var data = [trace1];

  // Define the plot layout
  var layout = {
    autosize: true,
    title: "Firms with Most Recalls",
    titlefont: {
      size: 16,
      color: 'black'   
    },
    height: 450,
    margin: {
      l: 40,
      r: 30,
      t: 50,
      b: 0
    },
    xaxis: { 
      title: "Firm Name",
      automargin: true,
      tickangle: 90
    },
    yaxis: { 
      title: "Recalls",
      automargin: true
    }
  };

  // Clear existing chart object
  d3.select("#bar-chart").html("<div id='bar-chart'></div>");

  // Plot the chart to a div tag with id "bar-plot"
  Plotly.newPlot("bar-chart", data, layout,{displayModeBar: false});  

}

// Function to build choropleth map
function buildChoropleth(statesData,normalize) {

  // State populations (to be used if "Normalize by Population" is selected)
  var statePopulation = [4779736, 710231, 6392017, 2915918, 37254523, 5029196, 3574097, 897934, 601723, 18801310, 9687653, 1360301, 1567582, 12830632, 6483802, 3046355, 2853118, 4339367, 4533372, 1328361, 5773552, 6547629, 9883640, 5303925, 2967297, 5988927, 989415, 1826341, 2700551, 1316470, 8791894, 2059179, 19378102, 9535483, 672591, 11536504, 3751351, 3831074, 12702379, 1052567, 4625364, 814180, 6346105, 25145561, 2763885, 625741, 8001024, 6724540, 1852994, 5686986, 563626, 3725789];

  // If "Normalize by Population" box is checked, normalize recalls by state population (units = recalls per 1,000,000 people)
  if (normalize) {
    for (var i=0; i<statesData.features.length; i++) {
      statesData.features[i].properties.density = statesData.features[i].properties.density / statePopulation[i] * 1000000;
    }
  }

  // Get max and min recall numbers
  var maxDensity = getMinMax(statesData.features)[0];
  var minDensity = getMinMax(statesData.features)[1];

  // Set 12.5% steps for legend
  var rangeStep = (maxDensity - minDensity) * .125;

  // Function to get min and max recalls
  function getMinMax(statesData){
    var max = -100000;
    var min = 100000;
    for(var i = 0; i < statesData.length; i++){
      max = Math.max(parseFloat(statesData[i].properties.density),max);
      min = Math.min(parseFloat(statesData[i].properties.density),min);
    };
    return [max,min];
  };

  // Function to determine choropleth fill color based on recalls
  function getColor(density, max, min) {

    var range = max - min;
    var step = .125 * range;

    if (density >= max-step) {
      return "#8c2d04";
    }
    else if (density >= max - (2*step)) {
      return "#d94801";
    }
    else if (density >= max - (3*step)) {
      return "#f16913";
    }
    else if (density >= max - (4*step)) {
      return "#fd8d3c";
    }
    else if (density >= max - (5*step)) {
      return "#fdae6b";
    }
    else if (density >= max - (6*step)) {
      return "#fdd0a2";
    }
    else if (density >= max - (7*step)) {
      return "#fee6ce";
    }
    else {
      return "#fff5eb";
    }
  }

  // Function to return color for legend
  function getColorOnly(d) {
      return d >= minDensity+(rangeStep*7) ? '#8c2d04' :
            d >= minDensity+(rangeStep*6)  ? '#d94801' :
            d >= minDensity+(rangeStep*5)  ? '#f16913' :
            d >= minDensity+(rangeStep*4)  ? '#fd8d3c' :
            d >= minDensity+(rangeStep*3)   ? '#fdae6b' :
            d >= minDensity+(rangeStep*2)   ? '#fdd0a2' :
            d >= minDensity+rangeStep   ? '#fee6ce' :
                                         '#fff5eb';
  }


  // Function to return style object for each choropleth layer
  function style(feature) {
      return {
          fillColor: getColor(feature.properties.density,maxDensity,minDensity),
          weight: 1,
          opacity: 1,
          color: 'gray',
          dashArray: '3',
          fillOpacity: 0.7
      };
  }

  // Function to draw border and shade when hovering over states
  function highlightFeature(e) {
      var layer = e.target;

      layer.setStyle({
          weight: 2,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.7
      });

      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          layer.bringToFront();
      }
      info.update(layer.feature.properties);
  }
  // Function to reset the style on leaving hover state
  function resetHighlight(e) {
      geojson.resetStyle(e.target);
      info.update();
  }

  // Set up map
  var mapboxAccessToken = "pk.eyJ1IjoianVzdGluY291bHRlciIsImEiOiJjandiOHR3ODkwMnBsNDhvOWZpaTlmNm1jIn0.3RQPf58yeJ8KvcSpUYz6rQ";

  var container = L.DomUtil.get('map');
  if(container != null){
    container._leaflet_id = null;
  }

  // Define map variable
  var map = L.map("map", {
    center: [37.8, -96],
    zoom: 4,
    maxZoom: 4,
    minZoom: 4,
    zoomControl: false
  });

  // Add base layer to map
  var baseLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
      id: 'mapbox.light',
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      }).addTo(map);


  // Create geojson variable to hold choropleth
  var geojson;

  // Function to zoom on click
  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  // Function to determine action on mouseover/mouseout/click
  function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
      });

      // Function to build popup text of recall details
      function getRecallDetails(feature) {

        // HTML string to return
        var returnString = `<p><h5 style='text-align: center'><strong>${feature.properties.name} Recall Details</strong></h5></p>`;
        // Loop through recallDetails array of the feature
        for (var i=0; i<feature.properties.recallDetails.length; i++) {
          returnString += `<hr><p><strong>Recalling Firm:</strong> ${feature.properties.recallDetails[i].recalling_firm}<br>
            <strong>Product Description:</strong> ${feature.properties.recallDetails[i].product_description}<br>
            <strong>Reason for Recall:</strong> ${feature.properties.recallDetails[i].reason_for_recall}<br>
            <strong>Classification:</strong> ${feature.properties.recallDetails[i].classification}</p>`;
        }
        // Return HTML string with all recalls
        return returnString;
      }

      // If recalls exist for the state
      if (feature.properties.recallDetails.length > 0) {
        // Define variable to store all recall details of current feature (incl HTML tags)
        var featRecallDetails = getRecallDetails(feature);
        // Bind popup containing all recall details (incl HTML tags)
        layer.bindPopup(featRecallDetails, {
          maxHeight:200
        });
      }
  }

  // Assign choropleth styling and actions
  geojson = L.geoJson(statesData, {
      style: style,
      onEachFeature: onEachFeature
  })

  // Remove all layers besides base layer (for map redraw)
  map.eachLayer(function (layer) {
    if (layer != baseLayer) {
      map.removeLayer(layer)
    }
  }); 

  // Add choropleth layer to map
  geojson.addTo(map);

  // Create variable for map overlay
  var info = L.control();

  // Remove map overlay (for map redraw)
  d3.selectAll(".info").remove();

  // Create and update info div for overlay
  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.update();
      return this._div;
  };

  // Method to update the control based on feature properties passed
  info.update = function (props) {
    // If "Normalize by Population" is checked, create overlay with additional information
    if (normalize) {
      this._div.innerHTML = '<h5>Number of Recalls</h5><p>(per 1,000,000 people)</p>  ' +  (props ?
        '<b>' + props.name + '</b><br />' + props.density.toFixed(2) + ' recalls'
        : 'Hover over a state');
    }
    // Else, create basic overlay
    else {
      this._div.innerHTML = '<h5>Number of Recalls</h5>' +  (props ?
        '<b>' + props.name + '</b><br />' + props.density + ' recalls'
        : 'Hover over a state');
    }
  };

  // Add overlay to map
  info.addTo(map);

  // Variable to hold legend
  var legend = L.control({position: 'bottomright'});

  // Define legend parameters
  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');

    // Sample values used to determine legend colors
    var grades = [minDensity,
          minDensity+rangeStep,
          minDensity+(rangeStep*2),
          minDensity+(rangeStep*3),
          minDensity+(rangeStep*4),
          minDensity+(rangeStep*5),
          minDensity+(rangeStep*6),
          minDensity+(rangeStep*7)];

    // Legend labels

    // If the total range is less than 8, only display min and max labels
    if (maxDensity - minDensity < 8) {
      var labels = [`${Math.round(minDensity)}`,
            "•",
            "•",
            "•",
            "•",
            "•",
            "•",
            `${Math.round(maxDensity)}`
          ];
    }
    // Otherwise, display all range labels
    else {
      var labels = [`${Math.round(minDensity)}-${Math.round(minDensity+rangeStep)}`,
            `${Math.round(minDensity+rangeStep)+1}-${Math.round(minDensity+(rangeStep*2))}`,
            `${Math.round(minDensity+(rangeStep*2))+1}-${Math.round(minDensity+(rangeStep*3))}`,
            `${Math.round(minDensity+(rangeStep*3))+1}-${Math.round(minDensity+(rangeStep*4))}`,
            `${Math.round(minDensity+(rangeStep*4))+1}-${Math.round(minDensity+(rangeStep*5))}`,
            `${Math.round(minDensity+(rangeStep*5))+1}-${Math.round(minDensity+(rangeStep*6))}`,
            `${Math.round(minDensity+(rangeStep*6))+1}-${Math.round(minDensity+(rangeStep*7))}`,
            `${Math.round(minDensity+(rangeStep*7))+1}-${Math.round(maxDensity)}`
          ];
    }

    // Create content and styling for legend
    div.innerHTML='<div style="text-align: center;"><b>Legend</b><hr style="margin-top:.2rem;margin-bottom:.5rem"</div>';
    for (var i=0; i<grades.length; i++) {
      div.innerHTML += '<i style="background:'
      + getColorOnly(grades[i])
      + '">&nbsp;&nbsp;</i>&nbsp;'
      + labels[i]
      + '<br />';
    }
    return div;
  };

  // Add legend to map
  legend.addTo(map);

}

// Variables to hold checkbox elements
var class1 = document.getElementById('Class1');
var class2 = document.getElementById('Class2');
var class3 = document.getElementById('Class3');
var normalize = document.getElementById('Normalize');

// Variable to hold "Update Records" button
var updateButton = document.getElementById('update-btn');

// Event handler for "Update Records" button
updateButton.onclick = function() {
  queryEndpoint(class1.checked, class2.checked, class3.checked, normalize.checked);
}

// Event listeners for checkboxes
class1.onclick = function() {
  updateCharts(class1.checked, class2.checked, class3.checked, normalize.checked);
};
class2.onclick = function() {
  updateCharts(class1.checked, class2.checked, class3.checked, normalize.checked);
};
class3.onclick = function() {
  updateCharts(class1.checked, class2.checked, class3.checked, normalize.checked);
};
normalize.onclick = function() {
  updateCharts(class1.checked, class2.checked, class3.checked, normalize.checked);
};

// Enable popovers
$('#popover').popover();

// Dismiss popover on loss of focus
$('.popover-dismiss').popover({
  trigger: 'focus'
})

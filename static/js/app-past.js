// Function to build state recall count and count of recalls by recalling firm
function buildRecalls (recalls) {

  // Variables to hold state names, abbreviations, and totals
  var stateArray = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "Puerto Rico"];
  var initialsArray = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "PR"];
  var stateRecallCount = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

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
      }
      // Otherwise check if the distribution pattern contains the state name or initials
      else if (distPatternArray.includes(stateArray[j]) || distPatternArray.includes(initialsArray[j])) {
        // Increment the current state recall count
        stateRecallCount[j] += 1;
      }
    }
  }

  // Update statesData to set "density" property to the recall count for each state
  for (var i=0; i<stateArray.length; i++) {
    statesData.features[i].properties.density = stateRecallCount[i]; 
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
function queryEndpoint(class1,class2,class3,startDate,endDate,normalize) {

  // Parse dates to reformat into YYYY-MM format
  startDate = parseDate(startDate);
  endDate = parseDate(endDate);

  // Query the endpoint using user input variables
  d3.json(`http://127.0.0.1:5000/data/${class1}/${class2}/${class3}/${startDate}/${endDate}`).then( function(data){

    // Call function to build recall object
    var graphData = buildRecalls(data);

    // Call function to build bar chart
    buildBar(graphData.firmName,graphData.firmCount);

    // Call function to build choropleth map
    buildChoropleth(graphData.statesData,normalize);

  });

}

// Function to reformat date (from MMMM YYYY to YYYY-MM)
function parseDate(date) {
  // Split date to array with format MMMM YYYY
  date = date.split(" ");   

  // Determine month and return in format YYYY-MM
  if (date[0] == "January") {
    return `${date[1]}-01`;
  }
  if (date[0] == "February") {
    return `${date[1]}-02`;
  }
  if (date[0] == "March") {
    return `${date[1]}-03`;
  }
  if (date[0] == "April") {
    return `${date[1]}-04`;
  }
  if (date[0] == "May") {
    return `${date[1]}-05`;
  }
  if (date[0] == "June") {
    return `${date[1]}-06`;
  }
  if (date[0] == "July") {
    return `${date[1]}-07`;
  }
  if (date[0] == "August") {
    return `${date[1]}-08`;
  }
  if (date[0] == "September") {
    return `${date[1]}-09`;
  }
  if (date[0] == "October") {
    return `${date[1]}-10`;
  }
  if (date[0] == "November") {
    return `${date[1]}-11`;
  }
  if (date[0] == "December") {
    return `${date[1]}-12`;
  }
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

// Create list of months in available date range
var dateList = [];
for (var i=2012;i<=2019;i++) {
  for (var j=1;j<=12;j++) {
    if (j==1) {
      dateList.push(`January ${i}`);
    }
    if (j==2) {
      dateList.push(`February ${i}`);
    }
    if (j==3) {
      dateList.push(`March ${i}`);
    }
    if (j==4) {
      dateList.push(`April ${i}`);
    }
    if (j==5) {
      dateList.push(`May ${i}`);
    }
    if (j==6) {
      dateList.push(`June ${i}`);
    }
    if (j==7) {
      dateList.push(`July ${i}`);
    }
    if (j==8) {
      dateList.push(`August ${i}`);
    }
    if (j==9) {
      dateList.push(`September ${i}`);
    }
    if (j==10) {
      dateList.push(`October ${i}`);
    }
    if (j==11) {
      dateList.push(`November ${i}`);
    }
    if (j==12) {
      dateList.push(`December ${i}`);
    }
  }
}

// Refine date list to cover Jan 2012 through May 2019
var dateRange = dateList.slice(0,89);

// Define slider with start and end values
var slider = document.getElementById('slider');
var dateValues = [
  document.getElementById('start-value'),
  document.getElementById('end-value')
];

// Create slider
noUiSlider.create(slider, {
    start: [12, 76],
    connect: true,
    // Create two timestamps to define a range.
    range: {
      'min': 0,
      'max': 88
  },
    // start and end must be at least 1 month apart
    margin: 0,
    step: 1,
});

// Update displayed fields when the slider is moved
slider.noUiSlider.on('update', function (values, handle) {
  dateValues[handle].innerHTML = dateRange[+values[handle]];
});

// Variables to hold slider start and end values
var sliderStart = slider.noUiSlider.get()[0];
var sliderEnd = slider.noUiSlider.get()[1];

// Variables to hold checkbox elements
var class1 = document.getElementById('Class1');
var class2 = document.getElementById('Class2');
var class3 = document.getElementById('Class3');
var normalize = document.getElementById('Normalize');

// Event listeners for checkboxes
class1.onclick = function() {
  sliderStart = slider.noUiSlider.get()[0];
  sliderEnd = slider.noUiSlider.get()[1];
  queryEndpoint(class1.checked, class2.checked, class3.checked, dateRange[+sliderStart], dateRange[+sliderEnd], normalize.checked);
};
class2.onclick = function() {
  sliderStart = slider.noUiSlider.get()[0];
  sliderEnd = slider.noUiSlider.get()[1];
  queryEndpoint(class1.checked, class2.checked, class3.checked, dateRange[+sliderStart], dateRange[+sliderEnd], normalize.checked);
};
class3.onclick = function() {
  sliderStart = slider.noUiSlider.get()[0];
  sliderEnd = slider.noUiSlider.get()[1];
  queryEndpoint(class1.checked, class2.checked, class3.checked, dateRange[+sliderStart], dateRange[+sliderEnd], normalize.checked);
};
normalize.onclick = function() {
  sliderStart = slider.noUiSlider.get()[0];
  sliderEnd = slider.noUiSlider.get()[1];
  queryEndpoint(class1.checked, class2.checked, class3.checked, dateRange[+sliderStart], dateRange[+sliderEnd], normalize.checked);
};

// Event listener for slider change
slider.noUiSlider.on('change', function() {
  sliderStart = dateRange[+slider.noUiSlider.get()[0]];
  sliderEnd = dateRange[+slider.noUiSlider.get()[1]];
  queryEndpoint(class1.checked, class2.checked, class3.checked, sliderStart, sliderEnd, normalize.checked);
});

// Perform initial query to endpoint to populate page on load
queryEndpoint(class1.checked, class2.checked, class3.checked, dateRange[+sliderStart], dateRange[+sliderEnd], normalize.checked);

// Enable popovers
$('#popover').popover();

// Dismiss popover on loss of focus
$('.popover-dismiss').popover({
  trigger: 'focus'
})
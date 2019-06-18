function countByState(recalls) {

    // Variables to hold state names, abbreviations, and totals
    var stateArray = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "Puerto Rico"];
    var initialsArray = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "PR"];
    var stateRecallCount = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        
    // Loop through all recall objects
    for (var i=0; i<recalls.length; i++) {
  
      // Split the "distribution_pattern" by spaces
      var distPattern = recalls[i].distribution_pattern;
      var distPatternString = distPattern.replace(/,/g,"");
      var distPatternArray = distPatternString.split(" ");
  
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
  
    return stateRecallCount;
};

d3.json("http://127.0.0.1:5000/data/2012-01/2012-12").then(function(data12){
  d3.json("http://127.0.0.1:5000/data/2013-01/2013-12").then(function(data13){
    d3.json("http://127.0.0.1:5000/data/2014-01/2014-12").then(function(data14){
      d3.json("http://127.0.0.1:5000/data/2015-01/2015-12").then(function(data15){
        d3.json("http://127.0.0.1:5000/data/2016-01/2016-12").then(function(data16){
          d3.json("http://127.0.0.1:5000/data/2017-01/2017-12").then(function(data17){
            d3.json("http://127.0.0.1:5000/data/2018-01/2018-12").then(function(data18){
              d3.json("http://127.0.0.1:5000/data/2019-01/2019-12").then(function(data19){
                // console.log(data12);
                var data2012 = countByState(data12);
                var data2013 = countByState(data13);
                var data2014 = countByState(data14);
                var data2015 = countByState(data15);
                var data2016 = countByState(data16);
                var data2017 = countByState(data17);
                var data2018 = countByState(data18);
                var data2019 = countByState(data19);

                var natAvg2012 = Math.round(getAvg(data2012))
                var natAvg2013 = Math.round(getAvg(data2013))
                var natAvg2014 = Math.round(getAvg(data2014))
                var natAvg2015 = Math.round(getAvg(data2015))
                var natAvg2016 = Math.round(getAvg(data2016))
                var natAvg2017 = Math.round(getAvg(data2017))
                var natAvg2018 = Math.round(getAvg(data2018))
                var natAvg2019 = Math.round(getAvg(data2019))
                
                var stArray = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "Puerto Rico"];
                // var initialsArray = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "PR"];
                var labels = ["2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019"]
                var series = []
                var seriesNat = []
                  for (i = 0; i < stArray.length; i++) {
                    var objj = { name: stArray[i],   
                                points: [[labels[0], data2012[i]], 
                                [labels[1], data2013[i]],
                                [labels[2], data2014[i]],
                                [labels[3], data2015[i]],
                                [labels[4], data2016[i]],
                                [labels[5], data2017[i]],
                                [labels[6], data2018[i]],
                                [labels[7], data2019[i]]],
                                visible: false}
                    series.push(objj)};        
                    
                    var objjNat = { name: "National Average",
                      line:{width:4, color: "#002366"},
                      defaultPoint_marker_size: 12,
                      defaultPoint_marker_color: "#FFD700",
                      points: [[labels[0], natAvg2012],
                              [labels[1], natAvg2013],
                              [labels[2], natAvg2014],
                              [labels[3], natAvg2015],
                              [labels[4], natAvg2016],
                              [labels[5], natAvg2017],
                              [labels[6], natAvg2018],
                              [labels[7], natAvg2019]
                              ]
                    }; 
                    seriesNat.push(objjNat);
                    series.push(seriesNat[0]);          
                         
                    JSC.chart('stateChart', {
                    debug: true,
                    defaultSeries: { type: 'line' }, 
                    legend: { position: 'bottom'},
                    yAxis_label_text: 'Number of Recalls',
                    xAxis_label_text: 'Years',  
                    chartArea: { fill: "#f9f1f1" },
                    yAxis_formatString: 'n',
                    series: series  
                  });   
              });
            });
          });
        });
      });
    });
  });
});

function getAvg(data) {
  var total = 0
  for(var i = 0; i < data.length; i++) {
    total += data[i];
    var avg = total / data.length};
  
    return avg   
  };
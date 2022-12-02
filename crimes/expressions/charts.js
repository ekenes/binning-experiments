// Tells Arcade to expect (or download) the month and type
// fields from the layer of points to aggregate to bins
Expects($aggregatedFeatures, "type", "month");

var attributes = {};
var pieFieldNames = [];
// List each month of the year. This will be used to create attributes (or fields)
// for grouping crimes within each month.
var monthFieldNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Refer to all points within the bin as “crimes”
var crimes = $aggregatedFeatures;

// Returns the count of crimes
// for each category in the "type" field as a FeatureSet
// This list of crimes and their counts will be used for the pie chart
var typeStats = GroupBy(crimes, ["type"],
  [{ name: "total", expression: "1", statistic: "count" }]
);
// Orders the results in descending order by the total count
var topCrimes = Top(OrderBy(typeStats, "total desc"), 10);

// Returns the count of crimes as a FeatureSet
// for each month of the year based on the “month” field
// This list of crimes and their counts will be used for the line chart
var monthStats = GroupBy(crimes, ["month"],
  [{ name: "total", expression: "1", statistic: "count" }]
);

if(Count(topCrimes) == 0){
  return {
    type: "text",
    text: "No crimes committed in this area"
  };
}

// Pushes the list of crimes and their counts to a dictionary
// This will be used for both the pie chart.
// The result will look something like:
// attributes = {
//   drugs: 200,
//   theft: 180
// }
// Each crime type is also pushed to an array used to indicate
// which categories to include in the chart.
// e.g. pieFieldNames = [ “drugs”, “theft” ]
for(var item in topCrimes){
  var num_crimes_top = item.total;
  var crimeType = item["type"];
  attributes[crimeType] = num_crimes_top;
  Push(pieFieldNames, crimeType);
}

// Pushes the list of months and the number of crimes
// that occurred in each to a dictionary
// This will be used for the line chart.
// The result will look something like:
// attributes = {
//   January: 48,
//   February: 81
// }
for(var item in monthStats){
  var num_crimes_month = item.total;
  var crimeMonth = Text(Date(2010,item.month-1,1), "MMMM");
  attributes[crimeMonth] = num_crimes_month;
}

// Return a dictionary following the webmap spec for media elements
// So the popup knows which charts types to render using the
// data created within the expression.
// Spec: https://developers.arcgis.com/web-map-specification/objects/popupElement_media/
return {
  type: "media",
  attributes: attributes,
  title: "Crime summary",
  mediaInfos: [{
    type: "piechart",
    title: "Crimes by type",
    value: {
      fields: pieFieldNames
    }
  }, {
    type: "linechart",
    title: "Crimes by month",
    value: {
      fields: monthFieldNames
    }
  }]
};

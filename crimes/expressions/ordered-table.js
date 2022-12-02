// Tells Arcade to expect (or download) the is_night and type
// fields from the layer of points to aggregate to bins
Expects($aggregatedFeatures, "is_night", "type");

// Refer to all points within the bin as “crimes”
var crimes = $aggregatedFeatures;

// Returns the count of crimes, and the % that occurred at night
// for each category in the "type" field as a FeatureSet
var stats = GroupBy(crimes, ["type"],
  [
    { name: "total", expression: "1", statistic: "count" },
    { name: "nightPercent", expression: "is_night", statistic: "avg" }
  ]
);

// Orders the results in descending order by the total count
// and keeps the 5 most common crime types
var topCrimes = Top(OrderBy(stats, "total desc"), 5);

// if no crimes were reported, then return
// a text element indicating this
if(Count(topCrimes) == 0){
  return {
    type: "text",
    text: "No crimes committed in this area"
  };
}

// Build an HTML table to display the summary of
// crimes by count and the % that occurred at night
var cssGray = "style='background-color:#d6d6d6;'";
var cssRight = "style='text-align: right;'";
var cssCenter = "style='text-align: center;'";

var table = "<table style='width: 100%'>";
table += `<tr>
  <td ${cssCenter}><b>Category</b></td>
  <td ${cssCenter}><b>Count</b></td>
  <td ${cssCenter}><b>% at night</b></td>
</tr>`;

var i = 0;
// Create a new row in the table for each crime.
// There should be no more than 5 rows.
for(var item in topCrimes){
  var num_crimes = Text(item.total, "#,###");
  var night_percent = Text(item.nightPercent, "#%");
  var crimeType = item["type"];

  table += `<tr ${IIF( i % 2 != 0, cssGray, null )}>
    <td>${crimeType}</td>
    <td ${cssRight}>${num_crimes}</td>
    <td ${cssRight}>${night_percent}</td>
  </tr>`;
  i++;
}
table += "</table>";

// Return the table as a text element
// https://developers.arcgis.com/web-map-specification/objects/popupElement_text/
return {
  type: "text",
  text: table
};

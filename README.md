# Binning Experiments

Binning is a form of geographic data aggregation that aggregates points to predefined geohash cells, effectively representing point data as a gridded polygon layer. Read more about binning in [this blog post](https://www.esri.com/arcgis-blog/products/js-api-arcgis/mapping/binning-now-available-in-the-arcgis-api-for-javascript/).

The apps in this repo explore various ways to visualize binned data.

## Bin size

These apps visualize [Argo float](https://argo.ucsd.edu/) locations binned at various levels. Levels 1-3 should only be used for datasets that span the globe. These examples demonstrate how the resolution of the bin size affects the visualization.

- [Argo floats binned to level 1](https://ekenes.github.io/binning-experiments/intro/buoys-level-1.html)
- [Argo floats binned to level 2](https://ekenes.github.io/binning-experiments/intro/buoys-level-2.html)
- [Argo floats binned to level 3](https://ekenes.github.io/binning-experiments/intro/buoys-level-3.html)

## Projections

The following apps allow you to explore and view binned Argo float data in various projections. See [Binning and spatial references for more information](https://www.esri.com/arcgis-blog/products/js-api-arcgis/mapping/binning-now-available-in-the-arcgis-api-for-javascript/#spatial-references).

- [Hurricanes](https://ekenes.github.io/binning-experiments/intro/hurricanes.html)
- [Explore projections](https://ekenes.github.io/binning-experiments/intro/explore-projections.html)

## Wurman dots

These apps experiment with visualization binned data using the [Wurman dot visualization technique](https://www.esri.com/arcgis-blog/products/js-api-arcgis/mapping/wurman-dots-bringing-back-the-60s/).

- [Ratio of injuries to car crashes (2020)](https://ekenes.github.io/binning-experiments/wurman/crashes-wurman.html) - This app represents the ratio of motorists who sustained injuries to the total number of car crashes in the gridded circle style developed by Saul Wurman.
- [Car crashes (size) + ratio of injuries to car crashes (color)](https://ekenes.github.io/binning-experiments/wurman/crashes-wurman-total.html) - This app aggregates car crashes to geographic bins and visualizes the count using Wurman's gridded circles. Continuous color is used to visualize the ratio of injuries to car crashes.

## Charts

The following apps explore various ways to represent binned crash data as pie charts.

- [Number of pedestrians, cyclists, and motorists injured or killed in car crashes (2020)](https://ekenes.github.io/binning-experiments/charts/crashes-pie-chart.html) - This app visualizes the total number of people injured or killed in car crashes in New York City (2020). Each pie chart is equally sized based on the dimensions of the bin. The size changes as the user zooms in and out of the map. At large scales, charts are full pies. As you zoom beyond a scale threshold, the pie charts transition to donuts with a label describing the value of the predominant category.
- [Number of pedestrians, cyclists, and motorists injured or killed in car crashes (size) (2020)](https://ekenes.github.io/binning-experiments/charts/crashes-pie-chart-size.html) - This app visualizes the total number of people injured or killed in car crashes in New York City (2020). Each pie chart is sized based on the total number of crashes in the bin.
- [Number of pedestrians and cyclists injured or killed in car crashes (2020)](https://ekenes.github.io/binning-experiments/charts/crashes-pie-chart-non-motorists.html) - This app visualizes the total number of people injured or killed in car crashes in New York City (2020). The colors of the chart emphasize the numbers of pedestrians and cyclists who were injured or killed in car crashes.
- [Number of pedestrians and cyclists injured or killed in car crashes (size) (2020)](https://ekenes.github.io/binning-experiments/charts/crashes-pie-chart-size-non-motorists.html) - This app visualizes the total number of people injured or killed in car crashes in New York City (2020). The colors of the chart emphasize the numbers of pedestrians and cyclists who were injured or killed in car crashes. Charts are sized based on the total number of crashes in the bin.

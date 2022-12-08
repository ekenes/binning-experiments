const featureReduction = {
  type: "binning",
  fixedBinLevel: 6,
  fields: [
    new AggregateField({
      name: "aggregateCount",
      alias: "Total count",
      statisticType: "count"
    })
  ],
  // renderer defining Wurman dots style
  // will eventually be defined here
  renderer: {
    type: "simple",
    symbol: {
      type: "simple-fill"
    }
  }
};

featureReduction.renderer = {
  type: "simple",
  symbol: {
    type: "cim",
    data: {
      type: "CIMSymbolReference",
      symbol: {
        type: "CIMPointSymbol",
        symbolLayers: [
          // symbol layer definitions here
          // one for outerRing
          // one for innerDot
        ]
      },
      primitiveOverrides: [
        {
          type: "CIMPrimitiveOverride",
          primitiveName: "innerDot",
          propertyName: "Size",
          valueExpressionInfo: {
            type: "CIMExpressionInfo",
            title: "Size in pixels of inner ring at maxScale",
            // outerSize is the pixel size at the largest scale
            // The innerSize is determined by multiplying
            // the outerSize by the forest ratio
            expression: `
              var binWidthMeters = 800;  // bin width in meters at level 6
              var viewResolution = 38;  // meters per pixel
              var initialViewScale = 144447;
              var binWidthPixels = binWidthMeters / viewResolution;
              var value = $feature.aggregateCount / 300;

              var innerRatio = IIF(value > 1, 1, value);
              var outerSize = binWidthPixels * (initialViewScale / $view.scale);
              var innerSize = outerSize * innerRatio;
              return IIF( innerSize < 3, 3, innerSize ) * 0.75;
            `,
            returnType: "Default"
          }
        }
      ]
    }
  },
  visualVariables: [
    {
      type: "color",
      field: "AVG_MOTORIST_INJURED",
      legendOptions: {
        title: "Ratio of motorists injured per crash"
      },
      stops: [
        { value: 0, color: "#feebe2" },
        { value: 0.15, color: "#fbb4b9" },
        { value: 0.25, color: "#f768a1" },
        { value: 0.33, color: "#c51b8a" },
        { value: 0.5, color: "#7a0177" }
      ]
    }
  ]
};
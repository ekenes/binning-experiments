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

              var innerRatio = IIF($feature.AVG_MOTORIST_INJURED > 1, 1, $feature.AVG_MOTORIST_INJURED);
              var outerSize = binWidthPixels * (initialViewScale / $view.scale);
              var innerSize = outerSize * innerRatio;
              return innerSize * 0.75;
            `,
            returnType: "Default"
          }
        }
      ]
    }
  }
};
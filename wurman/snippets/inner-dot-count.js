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
              var binWidthMeters = ${binSize};
              var viewResolution = ${view.resolution};
              var binWidthPixels = binWidthMeters / viewResolution;
              var value = $feature.aggregateCount / 300;

              var innerRatio = IIF(value > 1, 1, value);
              var outerSize = binWidthPixels * (${initialViewScale} / $view.scale);
              var innerSize = outerSize * innerRatio;
              return IIF( innerSize < 3, 3, innerSize ) * 0.75;
            `,
            returnType: "Default"
          }
        }
      ]
    }
  }
};
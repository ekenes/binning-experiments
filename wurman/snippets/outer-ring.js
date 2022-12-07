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
          // Name of the primitive (symbol layer to modify)
          primitiveName: "outerRing",
          // The symbol property to vary by expression
          propertyName: "Size",
          valueExpressionInfo: {
            type: "CIMExpressionInfo",
            title: "Size in pixels of outer ring at maxScale",
            // The Arcade expression used to vary symbol size
            // by scale. This should return a result in pixels
            expression: `
              var binWidthMeters = 611;
              var viewResolution = ${view.resolution};
              var binWidthPixels = binWidthMeters / viewResolution;
              return (binWidthPixels * (${initialViewScale} / $view.scale)) * 0.75;
            `,
            returnType: "Default"
          }
        }
      ]
    }
  }
};
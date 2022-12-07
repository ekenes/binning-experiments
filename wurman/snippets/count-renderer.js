featureReduction.renderer = {
  type: "simple",
  symbol: {
    type: "cim",
    data: {
      type: "CIMSymbolReference",
      symbol: {
        type: "CIMPointSymbol",
        symbolLayers: [
          {
            type: "CIMVectorMarker",
            primitiveName: "innerDot",
            markerGraphics: [
              {
                type: "CIMMarkerGraphic",
                geometry: { /* Geometry definition of a circle */ },
                symbol: { /* Solid fill */ }
              }
            ]
          },
          {
            type: "CIMVectorMarker",
            primitiveName: "outerRing",
            markerGraphics: [
              {
                type: "CIMMarkerGraphic",
                geometry: { /* Geometry definition of a circle */ },
                symbol: { /* Hollow fill with outline */ }
              }
            ]
          }
        ]
      },
      primitiveOverrides: [
        {
          type: "CIMPrimitiveOverride",
          // Name of the primitive (symbol layer to modify)
          primitiveName: "outerRing",
          // The symbol property to vary by expression
          propertyName: "Size",
          // Defines the Arcade expression that returns a
          // size based on a scale value
          valueExpressionInfo: { }
        },
        {
          type: "CIMPrimitiveOverride",
          primitiveName: "innerDot",
          propertyName: "Size",
          valueExpressionInfo: { }
        }
      ]
    }
  }
};
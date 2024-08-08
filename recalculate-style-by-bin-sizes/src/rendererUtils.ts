import { getMatchingSchemes } from "@arcgis/core/smartMapping/symbology/color";
import { createContinuousRenderer as createContinuousColorRenderer } from "@arcgis/core/smartMapping/renderers/color";

interface RegenerateRendererParams {
  layer: __esri.FeatureLayer;
  view: __esri.MapView;
}

type ColorThemes = __esri.colorGetMatchingSchemesParams["theme"];

export async function regenerateColorRenderer(params: RegenerateRendererParams){
  const { layer, view } = params;

  if (!layer || !view) {
    return;
  }

  const featureReduction = layer.featureReduction as __esri.FeatureReductionBinning;

  if(!featureReduction){
    return;
  }

  const renderer = (featureReduction.renderer as __esri.ClassBreaksRenderer).clone();
  const authoringInfo = renderer.authoringInfo;
  const colorVariableAuthoringInfo = authoringInfo?.visualVariables.find(vv => vv.type === "color");
  const theme = colorVariableAuthoringInfo?.theme;

  const colorVariable = renderer.visualVariables.find(vv => vv.type === "color") as __esri.ColorVariable;
  const colors = colorVariable?.stops.map(stop => stop.color);
  const geometryType = "polygon";

  const colorScheme = getMatchingSchemes({
    theme: theme as ColorThemes,
    geometryType,
    colors
  })[0];

  const field = renderer.field;
  const normalizationField = renderer.normalizationField;
  const valueExpression = renderer.valueExpression;
  const valueExpressionTitle = renderer.valueExpressionTitle;
  const legendOptions = renderer.legendOptions;

  const { renderer: newRenderer } = await createContinuousColorRenderer({
    layer,
    view,
    field,
    normalizationField,
    valueExpression,
    valueExpressionTitle,
    theme: theme as __esri.colorCreateContinuousRendererParams["theme"],
    colorScheme,
    outlineOptimizationEnabled: true,
    legendOptions,
    forBinning: true
  });

  featureReduction.renderer = newRenderer;
  layer.featureReduction = featureReduction;
}

export async function regenerateRenderer(params: RegenerateRendererParams) {
  const { layer, view } = params;

  if (!layer || !view) {
    return;
  }

  const featureReduction = layer.featureReduction as __esri.FeatureReductionCluster;

  if (!featureReduction) {
    return;
  }

  const renderer = (featureReduction.renderer as __esri.Renderer);

  if(renderer.type === "simple"){
    return;
  }
}
import {
  createContinuousRenderer as createContinuousColorRenderer,
  createAgeRenderer as createAgeColorRenderer,
} from "@arcgis/core/smartMapping/renderers/color";
import {
  createContinuousRenderer as createContinuousSizeRenderer,
  createAgeRenderer as createAgeSizeRenderer,
} from "@arcgis/core/smartMapping/renderers/size";
import {
  createRenderer as createRelationshipRenderer,
} from "@arcgis/core/smartMapping/renderers/relationship";

import classBreaks from "@arcgis/core/smartMapping/statistics/classBreaks";

import { createVisualVariable as createOpacityVisualVariable } from "@arcgis/core/smartMapping/renderers/opacity";
import Color from "@arcgis/core/Color";
interface RegenerateColorVariableParams {
  layer: __esri.FeatureLayer;
  view: __esri.MapView;
  field?: string;
  normalizationField?: string;
  valueExpression?: string;
  valueExpressionTitle?: string;
  startTime?: __esri.colorCreateAgeRendererParams["startTime"];
  endTime?: __esri.colorCreateAgeRendererParams["endTime"];
  unit?: __esri.colorCreateAgeRendererParams["unit"];
  theme?: string;
  colors: Color[];
}

async function regenerateColorVariable(params: RegenerateColorVariableParams) {
  const {
    layer,
    view,
    field,
    normalizationField,
    valueExpression,
    valueExpressionTitle,
    theme,
    colors,
    startTime,
    endTime,
    unit,
  } = params;

  if (startTime || endTime) {
    const { visualVariable } = await createAgeColorRenderer({
      layer,
      view,
      theme: theme as __esri.colorCreateAgeRendererParams["theme"],
      startTime: startTime || Date.now(),
      endTime: endTime || Date.now(),
      unit: unit!,
    });
    visualVariable.stops.forEach((stop, i) => {
      stop.color = colors[i];
    });
    return visualVariable;
  }

  const { visualVariable } = await createContinuousColorRenderer({
    layer,
    view,
    field,
    normalizationField,
    valueExpression,
    valueExpressionTitle,
    theme: theme as __esri.colorCreateContinuousRendererParams["theme"],
    forBinning: true,
  });
  visualVariable.stops.forEach((stop, i) => {
    stop.color = colors[i];
  });
  return visualVariable;
}
interface RegenerateSizeVariableParams {
  layer: __esri.FeatureLayer;
  view: __esri.MapView;
  field?: string;
  normalizationField?: string;
  valueExpression?: string;
  valueExpressionTitle?: string;
  startTime?: __esri.colorCreateAgeRendererParams["startTime"];
  endTime?: __esri.colorCreateAgeRendererParams["endTime"];
  unit?: __esri.colorCreateAgeRendererParams["unit"];
  theme?: string;
}

async function regenerateSizeVariable(params: RegenerateSizeVariableParams) {
  const {
    layer,
    view,
    field,
    normalizationField,
    valueExpression,
    valueExpressionTitle,
    theme,
    startTime,
    endTime,
    unit,
  } = params;

  if (startTime || endTime) {
    const { visualVariables } = await createAgeSizeRenderer({
      layer,
      view,
      theme: theme as __esri.sizeCreateAgeRendererParams["theme"],
      startTime: startTime || Date.now(),
      endTime: endTime || Date.now(),
      unit: unit!,
    });
    const visualVariable = visualVariables.filter(
      (vv) => vv.valueExpression !== "$view.scale"
    )[0];
    return visualVariable;
  }

  const { visualVariables } = await createContinuousSizeRenderer({
    layer,
    view,
    field,
    normalizationField,
    valueExpression,
    valueExpressionTitle,
    theme: theme as __esri.sizeCreateContinuousRendererParams["theme"],
    forBinning: true,
  });
  const visualVariable = visualVariables.filter(
    (vv) => vv.valueExpression !== "$view.scale"
  )[0];
  return visualVariable;
}

interface RegenerateOpacityVariableParams {
  layer: __esri.FeatureLayer;
  view: __esri.MapView;
  field?: string;
  normalizationField?: string;
  valueExpression?: string;
  valueExpressionTitle?: string;
  legendOptions?: __esri.opacityCreateVisualVariableParams["legendOptions"];
  opacityValues: number[];
}

async function regenerateOpacityVariable(
  params: RegenerateOpacityVariableParams
) {
  const {
    layer,
    view,
    field,
    normalizationField,
    valueExpression,
    valueExpressionTitle,
    opacityValues,
    legendOptions,
  } = params;

  const { visualVariable } = await createOpacityVisualVariable({
    layer,
    view,
    field,
    normalizationField,
    valueExpression,
    valueExpressionTitle,
    legendOptions,
    forBinning: true,
  });
  visualVariable.stops.forEach((stop, i) => {
    stop.opacity = opacityValues[i];
  });

  return visualVariable;
}

async function regenerateVisualVariables(params: RegenerateRendererParams) {
  const { layer, view } = params;
  const featureReduction =
    layer.featureReduction as __esri.FeatureReductionBinning;

  const renderer = (
    featureReduction.renderer as __esri.ClassBreaksRenderer
  ).clone();

  const { visualVariables, authoringInfo } = renderer;

  if (!visualVariables || visualVariables.length === 0) {
    return visualVariables;
  }

  const newVisualVariables = visualVariables.map(async (vv) => {
    const {
      field,
      normalizationField,
      valueExpression,
      valueExpressionTitle,
      legendOptions,
    } = vv as __esri.ColorVariable;

    if (vv.type === "color") {
      const authoringInfoVV = authoringInfo.visualVariables.find(
        (vv) => vv.type === "color"
      );
      const { theme, startTime, endTime, units } = authoringInfoVV!;

      const colors = (vv as __esri.ColorVariable).stops.map(
        (stop) => stop.color
      );
      const colorParams = {
        field,
        normalizationField,
        valueExpression,
        valueExpressionTitle,
        legendOptions,
        visualVariables,
        authoringInfo,
        layer,
        view,
        theme,
        colors,
        startTime,
        endTime,
        unit: units,
      } as RegenerateColorVariableParams;
      const colorVariable = await regenerateColorVariable(colorParams);
      return colorVariable;
    }
    if (vv.type === "size") {
      if (vv.valueExpression === "$view.scale") {
        return Promise.resolve(vv);
      }
      const authoringInfoVV = authoringInfo.visualVariables.find(
        (vv) => vv.type === "size"
      );
      const { theme, startTime, endTime, units } = authoringInfoVV!;

      const sizeParams = {
        field,
        normalizationField,
        valueExpression,
        valueExpressionTitle,
        legendOptions,
        visualVariables,
        authoringInfo,
        layer,
        view,
        theme,
        startTime,
        endTime,
        unit: units,
      } as RegenerateSizeVariableParams;
      const sizeVariable = await regenerateSizeVariable(sizeParams);
      return sizeVariable;
    }
    if (vv.type === "opacity") {
      const opacityParams = {
        field,
        normalizationField,
        valueExpression,
        valueExpressionTitle,
        legendOptions,
        opacityValues: (vv as __esri.OpacityVariable).stops.map(
          (stop) => stop.opacity
        ),
        layer,
        view,
      } as RegenerateOpacityVariableParams;
      const opacityVariable = await regenerateOpacityVariable(opacityParams);
      return opacityVariable;
    }
    if (vv.type === "rotation") {
      return await Promise.resolve(vv);
    }
  }) as Promise<__esri.VisualVariable>[];
  return await Promise.all(newVisualVariables);
}

async function regenerateClassBreaksRenderer(params: RegenerateRendererParams) {
  const { layer, view } = params;
  const featureReduction =
    layer.featureReduction as __esri.FeatureReductionBinning;

  const renderer = (
    featureReduction.renderer as __esri.ClassBreaksRenderer
  ).clone();

  const { field, normalizationField, valueExpression, authoringInfo } =
    renderer;

  const styleType = authoringInfo?.type;

  if (!styleType) {
    const newVisualVariables = await regenerateVisualVariables(params);
    renderer.visualVariables = newVisualVariables;
    return renderer;
  }

  if (styleType === "univariate-color-size") {
    console.log("figure this out later");
    return renderer;
  }

  const { classificationMethod, standardDeviationInterval } = authoringInfo;
  const numClasses = renderer.classBreakInfos.length;

  const { classBreakInfos } = await classBreaks({
    layer,
    view,
    field,
    normalizationField,
    valueExpression,
    classificationMethod:
      classificationMethod as __esri.classBreaksClassBreaksParams["classificationMethod"],
    standardDeviationInterval,
    numClasses,
    forBinning: true,
  });

  renderer.classBreakInfos.forEach((info, i) => {
    info.minValue = classBreakInfos[i].minValue;
    info.maxValue = classBreakInfos[i].maxValue;
    info.label = classBreakInfos[i].label;
  });

  return renderer;
}

async function regenerateUniqueValueRenderer(params: RegenerateRendererParams) {
  const { layer, view } = params;
  const featureReduction =
    layer.featureReduction as __esri.FeatureReductionBinning;

  const renderer = (
    featureReduction.renderer as __esri.UniqueValueRenderer
  ).clone();

  const { authoringInfo } = renderer;

  const styleType = authoringInfo?.type;

  if (styleType === "relationship"){
    const { field1, field2, focus, numClasses } = authoringInfo;
    const response = await createRelationshipRenderer({
      layer,
      view,
      field1,
      field2,
      focus,
      numClasses,
      forBinning: true,
    });
    renderer.valueExpression = response.renderer.valueExpression;
  }

  const newVisualVariables = await regenerateVisualVariables(params);
  renderer.visualVariables = newVisualVariables;

  return renderer;
}

async function regenerateSimpleRenderer(params: RegenerateRendererParams) {
  const { layer } = params;
  const featureReduction =
    layer.featureReduction as __esri.FeatureReductionBinning;

  const renderer = featureReduction.renderer as __esri.Renderer;
  return renderer;
}

function processParams(params: RegenerateRendererParams) {
  const { layer, view } = params;

  if (!layer || !view) {
    throw new Error("Layer and view are required");
  }

  const featureReduction =
    layer.featureReduction as __esri.FeatureReductionBinning;

  if (!featureReduction) {
    throw new Error("Feature reduction is required");
  }
}

const rendererTypeMap = {
  simple: regenerateSimpleRenderer,
  "class-breaks": regenerateClassBreaksRenderer,
  "unique-value": regenerateUniqueValueRenderer,
  "dot-density": null,
  "pie-chart": null,
};

interface RegenerateRendererParams {
  layer: __esri.FeatureLayer;
  view: __esri.MapView;
}

export async function regenerateRenderer(params: RegenerateRendererParams) {
  processParams(params);

  const { layer } = params;
  const featureReduction = (
    layer.featureReduction as __esri.FeatureReductionBinning
  ).clone();

  const renderer = featureReduction.renderer as __esri.Renderer;

  if (renderer.type in rendererTypeMap) {
    const newRenderer = await rendererTypeMap[renderer.type](params);
    featureReduction.renderer = newRenderer;
    layer.featureReduction = featureReduction;
    return;
  }
  console.log("Renderer type not supported");
}

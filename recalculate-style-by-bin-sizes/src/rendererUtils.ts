import {
  createContinuousRenderer as createContinuousColorRenderer,
  createAgeRenderer as createAgeColorRenderer,
} from "@arcgis/core/smartMapping/renderers/color";
import {
  createContinuousRenderer as createContinuousSizeRenderer,
  createAgeRenderer as createAgeSizeRenderer,
  updateRendererWithReferenceSize,
} from "@arcgis/core/smartMapping/renderers/size";
import { createRenderer as createHeatmapRenderer } from "@arcgis/core/smartMapping/renderers/heatmap";
import { createRenderer as createRelationshipRenderer } from "@arcgis/core/smartMapping/renderers/relationship";
import { createRenderer as createDotDensityRenderer } from "@arcgis/core/smartMapping/renderers/dotDensity";
import { createContinuousRenderer as createUnivariateRenderer } from "@arcgis/core/smartMapping/renderers/univariateColorSize";

import SizeStop from "@arcgis/core/renderers/visualVariables/support/SizeStop";

import classBreaks from "@arcgis/core/smartMapping/statistics/classBreaks";
import summaryStatistics from "@arcgis/core/smartMapping/statistics/summaryStatistics";
import referenceSize from "@arcgis/core/smartMapping/heuristics/referenceSize";
import outline from "@arcgis/core/smartMapping/heuristics/outline";
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
  forBinning?: boolean;
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
    forBinning,
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
    forBinning,
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
  forBinning?: boolean;
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
    forBinning,
  } = params;

  if (startTime || endTime) {
    const { visualVariables } = await createAgeSizeRenderer({
      layer,
      view,
      theme: theme as __esri.sizeCreateAgeRendererParams["theme"],
      startTime: startTime || Date.now(),
      endTime: endTime || Date.now(),
      unit: unit!,
      sizeOptimizationEnabled: true,
      outlineOptimizationEnabled: false,
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
    forBinning,
    sizeOptimizationEnabled: true,
    outlineOptimizationEnabled: false,
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
  forBinning?: boolean;
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
    forBinning,
  } = params;

  const { visualVariable } = await createOpacityVisualVariable({
    layer,
    view,
    field,
    normalizationField,
    valueExpression,
    valueExpressionTitle,
    legendOptions,
    forBinning,
  });
  visualVariable.stops.forEach((stop, i) => {
    stop.opacity = opacityValues[i];
  });

  return visualVariable;
}

async function regenerateVisualVariables(
  params: RegenerateRendererParams,
  vvSubset?: __esri.VisualVariable[]
) {
  if (vvSubset && vvSubset.length === 0) {
    return vvSubset;
  }

  const { layer, view, forBinning } = params;
  const featureReduction =
    layer.featureReduction as __esri.FeatureReductionBinning;

  const renderer = forBinning
    ? (featureReduction.renderer as __esri.ClassBreaksRenderer).clone()
    : (layer.renderer as __esri.ClassBreaksRenderer).clone();

  const { visualVariables, authoringInfo } = renderer;

  if (!visualVariables || visualVariables.length === 0) {
    return visualVariables;
  }

  const vv = vvSubset ? vvSubset : visualVariables;

  const newVisualVariables = vv
    .filter(
      (vv) =>
        !(
          vv.type === "size" &&
          vv.valueExpression === "$view.scale" &&
          (vv as __esri.SizeVariable).target === "outline"
        )
    )
    .map(async (vv) => {
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
          forBinning,
        } as RegenerateColorVariableParams;
        const colorVariable = await regenerateColorVariable(colorParams);
        return colorVariable;
      }
      if (vv.type === "size") {
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
          forBinning,
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
          forBinning,
        } as RegenerateOpacityVariableParams;
        const opacityVariable = await regenerateOpacityVariable(opacityParams);
        return opacityVariable;
      }
      if (vv.type === "rotation") {
        return await Promise.resolve(vv);
      }
    }) as Promise<__esri.VisualVariable>[];

  const {
    visualVariables: [outlineVariable],
  } = await outline({
    layer,
    view,
    forBinning,
  });

  return await Promise.all([
    ...newVisualVariables,
    outlineVariable as __esri.SizeVariable,
  ]);
}

async function regenerateReferenceSizeRenderer(
  params: RegenerateRendererParams
) {
  const { layer, view, forBinning } = params;
  const featureReduction =
    layer.featureReduction as __esri.FeatureReductionBinning;

  const renderer = forBinning
    ? (
        featureReduction.renderer as
          | __esri.ClassBreaksRenderer
          | __esri.UniqueValueRenderer
      ).clone()
    : (
        layer.renderer as
          | __esri.ClassBreaksRenderer
          | __esri.UniqueValueRenderer
      ).clone();

  const { authoringInfo } = renderer;

  const referenceSizeVariable = authoringInfo?.visualVariables.find(
    (vv) => vv.type === "size" && vv.theme === "reference-size"
  );

  if (referenceSizeVariable) {
    const { field, normalizationField } = referenceSizeVariable;

    const { avg, stddev } = await summaryStatistics({
      layer,
      view,
      field,
      normalizationField,
      forBinning,
    });
    const maxValue = avg + 2 * stddev;

    const { size } = await referenceSize({
      layer,
      view,
      forBinning,
    });

    const sizeStops = [
      new SizeStop({ value: 0, size: 1 }),
      new SizeStop({ value: maxValue, size }),
    ];

    const renderer = updateRendererWithReferenceSize({
      layer,
      view,
      sizeStops,
      forBinning,
    });
    return renderer;
  }
  return renderer;
}

interface RegenerateUnivariateRendererParams {
  layer: __esri.FeatureLayer;
  view: __esri.MapView;
  renderer: __esri.ClassBreaksRenderer;
  forBinning?: boolean;
}

async function regenerateUnivariateColorSizeRenderer(
  params: RegenerateUnivariateRendererParams
) {
  const { layer, renderer, view, forBinning } = params;
  const {
    field,
    normalizationField,
    valueExpression,
    valueExpressionTitle,
    authoringInfo,
  } = renderer;
  const { univariateTheme } = authoringInfo;

  const isContinuous = renderer.visualVariables.some(
    (vv) => vv.type === "color"
  );

  const { renderer: generatedRenderer } = await createUnivariateRenderer({
    layer,
    view,
    field,
    normalizationField,
    valueExpression,
    valueExpressionTitle,
    theme: univariateTheme,
    forBinning,
    colorOptions: {
      isContinuous,
    },
    sizeOptions: {
      sizeOptimizationEnabled: univariateTheme !== "above-and-below",
    },
  });

  const newRenderer = renderer.clone();

  newRenderer.classBreakInfos.forEach((info, i) => {
    info.minValue = generatedRenderer.classBreakInfos[i].minValue;
    info.maxValue = generatedRenderer.classBreakInfos[i].maxValue;
    info.label = generatedRenderer.classBreakInfos[i].label;
  });

  if (isContinuous) {
    const colorVariable = newRenderer.visualVariables.find(
      (vv) => vv.type === "color"
    ) as __esri.ColorVariable;
    const generatedColorVariable = generatedRenderer.visualVariables.find(
      (vv) => vv.type === "color"
    ) as __esri.ColorVariable;

    generatedColorVariable.stops.forEach((stop, i) => {
      stop.color = colorVariable.stops[i].color;
    });
  }

  const otherVisualVariables = newRenderer.visualVariables.filter(
    (vv) => vv.type !== "color" && vv.type !== "size"
  );

  const otherVariablesRegenerated = await regenerateVisualVariables(
    params,
    otherVisualVariables
  );

  newRenderer.visualVariables = [
    ...generatedRenderer.visualVariables,
    ...otherVariablesRegenerated,
  ];

  return newRenderer;
}

async function regenerateClassBreaksRenderer(params: RegenerateRendererParams) {
  const { layer, view, forBinning } = params;
  const featureReduction =
    layer.featureReduction as __esri.FeatureReductionBinning;

  let renderer = forBinning
    ? (featureReduction.renderer as __esri.ClassBreaksRenderer).clone()
    : (layer.renderer as __esri.ClassBreaksRenderer).clone();

  const { field, normalizationField, valueExpression, authoringInfo } =
    renderer;

  const styleType = authoringInfo?.type;

  if (styleType === "univariate-color-size") {
    const newRenderer = await regenerateUnivariateColorSizeRenderer({
      layer,
      view,
      renderer,
      forBinning,
    });

    return newRenderer;
  }

  if (renderer.classBreakInfos.length > 1) {
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
      forBinning,
    });

    renderer.classBreakInfos.forEach((info, i) => {
      info.minValue = classBreakInfos[i].minValue;
      info.maxValue = classBreakInfos[i].maxValue;
      info.label = classBreakInfos[i].label;
    });
  }

  const includesReferenceSize = authoringInfo?.visualVariables?.some(
    (vv) => vv.type === "size" && vv.theme === "reference-size"
  );

  if (includesReferenceSize) {
    renderer = (await regenerateReferenceSizeRenderer(
      params
    )) as __esri.ClassBreaksRenderer;
  }

  const newVisualVariables = await regenerateVisualVariables(params);
  renderer.visualVariables = newVisualVariables;
  return renderer;
}

async function regenerateUniqueValueRenderer(params: RegenerateRendererParams) {
  const { layer, view, forBinning } = params;
  const featureReduction =
    layer.featureReduction as __esri.FeatureReductionBinning;

  let renderer = forBinning
    ? (featureReduction.renderer as __esri.UniqueValueRenderer).clone()
    : (layer.renderer as __esri.UniqueValueRenderer).clone();

  const { authoringInfo } = renderer;

  const styleType = authoringInfo?.type;

  if (styleType === "relationship") {
    const { field1, field2, focus, numClasses } = authoringInfo;
    const response = await createRelationshipRenderer({
      layer,
      view,
      field1,
      field2,
      focus,
      numClasses,
      forBinning,
    });
    renderer.valueExpression = response.renderer.valueExpression;
  }

  const includesReferenceSize = authoringInfo?.visualVariables?.some(
    (vv) => vv.type === "size" && vv.theme === "reference-size"
  );

  if (includesReferenceSize) {
    renderer = (await regenerateReferenceSizeRenderer(
      params
    )) as __esri.UniqueValueRenderer;
  }

  const newVisualVariables = await regenerateVisualVariables(params);
  renderer.visualVariables = newVisualVariables;

  return renderer;
}

async function regenerateDotDensityRenderer(params: RegenerateRendererParams) {
  const { layer, view, forBinning } = params;
  const featureReduction =
    layer.featureReduction as __esri.FeatureReductionBinning;

  const renderer = forBinning
    ? (featureReduction.renderer as __esri.DotDensityRenderer).clone()
    : (layer.renderer as __esri.DotDensityRenderer).clone();

  const response = await createDotDensityRenderer({
    layer,
    view,
    attributes: renderer.attributes,
    dotValueOptimizationEnabled: Boolean(renderer.referenceScale),
    forBinning,
  });

  const newVisualVariables = await regenerateVisualVariables(params);
  renderer.visualVariables = newVisualVariables;

  renderer.referenceScale = response.renderer.referenceScale;
  renderer.dotValue = response.renderer.dotValue;

  return renderer;
}

async function regeneratePieChartRenderer(params: RegenerateRendererParams) {
  const { layer, forBinning } = params;
  const featureReduction =
    layer.featureReduction as __esri.FeatureReductionBinning;

  const renderer = forBinning
    ? (featureReduction.renderer as __esri.PieChartRenderer).clone()
    : (layer.renderer as __esri.PieChartRenderer).clone();

  const newVisualVariables = await regenerateVisualVariables(params);
  renderer.visualVariables = newVisualVariables as __esri.SizeVariable[];

  return renderer;
}

async function regenerateHeatmapRenderer(params: RegenerateRendererParams) {
  const { layer, view } = params;
  const oldRenderer = layer.renderer as __esri.HeatmapRenderer;
  const {
    field,
    authoringInfo: { fadeRatio },
  } = oldRenderer;

  const { renderer } = await createHeatmapRenderer({
    layer,
    view,
    field,
    fadeRatio,
  });

  renderer.colorStops.forEach((stop, i) => {
    stop.color = oldRenderer.colorStops[i].color;
  });

  return renderer;
}

async function regenerateSimpleRenderer(params: RegenerateRendererParams) {
  const { layer, forBinning } = params;
  const featureReduction =
    layer.featureReduction as __esri.FeatureReductionBinning;

  const renderer = forBinning ? featureReduction.renderer : layer.renderer;
  return renderer;
}

function processParams(params: RegenerateRendererParams) {
  const { layer, view, forBinning } = params;

  if (!layer || !view) {
    throw new Error("Layer and view are required");
  }

  const featureReduction =
    layer.featureReduction as __esri.FeatureReductionBinning;

  if (forBinning && !featureReduction) {
    throw new Error("Feature reduction is required when forBinning is true");
  }
}

const rendererTypeMap = {
  simple: regenerateSimpleRenderer,
  "class-breaks": regenerateClassBreaksRenderer,
  "unique-value": regenerateUniqueValueRenderer,
  "dot-density": regenerateDotDensityRenderer,
  "pie-chart": regeneratePieChartRenderer,
  heatmap: regenerateHeatmapRenderer,
};

type RendererTypes = keyof typeof rendererTypeMap;

interface RegenerateRendererParams {
  layer: __esri.FeatureLayer;
  view: __esri.MapView;
  forBinning?: boolean;
  filter?: __esri.FeatureFilter;
}

export async function regenerateRenderer(params: RegenerateRendererParams) {
  processParams(params);

  const { layer, forBinning } = params;
  const featureReduction =
    layer.featureReduction as __esri.FeatureReductionBinning;

  const { type: rendererType } = forBinning
    ? (featureReduction.renderer as __esri.Renderer)
    : layer.renderer;

  if (rendererType in rendererTypeMap) {
    return await rendererTypeMap[rendererType as RendererTypes](params);
  }
  console.log("Renderer type not supported");
}

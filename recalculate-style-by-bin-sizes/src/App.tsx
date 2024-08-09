import { useEffect, useState } from "react";
import "./App.css";
import "@arcgis/map-components/dist/components/arcgis-map";
import "@arcgis/map-components/dist/components/arcgis-legend";
import { ArcgisLegend, ArcgisMap } from "@arcgis/map-components-react";
import { defaultItemId, getUrlParams } from "./loadData";
import esriConfig from "@arcgis/core/config";
import React, { useRef } from "react";
import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-slider";
import "@esri/calcite-components/dist/components/calcite-switch";
import {
  CalciteLabel,
  CalciteSlider,
  CalciteSwitch,
} from "@esri/calcite-components-react";
import { regenerateRenderer } from "./rendererUtils";

function App() {
  const mapRef = useRef<HTMLArcgisMapElement | null>(null);
  const [webmapId, setWebmapId] = useState<string | undefined>(defaultItemId);
  const [fixedBinLevel, setFixedBinLevel] = useState<number>(5);
  const [layer, setLayer] = useState<__esri.FeatureLayer>(null!);
  const [regenerateEnabled, setRegenerateEnabled] = useState<boolean>(false);

  const initialize = async () => {
    const mapElement = mapRef.current;
    if (!mapElement) return;

    const { id, portal, layerIndex } = getUrlParams();
    esriConfig.portalUrl = portal!;
    setWebmapId(id);

    const selectedLayer = (
      mapElement.map.layers.getItemAt(0) as __esri.GroupLayer
    ).layers.getItemAt(layerIndex);
    (mapElement.map.layers.getItemAt(0) as __esri.GroupLayer).layers.forEach(
      (l, i) => (l.visible = i === layerIndex)
    );
    setLayer(selectedLayer as __esri.FeatureLayer);
  };

  useEffect(() => {
    console.log(fixedBinLevel);
    if (!layer || !fixedBinLevel) {
      return;
    }

    const featureReduction = (
      layer.featureReduction as __esri.FeatureReductionBinning
    ).clone();
    featureReduction.fixedBinLevel = fixedBinLevel;
    layer.featureReduction = featureReduction;

    if (regenerateEnabled) {
      regenerateRenderer({ layer, view: mapRef.current!.view });
    }

  }, [fixedBinLevel, layer, regenerateEnabled]);

  return (
    <>
      <div className="controls">
        <h2>Binning regenerate style test</h2>
        <div className="switch-content">
          <CalciteLabel layout="inline" alignment="start">
            Regenerate renderer
            <CalciteSwitch
              checked={regenerateEnabled}
              onCalciteSwitchChange={(e) => {
                setRegenerateEnabled(e.target.checked);
              }}
            />
          </CalciteLabel>
        </div>
        <div className="slider-content">
          <CalciteLabel layout="default">
            Fixed Bin Level
            <CalciteSlider
              labelHandles={true}
              min={1}
              max={9}
              step={1}
              value={fixedBinLevel}
              onCalciteSliderChange={(e) => {
                setFixedBinLevel(e.target.value as number);
              }}
            ></CalciteSlider>
          </CalciteLabel>
        </div>
      </div>
      <ArcgisMap
        ref={mapRef}
        itemId={webmapId}
        onArcgisViewReadyChange={initialize}
      >
        <ArcgisLegend position="bottom-left" />
      </ArcgisMap>
    </>
  );
}

export default App;

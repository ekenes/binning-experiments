import { setAssetPath } from "@esri/calcite-components/dist/components";
// CDN hosted assets
setAssetPath("https://js.arcgis.com/calcite-components/2.11.1/assets");

import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import "@arcgis/map-components/dist/components/arcgis-map";
import "@arcgis/map-components/dist/components/arcgis-layer-list";
import "@arcgis/map-components/dist/components/arcgis-legend";
import {
  ArcgisLayerList,
  ArcgisLegend,
  ArcgisMap,
} from "@arcgis/map-components-react";
import { defaultItemId, getUrlParams } from "./loadData";
import esriConfig from "@arcgis/core/config";
import "@esri/calcite-components/dist/components/calcite-label";
import "@esri/calcite-components/dist/components/calcite-slider";
import "@esri/calcite-components/dist/components/calcite-switch";
import "@esri/calcite-components/dist/components/calcite-action";
import "@esri/calcite-components/dist/components/calcite-action-bar";
import "@esri/calcite-components/dist/components/calcite-panel";
import "@esri/calcite-components/dist/components/calcite-shell";
import "@esri/calcite-components/dist/components/calcite-shell-panel";
import "@esri/calcite-components/dist/components/calcite-loader";

import {
  CalciteAction,
  CalciteActionBar,
  CalciteLabel,
  CalciteLoader,
  CalcitePanel,
  CalciteShell,
  CalciteShellPanel,
  CalciteSlider,
  CalciteSwitch,
} from "@esri/calcite-components-react";
import { regenerateRenderer } from "./rendererUtils";

import { when } from "@arcgis/core/core/reactiveUtils";

function App() {
  const mapRef = useRef<HTMLArcgisMapElement | null>(null);
  const layerListRef = useRef<HTMLArcgisLayerListElement | null>(null);
  const [webmapId, setWebmapId] = useState<string | undefined>(defaultItemId);
  const [fixedBinLevel, setFixedBinLevel] = useState<number>(5);
  const [layer, setLayer] = useState<__esri.FeatureLayer>(null!);
  const [regenerateEnabled, setRegenerateEnabled] = useState<boolean>(false);

  const initialize = async () => {
    const mapElement = mapRef.current;
    if (!mapElement) return;

    const { id, portal } = getUrlParams();
    esriConfig.portalUrl = portal!;
    setWebmapId(id);

    const view = mapElement?.view;
    view!.padding = {
      left: 49,
    };
    const webmap = view?.map as __esri.WebMap;

    const { title } = webmap.portalItem;
    document.querySelector("#header-title")!.textContent = title;

    let activeWidget;

    const handleActionBarClick = (event) => {
      const { target } = event;
      if (target.tagName !== "CALCITE-ACTION") {
        return;
      }

      if (activeWidget) {
        (document.querySelector(
          `[data-action-id=${activeWidget}]`
        ) as HTMLCalciteActionElement)!.active = false;
        (document.querySelector(
          `[data-panel-id=${activeWidget}]`
        ) as HTMLCalcitePanelElement)!.hidden = true;
      }

      const nextWidget = target.dataset.actionId;
      if (nextWidget !== activeWidget) {
        (document.querySelector(
          `[data-action-id=${nextWidget}]`
        ) as HTMLCalciteActionElement)!.active = true;
        (document.querySelector(
          `[data-panel-id=${nextWidget}]`
        ) as HTMLCalcitePanelElement)!.hidden = false;
        activeWidget = nextWidget;
      } else {
        activeWidget = null;
      }
    };

    const actionBar = document.querySelector("calcite-action-bar")!;

    actionBar.addEventListener("click", handleActionBarClick);

    let actionBarExpanded = false;
    actionBar.addEventListener("onCalciteActionBarToggle", () => {
      actionBarExpanded = !actionBarExpanded;
      view!.padding = {
        left: actionBarExpanded ? 135 : 49,
      };
    });

    (
      document.querySelector("calcite-shell") as HTMLCalciteShellElement
    ).hidden = false;
    (
      document.querySelector("calcite-loader") as HTMLCalciteLoaderElement
    ).hidden = true;
  };

  const listItemCreatedFunction = (event) => {
    const { item } = event;
    const l = item.layer;

    if (
      l.type !== "feature" ||
      l === layer ||
      l?.featureReduction?.type !== "binning"
    ) {
      return;
    }

    if(!layer && l.visible) {
      setLayer(l as __esri.FeatureLayer);
    }

    when(
      () => l.visible,
      () => {
        setLayer(l as __esri.FeatureLayer);
      }
    );
  };

  useEffect(() => {
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
      <CalciteLoader label="Loading"></CalciteLoader>
      <CalciteShell contentBehind={true}>
        <h2 id="header-title" slot="header">
          Feature Reduction Binning
        </h2>
        <CalciteShellPanel slot="panel-start" displayMode="float">
          <CalciteActionBar slot="action-bar">
            <CalciteAction
              data-action-id="layers"
              icon="layers"
              text="Layers"
            />
            <CalciteAction
              data-action-id="controls"
              icon="sliders-horizontal"
              text="Controls"
            />
          </CalciteActionBar>
          <CalcitePanel
            heading="Layers"
            height-scale="l"
            data-panel-id="layers"
            hidden
          >
            <ArcgisLayerList
              referenceElement="#map"
              ref={layerListRef}
              listItemCreatedFunction={listItemCreatedFunction}
            ></ArcgisLayerList>
          </CalcitePanel>
          <CalcitePanel
            heading="Controls"
            height-scale="l"
            data-panel-id="controls"
            hidden
          >
            <div className="controls">
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
                    ticks={9}
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
          </CalcitePanel>
        </CalciteShellPanel>
        <div className="map-only" id="map-container">
          <ArcgisMap
            id="map"
            class="map-only"
            ref={mapRef}
            itemId={webmapId}
            onArcgisViewReadyChange={initialize}
          >
            <ArcgisLegend position="bottom-right" />
          </ArcgisMap>
        </div>
      </CalciteShell>
    </>
  );
}

export default App;

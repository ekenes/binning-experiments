import { useEffect, useState } from 'react'
import './App.css'
import "@arcgis/map-components/dist/components/arcgis-map";
import "@arcgis/map-components/dist/components/arcgis-expand";
import "@arcgis/map-components/dist/components/arcgis-legend";
import { ArcgisExpand, ArcgisLegend, ArcgisMap } from '@arcgis/map-components-react'
import { defaultItemId, getUrlParams } from './loadData';
import esriConfig from "@arcgis/core/config";
import React, { useRef } from 'react';
import "@esri/calcite-components/dist/components/calcite-slider";
import { CalciteSlider } from '@esri/calcite-components-react';

function App() {
  const mapRef = useRef<HTMLArcgisMapElement | null>(null);
  const [webmapId, setWebmapId] = useState<string|undefined>(defaultItemId);
  const [fixedBinLevel, setFixedBinLevel] = useState<number>(3);
  const [layerId, setLayerId] = useState<number>(0);

  const initialize = async () => {
    const { id, portal, layerIndex } = getUrlParams();
    esriConfig.portalUrl = portal!;
    setWebmapId(id);
  };

  useEffect(() => {
    console.log(fixedBinLevel);
  }, [fixedBinLevel]);

  return (
    <>
      <ArcgisMap ref={mapRef} itemId={webmapId} onArcgisViewReadyChange={initialize}>
        <ArcgisExpand position='top-right' expanded={true}>
          <div className='slider-content'>
            <CalciteSlider
              min={1}
              max={9}
              step={1}
              value={fixedBinLevel}
              onCalciteSliderChange={(e: any) => {
                setFixedBinLevel(e.target.value);
              }}
            ></CalciteSlider>
          </div>
        </ArcgisExpand>
        <ArcgisLegend position='bottom-left' />
      </ArcgisMap>
    </>
  )
}

export default App

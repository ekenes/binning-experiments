export interface UrlParams {
  layerIndex: number;
  id: string;
  portal: string;
}

export const defaultItemId = "08c2bea3b9f444918157b722296682f0";

// function to set an id as a url param
function setUrlParams(id: string, layerId: string | number, portal: string) {
  window.history.pushState(
    "",
    "",
    `${window.location.pathname}?id=${id}&layerId=${layerId}&portal=${portal}`
  );
}

export function getUrlParams(): UrlParams {
  const queryParams = document.location.search.substring(1);
  const result: { id?: string, portal?: string, layerId?: string} = {};

  queryParams.split("&").forEach(function (part) {
    const item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });

  let { id, portal } = result;
  const { layerId } = result;

  let layerIndex = parseInt(layerId!);

  if (!id) {
    id = defaultItemId;
  }

  if (!layerId) {
    layerIndex = 0;
  }

  if (!portal) {
    portal = "https://www.arcgis.com/";
  }

  setUrlParams(id, layerIndex, portal);

  return { layerIndex, id, portal };
}
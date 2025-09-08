import { FC, PropsWithChildren, ReactNode } from "react";
import { CanvasProps } from 'react-three-map';
// import { StoryMapbox } from './mapbox/story-mapbox';
import { StoryMaplibre } from './story-maplibre';

export enum MapProvider {
  maplibre = "maplibre",
}

export interface StoryMapProps extends PropsWithChildren {
  latitude: number,
  longitude: number,
  zoom?: number,
  pitch?: number,
  bearing?: number,
  canvas?: Partial<CanvasProps>,
  mapChildren?: ReactNode,
  mapboxChildren?: ReactNode,
  maplibreChildren?: ReactNode,
}

/** `<Map>` styled for stories */
export const StoryMap: FC<StoryMapProps> = (props) => {

  const canvas = { overlay: true, ...props.canvas };

  return <div className="h-screen relative">
    <StoryMaplibre {...props} canvas={canvas} />

  </div>
}
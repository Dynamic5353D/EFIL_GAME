import { HOSTEL_ROOM } from './hostel_room';
import { MIT_ROAD } from './mit_road';
import type { MapDef } from './types';

export const MAPS: Record<string, MapDef> = {
  [HOSTEL_ROOM.id]: HOSTEL_ROOM,
  [MIT_ROAD.id]: MIT_ROAD,
};

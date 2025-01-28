import { SwitchableFeature } from '../../bbtcommon/SwitchableFeatures';

export type Features = {
  [key in SwitchableFeature]?: boolean;
};

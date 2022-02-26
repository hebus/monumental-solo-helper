import CivilizationName from "./enum/CivilizationName";
import CivilizationType from "./enum/CivilizationType";
import Expansion from "./enum/Expansion";

export default interface Civilization {
  name: CivilizationName
  type: CivilizationType
  expansion?: Expansion
}

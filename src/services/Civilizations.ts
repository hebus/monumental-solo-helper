import Civilization from './Civilization'
import CivilizationName from './enum/CivilizationName';
import CivilizationType from './enum/CivilizationType';
import Expansion from './enum/Expansion'
import findMandatory from 'brdgm-commons/src/util/map/findMandatory'

const civilizations = [
  // core box
  { name: CivilizationName.CHINA, type: CivilizationType.TECHNOLOGICAL },
  { name: CivilizationName.DENMARK, type: CivilizationType.AGGRESSIVE },
  { name: CivilizationName.EGYPT, type: CivilizationType.ARCHITECTURAL },
  { name: CivilizationName.GREECE, type: CivilizationType.ECONOMIC },
  { name: CivilizationName.JAPAN, type: CivilizationType.CULTURAL },
  // lost kingdoms
  { name: CivilizationName.AMAZONS, type: CivilizationType.AGGRESSIVE, expansion: Expansion.LOST_KINGDOMS },
  { name: CivilizationName.ATLANTIS, type: CivilizationType.TECHNOLOGICAL, expansion: Expansion.LOST_KINGDOMS },
  { name: CivilizationName.AZTECS, type: CivilizationType.CULTURAL, expansion: Expansion.LOST_KINGDOMS },
  { name: CivilizationName.MUGHALS, type: CivilizationType.ECONOMIC, expansion: Expansion.LOST_KINGDOMS },
  // african empires
  // TODO: use correct civilization types
  { name: CivilizationName.AKSUM, type: CivilizationType.ECONOMIC, expansion: Expansion.AFRICAN_EMPIRES },
  { name: CivilizationName.MALI, type: CivilizationType.ECONOMIC, expansion: Expansion.AFRICAN_EMPIRES },
  { name: CivilizationName.ZULU, type: CivilizationType.ECONOMIC, expansion: Expansion.AFRICAN_EMPIRES },
]

const civilizationsMap = new Map<CivilizationName,Civilization>()
civilizations.forEach(civilization => civilizationsMap.set(civilization.name, civilization))

export default {

  /**
   * Get civilization by name
   * @param name Name
   * @returns Civilization
   */
  get(name: CivilizationName) : Civilization {
    return findMandatory(civilizationsMap, name)
  },

  /**
   * Get civilization by name
   * @param name Name
   * @returns Civilization or undefined
   */
   getOptional(name: CivilizationName) : Civilization | undefined {
    return civilizationsMap.get(name)
  },

  /**
   * Get all civilizations
   * @returns Civilizations
   */
  getAll() : Civilization[] {
    return civilizations
  },

  /**
   * Get civilizations for core box
   * @param expansion Expansion
   * @returns Civilizations
   */
  getForCoreBox() : Civilization[] {
    return civilizations.filter(civ => civ.expansion == undefined)
  },

  /**
   * Get civilizations for given expansion
   * @param expansion Expansion
   * @returns Civilizations
   */
  getForExpansion(expansion?: Expansion) : Civilization[] {
    return civilizations.filter(civ => civ.expansion == expansion)
  }

}

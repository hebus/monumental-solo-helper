import Civilizations from '@/services/Civilizations'
import CivilizationName from '@/services/enum/CivilizationName'
import Expansion from '@/services/enum/Expansion'
import { expect } from 'chai'

describe('Civilizations', () => {
  it('get', () => {
    const civ = Civilizations.get(CivilizationName.DENMARK)

    expect(civ?.name).eq(CivilizationName.DENMARK)
  })

  it('getOptional', () => {
    const civ = Civilizations.getOptional(CivilizationName.CHINA)

    expect(civ).not.undefined
    expect(civ?.name).eq(CivilizationName.CHINA)
  })

  it('getAll', () => {
    const civs = Civilizations.getAll()

    expect(civs.length).eq(12)
  })

  it('getExpansion.core', () => {
    const civs = Civilizations.getForCoreBox()

    expect(civs.length).eq(5)
  })

  it('getExpansion.lost-kingdoms', () => {
    const civs = Civilizations.getForExpansion(Expansion.LOST_KINGDOMS)

    expect(civs.length).eq(4)
  })

  it('getExpansion.african-empires', () => {
    const civs = Civilizations.getForExpansion(Expansion.AFRICAN_EMPIRES)

    expect(civs.length).eq(3)
  })  
})

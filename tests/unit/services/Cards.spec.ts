import Cards from '@/services/Cards'
import CardName from '@/services/enum/CardName'
import CivilizationName from '@/services/enum/CivilizationName'
import { expect } from 'chai'

describe('Cards', () => {
  it('get', () => {
    const card = Cards.get(CardName.ADVANCED_EXPLORERS_CONQUER)

    expect(card).not.undefined
    expect(card?.name).to.eq(CardName.ADVANCED_EXPLORERS_CONQUER)
  })

  it('getStandard', () => {
    const cards = Cards.getStandard()

    expect(cards.length).eq(15)
  })

  it('getAdvanced', () => {
    const cards = Cards.getAdvanced()

    expect(cards.length).eq(4)
  })

  it('getCivilization', () => {
    const card = Cards.getCivilization(CivilizationName.AMAZONS)

    expect(card).not.undefined
  })
})

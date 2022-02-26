import CivilizationName from '@/services/enum/CivilizationName'
import CardName from '@/services/enum/CardName'
import CardDeck from '@/services/CardDeck'
import { expect } from 'chai'
import Cards from '@/services/Cards'
import Card from '@/services/Card'

describe('CardDeck', () => {
  it('newShuffled', () => {
    const cardDeck = CardDeck.new(3, CivilizationName.GREECE)

    expect(cardDeck.drawPile.length).to.eq(19)
    expect(cardDeck.discardPile.length).to.eq(0)
    expect(cardDeck.openCards.length).to.eq(0)

    const persistence = cardDeck.toPersistence()
    expect(persistence.drawPile.length).to.eq(19)
    expect(persistence.discardPile.length).to.eq(0)
    expect(persistence.openCards.length).to.eq(0)
    expect(persistence.nexusCards.length).to.eq(0)

    expect(persistence.drawPile.includes(CardName.GREECE_CIVILIZATION)).to.true
  }),

  it('draw', () => {
    const cardDeck = CardDeck.fromPersistence({
      drawPile: [CardName.GOLD_IF_CULTURAL, CardName.WONDER_IF_ECONOMIC, CardName.CONQUER_IF_ARCHITECTURAL],
      discardPile: [],
      openCards: [],
      nexusCards: []
    })

    const card1 = cardDeck.draw()    
    expect(card1.name, 'card1').to.eq(CardName.GOLD_IF_CULTURAL)

    const card2 = cardDeck.draw()    
    expect(card2.name, 'card2').to.eq(CardName.WONDER_IF_ECONOMIC)

    const persistence = cardDeck.toPersistence()
    expect(persistence.drawPile, 'drawPile').to.eql([CardName.CONQUER_IF_ARCHITECTURAL])
    expect(persistence.discardPile, 'discardPile').to.eql([])
    expect(persistence.openCards, 'openCards').to.eql([CardName.GOLD_IF_CULTURAL, CardName.WONDER_IF_ECONOMIC])
    expect(persistence.nexusCards, 'nexusCards').to.eql([])
  }),

  it('discardAll', () => {
    const cardDeck = CardDeck.fromPersistence({
      drawPile: [CardName.CONQUER_IF_ARCHITECTURAL],
      discardPile: [],
      openCards: [CardName.GOLD_IF_CULTURAL, CardName.WONDER_IF_ECONOMIC],
      nexusCards: []
    })

    cardDeck.discardAll()

    const persistence = cardDeck.toPersistence()
    expect(persistence.drawPile, 'drawPile').to.eql([CardName.CONQUER_IF_ARCHITECTURAL])
    expect(persistence.discardPile, 'discardPile').to.eql([CardName.GOLD_IF_CULTURAL, CardName.WONDER_IF_ECONOMIC])
    expect(persistence.openCards, 'openCards').to.eql([])
    expect(persistence.nexusCards, 'nexusCards').to.eql([])
  }),

  it('discardCard', () => {
    const cardDeck = CardDeck.fromPersistence({
      drawPile: [CardName.GOLD_IF_CULTURAL, CardName.WONDER_IF_ECONOMIC, CardName.CONQUER_IF_ARCHITECTURAL],
      discardPile: [],
      openCards: [],
      nexusCards: []
    })

    cardDeck.draw()
    const card2 = cardDeck.draw()
    cardDeck.draw()

    cardDeck.discardCard(card2)

    const persistence = cardDeck.toPersistence()
    expect(persistence.drawPile, 'drawPile').to.eql([])
    expect(persistence.discardPile, 'discardPile').to.eql([CardName.WONDER_IF_ECONOMIC])
    expect(persistence.openCards, 'openCards').to.eql([CardName.GOLD_IF_CULTURAL, CardName.CONQUER_IF_ARCHITECTURAL])
    expect(persistence.nexusCards, 'nexusCards').to.eql([])
  }),

  it('shuffleDiscardDrawPile', () => {
    const cardDeck = CardDeck.fromPersistence({
      drawPile: [CardName.GOLD_IF_CULTURAL],
      discardPile: [CardName.WONDER_IF_ECONOMIC, CardName.CONQUER_IF_ARCHITECTURAL],
      openCards: [],
      nexusCards: []
    })

    cardDeck.shuffleDiscardDrawPile()

    const persistence = cardDeck.toPersistence()
    expect(persistence.drawPile.length, 'drawPile').to.eq(3)
    expect(persistence.discardPile.length, 'discardPile').to.eq(0)
    expect(persistence.openCards.length, 'openCards').to.eq(0)
    expect(persistence.drawPile.includes(CardName.CONQUER_IF_ARCHITECTURAL), 'drawPile.card1').to.true
    expect(persistence.drawPile.includes(CardName.GOLD_IF_CULTURAL), 'drawPile.card2').to.true
    expect(persistence.drawPile.includes(CardName.WONDER_IF_ECONOMIC), 'drawPile.card3').to.true
  }),

  it('removeCard', () => {
    const cardDeck = CardDeck.fromPersistence({
      drawPile: [CardName.GOLD_IF_CULTURAL],
      discardPile: [CardName.WONDER_IF_ECONOMIC, CardName.CONQUER_IF_ARCHITECTURAL],
      openCards: [CardName.KNOWLEDGE_IF_ARCHITECTURAL,CardName.EXPLORERS_IF_CULTURAL],
      nexusCards: []
    })

    cardDeck.removeCard(Cards.get(CardName.GOLD_IF_CULTURAL) as Card)
    cardDeck.removeCard(Cards.get(CardName.WONDER_IF_ECONOMIC) as Card)
    cardDeck.removeCard(Cards.get(CardName.EXPLORERS_IF_CULTURAL) as Card)

    const persistence = cardDeck.toPersistence()
    expect(persistence.drawPile, 'drawPile').to.eql([])
    expect(persistence.discardPile, 'discardPile').to.eql([CardName.CONQUER_IF_ARCHITECTURAL])
    expect(persistence.openCards, 'openCards').to.eql([CardName.KNOWLEDGE_IF_ARCHITECTURAL])
    expect(persistence.nexusCards, 'nexusCards').to.eql([])
  }),

  it('moveToNexus', () => {
    const cardDeck = CardDeck.fromPersistence({
      drawPile: [CardName.GOLD_IF_CULTURAL, CardName.WONDER_IF_ECONOMIC, CardName.CONQUER_IF_ARCHITECTURAL],
      discardPile: [],
      openCards: [],
      nexusCards: []
    })

    cardDeck.draw()
    const card2 = cardDeck.draw()
    cardDeck.draw()

    cardDeck.moveToNexus(card2)

    const persistence = cardDeck.toPersistence()
    expect(persistence.drawPile, 'drawPile').to.eql([])
    expect(persistence.discardPile, 'discardPile').to.eql([])
    expect(persistence.openCards, 'openCards').to.eql([CardName.GOLD_IF_CULTURAL, CardName.CONQUER_IF_ARCHITECTURAL])
    expect(persistence.nexusCards, 'nexusCards').to.eql([CardName.WONDER_IF_ECONOMIC])
  })

})

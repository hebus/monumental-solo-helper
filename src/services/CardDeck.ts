import * as _ from "lodash"
import Card from "./Card"
import Cards from "./Cards"
import CivilizationName from "./enum/CivilizationName"
import { CardDeckPersistence } from "@/store"
import toCardNames from "@/util/toCardNames"
import toCards from "@/util/toCards"

export default class CardDeck {

  private _drawPile : Card[]
  private _discardPile : Card[] = []
  private _openCards: Card[]
  private _nexusCards: Card[]

  private constructor(drawPile : Card[], discardPile : Card[], openCards: Card[], nexusCards: Card[]) {
    this._drawPile = drawPile
    this._discardPile = discardPile
    this._openCards = openCards
    this._nexusCards = nexusCards
  }

  public get drawPile() : readonly Card[] {
    return this._drawPile
  }

  public get discardPile() : readonly Card[] {
    return this._discardPile
  }

  public get openCards() : readonly Card[] {
    return this._openCards
  }

  public get nexusCards() : readonly Card[] {
    return this._nexusCards
  }

  /**
   * Gets persistence view of card deck.
   */
  public toPersistence() : CardDeckPersistence {
    return {
      drawPile: toCardNames(this._drawPile),
      discardPile: toCardNames(this._discardPile),
      openCards: toCardNames(this._openCards),
      nexusCards: toCardNames(this._nexusCards)
    }
  }

  /**
   * Shuffles discard and remaining draw pile into a new draw pile.
   */
  public shuffleDiscardDrawPile() : void {
    this._drawPile.push(...this._discardPile)
    this._discardPile = []
    this._drawPile = _.shuffle(this._drawPile)
  }

  /**
   * Draw a card and add it to open cards
   * @returns Drawn card
   */
  public draw() : Card {
    // shuffle draw pile if empty (should normally never happen)
    if (this._drawPile.length == 0) {
      this.shuffleDiscardDrawPile();
      if (this._drawPile.length == 0) {
        throw new Error('Discard and draw pile is empty.')
      }
    }

    // take 1st card from draw pile and add to open cards
    const card = this._drawPile.shift() as Card
    this._openCards.push(card)

    return card
  }

  /**
   * Discard all open cards to discard pile.
   */
  public discardAll() : void {
    this._discardPile.push(...this._openCards)
    this._openCards = []
  }

  /**
   * Discards the given card
   * @param card Card
   */
  public discardCard(card: Card) : void {
    this._discardPile.push(card)
    _.remove(this._openCards, c => c.name == card.name)
  }

  /**
   * Move the given card to Nexus
   * @param card Card
   */
  public moveToNexus(card: Card) : void {
    this._nexusCards.push(card)
    _.remove(this._openCards, c => c.name == card.name)
  }

  /**
   * Removes a card from the game.
   * @param card Card
   */
  public removeCard(card: Card) : void {
    _.remove(this._drawPile, c => c.name == card.name)
    _.remove(this._discardPile, c => c.name == card.name)
    _.remove(this._openCards, c => c.name == card.name)
  }

  /**
   * Creates a shuffled new card deck with random advanced cards.
   */
  public static new(numAdvancedCards: number, civilizationName: CivilizationName) : CardDeck {
    // prepare draw pile
    const drawPile : Card[] = []
    drawPile.push(...Cards.getStandard())
    drawPile.push(...CardDeck.pickRandomAdvancedCards(numAdvancedCards))
    drawPile.push(Cards.getCivilization(civilizationName))
    const cardDeck = new CardDeck(drawPile, [], [], [])
    cardDeck.shuffleDiscardDrawPile()
    return cardDeck
  }

  /**
   * Re-creates a card date from persistence.
   */
  public static fromPersistence(persistence : CardDeckPersistence) : CardDeck {
    return new CardDeck(
      toCards(persistence.drawPile),
      toCards(persistence.discardPile),
      toCards(persistence.openCards),
      toCards(persistence.nexusCards)
    )
  }

  /**
   * Randomly picks the given number of advanced cards.
   */
  private static pickRandomAdvancedCards(numAdvancedCards: number) : Card[] {
    const advancedCards : Card[] = []

    if (numAdvancedCards > 0) {
      const allAdvancedCards = Cards.getAdvanced()
      if (numAdvancedCards >= allAdvancedCards.length) {
        advancedCards.push(...allAdvancedCards)
      }
      else {
        while (advancedCards.length < numAdvancedCards) {
          const randomIndex = _.random(allAdvancedCards.length - 1)
          const advancedCard = allAdvancedCards[randomIndex]
          if (!advancedCards.includes(advancedCard)) {
            advancedCards.push(advancedCard)
          }
        }
      }
    }

    return advancedCards
  }

}

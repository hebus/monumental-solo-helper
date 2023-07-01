import Card from '@/services/Card';
import CardName from '@/services/enum/CardName';

/**
 * Converts list of card instances to card names.
 */
export default function(cards : Card[]) : CardName[] {
  return cards.map(card => card.name)
}

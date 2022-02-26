import Card from "@/services/Card";
import Cards from "@/services/Cards";
import CardName from "@/services/enum/CardName";

/**
 * Converts list of card names to card instances.
 */
export default function(cardNames : CardName[]) : Card[] {
  return cardNames.map(Cards.get)
}

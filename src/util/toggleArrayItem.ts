/**
 * Adds an item to an array if it does not exist. Otherwise removes it.
 * @param array Array
 * @param item Item
 */
export default function<T>(array : T[], item : T) : void {
  const index = array.indexOf(item)
  if (index >= 0) {
    array.splice(index, 1)
  }
  else {
    array.push(item)
  }
}

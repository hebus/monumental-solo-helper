import { expect } from 'chai'
import Expansion from '@/services/enum/Expansion'
import toggleArrayItem from '@/util/toggleArrayItem'

describe('toggleArrayItem', () => {
  it('toggleExist', () => {
    const array = [Expansion.LOST_KINGDOMS,Expansion.AFRICAN_EMPIRES]
    toggleArrayItem(array, Expansion.LOST_KINGDOMS)

    expect(array).to.eql([Expansion.AFRICAN_EMPIRES])
  }),

  it('toggleNotExist', () => {
    const array : Expansion[] = []
    toggleArrayItem(array, Expansion.LOST_KINGDOMS)

    expect(array).to.eql([Expansion.LOST_KINGDOMS])
  })
})

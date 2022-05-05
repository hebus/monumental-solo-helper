import { expect } from 'chai'
import randomEnum from '@/util/randomEnum'
import DifficultyLevel from '@/services/enum/DifficultyLevel'
import CivilizationType from '@/services/enum/CivilizationType'

describe('randomEnum', () => {
  it('int enum', () => {
    const value = randomEnum(DifficultyLevel)

    expect(value).not.undefined
  })

  it('string enum', () => {
    const value = randomEnum(CivilizationType)

    expect(value).not.undefined
  })
})

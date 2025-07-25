import { describe, expect, it } from 'vitest'
import { AMPERE_VALUES, CAPACITY_UNITS } from '~/features/simulation/constants/company-codes'
import { KVA_RANGE_LENGTH, KVA_START_VALUE } from '~/features/simulation/constants/validation'
import type { CapacityOption } from '~/features/simulation/types/simulation'
import {
  createCapacityOptions,
  createKVACapacityOptions,
} from '~/features/simulation/utils/capacity-generator'

describe('capacity-generator', () => {
  describe('createCapacityOptions', () => {
    it('AMPERE_VALUES使用時に数値valueとラベルを正しく生成する', () => {
      const result = createCapacityOptions(AMPERE_VALUES, CAPACITY_UNITS.AMPERE)
      
      expect(result).toHaveLength(AMPERE_VALUES.length)
      expect(result[0]).toEqual({
        value: 10,
        label: '10A',
        unit: 'A',
      } as CapacityOption)
      expect(result[6]).toEqual({
        value: 60,
        label: '60A', 
        unit: 'A',
      } as CapacityOption)
    })

    it('kVA単位の値で正しいオプションを生成する', () => {
      const testValues = [6, 10, 15] as const
      const result = createCapacityOptions(testValues, CAPACITY_UNITS.KVA)
      
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        value: 6,
        label: '6kVA',
        unit: 'kVA',
      } as CapacityOption)
      expect(result[2]).toEqual({
        value: 15,
        label: '15kVA',
        unit: 'kVA',
      } as CapacityOption)
    })

    it('空配列を渡した場合は空配列を返す', () => {
      const result = createCapacityOptions([], CAPACITY_UNITS.AMPERE)
      expect(result).toEqual([])
    })

    it('すべての値が数値型であることを確認', () => {
      const result = createCapacityOptions(AMPERE_VALUES, CAPACITY_UNITS.AMPERE)
      
      result.forEach((option) => {
        expect(typeof option.value).toBe('number')
        expect(typeof option.label).toBe('string')
        expect(typeof option.unit).toBe('string')
      })
    })
  })

  describe('createKVACapacityOptions', () => {
    it('デフォルト値でkVAオプションを生成する', () => {
      const result = createKVACapacityOptions()
      
      expect(result).toHaveLength(KVA_RANGE_LENGTH)
      expect(result[0]).toEqual({
        value: KVA_START_VALUE,
        label: `${KVA_START_VALUE}kVA`,
        unit: 'kVA',
      } as CapacityOption)
    })

    it('カスタム開始値と長さでオプションを生成する', () => {
      const customStart = 10
      const customLength = 5
      const result = createKVACapacityOptions(customStart, customLength)
      
      expect(result).toHaveLength(customLength)
      expect(result[0]).toEqual({
        value: 10,
        label: '10kVA',
        unit: 'kVA',
      } as CapacityOption)
      expect(result[4]).toEqual({
        value: 14,
        label: '14kVA',
        unit: 'kVA',
      } as CapacityOption)
    })

    it('カスタム単位でオプションを生成する', () => {
      const result = createKVACapacityOptions(KVA_START_VALUE, 3, CAPACITY_UNITS.AMPERE)
      
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({
        value: KVA_START_VALUE,
        label: `${KVA_START_VALUE}A`,
        unit: 'A',
      } as CapacityOption)
    })

    it('連続する数値を正しく生成する', () => {
      const result = createKVACapacityOptions(1, 5)
      
      expect(result.map(option => option.value)).toEqual([1, 2, 3, 4, 5])
      expect(result.map(option => option.label)).toEqual(['1kVA', '2kVA', '3kVA', '4kVA', '5kVA'])
    })

    it('長さが0の場合は空配列を返す', () => {
      const result = createKVACapacityOptions(1, 0)
      expect(result).toEqual([])
    })

    it('すべての値が数値型でCapacityOption型に準拠する', () => {
      const result = createKVACapacityOptions()
      
      result.forEach((option) => {
        expect(typeof option.value).toBe('number')
        expect(typeof option.label).toBe('string')
        expect(['A', 'kVA']).toContain(option.unit)
      })
    })
  })

  describe('型安全性テスト', () => {
    it('createCapacityOptionsの戻り値型がCapacityOption[]である', () => {
      const result = createCapacityOptions(AMPERE_VALUES, CAPACITY_UNITS.AMPERE)
      
      // TypeScriptコンパイル時の型チェック用
      const _typeCheck: CapacityOption[] = result
      expect(_typeCheck).toBeDefined()
    })

    it('createKVACapacityOptionsの戻り値型がCapacityOption[]である', () => {
      const result = createKVACapacityOptions()
      
      // TypeScriptコンパイル時の型チェック用  
      const _typeCheck: CapacityOption[] = result
      expect(_typeCheck).toBeDefined()
    })
  })
})
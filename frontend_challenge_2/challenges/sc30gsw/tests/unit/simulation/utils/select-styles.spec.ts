import { describe, expect, it } from 'vitest'
import { createSelectStyles } from '~/features/simulation/utils/select-styles'

describe('select-styles', () => {
  describe('createSelectStyles', () => {
    it('デフォルト状態では通常のスタイルを適用', () => {
      const styles = createSelectStyles({})
      
      expect(styles.control).toBeDefined()
      expect(styles.valueContainer).toBeDefined()
      expect(styles.singleValue).toBeDefined()
      expect(styles.placeholder).toBeDefined()
      expect(styles.indicatorSeparator).toBeDefined()
      expect(styles.dropdownIndicator).toBeDefined()
      expect(styles.menu).toBeDefined()
      expect(styles.option).toBeDefined()
    })

    it('エラー状態の場合、エラー用のスタイルを適用', () => {
      const styles = createSelectStyles({ error: 'エラーメッセージ' })
      const mockProvided = {
        border: '1px solid gray',
        backgroundColor: 'white',
        borderRadius: '4px',
      }
      
      const controlStyles = styles.control?.(mockProvided, {} as any)
      
      expect(controlStyles).toEqual(
        expect.objectContaining({
          border: '1px solid rgb(252 165 165)',
          backgroundColor: 'rgb(254 242 242)',
        })
      )
    })

    it('無効状態の場合、無効用のスタイルを適用', () => {
      const styles = createSelectStyles({ disabled: true })
      const mockProvided = {
        border: '1px solid gray',
        backgroundColor: 'white',
        borderRadius: '4px',
      }
      
      const controlStyles = styles.control?.(mockProvided, {} as any)
      
      expect(controlStyles).toEqual(
        expect.objectContaining({
          border: '1px solid rgb(209 213 219)',
          backgroundColor: 'rgb(249 250 251)',
        })
      )
    })

    it('説明付きの場合、適切なborderRadiusを適用', () => {
      const styles = createSelectStyles({ hasDescription: true })
      const mockProvided = {
        border: '1px solid gray',
        backgroundColor: 'white',
        borderRadius: '4px',
      }
      
      const controlStyles = styles.control?.(mockProvided, {} as any)
      
      expect(controlStyles).toEqual(
        expect.objectContaining({
          borderRadius: '6px 6px 0 0',
          borderBottom: 'none',
        })
      )
    })

    it('説明なしの場合、通常のborderRadiusを適用', () => {
      const styles = createSelectStyles({ hasDescription: false })
      const mockProvided = {
        border: '1px solid gray',
        backgroundColor: 'white',
        borderRadius: '4px',
      }
      
      const controlStyles = styles.control?.(mockProvided, {} as any)
      
      expect(controlStyles).toEqual(
        expect.objectContaining({
          borderRadius: '6px',
          borderBottom: undefined,
        })
      )
    })

    it('valueContainerのpaddingを0に設定', () => {
      const styles = createSelectStyles({})
      const mockProvided = { padding: '8px' }
      
      const valueContainerStyles = styles.valueContainer?.(mockProvided, {} as any)
      
      expect(valueContainerStyles).toEqual(
        expect.objectContaining({
          padding: '0',
        })
      )
    })

    it('singleValueの色を状態に応じて設定', () => {
      const enabledStyles = createSelectStyles({ disabled: false })
      const disabledStyles = createSelectStyles({ disabled: true })
      const mockProvided = { color: 'black', margin: '4px' }
      
      const enabledSingleValue = enabledStyles.singleValue?.(mockProvided, {} as any)
      const disabledSingleValue = disabledStyles.singleValue?.(mockProvided, {} as any)
      
      expect(enabledSingleValue).toEqual(
        expect.objectContaining({
          color: 'rgb(17 24 39)',
          margin: '0',
        })
      )
      
      expect(disabledSingleValue).toEqual(
        expect.objectContaining({
          color: 'rgb(156 163 175)',
          margin: '0',
        })
      )
    })

    it('placeholderの色とmarginを設定', () => {
      const styles = createSelectStyles({})
      const mockProvided = { color: 'black', margin: '4px' }
      
      const placeholderStyles = styles.placeholder?.(mockProvided, {} as any)
      
      expect(placeholderStyles).toEqual(
        expect.objectContaining({
          color: 'rgb(156 163 175)',
          margin: '0',
        })
      )
    })

    it('indicatorSeparatorを非表示に設定', () => {
      const styles = createSelectStyles({})
      
      const indicatorSeparatorStyles = styles.indicatorSeparator?.({}, {} as any)
      
      expect(indicatorSeparatorStyles).toEqual({
        display: 'none',
      })
    })

    it('dropdownIndicatorを非表示に設定', () => {
      const styles = createSelectStyles({})
      
      const dropdownIndicatorStyles = styles.dropdownIndicator?.({}, {} as any)
      
      expect(dropdownIndicatorStyles).toEqual({
        display: 'none',
      })
    })

    it('menuのスタイルを適切に設定', () => {
      const styles = createSelectStyles({})
      const mockProvided = {}
      
      const menuStyles = styles.menu?.(mockProvided, {} as any)
      
      expect(menuStyles).toEqual(
        expect.objectContaining({
          borderRadius: '6px',
          border: '1px solid rgb(209 213 219)',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          zIndex: 50,
        })
      )
    })

    it('選択されたオプションに適切なスタイルを適用', () => {
      const styles = createSelectStyles({})
      const mockProvided = {}
      const mockState = { isSelected: true, isFocused: false }
      
      const optionStyles = styles.option?.(mockProvided, mockState as any)
      
      expect(optionStyles).toEqual(
        expect.objectContaining({
          backgroundColor: 'rgb(248 113 113)',
          color: 'white',
          fontSize: '1rem',
          fontWeight: '600',
          padding: '0.75rem 1rem',
        })
      )
    })

    it('フォーカスされたオプションに適切なスタイルを適用', () => {
      const styles = createSelectStyles({})
      const mockProvided = {}
      const mockState = { isSelected: false, isFocused: true }
      
      const optionStyles = styles.option?.(mockProvided, mockState as any)
      
      expect(optionStyles).toEqual(
        expect.objectContaining({
          backgroundColor: 'rgb(254 242 242)',
          color: 'rgb(17 24 39)',
        })
      )
    })

    it('通常状態のオプションに適切なスタイルを適用', () => {
      const styles = createSelectStyles({})
      const mockProvided = {}
      const mockState = { isSelected: false, isFocused: false }
      
      const optionStyles = styles.option?.(mockProvided, mockState as any)
      
      expect(optionStyles).toEqual(
        expect.objectContaining({
          backgroundColor: 'white',
          color: 'rgb(17 24 39)',
        })
      )
    })

    it('複数の状態を組み合わせても適切に動作', () => {
      const styles = createSelectStyles({ 
        error: 'エラー', 
        disabled: false, 
        hasDescription: true 
      })
      const mockProvided = {
        border: '1px solid gray',
        backgroundColor: 'white',
        borderRadius: '4px',
      }
      
      const controlStyles = styles.control?.(mockProvided, {} as any)
      
      expect(controlStyles).toEqual(
        expect.objectContaining({
          border: '1px solid rgb(252 165 165)',
          backgroundColor: 'rgb(254 242 242)',
          borderRadius: '6px 6px 0 0',
          borderBottom: 'none',
        })
      )
    })
  })
})
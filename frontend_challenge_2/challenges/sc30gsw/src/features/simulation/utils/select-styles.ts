import type { StylesConfig } from "react-select"

type SelectOption = {
  value: string | number
  label: string
}

type SelectStylesProps = {
  error?: string
  disabled?: boolean
  hasDescription?: boolean
}

const ERROR_BORDER_COLOR = "rgb(252 165 165)"
const DISABLED_BORDER_COLOR = "rgb(209 213 219)"
const DISABLED_BACKGROUND_COLOR = "rgb(249 250 251)"
const DISABLED_TEXT_COLOR = "rgb(156 163 175)"
const ERROR_BACKGROUND_COLOR = "rgb(254 242 242)"
const SELECTED_OPTION_COLOR = "rgb(248 113 113)"

export function createSelectStyles<T extends SelectOption>({
  error,
  disabled,
  hasDescription = false,
}: SelectStylesProps): StylesConfig<T, false> {
  return {
    control: (provided) => ({
      ...provided,
      border: error
        ? `1px solid ${ERROR_BORDER_COLOR}`
        : disabled
          ? `1px solid ${DISABLED_BORDER_COLOR}`
          : `1px solid ${DISABLED_BORDER_COLOR}`,
      borderRadius: hasDescription ? "6px 6px 0 0" : "6px",
      borderBottom: hasDescription ? "none" : undefined,
      backgroundColor: error
        ? ERROR_BACKGROUND_COLOR
        : disabled
          ? DISABLED_BACKGROUND_COLOR
          : "white",
      paddingLeft: "2.5rem",
      paddingRight: "0.5rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem",
      fontSize: "1rem",
      fontWeight: "600",
      minHeight: "48px",
      boxShadow: "none",
      "&:hover": {
        borderColor: error
          ? ERROR_BORDER_COLOR
          : disabled
            ? DISABLED_BORDER_COLOR
            : DISABLED_TEXT_COLOR,
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: disabled ? DISABLED_TEXT_COLOR : "rgb(17 24 39)",
      margin: "0",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: DISABLED_TEXT_COLOR,
      margin: "0",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: () => ({
      display: "none",
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "6px",
      border: `1px solid ${DISABLED_BORDER_COLOR}`,
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      zIndex: 50,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? SELECTED_OPTION_COLOR
        : state.isFocused
          ? ERROR_BACKGROUND_COLOR
          : "white",
      color: state.isSelected ? "white" : "rgb(17 24 39)",
      fontSize: "1rem",
      fontWeight: "600",
      padding: "0.75rem 1rem",
      "&:hover": {
        backgroundColor: state.isSelected ? SELECTED_OPTION_COLOR : ERROR_BACKGROUND_COLOR,
      },
    }),
  }
}

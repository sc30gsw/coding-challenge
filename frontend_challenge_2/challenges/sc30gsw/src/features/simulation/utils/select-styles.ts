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

export function createSelectStyles<T extends SelectOption>({
  error,
  disabled,
  hasDescription = false,
}: SelectStylesProps): StylesConfig<T, false> {
  return {
    control: (provided) => ({
      ...provided,
      border: error
        ? "1px solid rgb(252 165 165)"
        : disabled
          ? "1px solid rgb(209 213 219)"
          : "1px solid rgb(209 213 219)",
      borderRadius: hasDescription ? "6px 6px 0 0" : "6px",
      borderBottom: hasDescription ? "none" : undefined,
      backgroundColor: error ? "rgb(254 242 242)" : disabled ? "rgb(249 250 251)" : "white",
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
          ? "rgb(252 165 165)"
          : disabled
            ? "rgb(209 213 219)"
            : "rgb(156 163 175)",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: "0",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: disabled ? "rgb(156 163 175)" : "rgb(17 24 39)",
      margin: "0",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "rgb(156 163 175)",
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
      border: "1px solid rgb(209 213 219)",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      zIndex: 50,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "rgb(248 113 113)"
        : state.isFocused
          ? "rgb(254 242 242)"
          : "white",
      color: state.isSelected ? "white" : "rgb(17 24 39)",
      fontSize: "1rem",
      fontWeight: "600",
      padding: "0.75rem 1rem",
      "&:hover": {
        backgroundColor: state.isSelected ? "rgb(248 113 113)" : "rgb(254 242 242)",
      },
    }),
  }
}

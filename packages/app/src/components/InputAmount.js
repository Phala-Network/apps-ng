import React, { useCallback, useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { Input as _Input, Select, useInput } from '@zeit-ui/react'
import { getValuesFromString, DEFAULT_BITLENGTH, findSi, BN_ZERO } from '@/utils/getUnitAmount'

const siOptions = [{ "text": "pico", "value": "p" }, { "text": "nano", "value": "n" }, { "text": "micro", "value": "µ" }, { "text": "milli", "value": "m" }, { "text": "Unit", "value": "-" }, { "text": "Kilo", "value": "k" }, { "text": "Mega", "value": "M" }, { "text": "Giga", "value": "G" }, { "text": "Tera", "value": "T" }, { "text": "Peta", "value": "P" }, { "text": "Exa", "value": "E" }, { "text": "Zeta", "value": "Z" }, { "text": "Yotta", "value": "Y" }]

const InputAmountWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  place-content: space-between;

  & .with-label {
    position: relative;
    z-index: 1;
  }

  & .input-wrapper {
    border-radius: 5px 0 0 5px !important;
  }

  & .select {
    border-radius: 0 5px 5px 0 !important;
    margin-left: -1px;
    position: relative;
    z-index: 0;
    min-width: unset !important;
  }

  & .select:hover, & .select:active {
    z-index: 2;
  }

  & .select .option span {
    margin-right: 36px;
    text-overflow: initial;
    overflow: visible;
  }
`

const Input = styled(_Input)
  .attrs({
    width: '100%'
  })`
  `

const UnitLabel = styled.span`

`

const InputAmount = ({ symbol = 'PHA', onChange, ...props }) => {
  const input = useInput('')
  const [unit, setUnit] = useState('-')

  const amount = useMemo(() => {
    const [, _value] = getValuesFromString(
      input.state,
      findSi(unit),
      DEFAULT_BITLENGTH,
      true
    )
    return _value
  }, [input.state, unit])

  useEffect(() => {
    onChange && onChange(amount)
  }, [onChange, amount])

  return <InputAmountWrapper>
    <Input {...input.bindings} type='number' {...props} />
    <Select
      placeholder="Choose one"
      value={unit}
      onChange={setUnit}
    >
      {siOptions.map(i => <Select.Option value={i.value} key={i.value}>
        <UnitLabel>
          {i.value === '-' ? '' : `${i.text} `}{symbol}
        </UnitLabel>

      </Select.Option>)}

    </Select>
  </InputAmountWrapper>
}

export default InputAmount
export { BN_ZERO }

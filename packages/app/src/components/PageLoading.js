import React from 'react'
import { Loading } from '@zeit-ui/react'
import styled from 'styled-components'

const LoadingWrapper = styled.div`
  margin: 36vh auto;
  flex: 1;
  height: 100%;
`

export default () => (
  <LoadingWrapper>
    <Loading size="large" />
  </LoadingWrapper>
)

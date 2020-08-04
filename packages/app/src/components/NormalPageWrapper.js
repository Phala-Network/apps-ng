import ApiRequired from '@/utils/ApiRequired'
import { Container } from 'semantic-ui-react'

export default function NormalPageWrapper ({ children, hasContainer = true }) {
  return <ApiRequired>
    {hasContainer
      ? <Container>
        {children}
      </Container>
      : children}

  </ApiRequired>
}

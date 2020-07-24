import ApiRequired from '@/utils/ApiRequired'
import { Container } from 'semantic-ui-react'

export default function NormalPageWrapper ({ children }) {
  return <ApiRequired>
    <Container>
      {children}
    </Container>
  </ApiRequired>
}

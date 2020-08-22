import { useEffect } from "react"
import { LAYOUT_ROUTE, DEFAULT_ROUTE } from '@/utils/route/utils'
import { useRouter } from "next/router"

function Home () {
  const router = useRouter()
  useEffect(() => {
    router.replace(LAYOUT_ROUTE, DEFAULT_ROUTE)
  }, [])
  return null
}

export default Home

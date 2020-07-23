// import { observer } from "mobx-react"
import { useEffect } from "react"
import { LAYOUT_ROUTE, getPageRoute, DEFAULT_ROUTE_NAME } from '@/utils/route'
import { useRouter } from "next/router"

function Home () {
  const router = useRouter()
  useEffect(() => {
    router.replace(LAYOUT_ROUTE, getPageRoute(DEFAULT_ROUTE_NAME))
  }, [])
  return null
}

export default Home
// export default observer(Home) 

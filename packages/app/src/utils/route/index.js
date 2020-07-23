import { MENU_ROUTES, COMPONENT_ROUTES } from './routes'
import { _findRouteComponent } from './utils'

export const findRouteComponent = slug =>
  _findRouteComponent(COMPONENT_ROUTES, slug)

export const getPageRoute = key => `${MENU_ROUTES[key]}`

export * from './utils'
export * from './routes'

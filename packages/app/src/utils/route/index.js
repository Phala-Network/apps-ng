import { MENU_ROUTES, COMPONENT_ROUTES } from './routes'
import { LAYOUT_ROUTE, _findRouteComponent } from './utils'
import { Link } from '@/utils/i18n'

export const findRouteComponent = slug =>
  _findRouteComponent(COMPONENT_ROUTES, slug)

export const getPageRoute = key => `${MENU_ROUTES[key]}`

export const RouteLink = ({ href, ...props }) =>
  <Link
    href={LAYOUT_ROUTE}
    as={getPageRoute(href)}
    {...props}
  />


export * from './utils'
export * from './routes'

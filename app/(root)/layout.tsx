import { TypesLayout } from '@/types'
import { MainHeader } from '../../components/layouts/main-header'

const Layout = ({children}:TypesLayout) => {
  return (
    <>
    <MainHeader/>
    {children}
    </>
  )
}

export default Layout
import '../styles/globals.css'
import { useRouter } from 'next/router'
import TabsBar from '../components/TabsBar'

export default function App({ Component, pageProps }) {
  const router = useRouter()

  const showTopTabs = router.pathname !== '/'

  return (
    <div>
      {showTopTabs && <TabsBar />}
      <Component {...pageProps} />
    </div>
  )
}

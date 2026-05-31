import Link from 'next/link'
import { useRouter } from 'next/router'

const TABS = [
  { href: '/#hero', label: 'Home' },
  { href: '/#projects', label: 'Projects' },
  { href: '/#skills', label: 'Skills' },
  { href: '/#personal', label: 'Personal' },
  { href: '/#assistant', label: 'Ask' },
  { href: '/#contact', label: 'Contact' }
]

export default function TabsBar(){
  const router = useRouter()

  return (
    <div className="top-tabs border-b">
      {TABS.map(tab => {
        const active = router.asPath === tab.href || (tab.href === '/#hero' && router.pathname === '/')
        return (
          <Link key={tab.href} href={tab.href} className={`top-tab ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined}>
            <span className="top-tab-dot" aria-hidden="true" />
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </div>
  )
}

import { Outlet, useLocation } from 'react-router-dom';
import BottomTabNav from '@/components/BottomTabNav';
import Header from '@/components/Header';

const PUBLIC_ROUTES = ['/', '/login', '/demo', '/unirse'];
const HIDE_HEADER_ROUTES = ['/', '/login', '/demo', '/unirse'];

export default function MobileLayout() {
  const { pathname } = useLocation();
  const showNav = !PUBLIC_ROUTES.includes(pathname);
  const showHeader = !HIDE_HEADER_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen" style={{ background: '#FDFBF7', paddingTop: 'env(safe-area-inset-top, 0px)', paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)' }}>
      <div className="max-w-md mx-auto min-h-screen flex flex-col overflow-hidden" style={{ paddingBottom: showNav ? 'calc(64px + env(safe-area-inset-bottom, 0px))' : '0px' }}>
        {showHeader && <Header />}
        <div className="flex-1 overflow-y-auto overflow-x-hidden" data-scroll-container={pathname}>
          <Outlet />
        </div>
      </div>
      {showNav && <BottomTabNav />}
    </div>
  );
}
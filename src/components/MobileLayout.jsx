import { Outlet, useLocation } from 'react-router-dom';
import BottomTabNav from '@/components/BottomTabNav';

const PUBLIC_ROUTES = ['/', '/login', '/demo', '/unirse'];

export default function MobileLayout() {
  const { pathname } = useLocation();
  const showNav = !PUBLIC_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)' }}>
      <div className="max-w-md mx-auto min-h-screen flex flex-col" style={{ paddingBottom: showNav ? 'calc(64px + env(safe-area-inset-bottom, 0px))' : '0px' }}>
        <Outlet />
      </div>
      {showNav && <BottomTabNav />}
    </div>
  );
}
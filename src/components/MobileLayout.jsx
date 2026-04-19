import { Outlet } from 'react-router-dom';
import BottomTabNav from '@/components/BottomTabNav';

export default function MobileLayout() {
  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)' }}>
      <div className="max-w-md mx-auto min-h-screen flex flex-col" style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}>
        <Outlet />
      </div>
      <BottomTabNav />
    </div>
  );
}
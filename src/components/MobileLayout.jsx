import { Outlet } from 'react-router-dom';
import BottomTabNav from '@/components/BottomTabNav';

export default function MobileLayout() {
  return (
    <div className="min-h-screen bg-background safe-top safe-x">
      <div className="max-w-md mx-auto min-h-screen flex flex-col pb-20">
        <Outlet />
      </div>
      <BottomTabNav />
    </div>
  );
}
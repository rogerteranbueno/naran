import { Outlet } from 'react-router-dom';

export default function MobileLayout() {
  return (
    <div className="min-h-screen bg-background safe-top safe-bottom safe-x">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
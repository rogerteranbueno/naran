import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Reframe() {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      <button
        onClick={() => navigate('/app')}
        className="flex items-center gap-2 text-muted-foreground mb-8 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Volver</span>
      </button>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground text-center">Pantalla de Reframe</p>
      </div>
    </div>
  );
}
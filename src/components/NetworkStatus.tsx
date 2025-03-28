import { WifiOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NetworkStatus = () => {
  const { isOffline } = useAuth();
  
  if (!isOffline) return null;
  
  return (
    <div className="fixed bottom-4 right-4 flex items-center bg-amber-500 text-white px-3 py-2 rounded-md shadow-lg z-50 animate-pulse">
      <WifiOff className="mr-2 h-4 w-4" />
      <span className="text-sm font-medium">You are offline</span>
    </div>
  );
};

export default NetworkStatus; 
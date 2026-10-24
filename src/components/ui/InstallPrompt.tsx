import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './Button';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('installDismissed');
      if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 24 * 60 * 60 * 1000) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installDismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm screen-fade">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 p-4 rounded-2xl shadow-2xl flex items-start gap-4">
        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
          <Download className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-white font-bold mb-1">Install App</h2>
          <p className="text-xs text-zinc-300 mb-3">Install SAT Vocab Quest on your device for offline play and better performance.</p>
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={handleInstallClick} className="flex-1 py-1.5 text-xs">
              Install
            </Button>
            <button onClick={handleDismiss} className="px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition-colors bg-slate-800 rounded-md">
              Maybe Later
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-zinc-400 hover:text-white absolute top-2 right-2 p-1" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

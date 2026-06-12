import React from 'react';
import { usePWA } from '../../context/PWAContext';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import newLogo from '../../assets/mye3AcadmeyNewLogo.jpeg';

const PWAPrompt = () => {
  const { showPrompt, handleInstall, handleDismiss } = usePWA();

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] md:hidden"
        >
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center p-1 flex-shrink-0 border border-slate-100">
                <img src={newLogo} alt="App Logo" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Mye3 Academy App</h3>
                <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                  Install our app for faster access, offline tests, and instant notifications.
                </p>
              </div>
              <button 
                onClick={handleDismiss}
                className="p-1 text-slate-400 hover:text-slate-600 active:scale-90 transition-transform bg-slate-50 rounded-full"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={handleDismiss}
                className="py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Later
              </button>
              <button
                onClick={handleInstall}
                className="py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Download size={14} /> Install
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAPrompt;

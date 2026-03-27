import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { SalesData } from './types';
import { BarChart3, LayoutDashboard, Settings, HelpCircle, Bell, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [salesData, setSalesData] = useState<SalesData[] | null>(null);

  const handleDataLoaded = (data: SalesData[]) => {
    setSalesData(data);
  };

  const handleReset = () => {
    setSalesData(null);
  };

  return (
    <div className="min-h-screen bg-bg-main flex text-slate-700 font-sans">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-100 flex-col sticky top-0 h-screen z-20">
        <div className="h-16 flex items-center px-6 bg-gradient-to-r from-brand-pink to-brand-purple text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Lector.</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Menú Principal</p>
          <NavItem icon={<LayoutDashboard size={18} />} label="Tablero" active />
          <NavItem icon={<BarChart3 size={18} />} label="Widgets" />
          <NavItem icon={<Bell size={18} />} label="Notificaciones" />
          <NavItem icon={<Settings size={18} />} label="Configuración" />
          <NavItem icon={<HelpCircle size={18} />} label="Documentación" />
        </nav>

        <div className="p-4 border-t border-slate-50">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-600 mb-1">¿Necesitas ayuda?</p>
            <p className="text-[10px] text-slate-400">Consulta nuestra documentación para funciones avanzadas.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <button className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
              <LayoutDashboard size={20} />
            </button>
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-purple transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar datos..." 
                className="w-full bg-slate-50 border-none rounded-lg pl-10 pr-4 py-2 text-sm text-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-purple/10 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-pink rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-100 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-700">Usuario Admin</p>
                <p className="text-[10px] text-slate-400">Analista Senior</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-slate-50 p-0.5 overflow-hidden">
                <img 
                  src="https://picsum.photos/seed/user/100/100" 
                  alt="User" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            {!salesData ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center min-h-[60vh]"
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-display font-bold text-slate-800 mb-4 tracking-tight uppercase">
                    Análisis de <span className="text-brand-pink">Ventas</span>
                  </h2>
                  <p className="text-slate-500 max-w-md mx-auto text-sm">
                    Sube tu archivo de datos de ventas para generar un tablero de análisis completo e interactivo.
                  </p>
                </div>
                <FileUpload onDataLoaded={handleDataLoaded} />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Dashboard data={salesData} onReset={handleReset} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="p-6 text-center border-t border-slate-100 bg-white">
          <p className="text-xs font-medium text-slate-400">
            Creado por <span className="text-brand-pink font-bold">Gaby Yulemi Vargas Curo</span> - Curso de Excel con IA
          </p>
        </footer>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={cn(
      "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group",
      active 
        ? "bg-brand-pink/5 text-brand-pink font-semibold" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
    )}>
      <div className={cn(
        "transition-colors",
        active ? "text-brand-pink" : "text-slate-400 group-hover:text-slate-600"
      )}>
        {icon}
      </div>
      <span className="text-sm">{label}</span>
      {active && <div className="ml-auto w-1 h-4 rounded-full bg-brand-pink" />}
    </button>
  );
}

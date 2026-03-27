import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Users, ShoppingBag, DollarSign, 
  Filter, Download, RefreshCcw, ChevronRight,
  Globe, CreditCard, User, Tag, Calendar
} from 'lucide-react';
import { SalesData, DashboardStats } from '@/src/types';
import { format, startOfMonth, endOfMonth, isWithinInterval, subDays, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface DashboardProps {
  data: SalesData[];
  onReset: () => void;
}

const COLORS = ['#f43f5e', '#8b5cf6', '#3b82f6', '#06b6d4', '#f59e0b', '#10b981'];

export const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const [filters, setFilters] = React.useState({
    country: 'Todos',
    channel: 'Todos',
    seller: 'Todos',
    product: 'Todos',
    paymentMethod: 'Todos',
    dateRange: 'Todos'
  });

  const dateOptions = [
    'Todos',
    'Hoy',
    'Ayer',
    'Últimos 7 días',
    'Últimos 30 días',
    'Este Mes',
    'Mes Pasado'
  ];

  const uniqueValues = useMemo(() => ({
    countries: ['Todos', ...new Set(data.map(d => d.País))].sort(),
    channels: ['Todos', ...new Set(data.map(d => d.Canal))].sort(),
    sellers: ['Todos', ...new Set(data.map(d => d.Vendedor))].sort(),
    products: ['Todos', ...new Set(data.map(d => d.Producto))].sort(),
    paymentMethods: ['Todos', ...new Set(data.map(d => d["Forma de pago"]))].sort(),
  }), [data]);

  const filteredData = useMemo(() => {
    const now = new Date();
    return data.filter(d => {
      const matchCountry = filters.country === 'Todos' || d.País === filters.country;
      const matchChannel = filters.channel === 'Todos' || d.Canal === filters.channel;
      const matchSeller = filters.seller === 'Todos' || d.Vendedor === filters.seller;
      const matchProduct = filters.product === 'Todos' || d.Producto === filters.product;
      const matchPayment = filters.paymentMethod === 'Todos' || d["Forma de pago"] === filters.paymentMethod;
      
      let matchDate = true;
      if (filters.dateRange !== 'Todos') {
        const date = d.Fecha;
        switch (filters.dateRange) {
          case 'Hoy':
            matchDate = isSameDay(date, now);
            break;
          case 'Ayer':
            matchDate = isSameDay(date, subDays(now, 1));
            break;
          case 'Últimos 7 días':
            matchDate = isWithinInterval(date, { start: startOfDay(subDays(now, 7)), end: endOfDay(now) });
            break;
          case 'Últimos 30 días':
            matchDate = isWithinInterval(date, { start: startOfDay(subDays(now, 30)), end: endOfDay(now) });
            break;
          case 'Este Mes':
            matchDate = isWithinInterval(date, { start: startOfMonth(now), end: endOfMonth(now) });
            break;
          case 'Mes Pasado':
            const lastMonth = subDays(startOfMonth(now), 1);
            matchDate = isWithinInterval(date, { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) });
            break;
        }
      }
      
      return matchCountry && matchChannel && matchSeller && matchProduct && matchPayment && matchDate;
    });
  }, [data, filters]);

  const stats = useMemo((): DashboardStats => {
    const totalSales = filteredData.reduce((acc, d) => acc + d.Ventas, 0);
    const totalQuantity = filteredData.reduce((acc, d) => acc + d.Cantidad, 0);
    const totalCustomers = new Set(filteredData.map(d => d.Cliente)).size;

    const countryMap = new Map<string, number>();
    const channelMap = new Map<string, number>();
    const sellerMap = new Map<string, number>();
    const timeMap = new Map<string, number>();

    filteredData.forEach(d => {
      countryMap.set(d.País, (countryMap.get(d.País) || 0) + d.Ventas);
      channelMap.set(d.Canal, (channelMap.get(d.Canal) || 0) + d.Ventas);
      sellerMap.set(d.Vendedor, (sellerMap.get(d.Vendedor) || 0) + d.Ventas);
      
      const dateKey = format(d.Fecha, 'MMM yyyy', { locale: es });
      timeMap.set(dateKey, (timeMap.get(dateKey) || 0) + d.Ventas);
    });

    return {
      totalSales,
      totalQuantity,
      totalCustomers,
      avgOrderValue: totalSales / (filteredData.length || 1),
      salesByCountry: Array.from(countryMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6),
      salesByChannel: Array.from(channelMap.entries()).map(([name, value]) => ({ name, value })),
      salesBySeller: Array.from(sellerMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5),
      salesOverTime: Array.from(timeMap.entries()).map(([date, value]) => ({ date, value })),
    };
  }, [filteredData]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800 tracking-tight">Análisis de Ventas</h1>
          <p className="text-slate-400 text-sm">Análisis en tiempo real y métricas de rendimiento</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-500 bg-white hover:bg-slate-50 rounded-xl transition-all border border-slate-100 card-shadow"
          >
            <RefreshCcw size={16} className="text-brand-purple" />
            Cambiar Archivo
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-brand-pink to-brand-purple rounded-xl transition-all shadow-lg shadow-brand-pink/20 hover:scale-105">
            <Download size={16} />
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex flex-col lg:flex-row lg:items-end gap-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 flex-1">
          <FilterSelect 
            label="País" 
            icon={<Globe size={14} />} 
            options={uniqueValues.countries} 
            value={filters.country} 
            onChange={(v) => setFilters(f => ({ ...f, country: v }))} 
          />
          <FilterSelect 
            label="Canal" 
            icon={<ShoppingBag size={14} />} 
            options={uniqueValues.channels} 
            value={filters.channel} 
            onChange={(v) => setFilters(f => ({ ...f, channel: v }))} 
          />
          <FilterSelect 
            label="Vendedor" 
            icon={<User size={14} />} 
            options={uniqueValues.sellers} 
            value={filters.seller} 
            onChange={(v) => setFilters(f => ({ ...f, seller: v }))} 
          />
          <FilterSelect 
            label="Producto" 
            icon={<Tag size={14} />} 
            options={uniqueValues.products} 
            value={filters.product} 
            onChange={(v) => setFilters(f => ({ ...f, product: v }))} 
          />
          <FilterSelect 
            label="Pago" 
            icon={<CreditCard size={14} />} 
            options={uniqueValues.paymentMethods} 
            value={filters.paymentMethod} 
            onChange={(v) => setFilters(f => ({ ...f, paymentMethod: v }))} 
          />
          <FilterSelect 
            label="Rango de Fecha" 
            icon={<Calendar size={14} />} 
            options={dateOptions} 
            value={filters.dateRange} 
            onChange={(v) => setFilters(f => ({ ...f, dateRange: v }))} 
          />
        </div>
        <button 
          onClick={() => setFilters({
            country: 'Todos',
            channel: 'Todos',
            seller: 'Todos',
            product: 'Todos',
            paymentMethod: 'Todos',
            dateRange: 'Todos'
          })}
          className="px-6 py-2.5 text-[10px] font-bold text-brand-purple hover:bg-brand-purple/5 rounded-xl transition-all border border-brand-purple/20 uppercase tracking-widest h-[42px]"
        >
          Limpiar Filtros
        </button>
      </div>

      {filteredData.length === 0 ? (
        <div className="bg-white p-20 rounded-[2rem] border-2 border-dashed border-slate-100 text-center card-shadow">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Filter size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No se encontraron resultados</h3>
          <p className="text-slate-400 text-sm">Ajusta tus filtros para ver los datos.</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
              title="Ingresos Totales" 
              value={formatCurrency(stats.totalSales)} 
              icon={<DollarSign />} 
              trend="+12.5%" 
              color="purple"
            />
            <KPICard 
              title="Pedidos Totales" 
              value={filteredData.length.toLocaleString()} 
              icon={<ShoppingBag />} 
              trend="+8.2%" 
              color="blue"
            />
            <KPICard 
              title="Valor Promedio de Pedido" 
              value={formatCurrency(stats.avgOrderValue)} 
              icon={<TrendingUp />} 
              trend="-2.4%" 
              color="orange"
            />
            <KPICard 
              title="Clientes Activos" 
              value={stats.totalCustomers.toLocaleString()} 
              icon={<Users />} 
              trend="+5.1%" 
              color="pink"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Rendimiento de Ventas</h3>
                  <p className="text-slate-400 text-xs">Distribución mensual de ingresos</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-purple" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Ingresos</span>
                </div>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.salesOverTime}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-brand-purple)" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="var(--color-brand-purple)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                      tickFormatter={(v) => `$${v/1000}k`} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                      formatter={(v: number) => [formatCurrency(v), 'Ventas']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="var(--color-brand-purple)" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Ventas por Canal</h3>
              <p className="text-slate-400 text-xs mb-8">Distribución a través de plataformas</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.salesByChannel}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {stats.salesByChannel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-3">
                {stats.salesByChannel.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs font-semibold text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow">
              <h3 className="text-lg font-bold text-slate-800 mb-8">Países Principales</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.salesByCountry} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      width={100} 
                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      formatter={(v: number) => formatCurrency(v)}
                    />
                    <Bar dataKey="value" fill="var(--color-brand-cyan)" radius={[0, 10, 10, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow">
              <h3 className="text-lg font-bold text-slate-800 mb-8">Vendedores Principales</h3>
              <div className="space-y-6">
                {stats.salesBySeller.map((seller, i) => (
                  <div key={seller.name} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                      0{i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-bold text-slate-700">{seller.name}</span>
                        <span className="text-sm font-bold text-brand-green">{formatCurrency(seller.value)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(seller.value / stats.salesBySeller[0].value) * 100}%` }}
                          className="bg-gradient-to-r from-brand-green to-brand-cyan h-full rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-[2rem] border border-slate-100 card-shadow overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Transacciones Recientes</h3>
              <span className="text-[10px] font-bold text-brand-purple bg-brand-purple/5 px-3 py-1 rounded-full border border-brand-purple/10 uppercase tracking-widest">
                {filteredData.length} Registros
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-50">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Producto</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Canal</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Cant</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ventas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-all group">
                      <td className="px-8 py-4 text-xs font-semibold text-slate-500">{format(row.Fecha, 'dd/MM/yyyy')}</td>
                      <td className="px-8 py-4 text-xs font-bold text-slate-700">{row.Cliente}</td>
                      <td className="px-8 py-4 text-xs font-semibold text-slate-500">{row.Producto}</td>
                      <td className="px-8 py-4 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider">
                          {row.Canal}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-xs font-semibold text-slate-500 text-right">{row.Cantidad}</td>
                      <td className="px-8 py-4 text-xs font-bold text-brand-green text-right">{formatCurrency(row.Ventas)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredData.length > 10 && (
              <div className="p-4 bg-slate-50/30 text-center border-t border-slate-50">
                <button className="text-[10px] font-bold text-brand-purple hover:text-brand-pink transition-colors uppercase tracking-widest flex items-center gap-2 mx-auto">
                  Ver todos los registros <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

interface FilterSelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  icon: React.ReactNode;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ label, options, value, onChange, icon }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
      <span className="text-brand-purple">{icon}</span>
      {label}
    </label>
    <div className="relative group">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-purple/10 transition-all appearance-none cursor-pointer group-hover:bg-slate-100"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-brand-purple transition-colors">
        <ChevronRight size={14} className="rotate-90" />
      </div>
    </div>
  </div>
);

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  color: 'purple' | 'blue' | 'orange' | 'pink' | 'green' | 'cyan';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, color }) => {
  const colorMap = {
    purple: "from-brand-purple to-[#8b5cf6] shadow-brand-purple/20",
    blue: "from-brand-blue to-brand-cyan shadow-brand-blue/20",
    orange: "from-brand-orange to-brand-yellow shadow-brand-orange/20",
    pink: "from-brand-pink to-[#ec4899] shadow-brand-pink/20",
    green: "from-brand-green to-[#10b981] shadow-brand-green/20",
    cyan: "from-brand-cyan to-brand-blue shadow-brand-cyan/20"
  };

  const isPositive = trend.startsWith('+');

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-[2rem] border border-slate-100 card-shadow relative overflow-hidden group"
    >
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br transition-transform duration-500 group-hover:rotate-6",
          colorMap[color]
        )}>
          {React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: 2 })}
        </div>
        <div className={cn(
          "text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-widest",
          isPositive 
            ? "bg-green-50 text-green-600 border-green-100" 
            : "bg-red-50 text-red-600 border-red-100"
        )}>
          {trend}
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">{title}</p>
        <h4 className="text-2xl font-display font-bold text-slate-800 tracking-tight">{value}</h4>
      </div>
    </motion.div>
  );
};

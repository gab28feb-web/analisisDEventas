import React, { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileType, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { SalesData } from '@/src/types';
import { parse, isValid } from 'date-fns';

interface FileUploadProps {
  onDataLoaded: (data: SalesData[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (jsonData.length === 0) {
          setError('El archivo está vacío.');
          return;
        }

        const requiredColumns = ['Cliente', 'país', 'canal', 'forma de pago', 'producto', 'vendedor', 'fecha', 'ventas', 'cantidad'];
        const firstRow = jsonData[0];
        const missingColumns = requiredColumns.filter(col => 
          !Object.keys(firstRow).some(key => key.toLowerCase() === col.toLowerCase())
        );

        if (missingColumns.length > 0) {
          setError(`Faltan las siguientes columnas: ${missingColumns.join(', ')}`);
          return;
        }

        const formattedData: SalesData[] = jsonData.map((row: any) => {
          // Find keys case-insensitively
          const getVal = (key: string) => {
            const actualKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
            return actualKey ? row[actualKey] : null;
          };

          let dateVal = getVal('fecha');
          let parsedDate: Date;

          if (dateVal instanceof Date) {
            parsedDate = dateVal;
          } else {
            // Try parsing string date
            parsedDate = new Date(dateVal);
            if (!isValid(parsedDate)) {
               // Try common formats if standard Date fails
               parsedDate = parse(String(dateVal), 'dd/MM/yyyy', new Date());
               if (!isValid(parsedDate)) {
                 parsedDate = parse(String(dateVal), 'yyyy-MM-dd', new Date());
               }
            }
          }

          return {
            Cliente: String(getVal('cliente') || ''),
            País: String(getVal('país') || ''),
            Canal: String(getVal('canal') || ''),
            "Forma de pago": String(getVal('forma de pago') || ''),
            Producto: String(getVal('producto') || ''),
            Vendedor: String(getVal('vendedor') || ''),
            Fecha: parsedDate,
            Ventas: Number(getVal('ventas') || 0),
            Cantidad: Number(getVal('cantidad') || 0),
          };
        });

        onDataLoaded(formattedData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Error al procesar el archivo. Asegúrate de que sea un formato válido.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 flex flex-col items-center justify-center gap-6 cursor-pointer group",
          isDragging 
            ? "border-brand-purple bg-brand-purple/5 shadow-lg" 
            : "border-slate-200 bg-white hover:border-brand-pink/50 hover:bg-slate-50 card-shadow"
        )}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
        />
        
        <div className="relative">
          <div className="absolute inset-0 bg-brand-pink blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative p-5 bg-white border border-slate-100 rounded-2xl text-brand-pink shadow-sm">
            <Upload size={32} strokeWidth={2} />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-slate-800">Subir Archivo de Datos</h3>
          <p className="text-slate-400 text-xs">Arrastra y suelta tus archivos Excel o CSV aquí</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <FileType size={12} className="text-brand-cyan" />
          <span>Formatos: .xlsx, .xls, .csv</span>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600"
        >
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-xs font-semibold">{error}</p>
        </motion.div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 card-shadow">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Columnas Requeridas</p>
          <ul className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-600">
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-pink" /> Cliente</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-cyan" /> País</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-orange" /> Canal</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-green" /> Pago</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-purple" /> Producto</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-blue" /> Vendedor</li>
          </ul>
        </div>
        <div className="bg-brand-cyan/5 p-5 rounded-2xl border border-brand-cyan/10">
          <p className="text-[10px] font-bold text-brand-cyan uppercase tracking-widest mb-2">Consejo Pro</p>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Asegúrate de que los encabezados de tus columnas coincidan exactamente para obtener los mejores resultados de procesamiento. Evita caracteres especiales en los encabezados.
          </p>
        </div>
      </div>
    </div>
  );
};

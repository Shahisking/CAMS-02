import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CategoryType, Department, Building as BuildingType, AssetCondition, AssetStatus, FloorName, Asset } from '../../types';

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
      if (char === '\r' && text[i + 1] === '\n') {
        i++;
      }
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length < 2) return [];

  const parseRow = (rowStr: string): string[] => {
    const values: string[] = [];
    let val = '';
    let inQ = false;
    for (let i = 0; i < rowStr.length; i++) {
      const c = rowStr[i];
      if (c === '"') {
        if (inQ && rowStr[i + 1] === '"') {
          val += '"';
          i++;
        } else {
          inQ = !inQ;
        }
      } else if (c === ',' && !inQ) {
        values.push(val.trim());
        val = '';
      } else {
        val += c;
      }
    }
    values.push(val.trim());
    return values;
  };

  const headers = parseRow(lines[0]).map((h) => h.replace(/^"|"$/g, '').trim());
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowValues = parseRow(lines[i]).map((v) => v.replace(/^"|"$/g, '').trim());
    if (rowValues.every((v) => v === '')) continue;
    const rec: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rec[h] = rowValues[idx] || '';
    });
    records.push(rec);
  }

  return records;
}

export const ImportCSVModal: React.FC<ImportCSVModalProps> = ({ isOpen, onClose }) => {
  const { addAsset } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importCount, setImportCount] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a valid CSV file.');
      return;
    }
    setError('');
    setFile(selectedFile);
    setImportCount(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const records = parseCSV(content);
        if (records.length === 0) {
          setError('No valid data records found in CSV. Please ensure the file has a header row and data.');
          setParsedData([]);
        } else {
          setParsedData(records);
        }
      }
    };
    reader.onerror = () => {
      setError('Failed to read the file.');
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const getFieldValue = (rec: Record<string, string>, keys: string[]): string => {
    for (const k of Object.keys(rec)) {
      const normalizedKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const targetKey of keys) {
        if (normalizedKey === targetKey.toLowerCase().replace(/[^a-z0-9]/g, '')) {
          return rec[k];
        }
      }
    }
    return '';
  };

  const handleDownloadTemplate = () => {
    const templateHeaders = [
      'Asset Name',
      'Category',
      'Department',
      'Building Block',
      'Floor',
      'Room Number',
      'Condition',
      'Assigned To',
      'Status',
      'Purchase Date',
      'Purchase Cost (INR)',
      'Vendor',
      'Warranty Expiry',
      'Assigned Type',
    ];
    const sampleRow = [
      'Dell OptiPlex 7090 Desktop',
      'Computer',
      'Computer Science & Engineering',
      'S Block',
      'First Floor',
      'S110',
      'New',
      'Dr. R. Sundaram',
      'Active',
      '2025-06-15',
      '65000',
      'Dell India Pvt Ltd',
      '2028-06-15',
      'Faculty',
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [templateHeaders.join(','), sampleRow.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'asset_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    setIsImporting(true);
    setError('');
    let importedCount = 0;

    try {
      for (const rec of parsedData) {
        const name = getFieldValue(rec, ['asset_name', 'assetname', 'name', 'title']) || 'Imported Asset';
        const category = (getFieldValue(rec, ['category', 'categorytype']) || 'Computer') as CategoryType;
        const department = (getFieldValue(rec, ['department', 'dept']) || 'Computer Science & Engineering') as Department;
        const building = (getFieldValue(rec, ['buildingblock', 'building_block', 'block', 'building']) || 'S Block') as BuildingType;
        const floor = (getFieldValue(rec, ['floor']) || 'Ground Floor') as FloorName;
        const roomNumber = getFieldValue(rec, ['roomnumber', 'room_number', 'room']) || 'G-01';
        const purchaseDate = getFieldValue(rec, ['purchasedate', 'purchase_date', 'date']) || new Date().toISOString().split('T')[0];
        const purchaseCost = Number(getFieldValue(rec, ['purchasecost', 'purchase_cost', 'cost', 'price'])) || 0;
        const vendor = getFieldValue(rec, ['vendor', 'supplier']) || 'Standard Supplier';
        const warrantyExpiry = getFieldValue(rec, ['warrantyexpiry', 'warranty_expiry', 'warranty']) || '2027-12-31';
        const condition = (getFieldValue(rec, ['condition']) || 'Good') as AssetCondition;
        const status = (getFieldValue(rec, ['status']) || 'Active') as AssetStatus;
        const assignedTo = getFieldValue(rec, ['assignedto', 'assigned_to', 'assigned']) || department;
        const assignedType = (getFieldValue(rec, ['assignedtype', 'assigned_type']) || 'Department') as Asset['assignedType'];

        const newAssetData: Omit<Asset, 'id'> = {
          name,
          category,
          department,
          building,
          floor,
          roomNumber,
          purchaseDate,
          purchaseCost,
          vendor,
          warrantyExpiry,
          condition,
          status,
          assignedTo,
          assignedType,
        };

        await addAsset(newAssetData);
        importedCount++;
      }

      setImportCount(importedCount);
      setTimeout(() => {
        onClose();
        setFile(null);
        setParsedData([]);
        setImportCount(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('An error occurred while importing records to the database.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Import Assets from CSV</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload a CSV spreadsheet to bulk add asset records directly into the live database.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isImporting}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Download Template & Instructions */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Need a sample format?</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Download our sample CSV template with standard header columns.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Download Template</span>
              </button>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                <div className="p-3 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-full">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    Click to browse
                  </span>{' '}
                  <span className="text-sm text-slate-500 dark:text-slate-400">or drag & drop your CSV file here</span>
                </div>
                <span className="text-[11px] text-slate-400">Supports UTF-8 CSV files up to 10MB</span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Import Notification */}
            {importCount !== null && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Successfully imported {importCount} asset record(s) into the live database!</span>
              </div>
            )}

            {/* Parsed Data Preview */}
            {file && parsedData.length > 0 && importCount === null && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    CSV Preview ({parsedData.length} records ready to import)
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">{file.name}</span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto max-h-48 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                        <th className="p-2.5">Asset Name</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Department</th>
                        <th className="p-2.5">Building</th>
                        <th className="p-2.5">Room</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {parsedData.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300">
                          <td className="p-2.5 font-semibold text-slate-900 dark:text-white">
                            {getFieldValue(row, ['asset_name', 'assetname', 'name', 'title']) || 'Untitled Asset'}
                          </td>
                          <td className="p-2.5">{getFieldValue(row, ['category', 'categorytype']) || 'Computer'}</td>
                          <td className="p-2.5">{getFieldValue(row, ['department', 'dept']) || 'CSE'}</td>
                          <td className="p-2.5">{getFieldValue(row, ['buildingblock', 'building_block', 'block', 'building']) || 'S Block'}</td>
                          <td className="p-2.5 font-mono">{getFieldValue(row, ['roomnumber', 'room_number', 'room']) || 'G-01'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.length > 5 && (
                    <div className="p-2 text-center text-[11px] text-slate-400 bg-slate-50/30 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 font-medium">
                      + {parsedData.length - 5} more records will be imported
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={parsedData.length === 0 || isImporting || importCount !== null}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Import {parsedData.length > 0 ? `${parsedData.length} Records` : 'CSV'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

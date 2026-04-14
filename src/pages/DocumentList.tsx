import React from 'react';
import { 
  FileText, 
  Eye, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';
import axios from 'axios';

interface DocumentListProps {
  invoices: any[];
  onSelectDoc: (id: string) => void;
  onRefresh: () => void;
}

const API_BASE_URL = 'http://localhost:3001/api';

const DocumentList: React.FC<DocumentListProps> = ({ invoices, onSelectDoc, onRefresh }) => {
  
  const handleReprocess = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await axios.post(`${API_BASE_URL}/reprocess/${id}`);
      onRefresh();
    } catch (err) {
      alert('Failed to reprocess');
    }
  };

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Processed Invoices</h3>
          <p className="text-sm text-muted-foreground">Manage and view extraction results</p>
        </div>
        <button 
          onClick={onRefresh}
          className="p-2 hover:bg-muted rounded-xl transition-colors border border-border"
        >
          <RefreshCcw size={18} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <th className="px-6 py-4">Document</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Vendor</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Confidence</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  <FileText className="mx-auto mb-4 opacity-20" size={48} />
                  No documents found. Upload some to get started.
                </td>
              </tr>
            ) : invoices.map((inv) => (
              <tr 
                key={inv.id} 
                className="hover:bg-muted/20 cursor-pointer transition-colors group"
                onClick={() => onSelectDoc(inv.id)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                      <FileText size={16} />
                    </div>
                    <span className="text-sm font-medium">{inv.filename}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    inv.status === 'PROCESSED' 
                      ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                      : inv.status === 'ERROR'
                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                      : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                  }`}>
                    {inv.status === 'PENDING' && <Clock size={12} className="animate-spin" />}
                    {inv.status === 'PROCESSED' && <CheckCircle2 size={12} />}
                    {inv.status === 'ERROR' && <AlertCircle size={12} />}
                    {inv.status}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">{inv.vendorName || '-'}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 text-sm font-semibold">
                  {inv.currency} {inv.totalAmount?.toLocaleString() || '-'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          (inv.confidenceScore || 0) > 0.8 ? 'bg-green-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${(inv.confidenceScore || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{((inv.confidenceScore || 0) * 100).toFixed(0)}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSelectDoc(inv.id); }}
                      className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors border border-transparent hover:border-border"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleReprocess(e, inv.id)}
                      className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors border border-transparent hover:border-border"
                    >
                      <RefreshCcw size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentList;

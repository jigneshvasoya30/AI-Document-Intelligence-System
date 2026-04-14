import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Save, RefreshCcw, AlertTriangle, CheckCircle2, ExternalLink, Loader2
} from 'lucide-react';
import axios from 'axios';

interface DocumentDetailsProps {
  docId: string;
  onBack: () => void;
  onRefresh: () => void;
}

const API_BASE_URL = 'http://localhost:3001/api';
const UPLOAD_URL = 'http://localhost:3001/uploads';

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ docId, onBack, onRefresh }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('fields');
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/documents/${docId}`);
      setData(res.data);
      setEditedFields({});
    } catch (err) {
      console.error('Failed to fetch details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetails(); }, [docId]);

  const handleFieldChange = (field: string, value: string) => {
    setEditedFields(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/documents/${docId}`, {
        vendorName: editedFields.vendorName ?? data.vendorName,
        invoiceNumber: editedFields.invoiceNumber ?? data.invoiceNumber,
        invoiceDate: editedFields.invoiceDate ?? data.invoiceDate,
        currency: editedFields.currency ?? data.currency,
        totalAmount: editedFields.totalAmount ?? data.totalAmount,
        taxAmount: editedFields.taxAmount ?? data.taxAmount,
      });
      await fetchDetails();
      onRefresh();
    } catch (err) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleReprocess = async () => {
    try {
      await axios.post(`${API_BASE_URL}/reprocess/${docId}`);
      setTimeout(fetchDetails, 2000);
      onRefresh();
    } catch (err) {
      alert('Failed to reprocess');
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return <div className="p-8 text-muted-foreground">Document not found.</div>;

  const hasEdits = Object.keys(editedFields).length > 0;

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-muted rounded-xl transition-colors border border-border">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold truncate max-w-sm">{data.filename}</h2>
            <p className="text-sm text-muted-foreground">
              Processed {new Date(data.updatedAt).toLocaleString()} •{' '}
              <span className={`font-medium ${data.status === 'PROCESSED' ? 'text-green-500' : data.status === 'ERROR' ? 'text-red-500' : 'text-orange-500'}`}>
                {data.status}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!hasEdits || saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium transition-all border border-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-600"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
          <button onClick={handleReprocess} className="p-2 hover:bg-muted rounded-xl transition-colors border border-border" title="Reprocess">
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
        {/* Left: PDF Preview */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Document Preview</span>
            <a
              href={`${UPLOAD_URL}/${data.originalPath.split('/').pop()}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              Open in new tab <ExternalLink size={12} />
            </a>
          </div>
          <div className="flex-1 bg-slate-900 flex items-center justify-center p-8">
            <div className="w-full h-full border border-border/50 rounded-lg bg-background flex flex-col items-center justify-center text-muted-foreground space-y-4 shadow-2xl">
              <FileIcon />
              <p className="text-sm">PDF Preview</p>
              <div className="bg-muted p-4 rounded-xl text-xs font-mono max-w-[80%] overflow-hidden text-ellipsis text-center">
                {data.filename}
              </div>
              {data.confidenceScore !== null && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className={`font-bold ${(data.confidenceScore || 0) > 0.8 ? 'text-green-500' : 'text-orange-500'}`}>
                    {((data.confidenceScore || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Data & Analysis */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
          {/* Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
            data.validationErrors?.length > 0
              ? 'bg-orange-500/10 border-orange-500/20 text-orange-500'
              : 'bg-green-500/10 border-green-500/20 text-green-500'
          }`}>
            {data.validationErrors?.length > 0 ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
            <div>
              <p className="font-bold">
                {data.validationErrors?.length > 0 ? `${data.validationErrors.length} Validation Issue(s)` : 'Validation Successful'}
              </p>
              <p className="text-sm opacity-80">
                {data.validationErrors?.length > 0
                  ? 'Some fields may need review.'
                  : 'All fields match mathematical and format constraints.'}
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('fields')}
                className={`px-6 py-4 text-sm font-semibold transition-all ${activeTab === 'fields' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:bg-muted/50'}`}
              >
                Extracted Fields
              </button>
              <button
                onClick={() => setActiveTab('errors')}
                className={`px-6 py-4 text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'errors' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:bg-muted/50'}`}
              >
                Errors & Warnings
                {data.validationErrors?.length > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                    {data.validationErrors.length}
                  </span>
                )}
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'fields' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <FieldGroup
                      label="Vendor Name"
                      value={editedFields.vendorName ?? (data.vendorName || '')}
                      onChange={v => handleFieldChange('vendorName', v)}
                    />
                    <FieldGroup
                      label="Invoice #"
                      value={editedFields.invoiceNumber ?? (data.invoiceNumber || '')}
                      onChange={v => handleFieldChange('invoiceNumber', v)}
                    />
                    <FieldGroup
                      label="Invoice Date"
                      value={editedFields.invoiceDate ?? (data.invoiceDate ? new Date(data.invoiceDate).toLocaleDateString() : '')}
                      onChange={v => handleFieldChange('invoiceDate', v)}
                    />
                    <FieldGroup
                      label="Currency"
                      value={editedFields.currency ?? (data.currency || '')}
                      onChange={v => handleFieldChange('currency', v)}
                    />
                    <FieldGroup
                      label="Tax Amount"
                      value={editedFields.taxAmount ?? (data.taxAmount?.toString() || '0')}
                      onChange={v => handleFieldChange('taxAmount', v)}
                    />
                    <FieldGroup
                      label="Total Amount"
                      value={editedFields.totalAmount ?? (data.totalAmount?.toString() || '0')}
                      onChange={v => handleFieldChange('totalAmount', v)}
                    />
                  </div>

                  {data.lineItems?.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Line Items</h4>
                      <div className="border border-border/50 rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/30">
                            <tr className="text-left border-b border-border">
                              <th className="px-4 py-3 font-semibold">Description</th>
                              <th className="px-4 py-3 font-semibold text-center">Qty</th>
                              <th className="px-4 py-3 font-semibold text-right">Unit Price</th>
                              <th className="px-4 py-3 font-semibold text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {data.lineItems.map((item: any) => (
                              <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                                <td className="px-4 py-3">{item.description}</td>
                                <td className="px-4 py-3 text-center">{item.quantity}</td>
                                <td className="px-4 py-3 text-right">{Number(item.unitPrice).toFixed(2)}</td>
                                <td className="px-4 py-3 text-right font-medium">{Number(item.lineTotal).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {!data.validationErrors?.length ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <CheckCircle2 size={48} className="text-green-500 mb-4 opacity-20" />
                      <p>No validation errors found.</p>
                    </div>
                  ) : data.validationErrors.map((err: any) => (
                    <div key={err.id} className="flex gap-4 p-4 rounded-2xl bg-muted/40 border border-border/50 items-start">
                      <div className={`p-2 rounded-lg mt-0.5 ${err.severity === 'ERROR' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold capitalize">{err.field?.replace(/_/g, ' ') || 'General'}</p>
                        <p className="text-sm text-muted-foreground mt-1">{err.message}</p>
                        <span className={`text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full ${err.severity === 'ERROR' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                          {err.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FieldGroup = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</label>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={`Enter ${label.toLowerCase()}`}
      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
    />
  </div>
);

const FileIcon = () => (
  <div className="relative w-24 h-32 bg-card rounded-lg border-2 border-border shadow-xl flex items-center justify-center">
    <div className="absolute top-0 right-0 w-8 h-8 bg-muted border-l-2 border-b-2 border-border rounded-bl-lg" />
    <span className="text-xs font-mono rotate-[-10deg] opacity-20 select-none">INVOICE</span>
    <div className="absolute bottom-4 left-4 right-4 h-1 bg-muted rounded-full" />
    <div className="absolute bottom-7 left-4 right-8 h-1 bg-muted rounded-full" />
    <div className="absolute bottom-10 left-4 right-6 h-1 bg-muted rounded-full" />
  </div>
);

export default DocumentDetails;

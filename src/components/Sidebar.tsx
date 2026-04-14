import React from 'react';
import { LayoutDashboard, FileText, Upload } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'documents', icon: FileText, label: 'Documents' },
    { id: 'upload', icon: Upload, label: 'Upload' },
  ];

  return (
    <div className="w-64 border-r border-border flex flex-col bg-card/30 backdrop-blur-xl">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
          <FileText size={18} className="text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">DocIntel</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/10' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <item.icon size={20} className="mr-3" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="bg-muted/50 rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-2">PROMPT VERSION</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">v1.0.4 (Active)</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

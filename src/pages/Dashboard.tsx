import React from 'react';
import { 
  CheckCircle2, 
  TrendingUp, 
  FileText,
  Clock
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';

interface DashboardProps {
  invoices: any[];
  onSelectDoc: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, onSelectDoc }) => {
  const stats = {
    total: invoices.length,
    processed: invoices.filter(i => i.status === 'PROCESSED').length,
    errors: invoices.filter(i => i.status === 'ERROR').length,
    avgConfidence: (invoices.filter(i => i.status === 'PROCESSED').reduce((acc, curr) => acc + (curr.confidenceScore || 0), 0) / (invoices.filter(i => i.status === 'PROCESSED').length || 1) * 100).toFixed(1),
    avgTime: (invoices.reduce((acc, curr) => acc + (curr.processingTime || 0), 0) / (invoices.length || 1) / 1000).toFixed(2)
  };

  const chartData = [
    { name: 'Mon', value: 4 },
    { name: 'Tue', value: 7 },
    { name: 'Wed', value: 5 },
    { name: 'Thu', value: 12 },
    { name: 'Fri', value: stats.processed },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Invoices" 
          value={stats.total.toString()} 
          icon={FileText} 
          trend="+12%" 
          color="indigo" 
        />
        <StatCard 
          label="Success Rate" 
          value={`${((stats.processed / (stats.total || 1)) * 100).toFixed(1)}%`} 
          icon={CheckCircle2} 
          trend="+5%" 
          color="green" 
        />
        <StatCard 
          label="Avg Confidence" 
          value={`${stats.avgConfidence}%`} 
          icon={TrendingUp} 
          trend="-2%" 
          color="blue" 
        />
        <StatCard 
          label="Avg Proc. Time" 
          value={`${stats.avgTime}s`} 
          icon={Clock} 
          trend="-0.4s" 
          color="orange" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-card rounded-3xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Processing Volume</h3>
              <p className="text-sm text-muted-foreground">Number of invoices processed over time</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {invoices.slice(0, 5).map((inv: any) => (
              <div 
                key={inv.id} 
                onClick={() => onSelectDoc(inv.id)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    inv.status === 'PROCESSED' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                  }`}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{inv.filename.length > 20 ? inv.filename.substring(0, 17) + '...' : inv.filename}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(inv.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
                {inv.status === 'PROCESSED' ? (
                  <span className="text-xs font-semibold text-green-500">{inv.confidenceScore ? (inv.confidenceScore * 100).toFixed(0) : 0}%</span>
                ) : (
                  <span className="text-xs font-semibold text-orange-500">Wait</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, trend, color }: any) => {
  const colors: any = {
    indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-500 border-indigo-500/20',
    green: 'from-emerald-500/20 to-emerald-500/5 text-emerald-500 border-emerald-500/20',
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-500 border-blue-500/20',
    orange: 'from-orange-500/20 to-orange-500/5 text-orange-500 border-orange-500/20',
  };

  return (
    <div className={`bg-card rounded-3xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group`}>
      <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-0 group-hover:opacity-100 transition-opacity blur-3xl`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${colors[color]} border`}>
            <Icon size={20} />
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full bg-background/50 border border-border`}>{trend}</span>
        </div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      </div>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DHAKA_ZONES } from '../constants';

const DATA_WASTE_COMPOSITION = [
  { name: 'Organic', value: 65, color: '#22c55e' }, // High organic in Dhaka
  { name: 'Plastic', value: 12, color: '#3b82f6' },
  { name: 'Paper', value: 8, color: '#fbbf24' },
  { name: 'Glass/Metal', value: 5, color: '#94a3b8' },
  { name: 'Others', value: 10, color: '#ef4444' },
];

const DATA_ZONE_PERFORMANCE = [
  { name: 'Gulshan', efficiency: 85, volume: 120 },
  { name: 'Banani', efficiency: 82, volume: 90 },
  { name: 'Mirpur', efficiency: 65, volume: 350 },
  { name: 'Dhanmondi', efficiency: 78, volume: 150 },
  { name: 'Uttara', efficiency: 75, volume: 200 },
  { name: 'Old Dhaka', efficiency: 55, volume: 280 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="w-full h-full overflow-y-auto p-6 bg-slate-50 scrollbar-hide">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Urban Dashboard</h2>
        <p className="text-slate-500">Real-time waste management metrics for Dhaka City.</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Total Daily Waste</h3>
          <div className="text-3xl font-bold text-slate-800">6,500 <span className="text-lg font-normal text-slate-400">Tons</span></div>
          <div className="text-xs text-emerald-600 font-medium mt-2">↑ 2.4% from last month</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Recycling Rate</h3>
          <div className="text-3xl font-bold text-emerald-600">34%</div>
          <div className="text-xs text-slate-400 mt-2">Target: 50% by 2026</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">STS Operational</h3>
          <div className="text-3xl font-bold text-blue-600">54<span className="text-slate-400 text-lg">/60</span></div>
          <div className="text-xs text-amber-500 font-medium mt-2">6 requiring maintenance</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Waste Composition */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Waste Composition</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DATA_WASTE_COMPOSITION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {DATA_WASTE_COMPOSITION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone Efficiency */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Collection Efficiency by Zone</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DATA_ZONE_PERFORMANCE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="efficiency" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alert Section */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-4">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div>
          <h4 className="font-bold text-amber-800">High Waste Volume Alert</h4>
          <p className="text-sm text-amber-700 mt-1">Mirpur Section 12 reporting 15% above average waste generation today due to local market activity. Additional trucks dispatched.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
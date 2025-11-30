import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart, 
  Wallet, 
  FileText, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Save, 
  ArrowUpRight, 
  ArrowDownRight,
  LayoutDashboard,
  DollarSign,
  Briefcase
} from 'lucide-react';

// --- Types ---
type AssetType = 'Stock' | 'Bond' | 'ETF' | 'Cash' | 'Debt' | 'Option';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: AssetType;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

interface IPSSection {
  id: string;
  title: string;
  content: string;
}

// --- Mock Data ---
const INITIAL_ASSETS: Asset[] = [
  { id: '1', symbol: 'VTI', name: 'Vanguard Total Stock Market', type: 'ETF', quantity: 50, avgPrice: 210.00, currentPrice: 245.50 },
  { id: '2', symbol: 'BND', name: 'Vanguard Total Bond Market', type: 'Bond', quantity: 100, avgPrice: 75.00, currentPrice: 72.30 },
  { id: '3', symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock', quantity: 25, avgPrice: 140.00, currentPrice: 185.00 },
  { id: '4', symbol: 'MSFT', name: 'Microsoft Corp.', type: 'Stock', quantity: 15, avgPrice: 280.00, currentPrice: 405.00 },
  { id: '5', symbol: 'USD', name: 'Cash Reserve', type: 'Cash', quantity: 5000, avgPrice: 1.00, currentPrice: 1.00 },
];

const INITIAL_IPS: IPSSection[] = [
  { id: '1', title: 'Investment Philosophy', content: 'Long-term buy and hold strategy focusing on low-cost index funds. Market timing is to be avoided.' },
  { id: '2', title: 'Asset Allocation Target', content: '70% Equities (Stocks/ETFs)\n25% Fixed Income (Bonds)\n5% Cash/Equivalents' },
  { id: '3', title: 'Rebalancing Rules', content: 'Rebalance annually or when an asset class drifts more than 5% from its target allocation.' },
  { id: '4', title: 'Risk Tolerance', content: 'Moderate-Aggressive. Willing to withstand 20%+ drawdowns for higher long-term growth.' },
];

// --- Components ---

// 1. Simple Card Component
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

// 2. Simple SVG Pie Chart
const SimplePieChart = ({ data }: { data: { label: string; value: number; color: string }[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativeAngle = 0;

  if (total === 0) return <div className="text-center text-slate-400 py-10">No data to display</div>;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
      <div className="relative w-48 h-48 shrink-0">
        <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
          {data.map((slice, i) => {
            const percentage = slice.value / total;
            const angle = percentage * 360;
            const x1 = 50 + 50 * Math.cos((Math.PI * cumulativeAngle) / 180);
            const y1 = 50 + 50 * Math.sin((Math.PI * cumulativeAngle) / 180);
            const x2 = 50 + 50 * Math.cos((Math.PI * (cumulativeAngle + angle)) / 180);
            const y2 = 50 + 50 * Math.sin((Math.PI * (cumulativeAngle + angle)) / 180);
            
            const largeArcFlag = percentage > 0.5 ? 1 : 0;
            
            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`
            ].join(' ');

            const currentAngle = cumulativeAngle;
            cumulativeAngle += angle;

            return (
              <path
                key={slice.label}
                d={pathData}
                fill={slice.color}
                stroke="white"
                strokeWidth="2"
                onMouseEnter={(e) => {
                    const target = e.target as SVGPathElement;
                    target.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                    const target = e.target as SVGPathElement;
                    target.style.opacity = '1';
                }}
                className="transition-opacity duration-200 cursor-pointer"
              >
                <title>{`${slice.label}: ${Math.round(percentage * 100)}%`}</title>
              </path>
            );
          })}
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <div className="text-sm">
              <span className="font-medium text-slate-700">{item.label}</span>
              <span className="text-slate-500 ml-1">({Math.round((item.value / total) * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Application ---

export default function PortfolioTracker() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio' | 'ips'>('dashboard');
  
  // --- State with LocalStorage Persistence ---
  
  // Initialize Assets from LocalStorage
  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('portfolio_assets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse assets from local storage", e);
        return INITIAL_ASSETS;
      }
    }
    return INITIAL_ASSETS;
  });

  // Initialize IPS from LocalStorage
  const [ips, setIps] = useState<IPSSection[]>(() => {
    const saved = localStorage.getItem('portfolio_ips');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse IPS from local storage", e);
        return INITIAL_IPS;
      }
    }
    return INITIAL_IPS;
  });

  const [isEditingIps, setIsEditingIps] = useState(false);
  const [tempIps, setTempIps] = useState<IPSSection[]>(ips);

  // --- Effects to Save Data ---

  useEffect(() => {
    localStorage.setItem('portfolio_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('portfolio_ips', JSON.stringify(ips));
  }, [ips]);

  // --- Derived State (Analytics) ---
  const stats = useMemo(() => {
    // Net Worth includes Debt (negative values reduce net worth)
    const totalValue = assets.reduce((sum, asset) => sum + (asset.quantity * asset.currentPrice), 0);
    const totalCost = assets.reduce((sum, asset) => sum + (asset.quantity * asset.avgPrice), 0);
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost !== 0 ? (totalGain / Math.abs(totalCost)) * 100 : 0;

    // Allocation Data
    const allocationMap = new Map<string, number>();
    assets.forEach(asset => {
      const value = asset.quantity * asset.currentPrice;
      // Only add positive assets to the allocation pie chart
      if (value > 0) {
        allocationMap.set(asset.type, (allocationMap.get(asset.type) || 0) + value);
      }
    });

    const colors: Record<string, string> = {
      'Stock': '#3b82f6', // blue-500
      'Bond': '#10b981', // emerald-500
      'ETF': '#8b5cf6', // violet-500
      'Cash': '#64748b', // slate-500
      'Debt': '#ef4444', // red-500
      'Option': '#db2777', // pink-600
    };

    const allocationData = Array.from(allocationMap.entries()).map(([label, value]) => ({
      label,
      value,
      color: colors[label] || '#94a3b8'
    })).sort((a, b) => b.value - a.value);

    return { totalValue, totalGain, totalGainPercent, allocationData };
  }, [assets]);

  // --- Handlers ---
  const handleAddAsset = () => {
    // For demo purposes, adding a mock asset
    const newAsset: Asset = {
        id: Math.random().toString(36).substr(2, 9),
        symbol: 'NEW',
        name: 'New Holding',
        type: 'Stock',
        quantity: 1,
        avgPrice: 100,
        currentPrice: 100
    };
    setAssets([...assets, newAsset]);
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const handleUpdateAsset = (id: string, field: keyof Asset, value: string | number) => {
    setAssets(assets.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  const handleSaveIps = () => {
    setIps(tempIps);
    setIsEditingIps(false);
  };

  const handleIpsChange = (id: string, content: string) => {
    setTempIps(tempIps.map(section => 
      section.id === id ? { ...section, content } : section
    ));
  };

  // --- Formatting ---
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatPercent = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;

  // --- Render Views ---

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <DollarSign size={20} />
            </div>
            <h3 className="text-sm font-medium text-slate-500">Net Worth</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.totalValue)}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-sm font-medium text-slate-500">Total Gain/Loss</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-bold ${stats.totalGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(stats.totalGain)}
            </p>
            <span className={`text-sm font-medium ${stats.totalGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatPercent(stats.totalGainPercent)}
            </span>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-violet-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
              <Briefcase size={20} />
            </div>
            <h3 className="text-sm font-medium text-slate-500">Total Holdings</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{assets.length}</p>
        </Card>
      </div>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Asset Allocation</h3>
          <SimplePieChart data={stats.allocationData} />
        </Card>

        <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Top Holdings</h3>
            <div className="space-y-4">
                {[...assets].sort((a,b) => (b.quantity * b.currentPrice) - (a.quantity * a.currentPrice)).slice(0, 5).map(asset => {
                    const value = asset.quantity * asset.currentPrice;
                    const percent = (value / stats.totalValue) * 100;
                    return (
                        <div key={asset.id} className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold text-slate-700">{asset.symbol}</div>
                                <div className="text-xs text-slate-500">{asset.name}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium text-slate-700">{formatCurrency(value)}</div>
                                <div className="text-xs text-slate-400">{percent.toFixed(1)}%</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </Card>
      </div>
    </div>
  );

  const renderPortfolio = () => (
    <Card className="overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-lg font-bold text-slate-800">Your Holdings</h2>
            <p className="text-sm text-slate-500">Manage and edit your current positions.</p>
        </div>
        <button 
          onClick={handleAddAsset}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Asset
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-600">Symbol</th>
              <th className="px-6 py-4 font-semibold text-slate-600">Type</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">Shares</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">Avg Cost</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">Price</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">Market Value</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-right">Gain/Loss</th>
              <th className="px-6 py-4 font-semibold text-slate-600 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assets.map((asset) => {
              const marketValue = asset.quantity * asset.currentPrice;
              const gain = marketValue - (asset.quantity * asset.avgPrice);
              const gainPercent = asset.avgPrice !== 0 ? ((asset.currentPrice - asset.avgPrice) / Math.abs(asset.avgPrice)) * 100 : 0;

              return (
                <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                        type="text" 
                        value={asset.symbol}
                        onChange={(e) => handleUpdateAsset(asset.id, 'symbol', e.target.value)}
                        className="font-bold text-slate-700 bg-transparent border-b border-transparent focus:border-blue-500 outline-none w-16"
                    />
                    <div className="text-xs text-slate-400 truncate max-w-[150px]">{asset.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                        value={asset.type}
                        onChange={(e) => handleUpdateAsset(asset.id, 'type', e.target.value)}
                        className="bg-slate-100 rounded px-2 py-1 text-xs font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {['Stock', 'Bond', 'ETF', 'Cash', 'Debt', 'Option'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <input 
                        type="number" 
                        value={asset.quantity}
                        onChange={(e) => handleUpdateAsset(asset.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-right w-20 outline-none focus:text-blue-600"
                    />
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">
                     <input 
                        type="number" 
                        value={asset.avgPrice}
                        onChange={(e) => handleUpdateAsset(asset.id, 'avgPrice', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-right w-20 outline-none focus:text-blue-600"
                    />
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                     <input 
                        type="number" 
                        value={asset.currentPrice}
                        onChange={(e) => handleUpdateAsset(asset.id, 'currentPrice', parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-right w-20 outline-none focus:text-blue-600"
                    />
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700">
                    {formatCurrency(marketValue)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`flex items-center justify-end gap-1 ${gain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {gain >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      <span className="font-medium">{formatPercent(gainPercent)}</span>
                    </div>
                    <div className={`text-xs ${gain >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                        {gain > 0 ? '+' : ''}{formatCurrency(gain)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-2"
                      title="Remove Asset"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {assets.length === 0 && (
          <div className="p-8 text-center text-slate-500">
              No assets found. Click "Add Asset" to get started.
          </div>
      )}
    </Card>
  );

  const renderIPS = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-100 pb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-800">Investment Policy Statement</h2>
            <p className="text-slate-500 mt-1">Your personal constitution for financial decision making.</p>
          </div>
          <button 
            onClick={() => {
                if(isEditingIps) {
                    handleSaveIps();
                } else {
                    setTempIps(ips); // Sync state before editing
                    setIsEditingIps(true);
                }
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
              isEditingIps 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200' 
                : 'bg-slate-800 hover:bg-slate-900 text-white'
            }`}
          >
            {isEditingIps ? (
              <>
                <Save size={18} />
                Save Changes
              </>
            ) : (
              <>
                <FileText size={18} />
                Edit IPS
              </>
            )}
          </button>
        </div>

        <div className="space-y-8">
          {(isEditingIps ? tempIps : ips).map((section) => (
            <div key={section.id} className="group">
              <h3 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                {section.title}
              </h3>
              {isEditingIps ? (
                <textarea
                  value={section.content}
                  onChange={(e) => handleIpsChange(section.id, e.target.value)}
                  className="w-full h-32 p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-600 leading-relaxed resize-y bg-slate-50"
                  placeholder={`Enter your ${section.title.toLowerCase()}...`}
                />
              ) : (
                <div className="pl-3.5 border-l border-slate-200">
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{section.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {!isEditingIps && (
             <div className="mt-12 p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3 text-amber-800 text-sm">
                 <div className="shrink-0 pt-0.5">⚠️</div>
                 <p>Review this document annually or during major life changes. Sticking to your IPS during market volatility is its primary purpose.</p>
             </div>
        )}
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      {/* Sidebar / Navigation */}
      <nav className="fixed bottom-0 sm:top-0 w-full sm:w-20 sm:h-screen bg-white border-t sm:border-r border-slate-200 z-50 flex sm:flex-col justify-around sm:justify-start sm:pt-8 p-2 sm:p-0 shadow-lg sm:shadow-none">
         <div className="hidden sm:flex items-center justify-center mb-8 text-blue-600">
             <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center font-bold text-xl">
                 P
             </div>
         </div>
         
         <button 
           onClick={() => setActiveTab('dashboard')}
           className={`p-3 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
         >
           <LayoutDashboard size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
           <span className="text-[10px] sm:hidden font-medium">Dash</span>
         </button>

         <button 
           onClick={() => setActiveTab('portfolio')}
           className={`p-3 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${activeTab === 'portfolio' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
         >
           <Wallet size={24} strokeWidth={activeTab === 'portfolio' ? 2.5 : 2} />
           <span className="text-[10px] sm:hidden font-medium">Assets</span>
         </button>

         <button 
           onClick={() => setActiveTab('ips')}
           className={`p-3 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${activeTab === 'ips' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
         >
           <FileText size={24} strokeWidth={activeTab === 'ips' ? 2.5 : 2} />
           <span className="text-[10px] sm:hidden font-medium">IPS</span>
         </button>
      </nav>

      {/* Main Content Area */}
      <main className="pb-24 sm:pl-20 sm:pb-8">
        <header className="px-6 py-6 sm:px-8 sm:py-8 bg-white border-b border-slate-200 mb-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold text-slate-800">
                    {activeTab === 'dashboard' && 'Dashboard'}
                    {activeTab === 'portfolio' && 'Portfolio Management'}
                    {activeTab === 'ips' && 'Investment Policy'}
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    {activeTab === 'dashboard' && 'Overview of your financial health.'}
                    {activeTab === 'portfolio' && 'Track and edit your positions.'}
                    {activeTab === 'ips' && 'Your strategy and rules.'}
                </p>
            </div>
        </header>

        <div className="px-4 sm:px-8 max-w-6xl mx-auto">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'portfolio' && renderPortfolio()}
            {activeTab === 'ips' && renderIPS()}
        </div>
      </main>
    </div>
  );
}
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

type TimeFilter = 'week' | 'month' | 'lastmonth' | 'all';
type ChartTab = 'bar' | 'stacked' | 'pie' | 'line';

interface HirerTally { hirerId: number; hirerName: string; count: number; }
interface VenueData { venueId: number; venueName: string; hirers: HirerTally[]; }
interface HirerTotal { hirerId: number; hirerName: string; total: number; }
interface UtilPoint { date: string; count: number; }

interface StatsData {
  perVenueData: VenueData[];
  totalPerHirer: HirerTotal[];
  utilizationOverTime: UtilPoint[];
}

const PALETTE = ['#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6'];
const TIME_LABELS: Record<TimeFilter, string> = { week: 'This Week', month: 'This Month', lastmonth: 'Last Month', all: 'All Time' };
const CHART_TABS: { id: ChartTab; label: string }[] = [
  { id: 'bar', label: '📊 Bar (per venue)' },
  { id: 'stacked', label: '📈 Stacked Bar (total)' },
  { id: 'pie', label: '🥧 Pie (activity)' },
  { id: 'line', label: '📉 Line (utilization)' },
];

const ApplicantChart = () => {
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<TimeFilter>('all');
  const [chartTab, setChartTab] = useState<ChartTab>('bar');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    fetch(`${API}/booking/stats/${currentUser.id}?filter=${filter}`)
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [currentUser, filter]);

  const allHirers = useMemo(() => {
    if (!stats) return [];
    const map = new Map<number, string>();
    stats.perVenueData.forEach(v => v.hirers.forEach(h => map.set(h.hirerId, h.hirerName)));
    return Array.from(map.entries()).map(([id, name]) => ({ hirerId: id, hirerName: name }));
  }, [stats]);

  if (loading) return <p className="text-center text-gray-400 py-10">Loading analytics...</p>;
  if (!stats) return <p className="text-center text-gray-400 py-10">No data available.</p>;

  const isEmpty = stats.perVenueData.length === 0 && stats.totalPerHirer.length === 0;

  return (
    <div className="space-y-6">
      {/* Time filter */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Time period:</span>
          {(Object.keys(TIME_LABELS) as TimeFilter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors font-medium ${filter === f ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
              {TIME_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart type tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto w-fit">
        {CHART_TABS.map(t => (
          <button key={t.id} onClick={() => setChartTab(t.id)}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${chartTab === t.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>No booking data for {TIME_LABELS[filter].toLowerCase()}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {chartTab === 'bar' && <BarChart data={stats.perVenueData} allHirers={allHirers} />}
          {chartTab === 'stacked' && <StackedBarChart data={stats.perVenueData} allHirers={allHirers} />}
          {chartTab === 'pie' && <PieChart data={stats.totalPerHirer} />}
          {chartTab === 'line' && <LineChart data={stats.utilizationOverTime} />}
        </div>
      )}
    </div>
  );
};

/* ---- Chart 1: Bar — hirers per venue ---- */
const BarChart = ({ data, allHirers }: { data: VenueData[]; allHirers: { hirerId: number; hirerName: string }[] }) => {
  const maxCount = Math.max(...data.flatMap(v => v.hirers.map(h => h.count)), 1);
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Hirers per Venue</h2>
      <div className="space-y-8">
        {data.map(venue => (
          <div key={venue.venueId}>
            <p className="text-sm font-semibold text-gray-800 mb-3">{venue.venueName}</p>
            <div className="space-y-3">
              {venue.hirers.length === 0 ? <p className="text-xs text-gray-400">No bookings</p> : venue.hirers.map((h, i) => (
                <div key={h.hirerId} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-gray-600 text-right truncate">{h.hirerName.split(' ')[0]}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
                    <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${Math.max((h.count / maxCount) * 100, 5)}%`, backgroundColor: PALETTE[i % PALETTE.length] }}>
                      <span className="text-xs font-bold text-white">{h.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
        {allHirers.slice(0, 8).map((h, i) => (
          <div key={h.hirerId} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }}></div>
            <span className="text-xs text-gray-500">{h.hirerName.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---- Chart 2: Stacked Bar — total hirers across all venues ---- */
const StackedBarChart = ({ data, allHirers }: { data: VenueData[]; allHirers: { hirerId: number; hirerName: string }[] }) => {
  const maxTotal = Math.max(...data.map(v => v.hirers.reduce((s, h) => s + h.count, 0)), 1);
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Combined Hirers (Stacked by Venue)</h2>
      <div className="space-y-4">
        {data.map(venue => {
          const total = venue.hirers.reduce((s, h) => s + h.count, 0);
          return (
            <div key={venue.venueId} className="flex items-center gap-3">
              <div className="w-36 text-xs text-gray-600 text-right truncate">{venue.venueName}</div>
              <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden flex">
                {venue.hirers.map((h, i) => (
                  <div key={h.hirerId} title={`${h.hirerName}: ${h.count}`}
                    className="h-full transition-all duration-500 relative group"
                    style={{ width: `${(h.count / maxTotal) * 100}%`, backgroundColor: PALETTE[i % PALETTE.length] }}>
                    <span className="hidden group-hover:flex absolute inset-0 items-center justify-center text-xs text-white font-bold">{h.count}</span>
                  </div>
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-700 w-8 text-right">{total}</span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100">
        {allHirers.slice(0, 8).map((h, i) => (
          <div key={h.hirerId} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }}></div>
            <span className="text-xs text-gray-500">{h.hirerName.split(' ')[0]}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">Hover bars to see individual counts</p>
    </div>
  );
};

/* ---- Chart 3: Pie — most/least active hirers ---- */
const PieChart = ({ data }: { data: HirerTotal[] }) => {
  const total = data.reduce((s, h) => s + h.total, 0) || 1;
  const most = data[0];
  const least = data[data.length - 1];
  let cumulative = 0;
  const slices = data.slice(0, 8).map((h, i) => {
    const pct = (h.total / total) * 100;
    const startAngle = (cumulative / 100) * 360;
    cumulative += pct;
    const endAngle = (cumulative / 100) * 360;
    return { ...h, pct, startAngle, endAngle, color: PALETTE[i % PALETTE.length] };
  });

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  const arc = (cx: number, cy: number, r: number, s: number, e: number) => {
    const start = polarToCartesian(cx, cy, r, e);
    const end = polarToCartesian(cx, cy, r, s);
    const large = e - s <= 180 ? '0' : '1';
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} Z`;
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Hirer Activity Distribution</h2>
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <svg width="220" height="220" viewBox="0 0 220 220">
          {slices.map(s => (
            <path key={s.hirerId} d={arc(110, 110, 95, s.startAngle, s.endAngle)} fill={s.color} stroke="white" strokeWidth="2" />
          ))}
          <circle cx="110" cy="110" r="40" fill="white" />
          <text x="110" y="108" textAnchor="middle" className="text-xs" fill="#374151" fontSize="11" fontWeight="600">{total}</text>
          <text x="110" y="122" textAnchor="middle" fill="#9ca3af" fontSize="9">bookings</text>
        </svg>
        <div className="flex-1 space-y-2">
          {slices.map(s => (
            <div key={s.hirerId} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }}></div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-700 truncate">{s.hirerName}</span>
              </div>
              <span className="text-xs font-semibold text-gray-900 w-8 text-right">{s.total}</span>
              <span className="text-xs text-gray-400 w-10 text-right">{s.pct.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
      {most && least && most.hirerId !== least.hirerId && (
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100">
          <div className="bg-indigo-50 rounded-xl p-3">
            <p className="text-xs text-indigo-500 font-medium uppercase mb-1">Most Active</p>
            <p className="font-bold text-gray-900 text-sm">{most.hirerName}</p>
            <p className="text-xs text-indigo-600">{most.total} booking{most.total !== 1 ? 's' : ''}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3">
            <p className="text-xs text-amber-500 font-medium uppercase mb-1">Least Active</p>
            <p className="font-bold text-gray-900 text-sm">{least.hirerName}</p>
            <p className="text-xs text-amber-600">{least.total} booking{least.total !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---- Chart 4: Line — venue utilization over time ---- */
const LineChart = ({ data }: { data: UtilPoint[] }) => {
  if (data.length === 0) return <p className="text-center text-gray-400 py-8">No utilization data for this period.</p>;

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const W = 560, H = 220, PAD = { top: 20, right: 20, bottom: 40, left: 40 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const pts = data.map((d, i) => ({
    x: PAD.left + (i / Math.max(data.length - 1, 1)) * innerW,
    y: PAD.top + innerH - (d.count / maxCount) * innerH,
    ...d,
  }));

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const area = `M ${pts[0]?.x} ${PAD.top + innerH} L ${pts.map(p => `${p.x},${p.y}`).join(' L ')} L ${pts[pts.length - 1]?.x} ${PAD.top + innerH} Z`;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Venue Utilization Over Time</h2>
      <div className="overflow-x-auto">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="min-w-full">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(pct => {
            const y = PAD.top + innerH - pct * innerH;
            return (
              <g key={pct}>
                <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                <text x={PAD.left - 5} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{Math.round(pct * maxCount)}</text>
              </g>
            );
          })}
          {/* Axes */}
          <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH} stroke="#d1d5db" strokeWidth="1" />
          <line x1={PAD.left} y1={PAD.top + innerH} x2={PAD.left + innerW} y2={PAD.top + innerH} stroke="#d1d5db" strokeWidth="1" />
          {/* Area fill */}
          <path d={area} fill="url(#areaGrad)" />
          {/* Line */}
          <polyline points={polyline} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {/* Points + labels */}
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#6366f1" stroke="white" strokeWidth="2" />
              {pts.length <= 15 && (
                <text x={p.x} y={PAD.top + innerH + 15} textAnchor="middle" fontSize="8" fill="#9ca3af" transform={pts.length > 8 ? `rotate(-45 ${p.x} ${PAD.top + innerH + 15})` : ''}>
                  {p.date.slice(5)}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="w-4 h-0.5 bg-indigo-500"></div>
        <span className="text-xs text-gray-500">Booking submissions per day</span>
      </div>
    </div>
  );
};

export default ApplicantChart;

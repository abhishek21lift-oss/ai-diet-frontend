import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../services/api';
import { useAuthStore } from '../context/authStore';
import { Users, UtensilsCrossed, TrendingUp, Plus, ArrowRight, Target } from 'lucide-react';

const GOAL_COLORS: Record<string, string> = {
  FAT_LOSS: 'text-orange-400 bg-orange-900/30',
  MUSCLE_GAIN: 'text-blue-400 bg-blue-900/30',
  MAINTENANCE: 'text-green-400 bg-green-900/30',
  BODY_RECOMPOSITION: 'text-purple-400 bg-purple-900/30',
};

const GOAL_LABELS: Record<string, string> = {
  FAT_LOSS: 'Fat Loss',
  MUSCLE_GAIN: 'Muscle Gain',
  MAINTENANCE: 'Maintenance',
  BODY_RECOMPOSITION: 'Recomposition',
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.stats().then((r) => r.data.data),
  });

  const stats = data?.stats;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Good {getGreeting()}, {user?.trainer?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          {user?.trainer?.gymName} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: 'Total Clients',
            value: stats?.totalClients ?? '—',
            icon: Users,
            color: 'text-emerald-400',
            bg: 'bg-emerald-900/20',
            border: 'border-emerald-800/40',
          },
          {
            label: 'Diet Plans Created',
            value: stats?.totalDietPlans ?? '—',
            icon: UtensilsCrossed,
            color: 'text-blue-400',
            bg: 'bg-blue-900/20',
            border: 'border-blue-800/40',
          },
          {
            label: 'New This Month',
            value: stats?.newClientsThisMonth ?? '—',
            icon: TrendingUp,
            color: 'text-orange-400',
            bg: 'bg-orange-900/20',
            border: 'border-orange-800/40',
          },
        ].map((stat) => (
          <div key={stat.label} className={`card p-5 border ${stat.border}`}>
            <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">
              {isLoading ? <div className="h-8 w-16 bg-slate-800 rounded animate-pulse" /> : stat.value}
            </div>
            <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Clients */}
        <div className="col-span-2 card">
          <div className="flex items-center justify-between p-5 border-b border-slate-800">
            <h2 className="font-semibold text-white">Recent Clients</h2>
            <Link to="/clients/add" className="btn-primary text-xs py-1.5 px-3">
              <Plus className="w-3.5 h-3.5" /> Add Client
            </Link>
          </div>
          <div className="divide-y divide-slate-800">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-slate-800 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-800 rounded w-32 animate-pulse" />
                      <div className="h-2.5 bg-slate-800 rounded w-24 animate-pulse" />
                    </div>
                  </div>
                ))
              : data?.recentClients?.length === 0
              ? (
                <div className="p-12 text-center text-slate-500">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No clients yet. Add your first client!</p>
                  <Link to="/clients/add" className="btn-primary mt-4 mx-auto w-fit text-xs">
                    <Plus className="w-3.5 h-3.5" /> Add Client
                  </Link>
                </div>
              )
              : data?.recentClients?.map((client: any) => (
                  <Link key={client.id} to={`/clients/${client.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-slate-800/40 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {client.fullName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-100">{client.fullName}</div>
                      <div className="text-xs text-slate-500">BMI: {client.bmi}</div>
                    </div>
                    <span className={`badge text-xs ${GOAL_COLORS[client.fitnessGoal]}`}>
                      {GOAL_LABELS[client.fitnessGoal]}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                  </Link>
                ))}
          </div>
        </div>

        {/* Goal Breakdown */}
        <div className="card">
          <div className="p-5 border-b border-slate-800">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" /> Goal Breakdown
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 bg-slate-800 rounded animate-pulse" />
                ))
              : data?.goalBreakdown?.map((item: any) => {
                  const total = data.stats.totalClients || 1;
                  const pct = Math.round((item._count / total) * 100);
                  return (
                    <div key={item.fitnessGoal}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{GOAL_LABELS[item.fitnessGoal]}</span>
                        <span className="text-slate-300 font-medium">{item._count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            {!isLoading && !data?.goalBreakdown?.length && (
              <p className="text-slate-500 text-xs text-center py-4">No data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

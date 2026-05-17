import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { clientApi } from '../services/api';
import { Plus, Search, Users, Trash2, ArrowRight, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const GOAL_COLORS: Record<string, string> = {
  FAT_LOSS: 'text-orange-400 bg-orange-900/30 border-orange-800/30',
  MUSCLE_GAIN: 'text-blue-400 bg-blue-900/30 border-blue-800/30',
  MAINTENANCE: 'text-green-400 bg-green-900/30 border-green-800/30',
  BODY_RECOMPOSITION: 'text-purple-400 bg-purple-900/30 border-purple-800/30',
};
const GOAL_LABELS: Record<string, string> = {
  FAT_LOSS: 'Fat Loss', MUSCLE_GAIN: 'Muscle Gain',
  MAINTENANCE: 'Maintenance', BODY_RECOMPOSITION: 'Recomp',
};
const DIET_LABELS: Record<string, string> = {
  VEG: '🥦 Veg', VEGAN: '🌱 Vegan', NON_VEG: '🍗 Non-Veg', JAIN: '🪔 Jain',
};

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [goalFilter, setGoalFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['clients', search, goalFilter],
    queryFn: () => clientApi.list({ search, goal: goalFilter }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientApi.delete(id),
    onSuccess: () => {
      toast.success('Client removed');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: () => toast.error('Failed to delete client'),
  });

  const clients = data?.data ?? [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-slate-400 text-sm mt-1">
            {data?.pagination?.total ?? 0} total clients
          </p>
        </div>
        <Link to="/clients/add" className="btn-primary">
          <Plus className="w-4 h-4" /> Add New Client
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select
            value={goalFilter}
            onChange={(e) => setGoalFilter(e.target.value)}
            className="input pl-10 pr-8 appearance-none w-44"
          >
            <option value="">All Goals</option>
            <option value="FAT_LOSS">Fat Loss</option>
            <option value="MUSCLE_GAIN">Muscle Gain</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="BODY_RECOMPOSITION">Recomposition</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-slate-800">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-800 rounded w-40 animate-pulse" />
                  <div className="h-2.5 bg-slate-800 rounded w-28 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-700" />
            <p className="text-slate-400 font-medium">No clients found</p>
            <p className="text-slate-600 text-sm mt-1">
              {search || goalFilter ? 'Try adjusting your filters' : 'Add your first client to get started'}
            </p>
            {!search && !goalFilter && (
              <Link to="/clients/add" className="btn-primary mt-4 mx-auto w-fit">
                <Plus className="w-4 h-4" /> Add Client
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-slate-800/50 border-b border-slate-800 text-xs font-medium text-slate-500 uppercase tracking-wide">
              <div className="col-span-2">Client</div>
              <div>Goal</div>
              <div>Diet</div>
              <div>BMI / Calories</div>
              <div className="text-right">Actions</div>
            </div>
            <div className="divide-y divide-slate-800">
              {clients.map((client: any) => (
                <div key={client.id} className="grid grid-cols-6 gap-4 px-4 py-3.5 items-center hover:bg-slate-800/30 transition-colors">
                  {/* Name */}
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {client.fullName[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-100 truncate">{client.fullName}</div>
                      <div className="text-xs text-slate-500 truncate">{client.mobile}</div>
                    </div>
                  </div>
                  {/* Goal */}
                  <div>
                    <span className={`badge border text-xs ${GOAL_COLORS[client.fitnessGoal]}`}>
                      {GOAL_LABELS[client.fitnessGoal]}
                    </span>
                  </div>
                  {/* Diet */}
                  <div className="text-sm text-slate-400">{DIET_LABELS[client.dietType]}</div>
                  {/* Metrics */}
                  <div className="text-sm">
                    <span className="text-slate-300 font-mono">{client.bmi}</span>
                    <span className="text-slate-600 mx-1">/</span>
                    <span className="text-emerald-400 font-mono text-xs">{client.dailyCalories} kcal</span>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/clients/${client.id}`}
                      className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-900/30 rounded-lg transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${client.fullName}?`)) {
                          deleteMutation.mutate(client.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

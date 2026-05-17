import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi, progressApi } from '../services/api';
import {
  ChevronLeft, UtensilsCrossed, TrendingUp, Activity,
  Scale, Flame, Beef, Wheat, Droplets, Plus, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const GOAL_COLORS: Record<string, string> = {
  FAT_LOSS: 'text-orange-400 bg-orange-900/30',
  MUSCLE_GAIN: 'text-blue-400 bg-blue-900/30',
  MAINTENANCE: 'text-green-400 bg-green-900/30',
  BODY_RECOMPOSITION: 'text-purple-400 bg-purple-900/30',
};

function MetricCard({ icon: Icon, label, value, unit, color }: any) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-slate-800`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-lg font-bold text-white font-mono">
          {value} <span className="text-xs text-slate-500 font-normal">{unit}</span>
        </div>
      </div>
    </div>
  );
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [progressForm, setProgressForm] = useState({ weightKg: '', notes: '' });
  const [showProgressForm, setShowProgressForm] = useState(false);

  const { data: clientData, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientApi.get(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: progressData } = useQuery({
    queryKey: ['progress', id],
    queryFn: () => progressApi.list(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const progressMutation = useMutation({
    mutationFn: (data: any) => progressApi.add(id!, data),
    onSuccess: () => {
      toast.success('Progress recorded!');
      queryClient.invalidateQueries({ queryKey: ['progress', id] });
      setProgressForm({ weightKg: '', notes: '' });
      setShowProgressForm(false);
    },
    onError: () => toast.error('Failed to record progress'),
  });

  if (isLoading) return (
    <div className="p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-800 rounded w-48" />
        <div className="h-32 bg-slate-800 rounded" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-slate-800 rounded" />)}
        </div>
      </div>
    </div>
  );

  const client = clientData;
  if (!client) return null;

  const activePlan = client.dietPlans?.[0];
  const DIET_ICONS: Record<string, string> = { VEG: '🥦', VEGAN: '🌱', NON_VEG: '🍗', JAIN: '🪔' };

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/clients')} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-lg font-bold text-white">
            {client.fullName[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{client.fullName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-slate-400 text-sm">{client.email}</span>
              <span className="text-slate-700">·</span>
              <span className="text-slate-400 text-sm">{client.mobile}</span>
              <span className="text-slate-700">·</span>
              <span className="text-slate-400 text-sm">{client.age}y</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/clients/${id}/diet`} className="btn-primary text-sm">
            <UtensilsCrossed className="w-4 h-4" />
            {activePlan ? 'View Diet Plan' : 'Generate Diet Plan'}
          </Link>
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-6">
        <span className={`badge border border-current text-xs ${GOAL_COLORS[client.fitnessGoal]}`}>
          {client.fitnessGoal.replace('_', ' ')}
        </span>
        <span className="badge bg-slate-800 text-slate-300 text-xs">
          {DIET_ICONS[client.dietType]} {client.dietType}
        </span>
        <span className="badge bg-slate-800 text-slate-300 text-xs">
          {client.bodyType}
        </span>
        <span className="badge bg-slate-800 text-slate-300 text-xs">
          {client.gender}
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <MetricCard icon={Scale} label="BMI" value={client.bmi} unit="" color="text-blue-400" />
        <MetricCard icon={Flame} label="Daily Calories" value={client.dailyCalories} unit="kcal" color="text-orange-400" />
        <MetricCard icon={Beef} label="Protein" value={client.proteinGrams} unit="g" color="text-red-400" />
        <MetricCard icon={Activity} label="TDEE" value={client.tdee} unit="kcal" color="text-emerald-400" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Body Info */}
        <div className="col-span-2 space-y-4">
          {/* Body Details */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Body & Lifestyle</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {[
                ['Height', `${client.heightCm} cm`],
                ['Weight', `${client.weightKg} kg`],
                ['Body Fat', client.bodyFatPct ? `${client.bodyFatPct}%` : '—'],
                ['Activity', client.activityLevel.replace('_', ' ')],
                ['Sleep', `${client.sleepHours}h`],
                ['Water', `${client.waterIntakeLtr}L`],
                ['Experience', client.workoutExperience],
                ['BMR', `${client.bmr} kcal`],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-slate-500 text-xs">{label}</div>
                  <div className="text-slate-200 font-medium mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical */}
          {(client.medicalConditions?.length > 0 || client.injuries?.length > 0 || client.allergies?.length > 0) && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Medical & Restrictions</h3>
              <div className="space-y-2">
                {client.medicalConditions?.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs text-slate-500">Conditions:</span>
                    {client.medicalConditions.map((c: string) => (
                      <span key={c} className="badge bg-red-900/30 text-red-400 text-xs">{c}</span>
                    ))}
                  </div>
                )}
                {client.injuries?.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs text-slate-500">Injuries:</span>
                    {client.injuries.map((i: string) => (
                      <span key={i} className="badge bg-yellow-900/30 text-yellow-400 text-xs">{i}</span>
                    ))}
                  </div>
                )}
                {client.allergies?.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs text-slate-500">Allergies:</span>
                    {client.allergies.map((a: string) => (
                      <span key={a} className="badge bg-orange-900/30 text-orange-400 text-xs">{a}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress History */}
          <div className="card">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-300">Progress Records</h3>
              <button onClick={() => setShowProgressForm(!showProgressForm)} className="btn-secondary text-xs py-1 px-3">
                <Plus className="w-3.5 h-3.5" /> Log Progress
              </button>
            </div>

            {showProgressForm && (
              <div className="p-4 border-b border-slate-800 bg-slate-800/30">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="label">Weight (kg)</label>
                    <input className="input" type="number" placeholder="80.5"
                      value={progressForm.weightKg} onChange={(e) => setProgressForm((p) => ({ ...p, weightKg: e.target.value }))} />
                  </div>
                  <div className="flex-1">
                    <label className="label">Notes</label>
                    <input className="input" placeholder="Feeling great..."
                      value={progressForm.notes} onChange={(e) => setProgressForm((p) => ({ ...p, notes: e.target.value }))} />
                  </div>
                  <div className="flex items-end">
                    <button onClick={() => progressMutation.mutate(progressForm)} disabled={!progressForm.weightKg || progressMutation.isPending} className="btn-primary py-2">
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="divide-y divide-slate-800">
              {progressData?.length === 0 && (
                <p className="p-6 text-center text-slate-600 text-sm">No progress records yet</p>
              )}
              {progressData?.slice(0, 6).map((r: any) => (
                <div key={r.id} className="flex items-center gap-4 px-5 py-3">
                  <TrendingUp className="w-4 h-4 text-slate-600" />
                  <div className="flex-1">
                    <span className="text-slate-200 font-mono font-medium">{r.weightKg} kg</span>
                    {r.notes && <span className="text-slate-500 text-xs ml-3">{r.notes}</span>}
                  </div>
                  <span className="text-slate-600 text-xs">
                    {new Date(r.recordedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Active Diet Plan preview */}
        <div>
          <div className="card">
            <div className="p-4 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-300">Active Diet Plan</h3>
            </div>
            {activePlan ? (
              <div className="p-4">
                <div className="text-xs text-slate-500 mb-3">{activePlan.planName}</div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    ['Calories', `${activePlan.totalCalories}`, 'text-orange-400'],
                    ['Protein', `${activePlan.proteinGrams}g`, 'text-red-400'],
                    ['Carbs', `${activePlan.carbsGrams}g`, 'text-yellow-400'],
                    ['Fats', `${activePlan.fatsGrams}g`, 'text-blue-400'],
                  ].map(([l, v, c]) => (
                    <div key={l} className="bg-slate-800/50 rounded-lg p-2 text-center">
                      <div className={`text-sm font-bold font-mono ${c}`}>{v}</div>
                      <div className="text-xs text-slate-500">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  {activePlan.meals?.slice(0, 4).map((meal: any) => (
                    <div key={meal.id} className="flex justify-between text-xs py-1 border-b border-slate-800">
                      <span className="text-slate-400">{meal.mealTime} · {meal.mealName}</span>
                      <span className="text-slate-300 font-mono">{meal.calories} kcal</span>
                    </div>
                  ))}
                </div>
                <Link to={`/clients/${id}/diet`} className="btn-secondary w-full justify-center mt-4 text-xs">
                  View Full Plan
                </Link>
              </div>
            ) : (
              <div className="p-6 text-center">
                <UtensilsCrossed className="w-8 h-8 mx-auto mb-3 text-slate-700" />
                <p className="text-slate-500 text-sm">No diet plan yet</p>
                <Link to={`/clients/${id}/diet`} className="btn-primary mt-3 mx-auto w-fit text-xs">
                  Generate AI Plan
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

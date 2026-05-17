import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi, dietApi } from '../services/api';
import { ChevronLeft, Sparkles, Clock, Flame, Beef, Wheat, Droplets, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

function MacroBadge({ icon: Icon, label, value, color }: any) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800`}>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
    </div>
  );
}

export default function DietPlanPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  const { data: client } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientApi.get(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['diet-plans', id],
    queryFn: () => dietApi.list(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const generateMutation = useMutation({
    mutationFn: () => dietApi.generate(id!),
    onSuccess: () => {
      toast.success('AI diet plan generated!');
      queryClient.invalidateQueries({ queryKey: ['diet-plans', id] });
      queryClient.invalidateQueries({ queryKey: ['client', id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'AI generation failed. Check your Anthropic API key.');
    },
  });

  const activePlan = plans?.[0];

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/clients/${id}`)} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Diet Plan</h1>
            <p className="text-slate-400 text-sm">{client?.fullName}</p>
          </div>
        </div>
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="btn-primary"
        >
          {generateMutation.isPending ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
          ) : activePlan ? (
            <><RefreshCw className="w-4 h-4" /> Regenerate Plan</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate AI Plan</>
          )}
        </button>
      </div>

      {/* Generating state */}
      {generateMutation.isPending && (
        <div className="card p-10 text-center mb-6">
          <div className="w-14 h-14 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderWidth: 3 }} />
          <p className="text-emerald-400 font-medium">Claude AI is crafting your personalized diet plan...</p>
          <p className="text-slate-500 text-sm mt-1">Analysing client profile, calculating macros, building meals</p>
        </div>
      )}

      {/* No plan yet */}
      {!plansLoading && !activePlan && !generateMutation.isPending && (
        <div className="card p-16 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-700" />
          <h2 className="text-lg font-semibold text-slate-300 mb-2">No Diet Plan Yet</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            Generate a personalized AI diet plan for {client?.fullName} based on their goal ({client?.fitnessGoal?.replace('_', ' ')}), body metrics and food preferences.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6 text-sm">
            {[
              ['Goal', client?.fitnessGoal?.replace('_', ' ')],
              ['Calories', `${client?.dailyCalories} kcal`],
              ['Diet', client?.dietType],
            ].map(([l, v]) => (
              <div key={l} className="bg-slate-800 rounded-lg p-3">
                <div className="text-slate-500 text-xs">{l}</div>
                <div className="text-slate-200 font-medium mt-0.5 text-xs">{v}</div>
              </div>
            ))}
          </div>
          <button onClick={() => generateMutation.mutate()} className="btn-primary mx-auto">
            <Sparkles className="w-4 h-4" /> Generate Now
          </button>
        </div>
      )}

      {/* Active plan */}
      {activePlan && !generateMutation.isPending && (
        <>
          {/* Plan header card */}
          <div className="card p-5 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-white">{activePlan.planName}</h2>
                  {activePlan.aiGenerated && (
                    <span className="badge bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 text-xs">
                      <Sparkles className="w-3 h-3 inline mr-1" />AI Generated
                    </span>
                  )}
                </div>
                {activePlan.planSummary && (
                  <p className="text-slate-400 text-sm mt-1 max-w-2xl">{activePlan.planSummary}</p>
                )}
              </div>
              <div className="text-xs text-slate-500">
                {new Date(activePlan.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <MacroBadge icon={Flame} label="Calories" value={`${activePlan.totalCalories} kcal`} color="text-orange-400" />
              <MacroBadge icon={Beef} label="Protein" value={`${activePlan.proteinGrams}g`} color="text-red-400" />
              <MacroBadge icon={Wheat} label="Carbs" value={`${activePlan.carbsGrams}g`} color="text-yellow-400" />
              <MacroBadge icon={Droplets} label="Fats" value={`${activePlan.fatsGrams}g`} color="text-blue-400" />
            </div>
          </div>

          {/* Meals */}
          <div className="space-y-3 mb-4">
            {activePlan.meals?.map((meal: any) => (
              <div key={meal.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {meal.mealTime}
                    </div>
                    <h3 className="font-semibold text-slate-200">{meal.mealName}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-3 text-xs">
                      <span className="text-orange-400 font-mono">{meal.calories} kcal</span>
                      <span className="text-red-400 font-mono">{meal.proteinGrams}g P</span>
                      <span className="text-yellow-400 font-mono">{meal.carbsGrams}g C</span>
                    </div>
                    {expandedMeal === meal.id ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </button>

                {expandedMeal === meal.id && (
                  <div className="border-t border-slate-800">
                    <div className="grid grid-cols-4 gap-0 px-4 py-2 bg-slate-800/30 text-xs text-slate-500 font-medium uppercase tracking-wide">
                      <div>Food Item</div>
                      <div>Quantity</div>
                      <div>Macros</div>
                      <div>Alternatives</div>
                    </div>
                    {meal.foods?.map((food: any) => (
                      <div key={food.id} className="grid grid-cols-4 gap-0 px-4 py-3 border-t border-slate-800/50 text-sm">
                        <div className="text-slate-200 font-medium">{food.foodName}</div>
                        <div className="text-slate-400 font-mono">{food.quantity}</div>
                        <div className="space-y-0.5">
                          <div className="text-orange-400 text-xs font-mono">{food.calories} kcal</div>
                          <div className="text-slate-500 text-xs">P:{food.protein}g C:{food.carbs}g F:{food.fats}g</div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {food.alternatives?.slice(0, 2).map((alt: string) => (
                            <span key={alt} className="badge bg-slate-800 text-slate-400 text-xs">{alt}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tips & supplements */}
          {(activePlan.hydrationTips || activePlan.supplementSuggestions?.length > 0) && (
            <div className="grid grid-cols-2 gap-4">
              {activePlan.hydrationTips && (
                <div className="card p-4">
                  <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2">💧 Hydration Tips</h4>
                  <p className="text-slate-400 text-sm">{activePlan.hydrationTips}</p>
                </div>
              )}
              {activePlan.supplementSuggestions?.length > 0 && (
                <div className="card p-4">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">💊 Supplements</h4>
                  <div className="flex flex-wrap gap-1">
                    {activePlan.supplementSuggestions.map((s: string) => (
                      <span key={s} className="badge bg-emerald-900/30 text-emerald-400 text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Trainer notes */}
          {activePlan.trainerNotes && (
            <div className="card p-4 mt-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">📋 Trainer Notes</h4>
              <p className="text-slate-300 text-sm">{activePlan.trainerNotes}</p>
            </div>
          )}
        </>
      )}

      {/* Plan history */}
      {plans?.length > 1 && (
        <div className="card mt-6">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300">Plan History</h3>
          </div>
          <div className="divide-y divide-slate-800">
            {plans.slice(1).map((plan: any) => (
              <div key={plan.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div className="text-slate-400">{plan.planName}</div>
                <div className="text-slate-500 text-xs">
                  {new Date(plan.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

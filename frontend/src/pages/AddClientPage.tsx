import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '../services/api';
import { ChevronLeft, ChevronRight, Check, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = ['Personal Info', 'Body Metrics', 'Lifestyle & Goal', 'Nutrition & Medical'];

const defaultForm = {
  // Personal
  fullName: '', mobile: '', email: '', gender: 'MALE', dateOfBirth: '', age: '',
  // Body
  heightCm: '', weightKg: '', bodyFatPct: '', bodyType: 'MESOMORPH',
  // Lifestyle
  activityLevel: 'MODERATELY_ACTIVE', sleepHours: '7', waterIntakeLtr: '2.5',
  workoutExperience: 'INTERMEDIATE', fitnessGoal: 'FAT_LOSS',
  // Nutrition
  dietType: 'NON_VEG', allergies: '', foodsToAvoid: '',
  // Medical
  medicalConditions: '', injuries: '', medications: '', notes: '',
};

export default function AddClientPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(defaultForm);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => clientApi.create(data),
    onSuccess: (res) => {
      toast.success('Client added successfully!');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      navigate(`/clients/${res.data.data.id}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to create client');
    },
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    const payload = {
      ...form,
      age: parseInt(form.age) || undefined,
      heightCm: parseFloat(form.heightCm),
      weightKg: parseFloat(form.weightKg),
      bodyFatPct: form.bodyFatPct ? parseFloat(form.bodyFatPct) : undefined,
      sleepHours: parseFloat(form.sleepHours),
      waterIntakeLtr: parseFloat(form.waterIntakeLtr),
      allergies: form.allergies ? form.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
      foodsToAvoid: form.foodsToAvoid ? form.foodsToAvoid.split(',').map((s) => s.trim()).filter(Boolean) : [],
      medicalConditions: form.medicalConditions ? form.medicalConditions.split(',').map((s) => s.trim()).filter(Boolean) : [],
      injuries: form.injuries ? form.injuries.split(',').map((s) => s.trim()).filter(Boolean) : [],
      medications: form.medications ? form.medications.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };
    mutation.mutate(payload);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/clients')} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-emerald-400" /> Add New Client
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">619 Fitness Studio</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-emerald-400' : 'text-slate-600'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                ${i < step ? 'bg-emerald-600 border-emerald-600 text-white'
                  : i === step ? 'border-emerald-500 text-emerald-400'
                  : 'border-slate-700 text-slate-600'}`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className="text-xs font-medium whitespace-nowrap hidden sm:block">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-emerald-600' : 'bg-slate-800'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="card p-6">
        {/* Step 0: Personal Info */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full Name *</label>
                <input className="input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Rahul Sharma" />
              </div>
              <div>
                <label className="label">Mobile *</label>
                <input className="input" value={form.mobile} onChange={(e) => set('mobile', e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="label">Email *</label>
                <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="client@email.com" />
              </div>
              <div>
                <label className="label">Gender *</label>
                <select className="input" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Date of Birth *</label>
                <input className="input" type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Body Metrics */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white mb-4">Body Metrics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Height (cm) *</label>
                <input className="input" type="number" value={form.heightCm} onChange={(e) => set('heightCm', e.target.value)} placeholder="175" />
              </div>
              <div>
                <label className="label">Weight (kg) *</label>
                <input className="input" type="number" value={form.weightKg} onChange={(e) => set('weightKg', e.target.value)} placeholder="80" />
              </div>
              <div>
                <label className="label">Body Fat % (optional)</label>
                <input className="input" type="number" value={form.bodyFatPct} onChange={(e) => set('bodyFatPct', e.target.value)} placeholder="18" />
              </div>
              <div>
                <label className="label">Body Type *</label>
                <select className="input" value={form.bodyType} onChange={(e) => set('bodyType', e.target.value)}>
                  <option value="ECTOMORPH">Ectomorph (Lean / Hard to gain)</option>
                  <option value="MESOMORPH">Mesomorph (Athletic / Muscular)</option>
                  <option value="ENDOMORPH">Endomorph (Stocky / Easy to gain fat)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Lifestyle & Goal */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white mb-4">Lifestyle & Goal</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Activity Level *</label>
                <select className="input" value={form.activityLevel} onChange={(e) => set('activityLevel', e.target.value)}>
                  <option value="SEDENTARY">Sedentary (desk job, no exercise)</option>
                  <option value="LIGHTLY_ACTIVE">Lightly Active (1-3 days/week)</option>
                  <option value="MODERATELY_ACTIVE">Moderately Active (3-5 days/week)</option>
                  <option value="VERY_ACTIVE">Very Active (6-7 days/week)</option>
                  <option value="EXTRA_ACTIVE">Extra Active (athlete / 2x/day)</option>
                </select>
              </div>
              <div>
                <label className="label">Fitness Goal *</label>
                <select className="input" value={form.fitnessGoal} onChange={(e) => set('fitnessGoal', e.target.value)}>
                  <option value="FAT_LOSS">Fat Loss</option>
                  <option value="MUSCLE_GAIN">Muscle Gain</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="BODY_RECOMPOSITION">Body Recomposition</option>
                </select>
              </div>
              <div>
                <label className="label">Sleep Hours / night</label>
                <input className="input" type="number" value={form.sleepHours} onChange={(e) => set('sleepHours', e.target.value)} placeholder="7" />
              </div>
              <div>
                <label className="label">Water Intake (litres/day)</label>
                <input className="input" type="number" value={form.waterIntakeLtr} onChange={(e) => set('waterIntakeLtr', e.target.value)} placeholder="2.5" />
              </div>
              <div className="col-span-2">
                <label className="label">Workout Experience</label>
                <select className="input" value={form.workoutExperience} onChange={(e) => set('workoutExperience', e.target.value)}>
                  <option value="BEGINNER">Beginner (0-6 months)</option>
                  <option value="INTERMEDIATE">Intermediate (6 months - 2 years)</option>
                  <option value="ADVANCED">Advanced (2+ years)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Nutrition & Medical */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white mb-4">Nutrition & Medical</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Diet Type *</label>
                <select className="input" value={form.dietType} onChange={(e) => set('dietType', e.target.value)}>
                  <option value="NON_VEG">Non-Vegetarian</option>
                  <option value="VEG">Vegetarian</option>
                  <option value="VEGAN">Vegan</option>
                  <option value="JAIN">Jain</option>
                </select>
              </div>
              <div>
                <label className="label">Allergies (comma separated)</label>
                <input className="input" value={form.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="Peanuts, Gluten..." />
              </div>
              <div className="col-span-2">
                <label className="label">Foods to Avoid (comma separated)</label>
                <input className="input" value={form.foodsToAvoid} onChange={(e) => set('foodsToAvoid', e.target.value)} placeholder="Dairy, Sugar, Fried foods..." />
              </div>
              <div>
                <label className="label">Medical Conditions (comma separated)</label>
                <input className="input" value={form.medicalConditions} onChange={(e) => set('medicalConditions', e.target.value)} placeholder="Diabetes, Hypertension..." />
              </div>
              <div>
                <label className="label">Injuries (comma separated)</label>
                <input className="input" value={form.injuries} onChange={(e) => set('injuries', e.target.value)} placeholder="Knee injury, Lower back..." />
              </div>
              <div className="col-span-2">
                <label className="label">Notes (optional)</label>
                <textarea className="input min-h-[80px] resize-none" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Any additional notes about this client..." />
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn-secondary disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} className="btn-primary">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
              ) : (
                <><Check className="w-4 h-4" /> Create Client</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

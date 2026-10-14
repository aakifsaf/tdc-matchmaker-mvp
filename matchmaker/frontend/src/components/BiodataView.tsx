import {
  User, MapPin, Briefcase, GraduationCap, Heart, Leaf, Baby,
  Globe, Users, Star, Home, Phone, Mail, ChevronRight
} from 'lucide-react';
import { Customer } from '../types/customer';
import { formatIncome, getDietConfig, getAnswerConfig } from '../lib/utils';

interface BiodataViewProps {
  customer: Customer;
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center space-x-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <div className="p-1.5 bg-rose-50 rounded-lg">
          <Icon className="h-4 w-4 text-rose-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, value, badge, badgeColor }: {
  label: string;
  value: string | number | React.ReactNode;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-slate-50 last:border-b-0">
      <span className="text-xs font-medium text-slate-500 leading-5 flex-shrink-0 w-36">{label}</span>
      <span className="text-sm text-slate-800 font-medium text-right leading-5 flex-1">
        {badge ? (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${badgeColor}`}>
            {badge}
          </span>
        ) : value}
      </span>
    </div>
  );
}

export default function BiodataView({ customer: c }: BiodataViewProps) {
  const dietCfg = getDietConfig(c.diet);
  const kidsCfg = getAnswerConfig(c.want_kids);
  const relocateCfg = getAnswerConfig(c.open_to_relocate);
  const petsCfg = getAnswerConfig(c.open_to_pets);

  return (
    <div className="space-y-4">

      {/* 1. Personal & Identity */}
      <Section icon={User} title="Personal & Physical">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <div>
            <Field label="Full Name" value={`${c.first_name} ${c.last_name}`} />
            <Field label="Gender" value={c.gender} />
            <Field label="Date of Birth" value={new Date(c.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />
            <Field label="Age" value={`${c.age} years`} />
          </div>
          <div>
            <Field label="Height" value={c.height_formatted} />
            <Field label="Current City" value={c.city} />
            <Field label="Hometown" value={c.hometown} />
            <Field label="Country" value={c.country} />
          </div>
        </div>

        {/* Contact */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-3">
          <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
            <Mail className="h-3.5 w-3.5 text-slate-400" />
            <span>{c.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span>{c.phone}</span>
          </div>
        </div>
      </Section>

      {/* 2. Education & Career */}
      <Section icon={GraduationCap} title="Education & Career Pedigree">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <div>
            <Field label="College / University" value={c.ug_college} />
            <Field label="Degree" value={c.degree} />
            <Field label="Current Company" value={c.current_company} />
          </div>
          <div>
            <Field label="Designation" value={c.designation} />
            <Field label="Annual Income" value="" badge={formatIncome(c.income_lpa)} badgeColor="bg-emerald-50 text-emerald-700 border-emerald-200" />
            <Field label="Marital Status" value={c.marital_status} />
          </div>
        </div>
      </Section>

      {/* 3. Cultural & Family */}
      <Section icon={Globe} title="Cultural & Family Background">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <div>
            <Field label="Religion" value={c.religion} />
            <Field label="Caste / Community" value={c.caste} />
            <Field label="Mother Tongue" value={c.mother_tongue} />
          </div>
          <div>
            <Field label="Languages Known" value={c.languages_known.join(', ')} />
            <Field label="Siblings" value={c.siblings} />
            <Field
              label="Family Type"
              value=""
              badge={c.family_type}
              badgeColor={c.family_type === 'Nuclear' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}
            />
          </div>
        </div>
      </Section>

      {/* 4. Lifestyle & Habits */}
      <Section icon={Leaf} title="Lifestyle & Habits">
        <div className="flex flex-wrap gap-3 mb-4">
          {/* Diet */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${dietCfg.color}`}>
            <span>{dietCfg.emoji}</span>
            <span>{c.diet}</span>
          </div>
          {/* Smoking */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${c.smoking === 'Non-Smoker' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            <span>🚭</span>
            <span>{c.smoking}</span>
          </div>
          {/* Drinking */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${c.drinking === 'Non-Drinker' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            <span>🥛</span>
            <span>{c.drinking}</span>
          </div>
          {/* Manglik */}
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${c.manglik_status === 'Non-Manglik' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
            <span>🪐</span>
            <span>{c.manglik_status}</span>
          </div>
        </div>

        {/* Bio Summary */}
        {c.bio_summary && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Bio Summary</p>
            <p className="text-sm text-slate-700 leading-relaxed">{c.bio_summary}</p>
          </div>
        )}
      </Section>

      {/* 5. Dealbreakers & Outlook */}
      <Section icon={Heart} title="Dealbreakers & Life Outlook">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Want Kids', value: c.want_kids, cfg: kidsCfg },
            { label: 'Open to Relocate', value: c.open_to_relocate, cfg: relocateCfg },
            { label: 'Open to Pets', value: c.open_to_pets, cfg: petsCfg }
          ].map(({ label, value, cfg }) => (
            <div
              key={label}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center ${cfg.color}`}
            >
              <span className="text-lg font-bold leading-none">{cfg.emoji}</span>
              <span className="text-[11px] font-semibold mt-1.5 leading-tight">{label}</span>
              <span className="text-xs mt-0.5 font-bold">{value}</span>
            </div>
          ))}
        </div>

        {/* Partner Preferences */}
        {c.partner_preferences_summary && (
          <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1.5">Partner Preferences</p>
            <p className="text-sm text-slate-700 leading-relaxed">{c.partner_preferences_summary}</p>
          </div>
        )}
      </Section>
    </div>
  );
}
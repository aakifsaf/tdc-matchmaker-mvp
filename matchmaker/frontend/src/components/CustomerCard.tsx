'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Briefcase, ArrowRight, ChevronDown } from 'lucide-react';
import { Customer, JourneyStatus } from '../types/customer';
import { getStatusConfig, formatIncome } from '../lib/utils';
import { api } from '../lib/api';

interface CustomerCardProps {
  customer: Customer;
  onStatusChange?: (id: string, newStatus: JourneyStatus) => void;
}

const ALL_STATUSES: JourneyStatus[] = ['New', 'Interviewing', 'Active Matching', 'Matches Sent', 'Matched'];

export default function CustomerCard({ customer, onStatusChange }: CustomerCardProps) {
  const [status, setStatus] = useState<JourneyStatus>(customer.status_tag);
  const [showDropdown, setShowDropdown] = useState(false);
  const [updating, setUpdating] = useState(false);

  const statusCfg = getStatusConfig(status);

  async function handleStatusChange(newStatus: JourneyStatus) {
    setUpdating(true);
    setShowDropdown(false);
    try {
      await api.updateCustomerStatus(customer.id, newStatus);
      setStatus(newStatus);
      onStatusChange?.(customer.id, newStatus);
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group overflow-hidden flex flex-col">
      {/* Top: Photo + Name + Status */}
      <div className="p-4 flex items-start space-x-3">
        {/* Photo */}
        <div className="relative flex-shrink-0">
          <div className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            {customer.photo_url ? (
              <Image
                src={customer.photo_url}
                alt={`${customer.first_name} ${customer.last_name}`}
                width={56}
                height={56}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-slate-100 text-slate-600 font-bold text-lg">
                {customer.first_name[0]}{customer.last_name[0]}
              </div>
            )}
          </div>
          {/* Gender badge */}
          <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold ${customer.gender === 'Male' ? 'bg-blue-500 text-white' : 'bg-rose-500 text-white'}`}>
            {customer.gender === 'Male' ? 'M' : 'F'}
          </div>
        </div>

        {/* Name & Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm leading-tight truncate">
            {customer.first_name} {customer.last_name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {customer.age} yrs · {customer.height_formatted} · {customer.marital_status}
          </p>
          <div className="flex items-center space-x-1 mt-1">
            <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
            <p className="text-xs text-slate-500 truncate">{customer.city}</p>
          </div>
        </div>
      </div>

      {/* Middle: Career Info */}
      <div className="px-4 pb-3 space-y-1.5">
        <div className="flex items-center space-x-1.5">
          <Briefcase className="h-3 w-3 text-slate-400 flex-shrink-0" />
          <p className="text-xs text-slate-600 truncate font-medium">{customer.designation}</p>
        </div>
        <p className="text-xs text-slate-400 truncate pl-4">{customer.current_company}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            {formatIncome(customer.income_lpa)}
          </span>
          <span className="text-xs text-slate-400">{customer.religion} · {customer.diet}</span>
        </div>
      </div>

      {/* Bottom: Status + Action */}
      <div className="px-4 pb-4 pt-1 border-t border-slate-100 mt-auto flex items-center justify-between gap-2">
        {/* Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={updating}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} hover:opacity-80`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${updating ? 'animate-pulse' : ''}`} />
            <span className="truncate max-w-[90px]">{status}</span>
            <ChevronDown className="h-3 w-3 flex-shrink-0" />
          </button>

          {showDropdown && (
            <div className="absolute left-0 bottom-full mb-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-44">
              {ALL_STATUSES.map(s => {
                const cfg = getStatusConfig(s);
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center space-x-2 hover:bg-slate-50 transition-colors ${s === status ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span>{s}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* View Profile */}
        <Link
          href={`/customer/${customer.id}`}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-xs font-semibold transition-all group-hover:bg-rose-600"
        >
          <span>View Profile</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
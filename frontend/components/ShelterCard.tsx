'use client';

import React from 'react';
import { Shelter } from '@/types';
import { useI18n } from '@/hooks/useI18n';
import {
  Home, MapPin, Accessibility, Activity,
  Users, CheckCircle2, ShieldCheck, Clock, Heart
} from 'lucide-react';

interface Props {
  shelter: Shelter;
  distanceMeters?: number;
  estimatedMinutes?: number;
}

export default function ShelterCard({ shelter, distanceMeters, estimatedMinutes }: Props) {
  const { t } = useI18n();

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.sectionRecommendedShelter}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">|</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Target Evacuation Point
          </span>
        </div>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${
            shelter.status === 'OPEN'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
              : shelter.status === 'FULL'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-300'
              : 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300 border-red-300'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          {shelter.status}
        </span>
      </div>

      {/* Main Shelter Details */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <Home className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {shelter.name}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {shelter.address}
          </p>
        </div>

        {/* Proximity Pill */}
        {distanceMeters && estimatedMinutes && (
          <div className="flex items-center space-x-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shrink-0">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Distance</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {(distanceMeters / 1000).toFixed(1)} km
              </div>
            </div>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">ETA</div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ~{estimatedMinutes} mins
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Capacity & Accessibility Features */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {/* Available Spots */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Capacity</span>
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-white">
            {shelter.capacity_available} / {shelter.capacity_total}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {Math.round((shelter.capacity_available / shelter.capacity_total) * 100)}% available
          </div>
        </div>

        {/* Wheelchair Accessibility */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Accessibility className="w-3.5 h-3.5" />
            <span>Accessibility</span>
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            {shelter.wheelchair_accessible ? 'Wheelchair Ready' : 'Steps / Limited'}
          </div>
          <div className="text-[10px] text-slate-500">
            {shelter.wheelchair_accessible ? 'Ramps & Wide Doors' : 'Requires assistance'}
          </div>
        </div>

        {/* Medical Support */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Medical Care</span>
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            {shelter.medical_support ? 'First Aid Onsite' : 'No Dedicated Medics'}
          </div>
          <div className="text-[10px] text-slate-500">
            Trained emergency staff
          </div>
        </div>

        {/* Pet Friendly */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Heart className="w-3.5 h-3.5" />
            <span>Pets</span>
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            {shelter.pet_friendly ? 'Domestic Pets Allowed' : 'Service Animals Only'}
          </div>
          <div className="text-[10px] text-slate-500">
            Crate advised
          </div>
        </div>
      </div>

      {/* Provenance Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mr-1" />
          Verified Official Shelter Registry
        </span>
        <span>
          Last Status Check: {new Date(shelter.last_verified).toLocaleTimeString()}
        </span>
      </div>
    </section>
  );
}

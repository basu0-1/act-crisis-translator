import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import EmergencyStatusCard from '../components/EmergencyStatusCard';
import PersonalRiskCard from '../components/PersonalRiskCard';
import ActionPlanCards from '../components/ActionPlanCards';
import ShelterCard from '../components/ShelterCard';
import { I18nProvider } from '../hooks/useI18n';
import { translations } from '../lib/i18n';
import { EmergencyAlert, RiskAssessment, ActionPlan, Shelter } from '../types';

const renderWithI18n = (ui: React.ReactElement) => {
  return render(<I18nProvider>{ui}</I18nProvider>);
};

const mockAlert: EmergencyAlert = {
  id: 1,
  title: 'Flash Flood Surge Warning',
  description: 'Rising riverbed waters threatening lowland corridors.',
  emergency_type: 'FLOOD',
  severity: 'SEVERE',
  certainty: 'OBSERVED',
  time_to_impact_minutes: 32,
  verification_status: 'OFFICIAL_DISPATCH',
  data_status: 'DEMO',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockRisk: RiskAssessment = {
  user_id: 1,
  alert_id: 1,
  risk_score: 68.5,
  risk_level: 'HIGH',
  risk_factors: [
    {
      name: 'Emergency Severity',
      score_impact: 30,
      description: 'Major flood waters',
      severity_level: 'SEVERE',
    },
    {
      name: 'Mobility Vulnerability',
      score_impact: 10,
      description: 'Limited walking profile',
      severity_level: 'HIGH',
    },
  ],
  action_window_minutes: 24,
  disclaimer: 'Prototype decision-support score',
  created_at: new Date().toISOString(),
};

const mockActionPlan: ActionPlan = {
  user_id: 1,
  alert_id: 1,
  do_now: [
    { id: '1', text: 'Grab emergency go-bag', priority: 'HIGH', category: 'PREPARATION' },
  ],
  do_next: [
    { id: '2', text: 'Notify emergency contacts', priority: 'MEDIUM', category: 'COMMUNICATION' },
  ],
  avoid: [
    { id: '3', text: 'Do not drive through moving water', priority: 'CRITICAL', category: 'HAZARD' },
  ],
  if_then: [
    { id: '4', condition: 'IF Riverside Road is blocked', action: 'THEN take Ridge Ave bypass', severity: 'HIGH' },
  ],
  version: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockShelter: Shelter = {
  id: 1,
  name: 'Community Civic Center',
  address: '800 Civic Plaza',
  latitude: 37.781,
  longitude: -122.408,
  capacity_total: 250,
  capacity_available: 112,
  wheelchair_accessible: true,
  medical_support: true,
  pet_friendly: false,
  status: 'OPEN',
  last_verified: new Date().toISOString(),
  is_active: true,
};

describe('Emergency Decision Components', () => {
  it('renders EmergencyStatusCard with proper demo badge and severity', () => {
    renderWithI18n(<EmergencyStatusCard alert={mockAlert} />);
    expect(screen.getByText('Flash Flood Surge Warning')).toBeDefined();
    expect(screen.getByText('SIMULATED / DEMO SCENARIO')).toBeDefined();
    expect(screen.getByText('SEVERE')).toBeDefined();
  });

  it('renders PersonalRiskCard with transparent score and disclaimer', () => {
    renderWithI18n(<PersonalRiskCard risk={mockRisk} mobility="LIMITED_WALKING" />);
    expect(screen.getByText('69')).toBeDefined(); // rounded
    expect(screen.getAllByText('HIGH').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Prototype decision-support score/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Emergency Severity')).toBeDefined();
  });

  it('renders ActionPlanCards with DO NOW, NEXT, AVOID, and IF->THEN', () => {
    renderWithI18n(<ActionPlanCards plan={mockActionPlan} />);
    expect(screen.getByText('Grab emergency go-bag')).toBeDefined();
    expect(screen.getByText('Notify emergency contacts')).toBeDefined();
    expect(screen.getByText('Do not drive through moving water')).toBeDefined();
    expect(screen.getByText('IF Riverside Road is blocked')).toBeDefined();
    expect(screen.getByText('THEN take Ridge Ave bypass')).toBeDefined();
  });

  it('renders ShelterCard with accessibility and availability', () => {
    renderWithI18n(<ShelterCard shelter={mockShelter} distanceMeters={1600} estimatedMinutes={12} />);
    expect(screen.getByText('Community Civic Center')).toBeDefined();
    expect(screen.getByText('112 / 250')).toBeDefined();
    expect(screen.getByText('Wheelchair Ready')).toBeDefined();
    expect(screen.getByText('OPEN')).toBeDefined();
  });

  it('verifies multilingual translation coverage across EN, HI, and JA', () => {
    expect(translations.en.statusDemo).toBe('SIMULATED / DEMO SCENARIO');
    expect(translations.hi.statusDemo).toBe('सिम्युलेटेड / डेमो परिदृश्य');
    expect(translations.ja.statusDemo).toBe('シミュレーション / デモシナリオ');

    expect(translations.en.qWhatHappened).toBe('What is happening?');
    expect(translations.hi.qWhatHappened).toBe('क्या हो रहा है?');
    expect(translations.ja.qWhatHappened).toBe('何が起きているのか？');
  });
});

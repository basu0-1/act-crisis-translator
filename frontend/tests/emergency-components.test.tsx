import { describe, it, expect } from 'vitest';
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { EmergencyMap } from '../components/EmergencyMap';
import { MapContextControls } from '../components/MapContextControls';
import { getTranslation } from '../lib/translations';

vi.mock('leaflet', () => {
  const buildLayer = () => ({
    addTo: () => buildLayer(),
    bindPopup: () => buildLayer(),
    on: () => buildLayer(),
    setZIndex: () => buildLayer(),
    remove: () => buildLayer(),
  });

  const layerGroup = () => ({
    addTo: () => layerGroup(),
    clearLayers: () => layerGroup(),
    remove: () => layerGroup(),
  });

  return {
    default: {
      map: () => ({
        fitBounds: vi.fn(),
        setView: vi.fn(),
        flyTo: vi.fn(),
        getZoom: vi.fn(() => 12),
        setZoom: vi.fn(),
        remove: vi.fn(),
      }),
      tileLayer: () => ({ addTo: () => ({}) }),
      layerGroup,
      circle: () => buildLayer(),
      circleMarker: () => buildLayer(),
      polyline: () => buildLayer(),
      latLngBounds: () => ({
        extend: vi.fn(),
      }),
    },
  };
});

describe('ACT emergency map', () => {
  it('renders the Leaflet controls and real shelter labels', () => {
    render(
      <EmergencyMap
        user={{
          id: 'user-demo-01',
          name: 'Demo User',
          lat: 28.6139,
          lng: 77.2090,
          language: 'en',
          mobility: 'limited',
          transport: 'walking',
          companions: 'none',
          accessibility_requirements: ['Step-free access'],
          critical_needs: ['Medication'],
        }}
        alert={{
          id: 'ALERT-FLD-2026-0891',
          hazard_type: 'flood',
          severity: 'high',
          certainty: 'likely',
          headline: 'Critical Flash Flood Warning',
          description: 'Flooding along the northern basin.',
          lat: 28.6139,
          lng: 77.2090,
          radius_km: 5,
          time_to_impact_minutes: 32,
          required_action: 'evacuate',
          source_level: 1,
          provenance: {
            source_name: 'Official Alert',
            source_level: 1,
            timestamp: '2026-09-02T10:15:00Z',
            confidence: 0.98,
            verified: true,
          },
          created_at: '2026-09-02T10:15:00Z',
          active: true,
        }}
        roads={[
          {
            id: 'R3',
            name: 'Highland Boulevard',
            start_node: 'USER_HOME',
            end_node: 'SHELTER_B',
            status: 'safe',
            risk_level: 0.2,
            accessible_wheelchair: true,
            has_stairs: false,
            travel_time_minutes: 14,
            coordinates: [[77.2090, 28.6139], [77.2150, 28.6300]],
          },
        ]}
        shelters={[
          {
            id: 'SHELTER_B',
            name: 'Shelter B (Highland Safe Haven)',
            type: 'shelter',
            lat: 28.6300,
            lng: 77.2150,
            capacity: 400,
            current_occupancy: 120,
            status: 'open',
            is_accessible: true,
            updated_at: '10:14:00 UTC',
            address: '88 Highland Ridge Avenue',
          },
        ]}
        routeRec={{
          recommended_route: {
            route_id: 'R3',
            name: 'Highland Boulevard',
            destination_id: 'SHELTER_B',
            destination_name: 'Shelter B (Highland Safe Haven)',
            total_distance_km: 1.8,
            estimated_time_minutes: 14,
            safety_score: 85,
            is_accessible: true,
            has_stairs: false,
            status: 'safe',
            steps: [],
            path_coordinates: [[77.2090, 28.6139], [77.2150, 28.6300]],
          },
          destination: {
            id: 'SHELTER_B',
            name: 'Shelter B (Highland Safe Haven)',
            type: 'shelter',
            lat: 28.6300,
            lng: 77.2150,
            capacity: 400,
            current_occupancy: 120,
            status: 'open',
            is_accessible: true,
            updated_at: '10:14:00 UTC',
            address: '88 Highland Ridge Avenue',
          },
          destination_type: 'shelter',
          estimated_time_minutes: 14,
          safety_score: 85,
          reasons: ['Safe route available'],
          rejected_routes: [],
          all_routes: [],
          status: 'available',
        }}
        language="en"
      />
    );

    expect(screen.getByLabelText(/zoom in/i)).toBeTruthy();
    expect(screen.getByLabelText(/zoom out/i)).toBeTruthy();
    expect(screen.getByLabelText(/recenter map/i)).toBeTruthy();
    expect(screen.getByLabelText(/fit route/i)).toBeTruthy();
    expect(screen.getByLabelText(/open full screen map/i)).toBeTruthy();
    expect(screen.getByText(/leaflet/i)).toBeTruthy();
  });

  it('contains the map control translations required by the ACT UI', () => {
    const en = getTranslation('en');
    expect(en.zoomIn).toBe('Zoom In');
    expect(en.zoomOut).toBe('Zoom Out');
    expect(en.recenterMap).toBe('Recenter Map');
    expect(en.fitRoute).toBe('Fit Route');
    expect(en.startSafeRoute).toBe('Start Safe Route');
  });

  it('submits the selected saved location and situation through the map context action', async () => {
    const onCheckSafety = vi.fn().mockResolvedValue(undefined);

    render(
      <MapContextControls
        state={{
          alert: {
            id: 'alert-test', hazard_type: 'flood', severity: 'high', certainty: 'likely',
            headline: 'Test alert', description: 'Test alert', lat: 28.6139, lng: 77.209,
            radius_km: 5, time_to_impact_minutes: 32, required_action: 'evacuate', source_level: 1,
            provenance: { source_name: 'Test', source_level: 1, timestamp: '', confidence: 1, verified: true },
            created_at: '', active: true,
          },
          user: {
            id: 'user-demo-01', name: 'Demo User', lat: 28.6139, lng: 77.209,
            language: 'en', mobility: 'limited', transport: 'walking', companions: 'none',
            accessibility_requirements: [], critical_needs: [],
          },
          roads: [], shelters: [],
          risk: { score: 50, level: 'medium', estimated_action_window_minutes: 32, reasons: [], breakdown: [], prototype_disclaimer: '' },
          route_recommendation: { recommended_route: null, destination: null, destination_type: 'shelter', estimated_time_minutes: 0, safety_score: 0, reasons: [], rejected_routes: [], all_routes: [], status: 'available' },
          action_plan: { plan_id: 'test', timestamp: '', language: 'en', hazard: 'flood', risk_score: 50, risk_level: 'medium', action_window_minutes: 32, destination_shelter: '', route_summary: '', now: [], next: [], avoid: [], if_then: [], source_provenance: { source_name: 'Test', source_level: 1, timestamp: '', confidence: 1, verified: true }, disclaimer: '' },
          is_offline: false, last_event_description: '',
        }}
        language="en"
        isBusy={false}
        onApply={onCheckSafety}
      />
    );

    fireEvent.change(screen.getByLabelText("What's happening?"), { target: { value: 'earthquake' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /update map/i }));
    });

    expect(onCheckSafety).toHaveBeenCalledWith(28.6139, 77.2090, 'earthquake');
  });

  it('shows an unavailable state instead of a fabricated map location', () => {
    render(
      <EmergencyMap
        user={{
          id: 'user-demo-01', name: 'Demo User', lat: Number.NaN, lng: Number.NaN,
          language: 'en', mobility: 'limited', transport: 'walking', companions: 'none',
          accessibility_requirements: [], critical_needs: [],
        }}
        alert={{
          id: 'alert-unavailable', hazard_type: 'flood', severity: 'high', certainty: 'possible',
          headline: 'Information unavailable', description: 'Information unavailable.',
          lat: Number.NaN, lng: Number.NaN, radius_km: 0, time_to_impact_minutes: 0,
          required_action: 'none', source_level: 4,
          provenance: { source_name: 'Information unavailable.', source_level: 4, timestamp: '', confidence: 0, verified: false },
          created_at: '', active: false,
        }}
        roads={[]}
        shelters={[]}
        routeRec={{ recommended_route: null, destination: null, destination_type: 'shelter', estimated_time_minutes: 0, safety_score: 0, reasons: [], rejected_routes: [], all_routes: [], status: 'insufficient_info' }}
        language="en"
      />
    );

    expect(screen.getByText('Your location is unavailable.')).toBeTruthy();
  });

  it('sends browser live coordinates through the map update callback', async () => {
    const onApply = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) => success({
          coords: {
            latitude: 19.076,
            longitude: 72.8777,
            accuracy: 12,
          } as GeolocationCoordinates,
        } as GeolocationPosition),
      },
    });

    render(
      <MapContextControls
        state={{
          alert: {
            id: 'alert-live', hazard_type: 'flood', severity: 'high', certainty: 'likely',
            headline: 'Test alert', description: 'Test alert', lat: 28.6139, lng: 77.209,
            radius_km: 5, time_to_impact_minutes: 32, required_action: 'evacuate', source_level: 1,
            provenance: { source_name: 'Test', source_level: 1, timestamp: '', confidence: 1, verified: true },
            created_at: '', active: true,
          },
          user: {
            id: 'user-live', name: 'Live User', lat: 28.6139, lng: 77.209,
            language: 'en', mobility: 'limited', transport: 'walking', companions: 'none',
            accessibility_requirements: [], critical_needs: [],
          },
          roads: [], shelters: [],
          risk: { score: 50, level: 'medium', estimated_action_window_minutes: 32, reasons: [], breakdown: [], prototype_disclaimer: '' },
          route_recommendation: { recommended_route: null, destination: null, destination_type: 'shelter', estimated_time_minutes: 0, safety_score: 0, reasons: [], rejected_routes: [], all_routes: [], status: 'available' },
          action_plan: { plan_id: 'live', timestamp: '', language: 'en', hazard: 'flood', risk_score: 50, risk_level: 'medium', action_window_minutes: 32, destination_shelter: '', route_summary: '', now: [], next: [], avoid: [], if_then: [], source_provenance: { source_name: 'Test', source_level: 1, timestamp: '', confidence: 1, verified: true }, disclaimer: '' },
          is_offline: false, last_event_description: '',
        }}
        language="en"
        isBusy={false}
        onApply={onApply}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /use my location/i }));
    });

    expect(onApply).toHaveBeenCalledWith(19.076, 72.8777, 'flood');
  });
});

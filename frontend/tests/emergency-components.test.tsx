import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { EmergencyMap } from '../components/EmergencyMap';
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
});

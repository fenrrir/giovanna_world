import { describe, expect, it } from 'vitest';

import {
  ENVIRONMENT_IDS,
  LOCATION_IDS,
  environmentsOf,
  isEnvironmentId,
  locationOf,
} from './places';

describe('the taxonomy of places', () => {
  it('gives every location at least one environment to stand in', () => {
    for (const location of LOCATION_IDS) {
      expect(environmentsOf(location).length, `${location} has nowhere to be`).toBeGreaterThan(0);
    }
  });

  it('lists every environment exactly once', () => {
    expect(new Set(ENVIRONMENT_IDS).size).toBe(ENVIRONMENT_IDS.length);
  });

  /* The same rule a part id follows: the name says where it belongs, so a
     misfiled environment is caught by reading rather than by debugging. */
  it('namespaces every environment under its own location', () => {
    for (const environment of ENVIRONMENT_IDS) {
      expect(environment).toMatch(new RegExp(`^${locationOf(environment)}\\.`));
    }
  });

  it('answers which location an environment belongs to', () => {
    for (const location of LOCATION_IDS) {
      for (const environment of environmentsOf(location)) {
        expect(locationOf(environment)).toBe(location);
      }
    }
  });
});

describe('isEnvironmentId', () => {
  it('recognises every environment the taxonomy declares', () => {
    for (const environment of ENVIRONMENT_IDS) {
      expect(isEnvironmentId(environment)).toBe(true);
    }
  });

  /* Storage holds strings, and a world written by a later version can name a
     room this one has never had. */
  it('refuses a name from outside it', () => {
    expect(isEnvironmentId('house.attic')).toBe(false);
    expect(isEnvironmentId('house')).toBe(false);
    expect(isEnvironmentId('')).toBe(false);
  });
});

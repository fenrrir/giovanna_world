import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CURRENT_LOOK_KEY } from '../../src/lib/storage';
import { DEFAULT_LOOK } from '../../src/model/defaults';
import type { Look } from '../../src/model/types';
import { AUTOSAVE_DELAY_MS, LookProvider } from '../../src/state/LookProvider';
import { useLook } from '../../src/state/lookContext';
import { stubLookup, stubPart } from '../doubles';

const top = stubPart('top', 'top.t-shirt');
const lookup = stubLookup(top);

const fakeStorage = (seed: Record<string, string> = {}): Storage => {
  const entries = new Map(Object.entries(seed));

  return {
    get length() {
      return entries.size;
    },
    clear: () => {
      entries.clear();
    },
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => [...entries.keys()][index] ?? null,
    removeItem: (key) => {
      entries.delete(key);
    },
    setItem: (key, value) => {
      entries.set(key, value);
    },
  };
};

/** Exposes the store and lets a test drive it. */
const Probe = (): React.JSX.Element => {
  const { look, dispatch } = useLook();

  return (
    <button
      type="button"
      data-skin={look.skin}
      data-top={look.equipped.top?.partId ?? ''}
      onClick={() => {
        dispatch({ type: 'setSkin', color: '#C68A5E' });
      }}
    >
      skin
    </button>
  );
};

const mount = (storage: Storage) => {
  const view = render(
    <LookProvider storage={storage} lookup={lookup}>
      <Probe />
    </LookProvider>,
  );

  return { ...view, probe: screen.getByRole('button') };
};

const storedLook = (storage: Storage): Look | null => {
  const raw = storage.getItem(CURRENT_LOOK_KEY);

  return raw === null ? null : (JSON.parse(raw) as Look);
};

describe('LookProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('hydration', () => {
    it('starts from the default look when storage is empty', () => {
      const { probe } = mount(fakeStorage());

      expect(probe).toHaveAttribute('data-skin', DEFAULT_LOOK.skin);
    });

    it('restores a stored look', () => {
      const stored: Look = {
        schemaVersion: 1,
        skin: '#8A5A38',
        equipped: { top: { partId: 'top.t-shirt', color: '#1D9E75' } },
      };
      const { probe } = mount(fakeStorage({ [CURRENT_LOOK_KEY]: JSON.stringify(stored) }));

      expect(probe).toHaveAttribute('data-skin', '#8A5A38');
      expect(probe).toHaveAttribute('data-top', 'top.t-shirt');
    });

    it('drops a stored part that has left the registry, keeping the rest', () => {
      const stored: Look = {
        schemaVersion: 1,
        skin: '#8A5A38',
        equipped: { top: { partId: 'top.deleted', color: '#1D9E75' } },
      };
      const { probe } = mount(fakeStorage({ [CURRENT_LOOK_KEY]: JSON.stringify(stored) }));

      expect(probe).toHaveAttribute('data-skin', '#8A5A38');
      expect(probe).toHaveAttribute('data-top', '');
    });

    it('falls back to the default on corrupt json, showing no error', () => {
      const { probe, container } = mount(fakeStorage({ [CURRENT_LOOK_KEY]: '{not json' }));

      expect(probe).toHaveAttribute('data-skin', DEFAULT_LOOK.skin);
      expect(container.textContent).not.toMatch(/erro|error/i);
    });
  });

  describe('autosave', () => {
    it('does not write before the debounce elapses', () => {
      const storage = fakeStorage();
      const { probe } = mount(storage);

      act(() => {
        probe.click();
      });
      act(() => {
        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS - 1);
      });

      expect(storedLook(storage)).toBeNull();
    });

    it('writes once the debounce elapses', () => {
      const storage = fakeStorage();
      const { probe } = mount(storage);

      act(() => {
        probe.click();
      });
      act(() => {
        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
      });

      expect(storedLook(storage)?.skin).toBe('#C68A5E');
    });

    it('collapses a burst of changes into a single write', () => {
      const storage = fakeStorage();
      const { probe } = mount(storage);
      const setItem = vi.spyOn(storage, 'setItem');

      act(() => {
        probe.click();
        probe.click();
        probe.click();
      });
      act(() => {
        vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
      });

      expect(setItem).toHaveBeenCalledTimes(1);
      expect(storedLook(storage)?.skin).toBe('#C68A5E');
    });

    it('flushes a pending write when the app closes', () => {
      const storage = fakeStorage();
      const { probe, unmount } = mount(storage);

      act(() => {
        probe.click();
      });

      expect(storedLook(storage)).toBeNull();

      unmount();

      expect(storedLook(storage)?.skin).toBe('#C68A5E');
    });
  });

  it('falls back to the real part registry when no lookup is injected', () => {
    const stored: Look = {
      schemaVersion: 1,
      skin: '#8A5A38',
      // Registered for real in src/parts/registry.ts.
      equipped: { top: { partId: 'top.t-shirt', color: '#1D9E75' } },
    };

    render(
      <LookProvider storage={fakeStorage({ [CURRENT_LOOK_KEY]: JSON.stringify(stored) })}>
        <Probe />
      </LookProvider>,
    );

    expect(screen.getByRole('button')).toHaveAttribute('data-top', 'top.t-shirt');
  });

  it('writes to the browser store when none is injected', () => {
    render(
      <LookProvider lookup={lookup}>
        <Probe />
      </LookProvider>,
    );

    const probe = screen.getByRole('button');

    expect(probe).toHaveAttribute('data-skin', DEFAULT_LOOK.skin);

    act(() => {
      probe.click();
    });
    act(() => {
      vi.advanceTimersByTime(AUTOSAVE_DELAY_MS);
    });

    expect(localStorage.getItem(CURRENT_LOOK_KEY)).toContain('#C68A5E');
  });
});

describe('useLook', () => {
  it('refuses to run outside a provider, because there is no sane default state', () => {
    /*
     * React re-throws a render error through a synthetic event so devtools can
     * see it, which jsdom then reports as an uncaught error. Silencing
     * console.error alone leaves that second path printing a stack trace for a
     * throw the test is deliberately causing.
     */
    const swallow = (event: ErrorEvent): void => {
      event.preventDefault();
    };
    window.addEventListener('error', swallow);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      expect(() => render(<Probe />)).toThrow(/LookProvider/);
    } finally {
      window.removeEventListener('error', swallow);
      consoleError.mockRestore();
    }
  });
});

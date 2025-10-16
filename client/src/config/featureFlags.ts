// Global feature flags
// Flip to false to re-enable auth
export const DEV_AUTH_BYPASS: boolean = false;

// Optionally allow Vite env to override
// If Vite env var is set, it takes precedence
// Example: VITE_DEV_AUTH_BYPASS=true
const viteOverride = (import.meta as any)?.env?.VITE_DEV_AUTH_BYPASS;
if (typeof viteOverride !== 'undefined') {
  // Normalize common string values to boolean
  const normalized = String(viteOverride).toLowerCase();
  (globalThis as any).__DEV_AUTH_BYPASS__ = ['1', 'true', 'yes', 'on'].includes(normalized);
}

export const isDevBypassEnabled = (): boolean => {
  if (typeof (globalThis as any).__DEV_AUTH_BYPASS__ === 'boolean') {
    return (globalThis as any).__DEV_AUTH_BYPASS__;
  }
  return DEV_AUTH_BYPASS;
};

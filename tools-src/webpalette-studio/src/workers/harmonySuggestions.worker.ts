/// <reference lib="webworker" />
import { context, optionsFor } from '../lib/harmony';
import { HarmonyOption, Role } from '../lib/types';

interface SuggestionRequest {
  id: number;
  sources: string[];
  lockedRoles: Partial<Record<Role, string>>;
  roles: Role[];
}
interface SuggestionResponse {
  id: number;
  suggestions: Partial<Record<Role, HarmonyOption[]>>;
}

self.onmessage = (event: MessageEvent<SuggestionRequest>) => {
  const { id, sources, lockedRoles, roles } = event.data;
  const suggestions: Partial<Record<Role, HarmonyOption[]>> = {};
  if (sources.length) {
    const ctx = context(sources, lockedRoles);
    for (const role of roles) suggestions[role] = optionsFor(role, ctx);
  }
  const response: SuggestionResponse = { id, suggestions };
  self.postMessage(response);
};

export {};

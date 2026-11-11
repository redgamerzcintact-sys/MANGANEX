import { create } from 'zustand';

export type UserRole = 'ROLE_ADMIN' | 'ROLE_GEOLOGIST' | 'ROLE_ENGINEER' | 'ROLE_ANALYST' | 'ROLE_VIEWER';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  organization: string;
}

export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  ROLE_ADMIN: '/admin/dashboard',
  ROLE_GEOLOGIST: '/geologist/dashboard',
  ROLE_ENGINEER: '/operations/dashboard',
  ROLE_ANALYST: '/analytics/dashboard',
  ROLE_VIEWER: '/viewer/dashboard'
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ROLE_ADMIN: [
    'admin:all', 'users:manage', 'roles:manage', 'mines:manage',
    'datasets:manage', 'config:manage', 'models:manage', 'risks:read',
    'reports:all', 'audit:view'
  ],
  ROLE_GEOLOGIST: [
    'geology:read', 'geology:write', 'exploration:read', 'exploration:analyze',
    'satellite:read', 'boreholes:read', 'boreholes:write', 'prospectivity:run',
    'reports:read', 'nexus:use'
  ],
  ROLE_ENGINEER: [
    'production:read', 'production:write', 'equipment:read', 'equipment:write',
    'maintenance:read', 'maintenance:write', 'scenarios:execute',
    'risks:read', 'reports:read', 'nexus:use'
  ],
  ROLE_ANALYST: [
    'datasets:read', 'datasets:upload', 'datasets:analyze', 'models:read',
    'models:train', 'predictions:read', 'reports:generate', 'nexus:use'
  ],
  ROLE_VIEWER: [
    'dashboard:read', 'mines:read', 'maps:read', 'geology:read',
    'production:read', 'satellite:read', 'reports:read', 'nexus:use'
  ]
};

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const getStoredAuth = (): { user: AuthUser | null; token: string | null } => {
  try {
    const token = localStorage.getItem('manganex_token');
    const userStr = localStorage.getItem('manganex_auth_user');
    if (token && userStr) {
      const user = JSON.parse(userStr);
      // Normalize role name if legacy
      let role = user.role as UserRole;
      if (!role.startsWith('ROLE_')) {
        role = `ROLE_${role}` as UserRole;
      }
      return { user: { ...user, role }, token };
    }
  } catch (e) {
    console.error('Failed to parse stored auth user', e);
  }
  return { user: null, token: null };
};

const initialAuth = getStoredAuth();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialAuth.user,
  token: initialAuth.token,
  permissions: initialAuth.user ? ROLE_PERMISSIONS[initialAuth.user.role] || [] : [],
  isAuthenticated: !!initialAuth.token && !!initialAuth.user,

  setAuth: (user: AuthUser, token: string) => {
    // Normalize role name
    let role = user.role;
    if (!role.startsWith('ROLE_')) {
      role = `ROLE_${role}` as UserRole;
    }
    const normalizedUser = { ...user, role };
    const permissions = ROLE_PERMISSIONS[role] || [];

    localStorage.setItem('manganex_token', token);
    localStorage.setItem('manganex_auth_user', JSON.stringify(normalizedUser));

    set({
      user: normalizedUser,
      token,
      permissions,
      isAuthenticated: true
    });
  },

  logout: () => {
    localStorage.removeItem('manganex_token');
    localStorage.removeItem('manganex_auth_user');
    set({
      user: null,
      token: null,
      permissions: [],
      isAuthenticated: false
    });
  },

  hasPermission: (perm: string) => {
    const { permissions, user } = get();
    if (!user) return false;
    if (user.role === 'ROLE_ADMIN' || permissions.includes('admin:all')) return true;
    return permissions.includes(perm);
  },

  hasRole: (roles: UserRole | UserRole[]) => {
    const { user } = get();
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  }
}));


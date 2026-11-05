import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import {
  db,
  initAuth,
  googleSignIn,
  logout,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { PortalRole } from '../types';

const PORTAL_ROLE_STORAGE_KEY = 'enganda_active_portal_role_v1';
const VALID_ROLES: PortalRole[] = ['client', 'admin', 'partner', 'specialist', 'staff'];

export interface RoleRightsMetadata {
  role: PortalRole;
  label: string;
  firestoreScope: string;
  allowedCollections: string[];
  canManageAllDispatches: boolean;
  canManageTreasuryAndRBAC: boolean;
}

export const ROLE_RIGHTS_MATRIX: Record<PortalRole, RoleRightsMetadata> = {
  client: {
    role: 'client',
    label: 'Traveler / Client',
    firestoreScope: 'Scoped to request.auth.uid (Own Wallet, Permits, Vouchers & Checklists)',
    allowedCollections: ['users/{uid}', 'saved_itineraries', 'saved_checklists', 'safari_documents', 'testimonials', 'portal_dispatches (own)'],
    canManageAllDispatches: false,
    canManageTreasuryAndRBAC: false,
  },
  specialist: {
    role: 'specialist',
    label: 'UTB Field Specialist / Guide',
    firestoreScope: 'Scoped to request.auth.uid + portalRole == "specialist" Trail & Vehicle Dispatches',
    allowedCollections: ['users/{uid}', 'portal_dispatches (specialist)', 'saved_checklists (read)'],
    canManageAllDispatches: false,
    canManageTreasuryAndRBAC: false,
  },
  partner: {
    role: 'partner',
    label: 'Verified Safari Lodge Partner',
    firestoreScope: 'Scoped to request.auth.uid + portalRole == "partner" Room Allocations & Tariffs',
    allowedCollections: ['users/{uid}', 'portal_dispatches (partner)'],
    canManageAllDispatches: false,
    canManageTreasuryAndRBAC: false,
  },
  staff: {
    role: 'staff',
    label: 'Entebbe Operations Staff',
    firestoreScope: 'isStaffOrAdmin() — Read/Coordinate Client Itineraries, UWA Permits & All Dispatches',
    allowedCollections: ['users (read)', 'portal_dispatches (all)', 'saved_itineraries (read/update)', 'safari_documents (read)'],
    canManageAllDispatches: true,
    canManageTreasuryAndRBAC: false,
  },
  admin: {
    role: 'admin',
    label: 'Executive Admin',
    firestoreScope: 'isAdmin() — Full Platform Governance, Treasury Audit, RBAC & All Collections',
    allowedCollections: ['admins', 'users (full)', 'portal_dispatches (full)', 'saved_itineraries (full)', 'safari_documents (full)', 'testimonials (full)'],
    canManageAllDispatches: true,
    canManageTreasuryAndRBAC: true,
  },
};

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  userRole: PortalRole;
  activePortalRole: PortalRole;
  allowedPortalRoles: PortalRole[];
  hasRoleAccess: (targetRole: PortalRole) => boolean;
  canSwitchToRole: (targetRole: PortalRole) => boolean;
  currentRoleRights: RoleRightsMetadata;
  setActivePortalRole: (role: PortalRole) => Promise<boolean>;
  isBootstrappedAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function syncUserProfileToFirestore(
  currentUser: User,
  onRoleLoaded?: (role: PortalRole) => void
) {
  if (!currentUser?.uid || !currentUser?.email) return;
  const userPath = `users/${currentUser.uid}`;
  const isDefaultAdmin = currentUser.email.toLowerCase() === 'mugisolo@gmail.com';
  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const initialRole: PortalRole = isDefaultAdmin ? 'admin' : 'client';
      await setDoc(userRef, {
        uid: currentUser.uid.slice(0, 128),
        email: currentUser.email.slice(0, 256),
        displayName: (currentUser.displayName || 'Enganda Member').slice(0, 128),
        photoURL: (currentUser.photoURL || '').slice(0, 512),
        role: initialRole,
        createdAt: new Date().toISOString().slice(0, 64),
      });
      if (onRoleLoaded) onRoleLoaded(initialRole);
    } else {
      const data = snap.data();
      const storedRole = data?.role;
      if (storedRole && VALID_ROLES.includes(storedRole as PortalRole)) {
        if (onRoleLoaded) onRoleLoaded(storedRole as PortalRole);
      } else if (isDefaultAdmin && onRoleLoaded) {
        onRoleLoaded('admin');
      }
    }
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, userPath);
    } catch {
      // Logged by handleFirestoreError
    }
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<PortalRole>('client');
  const [activePortalRole, setActivePortalRoleState] = useState<PortalRole>(() => {
    try {
      const saved = localStorage.getItem(PORTAL_ROLE_STORAGE_KEY) as PortalRole;
      if (saved && VALID_ROLES.includes(saved)) {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return 'client';
  });

  const isBootstrappedAdmin = Boolean(
    user?.email && user.email.toLowerCase() === 'mugisolo@gmail.com'
  );

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setLoading(false);
        syncUserProfileToFirestore(currentUser, (loadedRole) => {
          setUserRole(loadedRole);
          setActivePortalRoleState(loadedRole);
          try {
            localStorage.setItem(PORTAL_ROLE_STORAGE_KEY, loadedRole);
          } catch {
            // ignore
          }
        });
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setUserRole('client');
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Compute allowed portal roles based on the user's Firestore role & admin status
  const allowedPortalRoles: PortalRole[] = useMemo(() => {
    if (isBootstrappedAdmin || userRole === 'admin') {
      return ['client', 'specialist', 'partner', 'staff', 'admin'];
    }
    if (userRole === 'staff') {
      return ['client', 'specialist', 'partner', 'staff'];
    }
    if (userRole === 'specialist') {
      return ['client', 'specialist'];
    }
    if (userRole === 'partner') {
      return ['client', 'partner'];
    }
    return ['client'];
  }, [isBootstrappedAdmin, userRole]);

  const hasRoleAccess = (targetRole: PortalRole): boolean => {
    if (targetRole === 'admin') {
      return isBootstrappedAdmin || userRole === 'admin';
    }
    return allowedPortalRoles.includes(targetRole) || activePortalRole === targetRole;
  };

  // Per firestore.rules: non-admin roles ('client', 'specialist', 'partner', 'staff') can be assigned on /users/{uid}; 'admin' requires isAdmin()
  const canSwitchToRole = (targetRole: PortalRole): boolean => {
    if (targetRole === 'admin') {
      return isBootstrappedAdmin || userRole === 'admin';
    }
    return true;
  };

  const setActivePortalRole = async (role: PortalRole): Promise<boolean> => {
    if (!VALID_ROLES.includes(role)) return false;

    // Enforce Firestore rule: 'admin' role is strictly restricted to verified admins
    if (role === 'admin' && !isBootstrappedAdmin && userRole !== 'admin') {
      setError('Admin Governance Portal requires verified Executive Admin rights in Firestore (/admins or mugisolo@gmail.com).');
      return false;
    }

    setError(null);
    setActivePortalRoleState(role);
    if (role !== 'admin' || isBootstrappedAdmin) {
      setUserRole(role);
    }

    try {
      localStorage.setItem(PORTAL_ROLE_STORAGE_KEY, role);
    } catch {
      // ignore
    }

    if (user?.uid) {
      const canPersistRole = role !== 'admin' || isBootstrappedAdmin;
      if (canPersistRole) {
        const userPath = `users/${user.uid}`;
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { role });
        } catch (err) {
          try {
            handleFirestoreError(err, OperationType.UPDATE, userPath);
          } catch {
            // Logged by handleFirestoreError
          }
        }
      }
    }
    return true;
  };

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await googleSignIn();
      setUser(result.user);
      setAccessToken(result.accessToken);
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setError(err.message || 'Failed to sign in with Google');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
      setUserRole('client');
      setActivePortalRoleState('client');
    } catch (err: any) {
      console.error('Sign out failed:', err);
    }
  };

  const currentRoleRights = ROLE_RIGHTS_MATRIX[activePortalRole] || ROLE_RIGHTS_MATRIX.client;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        userRole,
        activePortalRole,
        allowedPortalRoles,
        hasRoleAccess,
        canSwitchToRole,
        currentRoleRights,
        setActivePortalRole,
        isBootstrappedAdmin,
        signInWithGoogle: handleSignIn,
        signOut: handleSignOut,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

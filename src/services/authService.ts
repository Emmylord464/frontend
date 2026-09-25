import { AuthUser, UserTier } from '../types';

const STORAGE_KEY_USER = 'jamb_scholar_auth_user';
const STORAGE_KEY_USERS_DB = 'jamb_scholar_registered_users';

interface RegisteredUserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // simulated simple stored hash
  tier: UserTier;
  jambRegNumber: string;
  courseTrackId: string;
}

const DEFAULT_DEMO_USERS: RegisteredUserRecord[] = [
  {
    id: 'user-demo-1',
    name: 'Amina Adebayo',
    email: 'candidate@jamb.gov.ng',
    passwordHash: 'password123',
    tier: 'free',
    jambRegNumber: '2025/JAMB/78912',
    courseTrackId: 'medicine',
  },
  {
    id: 'user-pro-demo',
    name: 'Chukwuebuka Obi',
    email: 'pro.scholar@gmail.com',
    passwordHash: 'propass2025',
    tier: 'pro',
    jambRegNumber: '2025/JAMB/99411',
    courseTrackId: 'computer-science',
  },
];

function getStoredUsers(): RegisteredUserRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS_DB);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(DEFAULT_DEMO_USERS));
      return DEFAULT_DEMO_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DEMO_USERS;
  }
}

function saveStoredUsers(users: RegisteredUserRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
  } catch {
    // Ignore storage errors
  }
}

export const authService = {
  getCurrentUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: AuthUser | null): void {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    } catch {
      // Ignore storage errors
    }
  },

  async login(email: string, password: string): Promise<AuthUser> {
    // Artificial latency for tactile feel
    await new Promise((resolve) => setTimeout(resolve, 350));

    const users = getStoredUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      throw new Error('No candidate account found with this email. Please check or create an account.');
    }

    if (user.passwordHash !== password) {
      throw new Error('Incorrect password. Please verify and try again.');
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      tier: user.tier,
      jambRegNumber: user.jambRegNumber,
    };

    authService.setCurrentUser(authUser);
    return authUser;
  },

  async signup(name: string, email: string, password: string, courseTrackId = 'medicine'): Promise<AuthUser> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const users = getStoredUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    // Generate realistic random JAMB registration number (e.g. 2025/JAMB/48192)
    const randomFive = Math.floor(10000 + Math.random() * 90000);
    const regNum = `2025/JAMB/${randomFive}`;

    const newRecord: RegisteredUserRecord = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: password,
      tier: 'free',
      jambRegNumber: regNum,
      courseTrackId,
    };

    users.push(newRecord);
    saveStoredUsers(users);

    const authUser: AuthUser = {
      id: newRecord.id,
      name: newRecord.name,
      email: newRecord.email,
      tier: newRecord.tier,
      jambRegNumber: newRecord.jambRegNumber,
    };

    authService.setCurrentUser(authUser);
    return authUser;
  },

  async register(name: string, email: string, password: string, courseTrackId = 'medicine'): Promise<AuthUser> {
    return this.signup(name, email, password, courseTrackId);
  },

  async loginWithGoogle(): Promise<AuthUser> {
    await new Promise((resolve) => setTimeout(resolve, 450));

    // Simulated realistic Google account auth
    const authUser: AuthUser = {
      id: 'google-user-1',
      name: 'Oluwaseun Balogun',
      email: 'o.balogun@gmail.com',
      tier: 'free',
      jambRegNumber: '2025/JAMB/61028',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    };

    authService.setCurrentUser(authUser);
    return authUser;
  },

  logout(): void {
    authService.setCurrentUser(null);
  },

  updateTier(tier: UserTier): AuthUser | null {
    const current = authService.getCurrentUser();
    if (!current) return null;

    const updated: AuthUser = { ...current, tier };
    authService.setCurrentUser(updated);

    // Also update in registered list
    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.id === current.id || u.email === current.email);
    if (idx !== -1) {
      users[idx].tier = tier;
      saveStoredUsers(users);
    }

    return updated;
  },
};

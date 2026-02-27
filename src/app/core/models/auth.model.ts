// ── Matches your exact API response ──────────────────────────────────────────

export interface Branch {
  id: string;
  name: string;
  location: string | null;
}

export interface Role {
  id: string;
  role: string;           // e.g. "TELLER", "MANAGER", "ANALYST"
  created: string;
  updated: string;
  deleted: string | null;
  message: string | null;
}

export interface ApiUser {
  id: string;
  email: string;
  enabled: boolean;
  passwordExpired: boolean;
  roles: Role[];
  branch: Branch;

  inputter: string;
  inputDateTime: string;
  authorizer: string;
  authorizeDateTime: string;
  created: string;
  updated: string;
  deleted: string | null;
  message: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: ApiUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ── Derived app-level user (simplified, used throughout the app) ──────────────
export type AppRole = "teller" | "manager" | "analyst";

export interface AppUser {
  id: string;
  email: string;
  name: string;          // derived from email prefix
  initials: string;      // derived from email prefix
  role: AppRole;         // normalised from roles[0].role
  branch: Branch;
  rawRoles: Role[];      // original roles array in case you need multi-role later
}

/** Map API role string → AppRole */
export function toAppRole(apiRole: string): AppRole {
  const map: Record<string, AppRole> = {
    TELLER:  "teller",
    MANAGER: "manager",
    ANALYST: "analyst",
  };
  return map[apiRole?.toUpperCase()] ?? "teller";
}

/** Build a display name + initials from an email like pkanengoni@afcholdings.co.zw */
export function nameFromEmail(email: string): { name: string; initials: string } {
  const local  = email.split("@")[0];                       // pkanengoni
  const parts  = local.replace(/[._-]/g, " ").split(" ");   // ["pkanengoni"]
  const name   = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
  const initials = parts.map(p => p.charAt(0).toUpperCase()).join("").slice(0, 2);
  return { name, initials };
}

/** Convert LoginResponse → AppUser */
export function toAppUser(response: LoginResponse): AppUser {
  const { user } = response;
  const primaryRole = user.roles[0]?.role ?? "TELLER";
  const { name, initials } = nameFromEmail(user.email);

  return {
    id:       user.id,
    email:    user.email,
    name,
    initials,
    role:     toAppRole(primaryRole),
    branch:   user.branch,
    rawRoles: user.roles,
  };
}

// src/utils/authRoutes.js

export function getDashboardPathFromRole(role) {
  switch (role) {
    case "profesor":
      return "/profesor/dashboard";
    case "parinte":
      return "/parinte/dashboard";
    case "elev":
      return "/elev/dashboard";
    default:
      return "/";
  }
}

export function resolvePostAuthRedirect({
  user,
  profile,
  nextParam,
  needOnboarding,
}) {
  // acceptăm doar rute interne (încep cu "/")
  const safeNext = nextParam && nextParam.startsWith("/") ? nextParam : null;

  // 1) Onboarding dacă nu avem profil complet sau rol
  if (needOnboarding) {
    const base = "/autentificare/inregistrare?onboarding=1";
    return safeNext ? `${base}&next=${encodeURIComponent(safeNext)}` : base;
  }

  // 2) Dacă avem next valid, îl respectăm
  if (safeNext) return safeNext;

  // 3) Altfel decidem după rol
  const metaRole = user?.user_metadata?.role ?? null;
  const dbRole = profile?.role ?? null;
  const finalRole = metaRole || dbRole || null;

  return getDashboardPathFromRole(finalRole);
}

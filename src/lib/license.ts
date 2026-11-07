import { Movie, LicenseStatus } from '@prisma/client';

export interface LicenseStatusResult {
  isValid: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
  label: string;
  badgeClass: string;
}

/**
 * Prisma query condition to filter active movies.
 * Movies without an expiration date stay published indefinitely.
 * Only movies with an explicitly expired date, revoked status, or isPublished=false are hidden.
 */
export function getActiveLicenseFilter() {
  const now = new Date();
  return {
    isPublished: true,
    licenseStatus: {
      notIn: [LicenseStatus.EXPIRED, LicenseStatus.REVOKED],
    },
    OR: [
      { licenseExpires: null },
      { licenseExpires: { gte: now } },
    ],
  };
}

/**
 * Check single movie license validity (handling optional license fields)
 */
export function evaluateMovieLicense(
  movie: {
    licenseStatus?: LicenseStatus | null;
    licenseStart?: Date | string | null;
    licenseExpires?: Date | string | null;
    isPublished?: boolean | null;
  }
): LicenseStatusResult {
  const isPublished = movie.isPublished !== false;

  if (movie.licenseStatus === LicenseStatus.REVOKED) {
    return {
      isValid: false,
      isExpired: false,
      daysRemaining: 0,
      label: 'Revoked',
      badgeClass: 'bg-brand-coral/20 text-brand-coral border-brand-coral/40',
    };
  }

  if (movie.licenseStatus === LicenseStatus.EXPIRED) {
    return {
      isValid: false,
      isExpired: true,
      daysRemaining: 0,
      label: 'Expired',
      badgeClass: 'bg-brand-coral/20 text-brand-coral border-brand-coral/40',
    };
  }

  // If no expiration date is set, the movie is permanently active / standard
  if (!movie.licenseExpires) {
    return {
      isValid: isPublished,
      isExpired: false,
      daysRemaining: null,
      label: 'Active (No Expiry)',
      badgeClass: 'bg-brand-green/20 text-brand-green border-brand-green/40',
    };
  }

  const now = new Date();
  const expiry = new Date(movie.licenseExpires);
  const diffTime = expiry.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (now > expiry) {
    return {
      isValid: false,
      isExpired: true,
      daysRemaining,
      label: 'Expired (Hidden)',
      badgeClass: 'bg-brand-coral/20 text-brand-coral border-brand-coral/40',
    };
  }

  if (daysRemaining <= 14) {
    return {
      isValid: isPublished,
      isExpired: false,
      daysRemaining,
      label: `Expires in ${daysRemaining}d`,
      badgeClass: 'bg-brand-amber/20 text-brand-amber border-brand-amber/40',
    };
  }

  return {
    isValid: isPublished,
    isExpired: false,
    daysRemaining,
    label: 'Licensed & Active',
    badgeClass: 'bg-brand-green/20 text-brand-green border-brand-green/40',
  };
}

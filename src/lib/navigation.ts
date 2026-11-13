export interface NavLink {
  label: string;
  href: string;
}

/**
 * Primary header navigation — preserved labels mapped to real routes.
 * Route-based navigation (no in-page anchor scrolling).
 */
export const PRIMARY_NAV_LINKS: NavLink[] = [
  { label: "OVERVIEW", href: "/" },
  { label: "ABOUT", href: "/about" },
  { label: "CAREER", href: "/experience" },
  { label: "SKILLS", href: "/skills" },
  { label: "PROJECTS", href: "/projects" },
  { label: "ACCOLADES", href: "/achievements" },
  { label: "CONTACT", href: "/contact" },
];

/**
 * Footer "System Directory" — same destinations, editorial numbered labels.
 */
export const FOOTER_NAV_LINKS: NavLink[] = [
  { label: "01 Overview", href: "/" },
  { label: "02 Philosophy", href: "/about" },
  { label: "03 Expedition", href: "/experience" },
  { label: "04 Ecosystem", href: "/skills" },
  { label: "05 Creations", href: "/projects" },
  { label: "06 Accolades", href: "/achievements" },
  { label: "07 Contact", href: "/contact" },
];

export const PRIVACY_POLICY_ROUTE = "/privacy-policy";

import type { SocialLink } from "../types";

type SocialLinksProps = {
  links: SocialLink[];
};

export function SocialLinks({ links }: SocialLinksProps) {
  return (
    <ul className="social-links">
      {links.map((link) => (
        <li key={link.href}>
          <a href={link.href} target="_blank" rel="noopener">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

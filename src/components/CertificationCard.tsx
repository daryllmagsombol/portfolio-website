import type { Certification } from "../types";

type CertificationCardProps = {
  item: Certification;
};

export function CertificationCard({ item }: CertificationCardProps) {
  const label = item.title.replace(" ↗", "");

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener"
      className="cert-card reveal"
      aria-label={`Open ${label} badge on Credly`}
    >
      <img
        src={item.image.src}
        alt={item.image.alt}
        className="cert-card-image"
        loading="lazy"
        decoding="async"
      />
      <div className="cert-card-body">
        <h3 className="cert-card-title">{item.title}</h3>
        <p className="cert-card-issuer mono">{item.issuer}</p>
        <p className="cert-card-date">{item.date}</p>
      </div>
    </a>
  );
}

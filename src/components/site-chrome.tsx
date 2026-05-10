import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
};

const defaultNav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/#explorer", label: "Timeline" },
  { href: "/awards/", label: "Awards" },
  { href: "/people/", label: "People" },
  { href: "/#method", label: "Method" },
];

export function SiteHeader({ navItems = defaultNav }: { navItems?: NavItem[] }) {
  return (
    <>
      <div className="top-banner">
        <span>A living chronology of major computing awards, laureates, and eras.</span>
        <span>Explore by person, prize, institution, topic, or year.</span>
      </div>

      <header className="hero hero-compact">
        <nav className="nav-bar" aria-label="Primary">
          <Link href="/" className="brand-mark">
            Computing Awards Atlas
          </Link>
          <div className="nav-links">
            {navItems.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <a href="https://github.com/dmoliveira" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </nav>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>Computing Awards Atlas</strong>
        <p>Designed as a public GitHub Pages atlas for computer science recognition history.</p>
      </div>
      <div className="footer-links">
        <a href="https://github.com/dmoliveira" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="https://www.linkedin.com/in/dmoliveira/" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a href="https://buy.stripe.com/8x200i8bSgVe3Vl3g8bfO00" target="_blank" rel="noreferrer">
          Support via Stripe
        </a>
      </div>
    </footer>
  );
}

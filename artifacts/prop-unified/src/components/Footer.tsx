import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <span className="font-serif text-2xl tracking-wide block mb-6">
              <span className="text-primary font-bold">PROP</span>
              <span className="font-light text-foreground/90"> UNIFIED</span>
            </span>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              The premier real estate platform for luxury properties in Gujarat. Ahmedabad, Dholera, and Surat's most exclusive listings.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6 text-foreground">Properties</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/properties?type=sale" className="hover:text-primary transition-colors">Buy</Link></li>
              <li><Link href="/properties?type=rent" className="hover:text-primary transition-colors">Rent</Link></li>
              <li><Link href="/properties?type=commercial" className="hover:text-primary transition-colors">Commercial</Link></li>
              <li><Link href="/properties?type=plot" className="hover:text-primary transition-colors">Plots</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6 text-foreground">Cities</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/properties?city=Ahmedabad" className="hover:text-primary transition-colors">Ahmedabad</Link></li>
              <li><Link href="/properties?city=Dholera" className="hover:text-primary transition-colors">Dholera</Link></li>
              <li><Link href="/properties?city=Surat" className="hover:text-primary transition-colors">Surat</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg mb-6 text-foreground">Professionals</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Agent Dashboard</Link></li>
              <li><Link href="/listings" className="hover:text-primary transition-colors">My Listings</Link></li>
              <li><Link href="/kyc" className="hover:text-primary transition-colors">KYC Verification</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PROP UNIFIED. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

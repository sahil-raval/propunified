import { motion } from "framer-motion";
import { ArrowRight, MapPin, Building2, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const WHY_ITEMS = [
  {
    icon: Building2,
    title: "10,000+ Premium Listings",
    desc: "Curated properties across Ahmedabad, Dholera, and Surat — from luxury villas to commercial spaces.",
  },
  {
    icon: ShieldCheck,
    title: "KYC-Verified Agents",
    desc: "Every listing agent is identity-verified. Transact with total confidence.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Market Data",
    desc: "Live pricing, demand trends, and investment insights powered by Gujarat's property data network.",
  },
  {
    icon: Users,
    title: "Expert CRM Pipeline",
    desc: "Professional dashboard to track leads, manage listings, and close deals — all in one command center.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-[90vh] min-h-[700px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            {/* Always-dark cinematic overlay so hero text is always readable */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-background z-10" />
            <img
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"
              alt="Luxury Property"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="container mx-auto px-6 relative z-10 pt-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-5xl md:text-7xl font-serif leading-tight mb-6 text-white">
                Discover Premium <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A84C] to-[#E8C97A]">
                  Properties in Gujarat
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto font-light">
                The exclusive command center for real estate professionals and discerning buyers in Ahmedabad, Dholera, and Surat.
              </p>

              {/* Search Widget */}
              <div className="bg-background/90 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-2xl max-w-3xl mx-auto">
                <div className="flex gap-2 mb-4 border-b border-border pb-4">
                  {["Sale", "Rent", "Commercial", "Plot"].map((tab, i) => (
                    <Link key={tab} href={`/properties?type=${tab.toLowerCase()}`}>
                      <button
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                          i === 0
                            ? "bg-primary/20 text-primary"
                            : "hover:bg-foreground/5 text-foreground/70 hover:text-foreground"
                        }`}
                      >
                        {tab}
                      </button>
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <select className="w-full bg-input border border-border rounded-xl h-14 pl-12 pr-4 appearance-none focus:outline-none focus:border-primary/50 text-foreground">
                      <option>Ahmedabad</option>
                      <option>Dholera</option>
                      <option>Surat</option>
                    </select>
                  </div>
                  <div className="flex-[2] relative">
                    <input
                      type="text"
                      placeholder="Search by locality, project name..."
                      className="w-full bg-input border border-border rounded-xl h-14 pl-5 pr-4 focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <Link href="/properties">
                    <Button className="h-14 px-8 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-black font-semibold text-lg hover:opacity-90">
                      Search
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why PROP UNIFIED */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-16"
            >
              <p className="text-primary text-sm tracking-widest uppercase mb-3">Why Choose Us</p>
              <h2 className="text-4xl md:text-5xl font-serif">The PROP UNIFIED Difference</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {WHY_ITEMS.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="bg-card border border-border rounded-2xl p-8 hover:border-primary/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-serif mb-3">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-r from-[#C9A84C]/10 to-[#E8C97A]/5 border border-primary/20 rounded-3xl p-12 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-serif mb-4">
                  Ready to Find Your Dream Property?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                  Browse thousands of verified listings or list your own property with PROP UNIFIED today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/properties">
                    <Button className="bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-black font-semibold px-8 py-6 text-base hover:opacity-90 gap-2">
                      Explore Properties <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/listings/new">
                    <Button variant="outline" className="border-border text-foreground hover:bg-foreground/5 px-8 py-6 text-base">
                      List Your Property
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

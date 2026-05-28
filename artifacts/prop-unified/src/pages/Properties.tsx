import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Bed, Bath, Square, Search, SlidersHorizontal, Crown } from "lucide-react";
import { useListProperties, type Property } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

const PROPERTY_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format&fit=crop",
];

const TYPE_TABS = ["All", "sale", "rent", "commercial", "plot", "pg"] as const;
type TypeTab = (typeof TYPE_TABS)[number];

function formatPrice(price: number, unit: string) {
  const suffix = unit.includes("month") ? "/mo" : "";
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr${suffix}`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L${suffix}`;
  return `₹${price.toLocaleString("en-IN")}${suffix}`;
}

function PropertyCard({ property, index }: { property: Property; index: number }) {
  const img = PROPERTY_IMAGES[index % PROPERTY_IMAGES.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link href={`/properties/${property.id}`}>
        <div className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/40 transition-all hover:shadow-md group cursor-pointer">
          <div className="aspect-[4/3] relative overflow-hidden">
            <img
              src={img}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="bg-black/60 backdrop-blur-sm border-white/20 text-white text-xs capitalize">
                {property.type}
              </Badge>
              {(property as any).isPremium &&
                new Date((property as any).premiumUntil) > new Date() && (
                <Badge className="bg-primary text-black border-primary/30 text-xs backdrop-blur-sm font-semibold gap-1">
                  <Crown className="h-3 w-3" /> Premium
                </Badge>
              )}
              {property.featured && !(property as any).isPremium && (
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs backdrop-blur-sm">
                  Featured
                </Badge>
              )}
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-bold text-xl">
                {formatPrice(property.price, property.priceUnit ?? "INR")}
              </p>
            </div>
          </div>
          <div className="p-5">
            <h3 className="font-serif text-base mb-2 line-clamp-1 text-foreground">{property.title}</h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
              <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="truncate">
                {property.locality ? `${property.locality}, ` : ""}
                {property.city}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground border-t border-border/50 pt-3">
              {property.bedrooms && (
                <span className="flex items-center gap-1">
                  <Bed className="h-3.5 w-3.5" />
                  {property.bedrooms} Bed
                </span>
              )}
              {property.bathrooms && (
                <span className="flex items-center gap-1">
                  <Bath className="h-3.5 w-3.5" />
                  {property.bathrooms} Bath
                </span>
              )}
              <span className="flex items-center gap-1">
                <Square className="h-3.5 w-3.5" />
                {property.area} {property.areaUnit}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Properties() {
  const [activeType, setActiveType] = useState<TypeTab>("All");
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: properties, isLoading } = useListProperties({
    type: activeType === "All" ? undefined : activeType,
    city: city || undefined,
    search: search || undefined,
    limit: 24,
  });

  function handleSearch() {
    setSearch(searchInput);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-serif mb-2">Explore Properties</h1>
            <p className="text-muted-foreground">
              Premium real estate across Gujarat's fastest-growing cities
            </p>
          </motion.div>

          {/* Type Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveType(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                  activeType === tab
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "border border-border text-foreground/70 hover:text-foreground hover:border-foreground/30"
                }`}
              >
                {tab === "All" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full md:w-64 shrink-0">
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-28 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <h3 className="font-serif text-lg">Filters</h3>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider">
                    City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-input border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary/50 text-foreground"
                  >
                    <option value="">All Cities</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Dholera">Dholera</option>
                    <option value="Surat">Surat</option>
                    <option value="Gandhinagar">Gandhinagar</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Name, locality..."
                      className="w-full bg-input border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground text-foreground"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    size="sm"
                    className="w-full mt-2 bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-black hover:opacity-90"
                  >
                    Search
                  </Button>
                </div>

                {(city || search) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCity("");
                      setSearch("");
                      setSearchInput("");
                    }}
                    className="w-full text-muted-foreground hover:text-foreground border border-border hover:bg-foreground/5"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </aside>

            {/* Properties Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-card rounded-2xl border border-border overflow-hidden"
                    >
                      <Skeleton className="aspect-[4/3] w-full" />
                      <div className="p-5 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : properties && properties.length > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    {properties.length} properties found
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {properties.map((property, i) => (
                      <PropertyCard key={property.id} property={property} index={i} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-card border border-border rounded-2xl">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h2 className="text-xl font-serif text-muted-foreground mb-2">
                    No properties found
                  </h2>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

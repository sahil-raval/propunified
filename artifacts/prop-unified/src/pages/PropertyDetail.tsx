import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Bed, Bath, Square, ArrowLeft, Phone, Building2 } from "lucide-react";
import { useGetProperty, useCreateInquiry } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const inquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  message: z.string().optional(),
});

function formatPrice(price: number, unit: string) {
  if (price >= 10000000)
    return `₹${(price / 10000000).toFixed(2)} Cr${unit.includes("month") ? "/mo" : ""}`;
  if (price >= 100000)
    return `₹${(price / 100000).toFixed(2)} L${unit.includes("month") ? "/mo" : ""}`;
  return `₹${price.toLocaleString("en-IN")}${unit.includes("month") ? "/mo" : ""}`;
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading } = useGetProperty(Number(id ?? 0));
  const createInquiry = useCreateInquiry();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(inquirySchema),
    defaultValues: { name: "", phone: "", email: "", message: "" },
  });

  function onSubmit(values: z.infer<typeof inquirySchema>) {
    if (!property) return;
    createInquiry.mutate(
      {
        data: {
          propertyId: property.id,
          name: values.name,
          phone: values.phone,
          email: values.email ?? undefined,
          message: values.message ?? undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Inquiry Sent", description: "Our team will contact you shortly." });
          form.reset();
        },
        onError: () =>
          toast({
            title: "Error",
            description: "Failed to send inquiry.",
            variant: "destructive",
          }),
      }
    );
  }

  const amenities = (() => {
    try {
      return property?.amenities ? JSON.parse(property.amenities) : [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Properties
          </Link>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-96 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          ) : property ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Image Gallery */}
              <div className="relative h-96 rounded-2xl overflow-hidden bg-muted border border-border mb-8">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1600&auto=format&fit=crop"
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <Badge className="bg-black/60 backdrop-blur-sm border-white/20 text-white mb-2 capitalize">
                    {property.type}
                  </Badge>
                  <h1 className="text-3xl font-serif text-white">{property.title}</h1>
                  <div className="flex items-center gap-2 text-white/80 mt-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>
                      {property.locality}, {property.city}
                    </span>
                  </div>
                </div>
                <div className="absolute top-6 right-6">
                  <span className="text-3xl font-bold text-primary drop-shadow-lg">
                    {formatPrice(property.price, property.priceUnit ?? "INR")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Specs */}
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h2 className="text-xl font-serif mb-6">Property Details</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {property.bedrooms && (
                        <div className="flex flex-col items-center p-4 bg-muted/50 rounded-xl">
                          <Bed className="h-6 w-6 text-primary mb-2" />
                          <span className="text-xl font-bold">{property.bedrooms}</span>
                          <span className="text-xs text-muted-foreground">Bedrooms</span>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex flex-col items-center p-4 bg-muted/50 rounded-xl">
                          <Bath className="h-6 w-6 text-primary mb-2" />
                          <span className="text-xl font-bold">{property.bathrooms}</span>
                          <span className="text-xs text-muted-foreground">Bathrooms</span>
                        </div>
                      )}
                      <div className="flex flex-col items-center p-4 bg-muted/50 rounded-xl">
                        <Square className="h-6 w-6 text-primary mb-2" />
                        <span className="text-xl font-bold">{property.area}</span>
                        <span className="text-xs text-muted-foreground">{property.areaUnit}</span>
                      </div>
                      {property.furnishing && (
                        <div className="flex flex-col items-center p-4 bg-muted/50 rounded-xl">
                          <Building2 className="h-6 w-6 text-primary mb-2" />
                          <span className="text-sm font-bold text-center">{property.furnishing}</span>
                          <span className="text-xs text-muted-foreground">Furnishing</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {property.description && (
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h2 className="text-xl font-serif mb-4">About This Property</h2>
                      <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                    </div>
                  )}

                  {/* Amenities */}
                  {amenities.length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h2 className="text-xl font-serif mb-4">Amenities</h2>
                      <div className="flex flex-wrap gap-2">
                        {amenities.map((a: string) => (
                          <Badge
                            key={a}
                            variant="outline"
                            className="border-border text-foreground/70 py-1 px-3"
                          >
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Inquiry Form */}
                <div className="bg-card border border-border rounded-2xl p-6 h-fit sticky top-24">
                  <h2 className="text-xl font-serif mb-2">Request Information</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Our experts will contact you within 24 hours
                  </p>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/80">Full Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Your name"
                                className="bg-input border-border focus:border-primary/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/80">Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="+91 98765 43210"
                                className="bg-input border-border focus:border-primary/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/80">Email (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="you@example.com"
                                className="bg-input border-border focus:border-primary/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/80">Message (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Tell us what you're looking for..."
                                className="bg-input border-border focus:border-primary/50 resize-none"
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={createInquiry.isPending}
                        className="w-full bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-black font-semibold hover:opacity-90"
                      >
                        {createInquiry.isPending ? "Sending..." : "Send Inquiry"}
                      </Button>
                    </form>
                  </Form>
                  {property.ownerPhone && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Or contact directly:</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>{property.ownerPhone}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-serif text-muted-foreground">Property not found</h2>
              <Link href="/properties">
                <Button className="mt-4 bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-black">
                  Browse Properties
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

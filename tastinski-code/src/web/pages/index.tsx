import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Paintbrush, 
  ShieldCheck, 
  MapPin, 
  Home, 
  Building2, 
  Star, 
  Quote, 
  User, 
  Mail, 
  Phone, 
  MessageSquare,
  Sparkles,
  Layers,
  Users,
  ChevronRight,
  Clock,
  CheckCircle,
  ArrowRight,
  Brush,
  Award,
  Calculator,
  Loader2
} from "lucide-react";
import { useState } from "react";

export default function Index() {
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Instant Estimate Calculator State
  const [projectType, setProjectType] = useState<string>("");
  const [squareFootage, setSquareFootage] = useState<string>("");
  const [propertySize, setPropertySize] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("");
  const [estimateResult, setEstimateResult] = useState<{ min: number; max: number; formula?: string } | null>(null);
  const [showCustomQuote, setShowCustomQuote] = useState(false);
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    projectType: "",
    propertyAddress: "",
    message: "",
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactError(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setContactSuccess(true);
        setContactForm({
          fullName: "",
          phoneNumber: "",
          email: "",
          projectType: "",
          propertyAddress: "",
          message: "",
        });
      } else {
        setContactError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setContactError("Unable to submit form. Please try again or call us directly.");
    } finally {
      setContactSubmitting(false);
    }
  };

  const calculateEstimate = () => {
    // Commercial always requires custom quote
    if (projectType === "commercial") {
      setShowCustomQuote(true);
      setEstimateResult(null);
      return;
    }
    
    setShowCustomQuote(false);
    
    const sqft = squareFootage ? parseInt(squareFootage, 10) : 0;
    
    // If square footage is provided, use per-sqft pricing
    if (sqft > 0) {
      // Per-sqft pricing rates based on condition
      // Exterior: $2.50-$4.00 per sqft (Excellent $2.50-$3.00, Good $3.00-$3.50, Fair $3.50-$4.00)
      // Interior: $1.50-$3.00 per sqft (Excellent $1.50-$2.00, Good $2.00-$2.50, Fair $2.50-$3.00)
      const exteriorRates: Record<string, { min: number; max: number }> = {
        "excellent": { min: 2.50, max: 3.00 },
        "good": { min: 3.00, max: 3.50 },
        "fair": { min: 3.50, max: 4.00 }
      };
      
      const interiorRates: Record<string, { min: number; max: number }> = {
        "excellent": { min: 1.50, max: 2.00 },
        "good": { min: 2.00, max: 2.50 },
        "fair": { min: 2.50, max: 3.00 }
      };
      
      let minTotal = 0;
      let maxTotal = 0;
      let formulaParts: string[] = [];
      
      if (projectType === "exterior" || projectType === "both") {
        const rates = exteriorRates[condition] || { min: 3.00, max: 3.50 };
        minTotal += Math.round(sqft * rates.min);
        maxTotal += Math.round(sqft * rates.max);
        formulaParts.push(`Exterior: ${sqft.toLocaleString()} sqft × ${rates.min.toFixed(2)}-${rates.max.toFixed(2)}/sqft`);
      }
      
      if (projectType === "interior" || projectType === "both") {
        const rates = interiorRates[condition] || { min: 2.00, max: 2.50 };
        minTotal += Math.round(sqft * rates.min);
        maxTotal += Math.round(sqft * rates.max);
        formulaParts.push(`Interior: ${sqft.toLocaleString()} sqft × ${rates.min.toFixed(2)}-${rates.max.toFixed(2)}/sqft`);
      }
      
      setEstimateResult({ 
        min: minTotal, 
        max: maxTotal, 
        formula: formulaParts.join(" + ")
      });
      return;
    }
    
    // Fallback to bedroom-based pricing if no square footage provided
    const exteriorPricing: Record<string, { min: number; max: number }> = {
      "1-2": { min: 4000, max: 6000 },
      "3-4": { min: 6000, max: 9000 },
      "5+": { min: 9000, max: 15000 },
      "multi": { min: 15000, max: 25000 }
    };
    
    const interiorPricing: Record<string, { min: number; max: number }> = {
      "1-2": { min: 2500, max: 4000 },
      "3-4": { min: 3500, max: 6000 },
      "5+": { min: 5000, max: 8000 },
      "multi": { min: 8000, max: 15000 }
    };
    
    let minTotal = 0;
    let maxTotal = 0;
    
    if (projectType === "exterior" || projectType === "both") {
      const ext = exteriorPricing[propertySize] || { min: 0, max: 0 };
      minTotal += ext.min;
      maxTotal += ext.max;
    }
    
    if (projectType === "interior" || projectType === "both") {
      const int = interiorPricing[propertySize] || { min: 0, max: 0 };
      minTotal += int.min;
      maxTotal += int.max;
    }
    
    // Fair condition adds 20%
    if (condition === "fair") {
      minTotal = Math.round(minTotal * 1.2);
      maxTotal = Math.round(maxTotal * 1.2);
    }
    
    setEstimateResult({ min: minTotal, max: maxTotal });
  };

  // Square footage makes property size optional, otherwise property size is required
  const hasSquareFootage = squareFootage && parseInt(squareFootage, 10) > 0;
  const isEstimateReady = projectType && (hasSquareFootage || propertySize) && condition && timeframe;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-nunito bg-[#FAF9F6]">
      {/* Hero Section - Grand Victorian Mansion with Pacific Northwest Evergreen Forest */}
      {/* Text positioned on left over forest area, house remains prominent in center-right */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image - Local Victorian mansion with coniferous evergreen trees */}
        {/* Grand Queen Anne Victorian: sage green siding, cream trim, turret, wraparound porch */}
        {/* Pacific Northwest setting: Douglas fir, cedar trees framing the property */}
        {/* Professional real estate photography quality, $1-2M Seattle historic home */}
        {/* Zoomed out 15-20% to show more context: more evergreen forest on sides, more foreground lawn */}
        <div 
          className="absolute inset-[-10%] bg-contain bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('./victorian-hero.png')",
            backgroundPosition: "center 40%",
            backgroundSize: "cover",
            transform: "scale(0.85)",
            transformOrigin: "center center",
          }}
        />
        {/* Subtle overlay only - text box provides its own readability */}
        <div className="absolute inset-0 bg-[#1A2418]/10" />
        {/* Very subtle bottom gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1F1C]/30 via-transparent to-transparent" />

        {/* Content container - left aligned to overlay forest area */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="flex justify-start">
            {/* Semi-transparent dark box for text content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-xl lg:max-w-2xl p-8 sm:p-10 rounded-lg"
              style={{ backgroundColor: "rgba(44, 44, 44, 0.75)" }}
            >
              <motion.div 
                variants={itemVariants} 
                className="flex items-center gap-3 mb-6"
              >
                <span className="w-10 h-px bg-[#8B9D83]" />
                <span className="text-[#8B9D83] text-xs sm:text-sm font-medium tracking-[0.2em] uppercase">
                  Seattle · Bellevue · Redmond
                </span>
              </motion.div>
              
              <motion.h1 
                variants={itemVariants}
                className="font-cormorant text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white mb-4 leading-[1.05] tracking-tight"
              >
                Tastinski
                <span className="block text-[#8B9D83] italic font-normal text-3xl sm:text-4xl md:text-5xl mt-2">
                  The Art of Master Painting
                </span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-base sm:text-lg text-white/80 mb-8 leading-relaxed font-light"
              >
                Premium residential and commercial painting for Seattle's most distinguished homes. 
                Dedicated to perfection in every brushstroke across Bellevue, Redmond, and beyond.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start gap-3">
                <Button 
                  size="lg" 
                  className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-medium tracking-wide bg-[#8B9D83] hover:bg-[#7A8C74] text-white transition-all duration-300 rounded-sm"
                  onClick={() => {
                    document.getElementById('contact')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                >
                  Request Private Consultation
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-medium tracking-wide text-white border-white/40 hover:bg-white/10 hover:border-white/60 rounded-sm transition-all duration-300 bg-transparent"
                >
                  View Our Work
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-16 bg-gradient-to-b from-transparent via-white/40 to-transparent"
          />
        </motion.div>
      </section>

      {/* The Tastinski Standards Section */}
      <section className="py-28 lg:py-36 bg-[#FAF9F6] grain-texture">
        <div className="container mx-auto px-6 lg:px-16 xl:px-24">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <span className="text-[#8B9D83] text-sm font-medium tracking-[0.25em] uppercase mb-4 block">
              Our Standards
            </span>
            <h2 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-medium text-[#2C2C2C] mb-6 leading-tight">
              The Difference is in the Details
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: <Layers className="w-7 h-7" />,
                title: "Meticulous Preparation",
                description: "Every project begins with thorough surface preparation. We don't cut corners—we power wash, scrape, sand, prime, and caulk. The foundation of lasting beauty."
              },
              {
                icon: <Sparkles className="w-7 h-7" />,
                title: "Premium Materials",
                description: "We exclusively use Sherwin-Williams Emerald and Benjamin Moore Aura—paints engineered for the Pacific Northwest climate. 12-15 year lifespan, not 3-5."
              },
              {
                icon: <Users className="w-7 h-7" />,
                title: "White-Glove Service",
                description: "Spotless job sites. Daily cleanup. Furniture protection. Transparent communication. We treat your home with the respect it deserves."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="text-center p-10 lg:p-12"
              >
                <div className="w-16 h-16 mx-auto mb-8 border border-[#8B9D83]/30 flex items-center justify-center text-[#8B9D83]">
                  {item.icon}
                </div>
                <h3 className="font-cormorant text-2xl md:text-3xl font-medium text-[#2C2C2C] mb-5">
                  {item.title}
                </h3>
                <p className="text-[#6B6B6B] leading-relaxed font-light">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-28 lg:py-36 bg-[#2C2C2C]">
        <div className="container mx-auto px-6 lg:px-16 xl:px-24">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <span className="text-[#8B9D83] text-sm font-medium tracking-[0.25em] uppercase mb-4 block">
              What We Offer
            </span>
            <h2 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-medium text-white mb-6 leading-tight">
              Our Services
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {[
              {
                icon: <Home className="w-6 h-6" />,
                title: "Exterior Painting",
                description: "Transform your home's presence with weather-resistant finishes built for Seattle's climate.",
                price: "$6,000 - $12,000"
              },
              {
                icon: <Paintbrush className="w-6 h-6" />,
                title: "Interior Painting",
                description: "Refined color palettes and flawless application for living spaces that inspire.",
                price: "$3,500 - $7,000"
              },
              {
                icon: <Brush className="w-6 h-6" />,
                title: "Architectural Trim",
                description: "Precision work on crown molding, baseboards, and cabinetry—where craftsmanship shows.",
                price: "Custom Quote"
              },
              {
                icon: <Building2 className="w-6 h-6" />,
                title: "Commercial Projects",
                description: "Boutique offices, restaurants, and retail spaces painted with minimal disruption.",
                price: "Custom Quote"
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group p-8 lg:p-10 bg-[#363636] border border-white/5 hover:border-[#8B9D83]/30 transition-all duration-500"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 border border-[#8B9D83]/40 flex items-center justify-center text-[#8B9D83] group-hover:bg-[#8B9D83] group-hover:text-white transition-all duration-300">
                    {service.icon}
                  </div>
                  <span className="text-[#8B9D83] text-sm font-medium">{service.price}</span>
                </div>
                <h3 className="font-cormorant text-2xl font-medium text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-white/60 leading-relaxed font-light">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <Button 
              size="lg" 
              className="h-14 px-8 text-base font-medium tracking-wide bg-[#8B9D83] hover:bg-[#7A8C74] text-white transition-all duration-300 rounded-sm"
            >
              Schedule an Estimate
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FREE INSTANT ESTIMATE Section */}
      <section className="py-28 lg:py-36 bg-[#F5F4F0] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#8B9D83]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#8B9D83]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        
        <div className="container mx-auto px-6 lg:px-16 xl:px-24 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calculator className="w-5 h-5 text-[#8B9D83]" />
              <span className="text-[#8B9D83] text-sm font-medium tracking-[0.25em] uppercase">
                Free Tool
              </span>
            </div>
            <h2 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-medium text-[#2C2C2C] mb-6 leading-tight">
              Get Your Instant Estimate
            </h2>
            <p className="text-[#6B6B6B] text-lg leading-relaxed font-light">
              Answer a few quick questions for a preliminary quote range
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto bg-white p-8 lg:p-12 craft-shadow"
          >
            <div className="space-y-10">
              {/* Question 1: Project Type */}
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] tracking-wide mb-4">
                  <span className="text-[#8B9D83] font-cormorant text-lg mr-2">01.</span>
                  What type of painting project?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: "exterior", label: "Exterior" },
                    { value: "interior", label: "Interior" },
                    { value: "both", label: "Both" },
                    { value: "commercial", label: "Commercial" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setProjectType(option.value);
                        setEstimateResult(null);
                        setShowCustomQuote(false);
                      }}
                      className={`py-4 px-4 text-sm font-medium tracking-wide border transition-all duration-300 ${
                        projectType === option.value
                          ? "bg-[#8B9D83] text-white border-[#8B9D83]"
                          : "bg-white text-[#2C2C2C] border-[#E8E6E1] hover:border-[#8B9D83]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Square Footage (Optional) */}
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] tracking-wide mb-2">
                  <span className="text-[#8B9D83] font-cormorant text-lg mr-2">02.</span>
                  Square footage
                  <span className="text-[#8B9D83] text-xs ml-2 font-normal">(optional)</span>
                </label>
                <p className="text-[#9A9A9A] text-xs mb-4">
                  Don't know? Select property size in next question
                </p>
                <input
                  type="number"
                  value={squareFootage}
                  onChange={(e) => {
                    setSquareFootage(e.target.value);
                    setEstimateResult(null);
                    setShowCustomQuote(false);
                  }}
                  placeholder="Enter approximate square feet"
                  className="w-full py-4 px-4 text-sm font-medium tracking-wide border border-[#E8E6E1] bg-white text-[#2C2C2C] placeholder:text-[#9A9A9A] focus:border-[#8B9D83] focus:outline-none transition-all duration-300"
                />
              </div>

              {/* Question 3: Property Size (Optional if sqft provided) */}
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] tracking-wide mb-4">
                  <span className="text-[#8B9D83] font-cormorant text-lg mr-2">03.</span>
                  What is the property size?
                  {hasSquareFootage && <span className="text-[#8B9D83] text-xs ml-2 font-normal">(optional)</span>}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: "1-2", label: "1-2 Bedrooms" },
                    { value: "3-4", label: "3-4 Bedrooms" },
                    { value: "5+", label: "5+ Bedrooms" },
                    { value: "multi", label: "Multi-unit" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setPropertySize(option.value);
                        setEstimateResult(null);
                        setShowCustomQuote(false);
                      }}
                      className={`py-4 px-4 text-sm font-medium tracking-wide border transition-all duration-300 ${
                        propertySize === option.value
                          ? "bg-[#8B9D83] text-white border-[#8B9D83]"
                          : "bg-white text-[#2C2C2C] border-[#E8E6E1] hover:border-[#8B9D83]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 4: Current Condition */}
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] tracking-wide mb-4">
                  <span className="text-[#8B9D83] font-cormorant text-lg mr-2">04.</span>
                  What is the current condition?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "excellent", label: "Excellent" },
                    { value: "good", label: "Good" },
                    { value: "fair", label: "Fair" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setCondition(option.value);
                        setEstimateResult(null);
                        setShowCustomQuote(false);
                      }}
                      className={`py-4 px-4 text-sm font-medium tracking-wide border transition-all duration-300 ${
                        condition === option.value
                          ? "bg-[#8B9D83] text-white border-[#8B9D83]"
                          : "bg-white text-[#2C2C2C] border-[#E8E6E1] hover:border-[#8B9D83]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 5: Timeframe */}
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] tracking-wide mb-4">
                  <span className="text-[#8B9D83] font-cormorant text-lg mr-2">05.</span>
                  What is your timeframe?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: "1month", label: "Within 1 month" },
                    { value: "1-3months", label: "1-3 months" },
                    { value: "3-6months", label: "3-6 months" },
                    { value: "exploring", label: "Just exploring" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setTimeframe(option.value);
                        setEstimateResult(null);
                        setShowCustomQuote(false);
                      }}
                      className={`py-4 px-4 text-sm font-medium tracking-wide border transition-all duration-300 ${
                        timeframe === option.value
                          ? "bg-[#8B9D83] text-white border-[#8B9D83]"
                          : "bg-white text-[#2C2C2C] border-[#E8E6E1] hover:border-[#8B9D83]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculate Button */}
              <div className="pt-4">
                <Button
                  onClick={calculateEstimate}
                  disabled={!isEstimateReady}
                  className={`w-full py-6 text-base font-medium tracking-wide rounded-sm transition-all duration-300 ${
                    isEstimateReady
                      ? "bg-[#8B9D83] hover:bg-[#7A8C74] text-white"
                      : "bg-[#E8E6E1] text-[#9A9A9A] cursor-not-allowed"
                  }`}
                >
                  Get Estimate Range
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              {/* Results */}
              {estimateResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 pt-8 border-t border-[#E8E6E1]"
                >
                  <div className="text-center">
                    <span className="text-[#6B6B6B] text-sm font-medium tracking-[0.15em] uppercase block mb-3">
                      Your Estimated Range
                    </span>
                    <div className="font-cormorant text-4xl md:text-5xl font-medium text-[#2C2C2C] mb-4">
                      ${estimateResult.min.toLocaleString()} – ${estimateResult.max.toLocaleString()}
                    </div>
                    {estimateResult.formula && (
                      <p className="text-[#8B9D83] text-xs mb-4 max-w-lg mx-auto font-medium">
                        {estimateResult.formula}
                      </p>
                    )}
                    <p className="text-[#6B6B6B] text-sm mb-8 max-w-md mx-auto">
                      This is a preliminary estimate. For an exact quote, schedule a free consultation.
                    </p>
                    <Button 
                      size="lg"
                      className="h-14 px-8 text-base font-medium tracking-wide bg-[#2C2C2C] hover:bg-[#3D3D3D] text-white transition-all duration-300 rounded-sm"
                    >
                      Schedule Free On-Site Consultation
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Commercial Quote Message */}
              {showCustomQuote && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 pt-8 border-t border-[#E8E6E1]"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 border border-[#8B9D83]/30 flex items-center justify-center text-[#8B9D83]">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <h3 className="font-cormorant text-2xl md:text-3xl font-medium text-[#2C2C2C] mb-4">
                      Custom Quote Required
                    </h3>
                    <p className="text-[#6B6B6B] text-sm mb-8 max-w-md mx-auto">
                      Commercial projects require a personalized assessment. Let's schedule a consultation to discuss your specific needs.
                    </p>
                    <Button 
                      size="lg"
                      className="h-14 px-8 text-base font-medium tracking-wide bg-[#8B9D83] hover:bg-[#7A8C74] text-white transition-all duration-300 rounded-sm"
                    >
                      Request Commercial Consultation
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-28 lg:py-36 bg-[#FAF9F6] grain-texture">
        <div className="container mx-auto px-6 lg:px-16 xl:px-24">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-[#8B9D83] text-sm font-medium tracking-[0.25em] uppercase mb-4 block">
              Portfolio
            </span>
            <h2 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-medium text-[#2C2C2C] mb-6 leading-tight">
              Recent Work
            </h2>
          </motion.div>

          {/* Category Filter */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center gap-6 mb-12"
          >
            {["all", "exterior", "interior", "commercial"].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`text-sm font-medium tracking-wide uppercase transition-all duration-300 pb-2 border-b-2 ${
                  activeCategory === category 
                    ? "text-[#2C2C2C] border-[#8B9D83]" 
                    : "text-[#6B6B6B] border-transparent hover:text-[#2C2C2C]"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[
              { title: "Queen Anne Victorian", category: "exterior", img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800" },
              { title: "Capitol Hill Craftsman", category: "exterior", img: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&q=80&w=800" },
              { title: "Historic Trim Detail", category: "exterior", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800" },
              { title: "Wallingford Living Room", category: "interior", img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800" },
              { title: "Ballard Accent Wall", category: "interior", img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800" },
              { title: "Fremont Boutique", category: "commercial", img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800" },
              { title: "Medina Estate", category: "exterior", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" },
              { title: "Crown Molding Detail", category: "interior", img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800" },
              { title: "Pioneer Square Office", category: "commercial", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800" }
            ].filter(item => activeCategory === "all" || item.category === activeCategory).map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative aspect-[4/3] overflow-hidden cursor-pointer"
              >
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover warm-filter group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/80 via-[#2C2C2C]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                  <span className="text-[#8B9D83] text-xs font-medium tracking-[0.2em] uppercase mb-1">{item.category}</span>
                  <h4 className="text-white font-cormorant text-xl">{item.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-28 lg:py-36 bg-[#F5F4F0]">
        <div className="container mx-auto px-6 lg:px-16 xl:px-24">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <span className="text-[#8B9D83] text-sm font-medium tracking-[0.25em] uppercase mb-4 block">
              Our Approach
            </span>
            <h2 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-medium text-[#2C2C2C] mb-6 leading-tight">
              How We Work
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {[
              {
                step: "01",
                icon: <Users className="w-5 h-5" />,
                title: "Private Consultation",
                description: "We visit your property, discuss your vision, assess the scope, and provide a detailed written estimate."
              },
              {
                step: "02",
                icon: <Sparkles className="w-5 h-5" />,
                title: "Material Selection",
                description: "Together, we select premium paints and finishes. We explain options and recommend what works best for your project."
              },
              {
                step: "03",
                icon: <ShieldCheck className="w-5 h-5" />,
                title: "Preparation & Protection",
                description: "Meticulous surface prep. Furniture covered, floors protected, landscaping safeguarded."
              },
              {
                step: "04",
                icon: <Paintbrush className="w-5 h-5" />,
                title: "Expert Application",
                description: "Our master craftsmen apply 2-3 coats with precision. Daily progress updates."
              },
              {
                step: "05",
                icon: <CheckCircle className="w-5 h-5" />,
                title: "Final Walkthrough",
                description: "We inspect together. Touch-ups completed immediately. You approve before final payment."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
                className="flex gap-8 lg:gap-12 mb-12 last:mb-0"
              >
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-[#8B9D83] flex items-center justify-center text-white shrink-0">
                    {item.icon}
                  </div>
                  {index < 4 && (
                    <div className="w-px h-full bg-[#8B9D83]/20 mt-4" />
                  )}
                </div>
                <div className="pb-12 border-b border-[#E8E6E1] last:border-0 flex-1">
                  <span className="text-[#8B9D83] text-xs font-medium tracking-[0.2em] uppercase mb-2 block">
                    Step {item.step}
                  </span>
                  <h3 className="font-cormorant text-2xl md:text-3xl font-medium text-[#2C2C2C] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[#6B6B6B] leading-relaxed font-light max-w-xl">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas Section */}
      <section className="py-28 lg:py-36 bg-[#FAF9F6] grain-texture">
        <div className="container mx-auto px-6 lg:px-16 xl:px-24">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-[#8B9D83] text-sm font-medium tracking-[0.25em] uppercase mb-4 block">
              Service Areas
            </span>
            <h2 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-medium text-[#2C2C2C] mb-12 leading-tight">
              Serving Seattle's Finest Neighborhoods
            </h2>
            
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mb-10">
              {["Ballard", "Queen Anne", "Capitol Hill", "Fremont", "Wallingford", "Bellevue", "Redmond", "Kirkland", "Medina"].map((area, index) => (
                <motion.span
                  key={area}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="inline-flex items-center text-[#2C2C2C] text-lg font-cormorant"
                >
                  {area}
                  {index < 8 && <span className="mx-3 text-[#8B9D83]">·</span>}
                </motion.span>
              ))}
            </div>
            
            <p className="text-[#6B6B6B] text-sm font-medium tracking-wide">
              Licensed, insured, and trusted by Seattle homeowners since 2019
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-28 lg:py-36 bg-[#2C2C2C]">
        <div className="container mx-auto px-6 lg:px-16 xl:px-24">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <span className="text-[#8B9D83] text-sm font-medium tracking-[0.25em] uppercase mb-4 block">
              Testimonials
            </span>
            <h2 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-medium text-white mb-6 leading-tight">
              What Our Clients Say
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                name: "Margaret Chen",
                role: "Homeowner in Medina",
                project: "Full Exterior Renovation",
                content: "The attention to detail was extraordinary. They treated our historic home with the care it deserved. The prep work alone exceeded what other contractors quoted as their entire process.",
                rating: 5
              },
              {
                name: "Robert Anderson",
                role: "Property Manager",
                project: "Multi-Unit Commercial",
                content: "We've used Tastinski for three commercial properties now. Their professionalism and minimal disruption to tenants is unmatched. Worth every penny.",
                rating: 5
              },
              {
                name: "Catherine Wells",
                role: "Homeowner in Queen Anne",
                project: "Interior Walls & Trim",
                content: "They helped us select the perfect Benjamin Moore palette. The team was punctual, clean, and the finish quality is museum-worthy. Already planning our next project.",
                rating: 5
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="p-8 lg:p-10 bg-[#363636] border border-white/5 relative"
              >
                <Quote className="absolute top-8 right-8 w-8 h-8 text-[#8B9D83]/20" />
                <div className="flex gap-1 mb-6 text-[#8B9D83]">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-white/70 text-lg mb-8 leading-relaxed font-light italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#8B9D83] flex items-center justify-center text-white font-cormorant text-lg">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{testimonial.name}</h4>
                    <div className="text-xs text-[#8B9D83] uppercase tracking-[0.15em]">{testimonial.project}</div>
                    <div className="text-xs text-white/50 mt-0.5">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-28 lg:py-36 bg-[#FAF9F6] grain-texture" id="contact">
        <div className="container mx-auto px-6 lg:px-16 xl:px-24">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-[#8B9D83] text-sm font-medium tracking-[0.25em] uppercase mb-4 block">
              Get Started
            </span>
            <h2 className="font-cormorant text-4xl md:text-5xl lg:text-6xl font-medium text-[#2C2C2C] mb-6 leading-tight">
              Begin Your Transformation
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white p-8 lg:p-12 craft-shadow"
            >
              {contactSuccess ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-6 bg-[#8B9D83]/10 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-[#8B9D83]" />
                  </div>
                  <h3 className="font-cormorant text-2xl text-[#2C2C2C] mb-3">
                    Thank You!
                  </h3>
                  <p className="text-[#6B6B6B] leading-relaxed mb-6">
                    Your inquiry has been received. We'll be in touch within 24 hours to discuss your project.
                  </p>
                  <Button 
                    onClick={() => setContactSuccess(false)}
                    variant="outline"
                    className="border-[#8B9D83] text-[#8B9D83] hover:bg-[#8B9D83] hover:text-white"
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleContactSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#2C2C2C] tracking-wide">Full Name *</label>
                      <input 
                        type="text" 
                        placeholder="Your name" 
                        required
                        value={contactForm.fullName}
                        onChange={(e) => setContactForm(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-4 py-4 bg-[#F5F4F0] border border-[#E8E6E1] focus:outline-none focus:border-[#8B9D83] transition-colors duration-300 text-[#2C2C2C] placeholder:text-[#6B6B6B]/60" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#2C2C2C] tracking-wide">Phone Number *</label>
                      <input 
                        type="tel" 
                        placeholder="(360) 000-0000"
                        required
                        value={contactForm.phoneNumber}
                        onChange={(e) => setContactForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="w-full px-4 py-4 bg-[#F5F4F0] border border-[#E8E6E1] focus:outline-none focus:border-[#8B9D83] transition-colors duration-300 text-[#2C2C2C] placeholder:text-[#6B6B6B]/60" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#2C2C2C] tracking-wide">Email Address *</label>
                    <input 
                      type="email" 
                      placeholder="you@email.com"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-4 bg-[#F5F4F0] border border-[#E8E6E1] focus:outline-none focus:border-[#8B9D83] transition-colors duration-300 text-[#2C2C2C] placeholder:text-[#6B6B6B]/60" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#2C2C2C] tracking-wide">Project Type</label>
                      <select 
                        value={contactForm.projectType}
                        onChange={(e) => setContactForm(prev => ({ ...prev, projectType: e.target.value }))}
                        className="w-full px-4 py-4 bg-[#F5F4F0] border border-[#E8E6E1] focus:outline-none focus:border-[#8B9D83] transition-colors duration-300 text-[#2C2C2C] appearance-none cursor-pointer"
                      >
                        <option value="">Select type</option>
                        <option value="Exterior Painting">Exterior Painting</option>
                        <option value="Interior Painting">Interior Painting</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#2C2C2C] tracking-wide">Property Address</label>
                      <input 
                        type="text" 
                        placeholder="Street address"
                        value={contactForm.propertyAddress}
                        onChange={(e) => setContactForm(prev => ({ ...prev, propertyAddress: e.target.value }))}
                        className="w-full px-4 py-4 bg-[#F5F4F0] border border-[#E8E6E1] focus:outline-none focus:border-[#8B9D83] transition-colors duration-300 text-[#2C2C2C] placeholder:text-[#6B6B6B]/60" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#2C2C2C] tracking-wide">Message (Optional)</label>
                    <textarea 
                      rows={4} 
                      placeholder="Tell us about your project..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full px-4 py-4 bg-[#F5F4F0] border border-[#E8E6E1] focus:outline-none focus:border-[#8B9D83] transition-colors duration-300 resize-none text-[#2C2C2C] placeholder:text-[#6B6B6B]/60"
                    />
                  </div>

                  {contactError && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                      {contactError}
                    </div>
                  )}

                  <Button 
                    type="submit"
                    disabled={contactSubmitting}
                    className="w-full py-6 text-base font-medium tracking-wide bg-[#8B9D83] hover:bg-[#7A8C74] text-white transition-all duration-300 rounded-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {contactSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Request Consultation'
                    )}
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col justify-center"
            >
              <div className="space-y-10">
                <div>
                  <a href="tel:+13605048767" className="group flex items-start gap-5">
                    <div className="w-14 h-14 border border-[#8B9D83]/30 flex items-center justify-center text-[#8B9D83] group-hover:bg-[#8B9D83] group-hover:text-white transition-all duration-300">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[#6B6B6B] text-xs font-medium tracking-[0.2em] uppercase mb-1">Phone</div>
                      <div className="text-[#2C2C2C] text-2xl font-cormorant">(360) 504-8767</div>
                    </div>
                  </a>
                </div>

                <div>
                  <a href="mailto:contact@tastinski.com" className="group flex items-start gap-5">
                    <div className="w-14 h-14 border border-[#8B9D83]/30 flex items-center justify-center text-[#8B9D83] group-hover:bg-[#8B9D83] group-hover:text-white transition-all duration-300">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[#6B6B6B] text-xs font-medium tracking-[0.2em] uppercase mb-1">Email</div>
                      <div className="text-[#2C2C2C] text-xl font-cormorant">contact@tastinski.com</div>
                    </div>
                  </a>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 border border-[#8B9D83]/30 flex items-center justify-center text-[#8B9D83]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[#6B6B6B] text-xs font-medium tracking-[0.2em] uppercase mb-1">Business Hours</div>
                    <div className="text-[#2C2C2C] text-lg">Monday - Saturday</div>
                    <div className="text-[#6B6B6B]">8 AM - 6 PM</div>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 border border-[#8B9D83]/30 flex items-center justify-center text-[#8B9D83]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[#6B6B6B] text-xs font-medium tracking-[0.2em] uppercase mb-1">Location</div>
                    <div className="text-[#2C2C2C] text-lg">Serving Greater Seattle Area</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[#2C2C2C] border-t border-white/5">
        <div className="container mx-auto px-6 lg:px-16 xl:px-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 border border-[#8B9D83]/50 flex items-center justify-center text-[#8B9D83]">
                  <Paintbrush className="w-5 h-5" />
                </div>
                <span className="font-cormorant text-xl text-white">
                  Tastinski Pro Painters
                </span>
              </div>
              <p className="text-white/50 text-sm font-light tracking-wide">
                Master Craftsmanship
              </p>
            </div>

            {/* Links */}
            <div className="flex justify-center">
              <div className="flex gap-8 text-sm font-medium text-white/60">
                <a href="#" className="hover:text-[#8B9D83] transition-colors duration-300">Services</a>
                <a href="#" className="hover:text-[#8B9D83] transition-colors duration-300">Service Areas</a>
                <a href="#contact" className="hover:text-[#8B9D83] transition-colors duration-300">Contact</a>
              </div>
            </div>

            {/* Credentials */}
            <div className="text-right">
              <div className="inline-flex items-center gap-2 text-white/60 text-sm mb-2">
                <Award className="w-4 h-4 text-[#8B9D83]" />
                <span>Licensed & Insured</span>
              </div>
              <p className="text-white/40 text-xs">
                Contractor License #TASTIP*821JQ
              </p>
            </div>
          </div>

          <div className="craft-divider mb-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.1) 70%, transparent)' }} />

          <p className="text-center text-sm text-white/40">
            © 2025 Tastinski Pro Painters. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Theme Configuration Types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  spacing: {
    section: string;
    container: string;
  };
  borderRadius: string;
}

// Navigation Types
export interface NavigationItem {
  label: string;
  href: string;
  type?: "link" | "button";
}

export interface NavigationConfig {
  logo: {
    text: string;
    image?: string;
  };
  items: NavigationItem[];
  cta?: {
    label: string;
    href: string;
  };
}

// Hero Section Types
export interface HeroSection {
  type: "hero";
  badge?: string;
  heading: string;
  subheading: string;
  description: string;
  buttons: Array<{
    label: string;
    href: string;
    variant: "default" | "outline" | "secondary" | "ghost";
  }>;
  image?: string;
}

// Features Section Types
export interface Feature {
  icon: string;
  title: string;
  description: string;
  image?: string;
}

export interface FeaturesSection {
  type: "features";
  badge?: string;
  heading: string;
  description: string;
  features: Feature[];
  layout: "grid" | "list";
}

// Pricing Section Types
export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  buttonText: string;
  buttonHref: string;
}

export interface PricingSection {
  type: "pricing";
  badge?: string;
  heading: string;
  description: string;
  plans: PricingPlan[];
}

// Testimonials Section Types
export interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  avatar?: string;
  rating?: number;
}

export interface TestimonialsSection {
  type: "testimonials";
  badge?: string;
  heading: string;
  description: string;
  testimonials: Testimonial[];
}

// Dashboard Preview Section Types
export interface DashboardPreviewSection {
  type: "dashboard";
  image?: string;
  alt?: string;
}

// CTA Section Types
export interface CTASection {
  type: "cta";
  heading: string;
  description: string;
  buttons: Array<{
    label: string;
    href: string;
    variant: "default" | "outline" | "secondary";
  }>;
  backgroundColor?: string;
}

// FAQ Section Types
export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSection {
  type: "faq";
  badge?: string;
  heading: string;
  description?: string;
  faqs: FAQItem[];
}

// Footer Types
export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterSection {
  type: "footer";
  logo: {
    text: string;
    image?: string;
  };
  description: string;
  columns: FooterColumn[];
  socialLinks?: Array<{
    platform: string;
    href: string;
    icon: string;
  }>;
  copyright: string;
}

// Union type for all sections
export type Section =
  | HeroSection
  | DashboardPreviewSection
  | FeaturesSection
  | PricingSection
  | TestimonialsSection
  | CTASection
  | FAQSection
  | FooterSection;

// Landing Page Configuration
export interface LandingPageConfig {
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  navigation: NavigationConfig;
  sections: Section[];
}

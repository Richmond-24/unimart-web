"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import apiFetch from "../../lib/apiClient";
import {
  ShoppingCart,
  Truck,
  Rocket,
  Store,
  CreditCard,
  ClipboardCheck,
  CheckCircle2,
  Smartphone,
  Heart,
  Users,
  Lock,
  ShieldCheck,
  Package,
  Check,
  Minus,
  Plus,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Mail,
  MapPin,
  Phone,
  User,
  Receipt,
  Loader2,
  PartyPopper,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// ─── DESIGN TOKENS ─────────────────────────────────────────────
const TEAL = "#0D7377";
const TEAL_DARK = "#095357";
const TEAL_LIGHT = "#14A8AE";
const TEAL_TINT = "#E6F6F6";
const TEAL_BORDER = "#BFE7E7";

const BLUE = "#2E6FBA";
const BLUE_LIGHT = "#5B93D6";
const BLUE_TINT = "#EAF2FB";
const BLUE_BORDER = "#C6DBF4";

const ORANGE = "#FF6B35";
const ORANGE_DARK = "#E5502A";
const ORANGE_TINT = "#FFEDE4";
const ORANGE_BORDER = "#FFCBAE";

const MONEY = "#12A87F";
const MONEY_TINT = "#E4F7F0";
const DANGER = "#E24C4B";
const DANGER_TINT = "#FDEBEB";

const GRAD_BRAND = `linear-gradient(135deg, ${TEAL} 0%, ${BLUE} 100%)`;
const GRAD_CTA = `linear-gradient(135deg, ${ORANGE} 0%, ${ORANGE_DARK} 100%)`;

// ─── TYPES ──────────────────────────────────────────────────
interface DeliveryOption {
  id: string;
  label: string;
  eta: string;
  price: number;
}

interface Seller {
  id: string;
  name: string;
  avatar: string;
  deliveryOptions: DeliveryOption[];
  subaccountCode?: string;
}

interface CartItem {
  id: string;
  name: string;
  seller: Seller;
  price: number;
  qty: number;
  color: string;
  likes: number;
  friendsBought: string[];
}

interface PaymentChannel {
  id: "mtn" | "vodafone" | "airteltigo" | "card";
  label: string;
  brandColor: string;
  paystackChannels: string[];
  tag: string | null;
}

interface Address {
  name: string;
  phone: string;
  region: string;
  city: string;
  landmark: string;
}

interface SellerGroup {
  seller: Seller;
  items: CartItem[];
  subtotal: number;
}

interface OrderPayload {
  items: { productId: string; qty: number; price: number; sellerId: string }[];
  delivery: {
    perSeller: { sellerId: string; optionId: string; price: number }[];
    address: Address | null;
  };
  buyerEmail: string;
  totals: { subtotal: number; deliveryFee: number; discount: number; total: number };
}

interface OrderResponse {
  id: string;
  orderId: string;
  status: string;
}

interface PaystackVerifyPayload {
  reference: string;
  orderId: string;
}

interface SuccessState {
  orderId: string;
  total: number;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

// ─── API CONFIG ──────────────────────────────────────────────
// IMPORTANT: apiFetch already adds /api to the URL, so use '/orders' not '/api/orders'
const api = {
  async createOrder(payload: OrderPayload): Promise<OrderResponse> {
    console.log('📤 Sending to /orders:', JSON.stringify(payload, null, 2));
    
    if (!payload.items || payload.items.length === 0) {
      throw new Error('Cart is empty. Please add items before checkout.');
    }
    
    if (!payload.buyerEmail) {
      throw new Error('Email is required. Please enter your email.');
    }

    // ✅ CORRECT: Use '/orders' not '/api/orders' (apiFetch adds /api)
    return apiFetch("/orders", { 
      method: "POST", 
      body: JSON.stringify(payload) 
    }) as Promise<OrderResponse>;
  },
  async initializePaystackPayment(data: { 
    email: string; 
    amount: number; 
    orderId: string;
    splitCode?: string | null;
  }): Promise<{ access_code: string; reference: string }> {
    // ✅ CORRECT: Use '/payments/paystack/initialize' (apiFetch adds /api)
    return apiFetch("/payments/paystack/initialize", {
      method: "POST",
      body: JSON.stringify(data),
    }) as Promise<{ access_code: string; reference: string }>;
  },
  async verifyPaystackPayment(payload: PaystackVerifyPayload): Promise<{ status: string }> {
    // ✅ CORRECT: Use '/payments/paystack/verify' (apiFetch adds /api)
    return apiFetch("/payments/paystack/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    }) as Promise<{ status: string }>;
  },
};

// ─── MOCK DATA ──────────────────────────────────────────────
const SELLER_ADWOA: Seller = {
  id: "seller-adwoa",
  name: "@adwoa.creates",
  avatar: "AC",
  deliveryOptions: [
    { id: "pickup", label: "Campus Pickup", eta: "Today", price: 0 },
    { id: "standard", label: "Standard Delivery", eta: "3–5 days", price: 15 },
    { id: "express", label: "Express Delivery", eta: "1–2 days", price: 35 },
  ],
  subaccountCode: "ACCT_xxxxxxxxxx",
};

const SELLER_KWAME: Seller = {
  id: "seller-kwame",
  name: "@kwame.kicks",
  avatar: "KK",
  deliveryOptions: [
    { id: "standard", label: "Standard Delivery", eta: "4–6 days", price: 20 },
    { id: "express", label: "Express Delivery", eta: "2 days", price: 40 },
  ],
  subaccountCode: "ACCT_yyyyyyyyyy",
};

const MOCK_CART: CartItem[] = [
  { id: "p1", name: "Ankara Print Tote Bag", seller: SELLER_ADWOA, price: 85, qty: 1, color: "#E8603C", likes: 234, friendsBought: ["Ama", "Kofi"] },
  { id: "p2", name: "Retro Runner Sneakers", seller: SELLER_KWAME, price: 180, qty: 1, color: "#4361EE", likes: 512, friendsBought: ["Nana"] },
];

const PAYMENT_CHANNELS: PaymentChannel[] = [
  { id: "mtn", label: "MTN MoMo", brandColor: "#FFCB05", paystackChannels: ["mobile_money"], tag: "Popular" },
  { id: "vodafone", label: "Vodafone Cash", brandColor: "#E60000", paystackChannels: ["mobile_money"], tag: null },
  { id: "airteltigo", label: "AirtelTigo", brandColor: "#ED1C24", paystackChannels: ["mobile_money"], tag: null },
  { id: "card", label: "Card", brandColor: BLUE, paystackChannels: ["card"], tag: null },
];

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
const STEPS: { label: string; icon: LucideIcon }[] = [
  { label: "Cart", icon: ShoppingCart },
  { label: "Delivery", icon: Truck },
  { label: "Payment", icon: CreditCard },
  { label: "Review", icon: ClipboardCheck },
];

// ─── UTILITY ─────────────────────────────────────────────────
const fmt = (n: number): string => `GH₵ ${Number(n).toFixed(2)}`;

function deliveryIconFor(option: DeliveryOption): LucideIcon {
  if (option.id === "pickup") return Store;
  if (option.id === "express") return Rocket;
  return Truck;
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("No window"));
    if (window.PaystackPop) return resolve();
    const existing = document.getElementById("paystack-inline-js");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Paystack")));
      return;
    }
    const script = document.createElement("script");
    script.id = "paystack-inline-js";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack"));
    document.body.appendChild(script);
  });
}

// ─── ANIMATION VARIANTS ─────────────────────────────────────────
const stepVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction >= 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction >= 0 ? -28 : 28 }),
};

const listStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const listItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

// ─── GLOBAL SCOPED STYLES ───────────────────────────────────────
function CheckoutStyles() {
  return (
    <style jsx global>{`
      * {
        box-sizing: border-box;
      }
      .uc-root {
        overflow-x: hidden;
      }
      .uc-input {
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
        font-size: 16px !important;
      }
      .uc-input:focus {
        outline: none;
        border-color: ${TEAL} !important;
        box-shadow: 0 0 0 3px ${TEAL_TINT};
      }
      .uc-btn-primary:focus-visible {
        outline: 2px solid ${ORANGE};
        outline-offset: 2px;
      }
      .uc-btn-ghost:hover {
        border-color: ${TEAL} !important;
        background: ${TEAL_TINT} !important;
      }
      .uc-option {
        cursor: pointer;
      }
      .uc-option:hover {
        border-color: ${TEAL_LIGHT} !important;
      }
      .uc-logo-badge {
        box-shadow: 0 4px 14px -3px rgba(13, 115, 119, 0.55);
      }
      .uc-panel-scroll {
        overflow: hidden;
      }
      @media (max-width: 767px) {
        .uc-hide-mobile {
          display: none !important;
        }
        .uc-summary-sidebar {
          display: none !important;
        }
      }
      @media (min-width: 768px) {
        .uc-hide-desktop {
          display: none !important;
        }
      }
    `}</style>
  );
}

// ─── SMALL UI PRIMITIVES ──────────────────────────────────────
function IconBadge({ icon: Icon, tone = "teal", size = 36 }: { icon: LucideIcon; tone?: "teal" | "blue" | "orange" | "money" | "muted"; size?: number }) {
  const map: Record<string, { bg: string; fg: string }> = {
    teal: { bg: TEAL_TINT, fg: TEAL },
    blue: { bg: BLUE_TINT, fg: BLUE },
    orange: { bg: ORANGE_TINT, fg: ORANGE_DARK },
    money: { bg: MONEY_TINT, fg: MONEY },
    muted: { bg: "var(--color-background-secondary)", fg: "var(--color-text-secondary)" },
  };
  const { bg, fg } = map[tone];
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.32, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={size * 0.5} color={fg} strokeWidth={2.1} />
    </div>
  );
}

function StepHeader({ icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: "1.35rem", minWidth: 0 }}>
      <IconBadge icon={icon} tone="teal" />
      <div style={{ minWidth: 0 }}>
        <h2 style={{ margin: 0, fontSize: "clamp(17px, 4.2vw, 19px)", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: -0.3 }}>{title}</h2>
        <p style={{ margin: "3px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>{subtitle}</p>
      </div>
    </div>
  );
}

function Row({ label, value, bold, valueColor, mono }: { label: string; value: string; bold?: boolean; valueColor?: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
      <span style={{ fontSize: 13, color: bold ? "var(--color-text-primary)" : "var(--color-text-secondary)", fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span
        style={{
          fontSize: bold ? 16 : 13,
          fontWeight: bold ? 800 : 500,
          color: valueColor || "var(--color-text-primary)",
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
          fontFamily: mono ? "var(--font-mono, monospace)" : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function QtyBtn({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.88 }}
      style={{
        width: 32,
        height: 32,
        borderRadius: 9,
        border: "1px solid var(--color-border-secondary)",
        background: "var(--color-background-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-text-primary)",
        flexShrink: 0,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </motion.button>
  );
}

function PrimaryButton({ children, onClick, disabled, loading, trailingIcon: Trailing = ArrowRight }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; loading?: boolean; trailingIcon?: LucideIcon }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className="uc-btn-primary"
      whileHover={disabled || loading ? undefined : { scale: 1.015 }}
      whileTap={disabled || loading ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.12 }}
      style={{
        width: "100%",
        padding: "15px",
        borderRadius: 13,
        border: "none",
        background: disabled || loading ? "var(--color-border-secondary)" : GRAD_CTA,
        color: "#fff",
        fontSize: 15,
        fontWeight: 700,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        letterSpacing: 0.1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxShadow: disabled || loading ? "none" : "0 6px 16px -4px rgba(255, 107, 53, 0.45)",
      }}
    >
      {loading ? (
        <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} style={{ display: "flex" }}>
          <Loader2 size={16} />
        </motion.span>
      ) : null}
      {children}
      {!loading && Trailing ? <Trailing size={16} /> : null}
    </motion.button>
  );
}

function GhostButton({ children, onClick, leadingIcon: Leading = ArrowLeft }: { children: React.ReactNode; onClick: () => void; leadingIcon?: LucideIcon }) {
  return (
    <motion.button
      onClick={onClick}
      className="uc-btn-ghost"
      whileTap={{ scale: 0.97 }}
      style={{
        padding: "14px 18px",
        borderRadius: 13,
        border: "1px solid var(--color-border-secondary)",
        background: "transparent",
        color: "var(--color-text-primary)",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      {Leading ? <Leading size={15} /> : null}
      {children}
    </motion.button>
  );
}

function IconInput({
  icon: Icon,
  invalid,
  ...props
}: { icon: LucideIcon; invalid?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ position: "relative" }}>
      <Icon size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)", pointerEvents: "none" }} />
      <input
        {...props}
        className="uc-input"
        style={{
          width: "100%",
          padding: "12px 12px 12px 36px",
          borderRadius: 11,
          border: `1px solid ${invalid ? DANGER : "var(--color-border-secondary)"}`,
          background: "var(--color-background-primary)",
          color: "var(--color-text-primary)",
        }}
      />
    </div>
  );
}

// ─── STEPPER ─────────────────────────────────────────────────
function Stepper({ step, furthestStep, onJump, isMobile }: { step: number; furthestStep: number; onJump: (n: number) => void; isMobile: boolean }) {
  const pct = ((step - 1) / (STEPS.length - 1)) * 100;
  return (
    <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto", padding: isMobile ? "0.9rem 1rem 0" : "1.25rem 1.5rem 0" }}>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ position: "absolute", top: 16, left: `${100 / (STEPS.length * 2)}%`, right: `${100 / (STEPS.length * 2)}%`, height: 3, background: "var(--color-border-tertiary)", borderRadius: 999, zIndex: 0 }} />
        <motion.div
          initial={false}
          animate={{ width: `calc(${pct}% * ${(STEPS.length - 1) / STEPS.length})` }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: 16,
            left: `${100 / (STEPS.length * 2)}%`,
            height: 3,
            background: GRAD_BRAND,
            borderRadius: 999,
            zIndex: 0,
          }}
        />
        {STEPS.map(({ label, icon: Icon }, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          const reachable = n <= furthestStep;
          return (
            <button key={label} onClick={() => reachable && onJump(n)} disabled={!reachable} style={{ position: "relative", zIndex: 1, background: "none", border: "none", cursor: reachable ? "pointer" : "default", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1, padding: 0 }}>
              <motion.div
                animate={{ scale: active ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: done ? GRAD_BRAND : active ? GRAD_CTA : "var(--color-background-primary)",
                  border: active || done ? "none" : "2px solid var(--color-border-tertiary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: done || active ? "#fff" : "var(--color-text-tertiary)",
                  boxShadow: active ? "0 4px 12px -2px rgba(255,107,53,0.5)" : done ? "0 4px 12px -2px rgba(13,115,119,0.4)" : "none",
                }}
              >
                {done ? <Check size={15} strokeWidth={2.6} /> : <Icon size={14} strokeWidth={2.2} />}
              </motion.div>
              <span style={{ fontSize: isMobile ? 10 : 12, fontWeight: active ? 700 : 500, color: active ? "var(--color-text-primary)" : "var(--color-text-tertiary)", whiteSpace: "nowrap" }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function SocialCheckout() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<number>(1);
  const [furthestStep, setFurthestStep] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1);

  const [deliverySelections, setDeliverySelections] = useState<Record<string, string>>({});
  const [address, setAddress] = useState<Address>({ name: "", phone: "", region: "", city: "", landmark: "" });
  const [buyerEmail, setBuyerEmail] = useState<string>("");

  const [payChannel, setPayChannel] = useState<PaymentChannel["id"]>("mtn");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [summaryOpen, setSummaryOpen] = useState<boolean>(false);

  const bottomBarRef = useRef<HTMLDivElement | null>(null);
  const [bottomBarHeight, setBottomBarHeight] = useState<number>(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile || typeof ResizeObserver === "undefined") return;
    const el = bottomBarRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setBottomBarHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile, summaryOpen]);

  const sellerGroups: SellerGroup[] = useMemo(() => {
    const map = new Map<string, SellerGroup>();
    for (const item of cart) {
      const key = item.seller.id;
      if (!map.has(key)) map.set(key, { seller: item.seller, items: [], subtotal: 0 });
      const g = map.get(key)!;
      g.items.push(item);
      g.subtotal += item.price * item.qty;
    }
    return Array.from(map.values());
  }, [cart]);

  useEffect(() => {
    setDeliverySelections((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const g of sellerGroups) {
        if (!next[g.seller.id] && g.seller.deliveryOptions[0]) {
          next[g.seller.id] = g.seller.deliveryOptions[0].id;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [sellerGroups]);

  const needsAddress = sellerGroups.some((g) => {
    const chosenId = deliverySelections[g.seller.id];
    return chosenId && chosenId !== "pickup";
  });

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = sellerGroups.reduce((sum, g) => {
    const chosenId = deliverySelections[g.seller.id];
    const opt = g.seller.deliveryOptions.find((o) => o.id === chosenId);
    return sum + (opt?.price ?? 0);
  }, 0);
  const discount = subtotal > 200 ? 20 : 0;
  const total = subtotal + deliveryFee - discount;

  const mapBackendToCartItem = (it: any): CartItem => {
    const sellerRaw = it.product?.seller || {};
    const seller: Seller = {
      id: sellerRaw._id || sellerRaw.id || it.sellerId || "unknown-seller",
      name: sellerRaw.username || it.seller || "@creator",
      avatar: (sellerRaw.name && sellerRaw.name.split(" ").map((s: string) => s[0]).slice(0, 2).join("")) || it.sellerAvatar || "",
      deliveryOptions:
        Array.isArray(sellerRaw.deliveryOptions) && sellerRaw.deliveryOptions.length > 0
          ? sellerRaw.deliveryOptions
          : [{ id: "standard", label: "Standard Delivery", eta: "3–5 days", price: 15 }],
      subaccountCode: sellerRaw.subaccountCode || null,
    };
    return {
      id: it.product?._id || it.product?.id || it._id || String(it.product),
      name: it.product?.title || it.title || it.name || "Item",
      seller,
      price: Number(it.product?.price ?? it.price ?? 0),
      qty: Number(it.quantity ?? it.qty ?? 1),
      color: it.product?.color || it.color || "#DDD",
      likes: Number(it.product?.likes ?? it.likes ?? 0),
      friendsBought: Array.isArray(it.friendsBought) ? it.friendsBought : [],
    };
  };

  const readLocalCart = (): CartItem[] => {
    try {
      const raw = localStorage.getItem("unimart:cart");
      const cur = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(cur)) return [];
      return cur.map(
        (c: any): CartItem => ({
          id: c.id,
          name: c.title || c.name || "Item",
          seller: c.seller || SELLER_ADWOA,
          price: Number(c.price || 0),
          qty: Number(c.qty || 1),
          color: c.color || "#DDD",
          likes: Number(c.likes || 0),
          friendsBought: Array.isArray(c.friendsBought) ? c.friendsBought : [],
        })
      );
    } catch {
      return [];
    }
  };

  const mergeCartItems = (backendItems: CartItem[], localItems: CartItem[]) => {
    const map = new Map<string, CartItem>();
    backendItems.forEach((item) => item?.id && map.set(item.id, { ...item, qty: Number(item.qty || 1) }));
    localItems.forEach((item) => {
      if (!item?.id) return;
      if (map.has(item.id)) {
        const existing = map.get(item.id)!;
        map.set(item.id, { ...existing, qty: Number(existing.qty || 0) + Number(item.qty || 1) });
      } else {
        map.set(item.id, item);
      }
    });
    return Array.from(map.values());
  };

  const loadCart = useCallback(async () => {
    try {
      const localItems = readLocalCart();
      if (typeof window !== "undefined" && localStorage.getItem("unimart:token")) {
        try {
          const res = await apiFetch("/cart");
          if (res && res.success && res.data) {
            const backendItems = (Array.isArray(res.data.items) ? res.data.items : []).map(mapBackendToCartItem);
            setCart(mergeCartItems(backendItems, localItems));
            return;
          }
        } catch {
          /* fall through to local */
        }
      }
      setCart(localItems.length ? localItems : MOCK_CART);
    } catch {
      setCart(MOCK_CART);
    }
  }, []);

  useEffect(() => {
    loadCart();
    const onCustom = () => loadCart();
    window.addEventListener("unimart:cartUpdated", onCustom as EventListener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "unimart:cart") loadCart();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("unimart:cartUpdated", onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, [loadCart]);

  const updateQty = (id: string, delta: number) => {
    (async () => {
      const next = cart.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0);
      try {
        if (typeof window !== "undefined" && localStorage.getItem("unimart:token")) {
          const target = next.find((it) => it.id === id);
          const qty = target ? target.qty : 0;
          if (qty <= 0) await apiFetch(`/cart/${id}`, { method: "DELETE" });
          else await apiFetch("/cart/update", { method: "PUT", body: JSON.stringify({ productId: id, quantity: qty }) });
          window.dispatchEvent(new Event("unimart:cartUpdated"));
          await loadCart();
          return;
        }
      } catch {
        /* fall through */
      }
      setCart(next);
      try {
        localStorage.setItem("unimart:cart", JSON.stringify(next));
        window.dispatchEvent(new Event("unimart:cartUpdated"));
      } catch {
        /* ignore */
      }
    })();
  };

  const validateCartStep = (): boolean => cart.length > 0;

  const validateDeliveryStep = (): boolean => {
    const allChosen = sellerGroups.every((g) => !!deliverySelections[g.seller.id]);
    if (!allChosen) return false;
    if (!needsAddress) return true;
    return !!address.name && !!address.phone && !!address.region && !!address.city;
  };

  const validatePaymentStep = (): boolean => /\S+@\S+\.\S+/.test(buyerEmail);

  const goNext = () => {
    setDirection(1);
    setStep((s) => {
      const n = Math.min(s + 1, STEPS.length);
      setFurthestStep((f) => Math.max(f, n));
      return n;
    });
  };
  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };
  const jumpTo = (n: number) => {
    setDirection(n >= step ? 1 : -1);
    setStep(n);
  };

  const handleFieldChange = (field: keyof Address, value: string) => setAddress((prev) => ({ ...prev, [field]: value }));
  const handleTouch = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const buildOrderPayload = (): OrderPayload => {
    const items = cart.map((i) => ({
      productId: i.id,
      qty: i.qty,
      price: i.price,
      sellerId: i.seller.id,
    }));

    const perSeller = sellerGroups.map((g) => ({
      sellerId: g.seller.id,
      optionId: deliverySelections[g.seller.id] || g.seller.deliveryOptions[0]?.id || 'standard',
      price: g.seller.deliveryOptions.find((o) => o.id === deliverySelections[g.seller.id])?.price ?? 0,
    }));

    const payload: OrderPayload = {
      items,
      delivery: {
        perSeller,
        address: needsAddress ? address : null,
      },
      buyerEmail: buyerEmail || '',
      totals: {
        subtotal,
        deliveryFee,
        discount,
        total,
      },
    };

    console.log('🔍 buildOrderPayload output:', JSON.stringify(payload, null, 2));
    
    return payload;
  };

  const handlePlaceOrder = async () => {
    setError("");
    
    console.log('🔑 PAYSTACK_PUBLIC_KEY:', PAYSTACK_PUBLIC_KEY ? '✅ Set' : '❌ Not Set');

    if (!PAYSTACK_PUBLIC_KEY) {
      setError("Paystack isn't configured yet — set NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY.");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty. Please add items before checkout.");
      return;
    }

    if (!buyerEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔍 Checkout State:');
      console.log('  - Cart items:', cart.length);
      console.log('  - Seller groups:', sellerGroups.length);
      console.log('  - Buyer email:', buyerEmail);
      console.log('  - Totals:', { subtotal, deliveryFee, discount, total });

      const payload = buildOrderPayload();
      
      if (payload.items.length === 0) {
        throw new Error('Cart is empty. Please add items before checkout.');
      }
      
      if (!payload.buyerEmail) {
        throw new Error('Email is required. Please enter your email.');
      }

      console.log('📤 Creating order with payload:', JSON.stringify(payload, null, 2));
      const order = await api.createOrder(payload);
      console.log('✅ Order created:', order);
      
      const sellerId = sellerGroups[0]?.seller.id;
      let splitCode = null;
      
      if (sellerId) {
        try {
          const seller = sellerGroups[0]?.seller;
          splitCode = seller?.subaccountCode || null;
        } catch (error) {
          console.error('Failed to fetch split code:', error);
        }
      }

      console.log('💳 Initializing Paystack payment...');
      const { access_code, reference } = await api.initializePaystackPayment({
        email: buyerEmail,
        amount: total,
        orderId: order.id,
        splitCode,
      });
      console.log('✅ Payment initialized:', { access_code, reference });

      await loadPaystackScript();

      const channel = PAYMENT_CHANNELS.find((c) => c.id === payChannel);
      const channels = channel?.paystackChannels || ["card"];

      if (!window.PaystackPop) {
        throw new Error("Paystack failed to load. Please refresh and try again.");
      }

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: buyerEmail,
        amount: Math.round(total * 100),
        currency: "GHS",
        ref: reference,
        channels: channels,
        metadata: {
          orderId: order.id,
          split_code: splitCode,
        },
        callback: async (response: { reference: string }) => {
          try {
            await api.verifyPaystackPayment({ 
              reference: response.reference, 
              orderId: order.id 
            });
            
            setSuccess({ 
              orderId: order.orderId || order.id, 
              total 
            });
            
            try {
              if (localStorage.getItem("unimart:token")) {
                await apiFetch("/cart/clear", { method: "DELETE" });
              } else {
                localStorage.removeItem("unimart:cart");
              }
              window.dispatchEvent(new Event("unimart:cartUpdated"));
              setCart([]);
            } catch {
              // Non-fatal
            }
          } catch (error: unknown) {
            setError(
              error instanceof Error 
                ? error.message 
                : "We couldn't confirm your payment. Contact support with your reference: " + response.reference
            );
          } finally {
            setLoading(false);
          }
        },
        onClose: () => {
          setLoading(false);
          setError("Payment window closed before it was completed. No charge was made.");
        },
      });

      handler.openIframe();

    } catch (error: unknown) {
      console.error('❌ Checkout error:', error);
      setError(error instanceof Error ? error.message : "Something went wrong starting checkout.");
      setLoading(false);
    }
  };

  // ─── SUCCESS SCREEN ─────────────────────────────────────────
  if (success) {
    return (
      <div className="uc-root" style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${TEAL_TINT} 0%, var(--color-background-tertiary) 340px)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
        <CheckoutStyles />
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          style={{ background: "var(--color-background-primary)", borderRadius: 26, border: "1px solid var(--color-border-tertiary)", padding: "2.25rem 1.75rem", maxWidth: 440, width: "100%", textAlign: "center", boxShadow: "0 20px 50px -20px rgba(13,115,119,0.35)" }}
        >
          <div style={{ position: "relative", width: 76, height: 76, margin: "0 auto 1.25rem" }}>
            <motion.div
              initial={{ scale: 0.85, opacity: 0.55 }}
              animate={{ scale: 1.55, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              style={{ position: "absolute", inset: 0, borderRadius: "50%", background: MONEY }}
            />
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
              style={{ position: "relative", width: 76, height: 76, borderRadius: "50%", background: GRAD_BRAND, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 22px -6px rgba(13,115,119,0.55)" }}
            >
              <CheckCircle2 size={38} color="#fff" strokeWidth={2} />
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
            <PartyPopper size={18} color={ORANGE} />
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "var(--color-text-primary)" }}>Order Placed</h2>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }} style={{ color: "var(--color-text-secondary)", margin: "0 0 1.5rem", fontSize: 14 }}>
            Order <strong>{success.orderId}</strong> is confirmed and each seller has been notified.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            style={{ background: TEAL_TINT, border: `1px solid ${TEAL_BORDER}`, borderRadius: 14, padding: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
          >
            <Receipt size={18} color={TEAL} />
            <div>
              <p style={{ margin: 0, fontSize: 12, color: TEAL_DARK, textAlign: "left" }}>Total paid</p>
              <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: TEAL_DARK, fontVariantNumeric: "tabular-nums" }}>{fmt(success.total)}</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSuccess(null);
                setStep(1);
                setFurthestStep(1);
                setCart(MOCK_CART);
              }}
              style={{ padding: "11px 20px", borderRadius: 11, border: "1px solid var(--color-border-secondary)", background: "transparent", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}
            >
              Continue Shopping
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ padding: "11px 20px", borderRadius: 11, border: "none", background: GRAD_CTA, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, boxShadow: "0 6px 16px -4px rgba(255,107,53,0.45)" }}>
              <Truck size={15} />
              Track Order
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ─── MAIN WIZARD ─────────────────────────────────────────────
  return (
    <div className="uc-root" style={{ minHeight: "100vh", background: "var(--color-background-tertiary)", fontFamily: "var(--font-sans)", paddingBottom: isMobile ? bottomBarHeight + 12 : 40 }}>
      <CheckoutStyles />

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ background: GRAD_BRAND, padding: isMobile ? "0.85rem 1rem" : "0.9rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, boxShadow: "0 4px 16px -6px rgba(13,115,119,0.5)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div className="uc-logo-badge" style={{ width: 34, height: 34, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            <img src="/logo.png" alt="Uni-Mart" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: "#fff", letterSpacing: -0.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Uni-Mart</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.92)", background: "rgba(255,255,255,0.16)", padding: "6px 12px", borderRadius: 999, flexShrink: 0, whiteSpace: "nowrap" }}>
          <ShoppingCart size={14} />
          {cart.reduce((s, i) => s + i.qty, 0)} items
        </div>
      </motion.div>

      <Stepper step={step} furthestStep={furthestStep} onJump={(n) => furthestStep >= n && jumpTo(n)} isMobile={isMobile} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "1rem" : "1.5rem", display: "flex", flexDirection: isMobile ? "column" : "row", gap: "1.5rem", alignItems: "flex-start" }}>
        <div className="uc-panel-scroll" style={{ flex: 1, width: "100%", minWidth: 0, background: "var(--color-background-primary)", borderRadius: 20, border: "1px solid var(--color-border-tertiary)", padding: isMobile ? "1.1rem" : "1.6rem", boxShadow: "0 2px 10px rgba(16,16,20,0.05)", position: "relative" }}>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: "1rem" }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ background: DANGER_TINT, border: `1px solid ${DANGER}33`, borderRadius: 12, padding: "10px 14px", fontSize: 13, color: DANGER, display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {step === 1 && (
                <div>
                  <StepHeader icon={ShoppingCart} title="Your Cart" subtitle={`Items from ${sellerGroups.length} local ${sellerGroups.length === 1 ? "creator" : "creators"}`} />

                  {cart.length === 0 && <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>Your cart is empty.</p>}

                  <motion.div variants={listStagger} initial="hidden" animate="show">
                    {sellerGroups.map((group) => (
                      <div key={group.seller.id} style={{ marginBottom: "1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, minWidth: 0 }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: GRAD_BRAND, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{group.seller.avatar}</div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: TEAL_DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{group.seller.name}</span>
                        </div>

                        {group.items.map((item) => (
                          <motion.div variants={listItem} key={item.id} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--color-border-tertiary)" }}>
                            <div style={{ width: isMobile ? 54 : 60, height: isMobile ? 54 : 60, borderRadius: 14, background: item.color + "1F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Package size={24} color={item.color} strokeWidth={1.8} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5, color: "var(--color-text-primary)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{fmt(item.price * item.qty)}</p>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6, flexWrap: "wrap", gap: 6 }}>
                                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--color-text-tertiary)", minWidth: 0 }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                                    <Heart size={12} fill="currentColor" color={ORANGE} /> {item.likes.toLocaleString()}
                                  </span>
                                  {item.friendsBought.length > 0 && (
                                    <span style={{ display: "flex", alignItems: "center", gap: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      <Users size={12} style={{ flexShrink: 0 }} /> {item.friendsBought.slice(0, 2).join(", ")} bought this
                                    </span>
                                  )}
                                </span>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                                  <QtyBtn onClick={() => updateQty(item.id, -1)}>
                                    <Minus size={13} />
                                  </QtyBtn>
                                  <span style={{ fontSize: 14, fontWeight: 700, minWidth: 16, textAlign: "center" }}>{item.qty}</span>
                                  <QtyBtn onClick={() => updateQty(item.id, 1)}>
                                    <Plus size={13} />
                                  </QtyBtn>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </motion.div>

                  <div style={{ marginTop: "1.5rem" }}>
                    <PrimaryButton onClick={() => validateCartStep() && goNext()} disabled={!validateCartStep()}>
                      Continue to Delivery
                    </PrimaryButton>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <StepHeader icon={Truck} title="Delivery" subtitle="Each seller sets their own delivery options — choose one per seller" />

                  {sellerGroups.map((group) => (
                    <div key={group.seller.id} style={{ marginBottom: "1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, minWidth: 0, flexWrap: "wrap" }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: GRAD_BRAND, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{group.seller.avatar}</div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis" }}>{group.seller.name}</span>
                        <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", whiteSpace: "nowrap" }}>
                          · {group.items.length} item{group.items.length > 1 ? "s" : ""}
                        </span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : `repeat(${Math.min(group.seller.deliveryOptions.length, 3)}, 1fr)`, gap: 10 }}>
                        {group.seller.deliveryOptions.map((opt) => {
                          const selected = deliverySelections[group.seller.id] === opt.id;
                          const OptIcon = deliveryIconFor(opt);
                          return (
                            <motion.button
                              key={opt.id}
                              onClick={() => setDeliverySelections((prev) => ({ ...prev, [group.seller.id]: opt.id }))}
                              className="uc-option"
                              whileTap={{ scale: 0.98 }}
                              style={{
                                padding: "13px 12px",
                                borderRadius: 14,
                                border: selected ? `2px solid ${TEAL}` : "1px solid var(--color-border-tertiary)",
                                background: selected ? TEAL_TINT : "var(--color-background-primary)",
                                textAlign: "left",
                                boxShadow: selected ? "0 4px 12px -4px rgba(13,115,119,0.35)" : "none",
                                minWidth: 0,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, minWidth: 0 }}>
                                <OptIcon size={14} color={selected ? TEAL : "var(--color-text-secondary)"} style={{ flexShrink: 0 }} />
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: selected ? TEAL_DARK : "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.label}</p>
                              </div>
                              <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-secondary)" }}>{opt.eta}</p>
                              <p style={{ margin: "4px 0 0", fontSize: 13, fontWeight: 800, color: opt.price === 0 ? MONEY : "var(--color-text-primary)", fontVariantNumeric: "tabular-nums" }}>{opt.price === 0 ? "Free" : fmt(opt.price)}</p>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {needsAddress && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px", color: "var(--color-text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                        <MapPin size={14} color={BLUE} /> Delivery address
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                        <div style={{ gridColumn: !isMobile ? "span 2" : "span 1" }}>
                          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>Full Name</label>
                          <IconInput icon={User} value={address.name} onChange={(e) => handleFieldChange("name", e.target.value)} onBlur={() => handleTouch("name")} placeholder="Ama Owusu" invalid={touched.name && !address.name} />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>Phone Number</label>
                          <IconInput icon={Phone} value={address.phone} onChange={(e) => handleFieldChange("phone", e.target.value)} onBlur={() => handleTouch("phone")} placeholder="0244 123 456" invalid={touched.phone && !address.phone} />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>Region</label>
                          <IconInput icon={MapPin} value={address.region} onChange={(e) => handleFieldChange("region", e.target.value)} onBlur={() => handleTouch("region")} placeholder="Greater Accra" invalid={touched.region && !address.region} />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>City / Town</label>
                          <IconInput icon={MapPin} value={address.city} onChange={(e) => handleFieldChange("city", e.target.value)} onBlur={() => handleTouch("city")} placeholder="Accra" invalid={touched.city && !address.city} />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>Landmark (optional)</label>
                          <IconInput icon={MapPin} value={address.landmark} onChange={(e) => handleFieldChange("landmark", e.target.value)} placeholder="Near Accra Mall" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10, marginTop: "1.5rem" }}>
                    <GhostButton onClick={goBack}>Back</GhostButton>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <PrimaryButton
                        onClick={() => {
                          if (validateDeliveryStep()) goNext();
                          else setTouched({ name: true, phone: true, region: true, city: true });
                        }}
                      >
                        Continue to Payment
                      </PrimaryButton>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <StepHeader icon={CreditCard} title="Payment" subtitle="Checkout runs securely through Paystack" />

                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>Email for receipt</label>
                  <div style={{ marginBottom: "1.25rem" }}>
                    <IconInput icon={Mail} value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} onBlur={() => handleTouch("email")} placeholder="you@example.com" type="email" invalid={touched.email && !validatePaymentStep()} />
                  </div>

                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", margin: "0 0 8px" }}>Payment method</p>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10, marginBottom: "1.25rem" }}>
                    {PAYMENT_CHANNELS.map((pm) => {
                      const selected = payChannel === pm.id;
                      const Icon = pm.id === "card" ? CreditCard : Smartphone;
                      return (
                        <motion.button
                          key={pm.id}
                          onClick={() => setPayChannel(pm.id)}
                          className="uc-option"
                          whileTap={{ scale: 0.98 }}
                          style={{ padding: "13px 10px", borderRadius: 14, border: selected ? `2px solid ${TEAL}` : "1px solid var(--color-border-tertiary)", background: selected ? TEAL_TINT : "var(--color-background-primary)", textAlign: "center", position: "relative", boxShadow: selected ? "0 4px 12px -4px rgba(13,115,119,0.35)" : "none", minWidth: 0, overflow: "hidden" }}
                        >
                          {pm.tag && (
                            <span style={{ position: "absolute", top: 6, right: 6, fontSize: 9, fontWeight: 700, background: GRAD_CTA, color: "#fff", padding: "2px 6px", borderRadius: 20, lineHeight: 1.4 }}>{pm.tag}</span>
                          )}
                          <div style={{ position: "relative", width: 26, height: 26, margin: "6px auto 0" }}>
                            <Icon size={22} color={selected ? TEAL : "var(--color-text-secondary)"} />
                            <span style={{ position: "absolute", bottom: -1, right: -3, width: 8, height: 8, borderRadius: "50%", background: pm.brandColor, border: "1.5px solid var(--color-background-primary)" }} />
                          </div>
                          <p style={{ margin: "6px 0 0", fontSize: 12, fontWeight: 700, color: selected ? TEAL_DARK : "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pm.label}</p>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div style={{ background: BLUE_TINT, borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <ShieldCheck size={16} color={BLUE} style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>
                      {payChannel === "card" ? "Card details are entered on Paystack's secure page — Uni-Mart never sees or stores your card." : "You'll get a Paystack prompt to approve payment from your phone."}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: "1.5rem" }}>
                    <GhostButton onClick={goBack}>Back</GhostButton>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <PrimaryButton
                        onClick={() => {
                          if (validatePaymentStep()) goNext();
                          else setTouched((t) => ({ ...t, email: true }));
                        }}
                      >
                        Review Order
                      </PrimaryButton>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <StepHeader icon={ClipboardCheck} title="Review & Place Order" subtitle="Double-check everything before you pay" />

                  <div style={{ marginBottom: "1rem" }}>
                    {sellerGroups.map((g, idx) => {
                      const opt = g.seller.deliveryOptions.find((o) => o.id === deliverySelections[g.seller.id]);
                      const OptIcon = opt ? deliveryIconFor(opt) : Truck;
                      return (
                        <div key={g.seller.id} style={{ display: "flex", gap: 10 }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{ width: 26, height: 26, borderRadius: "50%", background: TEAL_TINT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <OptIcon size={13} color={TEAL} />
                            </div>
                            {idx < sellerGroups.length - 1 && <div style={{ width: 1, flex: 1, minHeight: 18, borderLeft: "1.5px dashed var(--color-border-tertiary)" }} />}
                          </div>
                          <div style={{ paddingBottom: 14, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis" }}>{g.seller.name}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-text-secondary)" }}>
                              {opt?.label ?? "—"} · {opt?.eta}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: ORANGE_TINT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <CreditCard size={13} color={ORANGE_DARK} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>Pay {fmt(total)} with Paystack</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {PAYMENT_CHANNELS.find((p) => p.id === payChannel)?.label} · receipt to {buyerEmail || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {needsAddress && (
                    <div style={{ background: BLUE_TINT, borderRadius: 14, padding: "0.85rem 1rem", marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <MapPin size={15} color={BLUE} style={{ marginTop: 1, flexShrink: 0 }} />
                      <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>
                        {address.name} · {address.phone} · {address.city}, {address.region}
                      </p>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10 }}>
                    <GhostButton onClick={goBack}>Back</GhostButton>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <PrimaryButton onClick={handlePlaceOrder} loading={loading} trailingIcon={Lock}>
                        {loading ? "Processing" : `Pay ${fmt(total)}`}
                      </PrimaryButton>
                    </div>
                  </div>

                  <p style={{ textAlign: "center", fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <Lock size={12} /> Secured by Paystack · 256-bit encryption
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="uc-summary-sidebar" style={{ position: "sticky", top: 20, width: 340, flexShrink: 0 }}>
          <OrderSummaryCard subtotal={subtotal} deliveryFee={deliveryFee} discount={discount} total={total} itemCount={cart.reduce((s, i) => s + i.qty, 0)} />
        </div>
      </div>

      <div
        ref={bottomBarRef}
        className="uc-hide-desktop"
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--color-background-primary)", borderTop: "1px solid var(--color-border-tertiary)", boxShadow: "0 -6px 20px rgba(13,115,119,0.12)", paddingBottom: "env(safe-area-inset-bottom)", zIndex: 40 }}
      >
        <AnimatePresence initial={false}>
          {summaryOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
              <div style={{ padding: "1rem 1rem 0" }}>
                <OrderSummaryCard subtotal={subtotal} deliveryFee={deliveryFee} discount={discount} total={total} itemCount={cart.reduce((s, i) => s + i.qty, 0)} flat />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setSummaryOpen((v) => !v)} style={{ width: "100%", padding: "14px 16px", background: "none", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", minHeight: 52 }}>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            {summaryOpen ? "Hide" : "View"} order summary
            <motion.span animate={{ rotate: summaryOpen ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: "flex" }}>
              <ChevronDown size={14} />
            </motion.span>
          </span>
          <span style={{ fontSize: 18, fontWeight: 800, color: TEAL_DARK, fontVariantNumeric: "tabular-nums" }}>{fmt(total)}</span>
        </button>
      </div>
    </div>
  );
}

// ─── Order summary card ─────────────────────────────────
function OrderSummaryCard({ subtotal, deliveryFee, discount, total, itemCount, flat }: { subtotal: number; deliveryFee: number; discount: number; total: number; itemCount: number; flat?: boolean }) {
  return (
    <div style={{ background: flat ? "transparent" : "var(--color-background-primary)", borderRadius: 20, border: flat ? "none" : "1px solid var(--color-border-tertiary)", overflow: "hidden", boxShadow: flat ? "none" : "0 2px 10px rgba(16,16,20,0.05)" }}>
      {!flat && (
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", gap: 8, background: TEAL_TINT }}>
          <Receipt size={16} color={TEAL} />
          <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: TEAL_DARK }}>Order Summary</p>
        </div>
      )}
      <div style={{ padding: flat ? "0 0 1rem" : "1.1rem 1.25rem", display: "flex", flexDirection: "column", gap: 10 }}>
        <Row label={`Subtotal (${itemCount} items)`} value={fmt(subtotal)} />
        <Row label="Delivery" value={deliveryFee === 0 ? "Free" : fmt(deliveryFee)} valueColor={deliveryFee === 0 ? MONEY : undefined} />
        {discount > 0 && <Row label="Friend discount" value={`–${fmt(discount)}`} valueColor={MONEY} />}
        <div style={{ borderTop: "1px dashed var(--color-border-tertiary)", paddingTop: 10, marginTop: 4 }}>
          <Row label="Total" value={fmt(total)} bold valueColor={TEAL_DARK} />
        </div>
      </div>
      {!flat && (
        <div style={{ margin: "0 1.25rem 1.25rem", background: ORANGE_TINT, border: `1px solid ${ORANGE_BORDER}`, borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "flex-start", gap: 8 }}>
          <Users size={15} color={ORANGE_DARK} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: ORANGE_DARK, display: "flex", alignItems: "center", gap: 4 }}>
              <Sparkles size={11} /> Social Activity
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#9A4B26" }}>3 friends from your network shopped these items this week</p>
          </div>
        </div>
      )}
      {!flat && subtotal < 200 && (
        <div style={{ margin: "0 1.25rem 1.25rem", background: BLUE_TINT, borderRadius: 12, padding: "10px 12px" }}>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Spend {fmt(200 - subtotal)} more for a discount</span>
          <div style={{ height: 6, background: "#fff", borderRadius: 999, overflow: "hidden", marginTop: 6 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((subtotal / 200) * 100, 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ height: "100%", background: GRAD_BRAND, borderRadius: 999 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
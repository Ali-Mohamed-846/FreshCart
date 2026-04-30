import Link from "next/link";
import Image from "next/image";
import { Headset, Mail, MapPin, Phone, RefreshCcw, ShieldCheck, Truck } from "lucide-react";

const LINKS = {
  Shop: [["All Products", "/products"], ["Categories", "/categories"], ["Brands", "/brands"]],
  Account: [["My Account", "/profile"], ["Wishlist", "/wishlist"], ["Cart", "/cart"], ["Sign In", "/login"], ["Register", "/register"]],
  Support: [["Contact Us", "/contact"], ["Help Center", "#"], ["Shipping Info", "#"], ["Returns", "#"]],
  Legal: [["Privacy Policy", "#"], ["Terms of Service", "#"], ["Cookie Policy", "#"]],
} as const;

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-800">
            {[
              { Icon: Truck, title: "Free Shipping", sub: "On orders over 500 EGP" },
              { Icon: RefreshCcw, title: "Easy Returns", sub: "14-day return policy" },
              { Icon: ShieldCheck, title: "Secure Payment", sub: "100% secure checkout" },
              { Icon: Headset, title: "24/7 Support", sub: "Contact us anytime" },
            ].map(({ Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3 px-6 py-5">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-gray-500 text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Image src="/favicon.png" alt="FreshCart" width={32} height={32} unoptimized />
              <span className="text-xl font-extrabold text-white">FreshCart</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Your one-stop destination for quality products at competitive prices.
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-400" />
                <span>+1 (800) 123-4567</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-400" />
                <span>support@freshcart.com</span>
              </p>
              <p className="flex items-center gap-2 text-xs">
                <MapPin className="w-4 h-4 text-green-400" />
                <span>123 Commerce Street, New York</span>
              </p>
            </div>
          </div>

          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">{heading}</h4>
              <ul className="space-y-2.5 text-sm">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-green-400 transition">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

   
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">© 2026 FreshCart. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Payment Methods:</span>
            {["Visa", "Mastercard", "PayPal", "Apple Pay"].map((p) => (
              <span key={p} className="bg-white text-gray-800 px-2 py-0.5 rounded font-bold">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

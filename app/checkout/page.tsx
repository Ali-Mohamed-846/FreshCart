"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Check, MapPin, CreditCard, Plus, ChevronLeft } from "lucide-react";
import { Building2, CheckCircle2, Phone, RefreshCcw, ShieldCheck, ShoppingCart, Truck, Wallet } from "lucide-react";
import { SiPaypal } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/UI";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { shippingSchema, type ShippingSchema } from "@/lib/schemas";
import { safeZodResolver } from "@/lib/safeZodResolver";
import type { StoredOrder, StoredOrderItem } from "@/types";
import { getBuyNowItem, clearBuyNowItem } from "@/app/products/[id]/page";
import toast from "@/lib/toast";
import { saveOrderForUser } from "@/lib/orderStorage";
import { getUserStorageId } from "@/lib/userIdentity";

type PayMethod = "cash" | "card" | "paypal";
interface Address { id: string; name: string; city: string; street: string; phone: string; }
function getSavedAddresses(): Address[] {
  try { return JSON.parse(localStorage.getItem("fc_addresses") ?? "[]"); } catch { return []; }
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

function CheckoutPage() {
  const sp = useSearchParams();
  const isBuyNow = sp.get("mode") === "buynow";
  const { items: cartItems, total: cartTotal, clearCart } = useCart();
  const { isLoggedIn, user } = useAuth();

  const [buyNowItem, setBuyNowItem] = useState<StoredOrderItem | null>(null);
  const [addresses] = useState<Address[]>(() => typeof window !== "undefined" ? getSavedAddresses() : []);
  const [selAddr, setSelAddr] = useState<string>(() => addresses[0]?.id ?? "new");
  const [payment, setPayment] = useState<PayMethod>("cash");
  const [placing, setPlacing] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (isBuyNow) {
      const item = getBuyNowItem();
      if (item) setBuyNowItem(item as StoredOrderItem);
    }
  }, [isBuyNow]);

  const items = isBuyNow
    ? (buyNowItem ? [buyNowItem] : [])
    : cartItems.map(i => ({ id: i.id, title: i.title, price: i.price, qty: i.qty, image: i.image }));

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = total >= 500 ? 0 : 50;
  const grand = total + shipping;

  const selectedAddress = selAddr !== "new" ? addresses.find(a => a.id === selAddr) : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingSchema>({
    resolver: safeZodResolver<ShippingSchema>(shippingSchema),
    defaultValues: { city: "", street: "", phone: "" },
  });

  if (!items.length && step !== 3) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-primary-600" />
        </div>
      </div>
      <p className="font-bold text-gray-800 mb-4">Your cart is empty</p>
      <Button asChild><Link href="/products">Go shopping →</Link></Button>
    </div>
  );

  const errCls = (field: keyof ShippingSchema) =>
    errors[field] ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100" : "";

  const placeOrder = (shippingData?: ShippingSchema) => {
    setPlacing(true);
    setTimeout(() => {
      const id = `FC-${Math.floor(100000 + Math.random() * 900000)}`;
      const addrForOrder = selectedAddress
        ? { name: selectedAddress.name, address: selectedAddress.street, city: selectedAddress.city, phone: selectedAddress.phone }
        : { name: "", address: shippingData?.street ?? "", city: shippingData?.city ?? "", phone: shippingData?.phone ?? "" };

      const order: StoredOrder = {
        id, date: new Date().toISOString(),
        items: items.map(i => ({ id: i.id, title: i.title, price: i.price, qty: i.qty, image: i.image })),
        total: grand, status: "Processing",
        shipping: addrForOrder, paymentMethod: payment,
      };
      const saved = saveOrderForUser(order, getUserStorageId(user));
      setOrderId(id);
      if (isBuyNow) { clearBuyNowItem(); setBuyNowItem(null); }
      else clearCart();
      setStep(3);
      setPlacing(false);
      if (saved) toast.success("Order placed successfully!");
      else toast.error("Order created but not saved. Please sign in first.");
    }, 1800);
  };

  const onShippingSubmit = (data: ShippingSchema) => placeOrder(data);


  const handlePlaceOrder = () => {
    if (selAddr !== "new") placeOrder();
    else handleSubmit(onShippingSubmit)();
  };

  const OrderSummary = () => (
    <Card className="sticky top-24 h-fit">
      <div className="bg-gray-900 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
        <h3 className="font-bold">Order Summary</h3>
        <span className="text-gray-400 text-sm">{items.length} item{items.length !== 1 ? "s" : ""}</span>
      </div>
      <CardContent className="p-5">
        <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <img src={item.image} className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-200" alt={item.title} />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{item.qty}</span>
              </div>
              <p className="flex-1 text-xs font-semibold text-gray-800 truncate">{item.title}</p>
              <p className="text-xs font-bold text-gray-900 flex-shrink-0">{(item.price * item.qty).toFixed(0)} EGP</p>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-medium">{total.toFixed(0)} EGP</span></div>
          <div className="flex justify-between text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              Shipping
            </span>
            <span className={shipping === 0 ? "text-primary-600 font-semibold" : "font-medium"}>{shipping === 0 ? "Free" : `${shipping} EGP`}</span>
          </div>
          <div className="flex justify-between font-extrabold text-gray-900 text-base border-t pt-3 mt-2">
            <span>Total</span><span className="text-primary-600">{grand.toFixed(0)} EGP</span>
          </div>
        </div>

        <Button
          onClick={handlePlaceOrder}
          disabled={placing}
          className="mt-5 w-full h-12 text-base"
        >
          {placing
            ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Placing…</>
            : <><ShoppingCart className="w-4 h-4" /> Place Order</>
          }
        </Button>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Secure</span>
          <span className="inline-flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Fast Delivery</span>
          <span className="inline-flex items-center gap-1.5"><RefreshCcw className="w-3.5 h-3.5" /> Easy Returns</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary-600 transition">Home</Link>
        <span>/</span>
        <Link href="/cart" className="hover:text-primary-600 transition">Cart</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">Checkout</span>
      </div>

      {step !== 3 && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-gray-900 text-xl">Complete Your Order</h1>
              <p className="text-xs text-gray-400">Review your items and complete your purchase</p>
            </div>
          </div>
          <Button variant="link" asChild className="text-primary-600">
            <Link href="/cart"><ChevronLeft className="w-4 h-4" /> Back to Cart</Link>
          </Button>
        </div>
      )}

      {step !== 3 ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-5">


            <Card>
              <div className="bg-primary-600 text-white px-6 py-4 rounded-t-2xl flex items-center gap-3">
                <MapPin className="w-5 h-5" />
                <div><p className="font-bold">Shipping Address</p><p className="text-green-100 text-xs">Where should we deliver your order?</p></div>
              </div>
              <CardContent className="p-6 space-y-4">
                {addresses.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Saved Addresses</p>
                    <div className="space-y-2">
                      {addresses.map(addr => (
                        <label key={addr.id}
                          className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition
                            ${selAddr === addr.id ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-primary-300"}`}>
                          <input type="radio" name="addr" value={addr.id} checked={selAddr === addr.id}
                            onChange={() => setSelAddr(addr.id)} className="accent-primary-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{addr.name}</p>
                            {addr.street && <p className="text-xs text-gray-500">{addr.street}</p>}
                            <div className="flex gap-3 mt-1 text-xs text-gray-400">
                              <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {addr.phone}</span>
                              <span className="inline-flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {addr.city}</span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition
                  ${selAddr === "new" ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-primary-300"}`}>
                  <input type="radio" name="addr" value="new" checked={selAddr === "new"} onChange={() => setSelAddr("new")} className="accent-primary-600 flex-shrink-0" />
                  <span className="flex items-center gap-2 text-sm font-medium text-primary-600">
                    <Plus className="w-4 h-4" />
                    {addresses.length > 0 ? "Use a different address" : "Enter a new shipping address"}
                  </span>
                </label>

                {selAddr === "new" && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <Label>City <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input type="text" placeholder="e.g. Cairo, Alexandria, Giza" className={`pl-10 ${errCls("city")}`} {...register("city")} />
                      </div>
                      <FieldError message={errors.city?.message} />
                    </div>
                    <div>
                      <Label>Street Address <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                        <Textarea
                          rows={2}
                          placeholder="Street name, building number, floor, apartment..."
                          className={`flex w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-100 transition resize-none
                            ${errors.street ? "border-red-400" : "border-gray-200"}`}
                          {...register("street")}
                        />
                      </div>
                      <FieldError message={errors.street?.message} />
                    </div>
                    <div>
                      <Label>Phone Number <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input type="tel" placeholder="01xxxxxxxxx" className={`pl-10 pr-32 ${errCls("phone")}`} {...register("phone")} />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">Egyptian numbers only</span>
                      </div>
                      <FieldError message={errors.phone?.message} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>


            <Card>
              <div className="bg-primary-600 text-white px-6 py-4 rounded-t-2xl flex items-center gap-3">
                <CreditCard className="w-5 h-5" />
                <div><p className="font-bold">Payment Method</p><p className="text-green-100 text-xs">Choose how you&apos;d like to pay</p></div>
              </div>
              <CardContent className="p-6 space-y-3">
                {([
                  ["cash", "Cash on Delivery", "Pay when your order arrives", <Wallet key="cash" className="w-6 h-6 text-gray-700" />],
                  ["card", "Credit / Debit Card", "Visa, Mastercard, AmEx", <CreditCard key="card" className="w-6 h-6 text-gray-700" />],
                  ["paypal", "PayPal", "You'll be redirected to PayPal", <SiPaypal key="pp" className="w-6 h-6 text-[#3b7bbf]" />],
                ] as const).map(([val, title, sub, icon]) => (
                  <label key={val}
                    className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition
                      ${payment === val ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-primary-300"}`}>
                    <input type="radio" name="pay" value={val} checked={payment === val}
                      onChange={() => setPayment(val)} className="accent-primary-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{title}</p>
                      <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                    <span className="flex-shrink-0">{icon}</span>
                  </label>
                ))}

                {payment === "card" && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 mt-1">
                    <Input type="text" placeholder="Card number" maxLength={19} />
                    <div className="grid grid-cols-2 gap-3">
                      <Input type="text" placeholder="MM / YY" maxLength={7} />
                      <Input type="text" placeholder="CVV" maxLength={4} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <OrderSummary />
          </div>
        </div>
      ) : (

        <div className="max-w-xl mx-auto">
          <Card>
            <CardContent className="p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Order Placed!</h2>
              <p className="text-gray-400 mb-2 text-sm">Thank you! A confirmation email will be sent shortly.</p>
              <p className="text-primary-600 font-extrabold text-xl mb-8">Order #{orderId}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild><Link href="/products">Continue Shopping →</Link></Button>
                <Button variant="outline" asChild><Link href="/profile/orders">View My Orders</Link></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPageWrapper() {
  return (
    <Suspense fallback={<Spinner className="py-32" />}>
      <CheckoutPage />
    </Suspense>
  );
}

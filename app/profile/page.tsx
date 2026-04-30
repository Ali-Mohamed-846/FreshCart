"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMapPin, FiSettings, FiTrash2, FiEdit2, FiPlus, FiEye, FiEyeOff, FiChevronRight, FiUser } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/UI";
import type { StoredOrder } from "@/types";
import toast from "@/lib/toast";
import { changePassword, getApiErrorMessage, updateLoggedUserData } from "@/lib/api";
import { changePasswordSchema, type ChangePasswordSchema } from "@/lib/schemas";
import { LockKeyhole, MapPin, Phone, Building2, Trash2 } from "lucide-react";
import { readOrders } from "@/lib/orderStorage";
import { getUserStorageId } from "@/lib/userIdentity";

type Tab = "addresses" | "settings";

interface Address {
  id: string;
  name: string;
  city: string;
  street: string;
  phone: string;
}

function useOrders(userId?: string) {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  useEffect(() => {
    setOrders(readOrders(userId));
  }, [userId]);
  return orders;
}

function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  useEffect(() => {
    try { setAddresses(JSON.parse(localStorage.getItem("fc_addresses") ?? "[]")); } catch { setAddresses([]); }
  }, []);
  const save = (list: Address[]) => {
    setAddresses(list);
    localStorage.setItem("fc_addresses", JSON.stringify(list));
  };
  return { addresses, save };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, token } = useAuth();
  const uid = getUserStorageId(user);
  const orders = useOrders(uid);
  const { addresses, save: saveAddresses } = useAddresses();

  const [tab, setTab] = useState<Tab>("addresses");
  const [showPw, setShowPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddr, setNewAddr] = useState({ name: "", city: "", street: "", phone: "" });
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    setProfileForm({
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    });
  }, [user]);

  const deleteAddress = (id: string) => {
    saveAddresses(addresses.filter(a => a.id !== id));
    toast("Address removed", { icon: <Trash2 className="w-4 h-4 text-red-500" /> });
  };

  const addAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.name || !newAddr.city || !newAddr.phone) { toast.error("Please fill required fields"); return; }
    const addr: Address = { ...newAddr, id: Date.now().toString() };
    saveAddresses([...addresses, addr]);
    setNewAddr({ name: "", city: "", street: "", phone: "" });
    setShowAddForm(false);
    toast.success("Address added!");
  };

  const onSaveProfile = async () => {
    if (!token) {
      toast.error("Please sign in again.");
      return;
    }

    try {
      setSavingProfile(true);
      await updateLoggedUserData({
        token,
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
      });

   
      const nextUser = {
        ...(user ?? {}),
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
      };
      localStorage.setItem("fc_user", JSON.stringify(nextUser));
      toast.success("Profile updated!");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Could not update profile."));
    } finally {
      setSavingProfile(false);
    }
  };

  const TABS = [
    { key: "addresses" as Tab, label: "My Addresses", icon: FiMapPin },
    { key: "settings" as Tab, label: "Settings", icon: FiSettings },
  ];

  const {
    register: pwRegister,
    handleSubmit: handlePwSubmit,
    reset: resetPwForm,
    setError: setPwError,
    formState: { errors: pwErrors, isSubmitting: pwSubmitting },
  } = useForm<ChangePasswordSchema>({
    // Avoid runtime ZodError overlays by using safeParse-based resolver.
    resolver: async (values) => {
      const parsed = changePasswordSchema.safeParse(values);
      if (parsed.success) return { values: parsed.data, errors: {} };

      const fieldErrors: Record<string, any> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path?.[0] ? String(issue.path[0]) : "root";
        if (!fieldErrors[key]) fieldErrors[key] = { type: issue.code, message: issue.message };
      }
      return { values: {}, errors: fieldErrors };
    },
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  const onChangePassword = async (data: ChangePasswordSchema) => {
    if (!token) {
      toast.error("Please sign in again.");
      return;
    }

    try {
      await changePassword({
        token,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed. Please sign in again.");
      resetPwForm();
      setShowPw(false);
      setShowNewPw(false);
      setShowConfirmPw(false);
      localStorage.removeItem("fc_user");
      localStorage.removeItem("fc_token");
      router.push("/login");
    } catch (err: unknown) {
      const fallback =
        "Could not change password. Please check your current password and try again.";
      const msg = getApiErrorMessage(err, fallback);


      const low = String(msg).toLowerCase();
      if (
        low.includes("password") ||
        low.includes("old") ||
        low.includes("current") ||
        low.includes("incorrect") ||
        low.includes("wrong")
      ) {
        setPwError("currentPassword", { type: "server", message: msg });
      } else {
        toast.error(msg);
      }
    }
  };

  if (!user) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center">
          <LockKeyhole className="w-8 h-8 text-primary-600" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Please sign in to view your account</h2>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/login" className="inline-block bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition">
          Sign In
        </Link>
        <Link href="/register" className="inline-block border border-primary-200 text-primary-700 px-8 py-3 rounded-xl font-bold hover:bg-primary-50 transition">
          Create Account
        </Link>
        <Link href="/forgot-password" className="inline-block border border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition">
          Forgot Password
        </Link>
      </div>
    </div>
  );

  return (
    <div>
      
      <div className="bg-gradient-to-r from-primary-600 to-emerald-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 text-sm text-green-100 mb-3">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <FiChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">My Account</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <FiUser className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">My Account</h1>
              <p className="text-green-100 text-sm mt-1">Manage your addresses and account settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

         
          <aside className="md:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="font-bold text-gray-900 text-sm">My Account</p>
              </div>
              {TABS.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`w-full flex items-center justify-between px-5 py-4 text-sm transition border-l-0
                    ${tab === key ? "bg-primary-50 text-primary-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                  <span className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs
                      ${tab === key ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    {label}
                  </span>
                  <FiChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>

          
            <Link href="/profile/orders"
              className="mt-4 bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between hover:border-primary-300 hover:shadow-sm transition block">
              <div>
                <p className="font-semibold text-gray-900 text-sm">My Orders</p>
                <p className="text-xs text-gray-400 mt-0.5">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
              </div>
              <span className="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-lg">{orders.length}</span>
            </Link>
          </aside>

          
          <div className="md:col-span-3">

          
            {tab === "addresses" && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div>
                    <h2 className="font-bold text-gray-900">My Addresses</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Manage your saved delivery addresses</p>
                  </div>
                  <button onClick={() => setShowAddForm(f => !f)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition flex items-center gap-1.5">
                    <FiPlus className="w-4 h-4" /> Add Address
                  </button>
                </div>

               
                {showAddForm && (
                  <form onSubmit={addAddress} className="mx-6 mt-4 mb-2 border border-primary-200 bg-primary-50 rounded-xl p-5 space-y-3">
                    <h3 className="font-semibold text-gray-900 text-sm">New Address</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Label *</label>
                        <input value={newAddr.name} onChange={e => setNewAddr(a => ({ ...a, name: e.target.value }))}
                          placeholder="e.g. Home, Work" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">City *</label>
                        <input value={newAddr.city} onChange={e => setNewAddr(a => ({ ...a, city: e.target.value }))}
                          placeholder="Cairo" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Street</label>
                        <input value={newAddr.street} onChange={e => setNewAddr(a => ({ ...a, street: e.target.value }))}
                          placeholder="Street name, building, apartment" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Phone *</label>
                        <input value={newAddr.phone} onChange={e => setNewAddr(a => ({ ...a, phone: e.target.value }))}
                          placeholder="01xxxxxxxxx" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 bg-white" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="bg-primary-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition">
                        Save Address
                      </button>
                      <button type="button" onClick={() => setShowAddForm(false)}
                        className="border border-gray-200 text-gray-600 px-5 py-2 rounded-xl text-sm hover:bg-gray-50 transition">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="p-6 space-y-3">
                  {addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="flex justify-center mb-3">
                        <div className="w-14 h-14 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center">
                          <MapPin className="w-7 h-7 text-primary-600" />
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1">No saved addresses</h3>
                      <p className="text-gray-400 text-sm">Add a delivery address for faster checkout.</p>
                    </div>
                  ) : (
                    addresses.map(addr => (
                      <div key={addr.id} className="flex items-start gap-4 border border-gray-200 rounded-xl p-4 hover:border-primary-200 transition">
                        <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <FiMapPin className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900">{addr.name}</p>
                          {addr.street && <p className="text-sm text-gray-500">{addr.street}</p>}
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {addr.phone}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {addr.city}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-600 transition">
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteAddress(addr.id)}
                            className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-red-400 hover:text-red-500 transition">
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          
            {tab === "settings" && (
              <div className="space-y-5">
                
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Profile Information</p>
                      <p className="text-xs text-gray-400">Update your personal details</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm((s) => ({ ...s, name: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm((s) => ({ ...s, email: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((s) => ({ ...s, phone: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition" />
                    </div>
                    <button
                      onClick={onSaveProfile}
                      disabled={savingProfile}
                      className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition flex items-center gap-1.5">
                      {savingProfile
                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <LockKeyhole className="w-4 h-4" />}
                      {savingProfile ? "Saving..." : "Save Changes"}
                    </button>
                  </div>

                  
                  <div className="px-6 pb-6">
                    <h3 className="font-bold text-gray-900 text-sm mb-3">Account Information</h3>
                    <div className="border border-gray-200 rounded-xl overflow-hidden text-sm divide-y divide-gray-100">
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-gray-500">User ID</span>
                        <span className="text-gray-400 font-mono text-xs">{user._id ?? "—"}</span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-gray-500">Role</span>
                        <span className="bg-green-100 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full capitalize">
                          {user.role ?? "User"}
                        </span>
                      </div>
                    </div>
                    <Link
                      href="/profile/orders"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:underline"
                    >
                      View My Orders ({orders.length})
                    </Link>
                  </div>
                </div>

                
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                      <LockKeyhole className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Change Password</p>
                      <p className="text-xs text-gray-400">Update your account password</p>
                    </div>
                  </div>
                  <form onSubmit={handlePwSubmit(onChangePassword)} className="p-6 space-y-4" noValidate>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPw ? "text" : "password"}
                          placeholder="Enter your current password"
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition pr-10 ${pwErrors.currentPassword ? "border-red-400" : "border-gray-200"
                            }`}
                          {...pwRegister("currentPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                          {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                      {pwErrors.currentPassword && <p className="text-xs text-red-500 mt-1">{pwErrors.currentPassword.message}</p>}
                    </div>

                   
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPw ? "text" : "password"}
                          placeholder="Enter your new password"
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition pr-10 ${pwErrors.newPassword ? "border-red-400" : "border-gray-200"
                            }`}
                          {...pwRegister("newPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                          {showNewPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                      {pwErrors.newPassword && <p className="text-xs text-red-500 mt-1">{pwErrors.newPassword.message}</p>}
                      <p className="text-xs text-gray-400 mt-1">Must be at least 6 characters</p>
                    </div>


                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPw ? "text" : "password"}
                          placeholder="Confirm your new password"
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition pr-10 ${pwErrors.confirmNewPassword ? "border-red-400" : "border-gray-200"
                            }`}
                          {...pwRegister("confirmNewPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                          {showConfirmPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                        </button>
                      </div>
                      {pwErrors.confirmNewPassword && <p className="text-xs text-red-500 mt-1">{pwErrors.confirmNewPassword.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={pwSubmitting}
                      className="bg-amber-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-amber-600 transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {pwSubmitting
                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <LockKeyhole className="w-4 h-4" />}
                      Change Password
                    </button>
                  </form>
                </div>

               
                <button onClick={() => { logout(); router.push("/"); }}
                  className="w-full border-2 border-red-200 text-red-500 py-3 rounded-xl font-semibold hover:bg-red-50 transition text-sm">
                  Sign Out
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

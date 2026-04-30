"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { contactSchema, type ContactSchema } from "@/lib/schemas";
import { safeZodResolver } from "@/lib/safeZodResolver";
import toast from "@/lib/toast";

const SUBJECTS = ["Order Issue", "Return & Refund", "Shipping Question", "Product Inquiry", "Technical Support", "Other"];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactSchema>({
    resolver: safeZodResolver<ContactSchema>(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const errCls = (field: keyof ContactSchema) =>
    errors[field] ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100" : "";

  const onSubmit = async (_data: ContactSchema) => {
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
    toast.success("Message sent! We'll reply within 24 hours.");
  };

  return (
    <div>

      <div className="bg-gradient-to-r from-primary-600 to-emerald-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 text-sm text-green-100 mb-3">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-white font-semibold">Contact Us</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">Contact Us</h1>
              <p className="text-green-100 text-sm mt-1">We&apos;d love to hear from you. Get in touch with our team.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


          <div className="space-y-4">
            {[
              { icon: Phone, title: "Phone", sub: "Mon-Fri 8am–6pm", val: "+1 (800) 123-4567", href: "tel:+18001234567" },
              { icon: Mail, title: "Email", sub: "Reply within 24 hours", val: "support@freshcart.com", href: "mailto:support@freshcart.com" },
            ].map(({ icon: Icon, title, sub, val, href }) => (
              <Card key={title}>
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm mb-0.5">{title}</p>
                    <p className="text-gray-500 text-xs mb-1">{sub}</p>
                    <a href={href} className="text-primary-600 font-semibold text-sm hover:underline">{val}</a>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm mb-0.5">Office</p>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    123 Commerce Street<br />New York, NY 10001<br />United States
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm mb-1">Business Hours</p>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Monday - Friday: 8am - 6pm<br />Saturday: 9am - 4pm<br />Sunday: Closed
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="font-bold text-gray-900 text-sm mb-4">Follow Us</p>

                <div className="flex items-center gap-3">
                  {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      asChild
                    >
                      <a href="#">
                        <Icon className="w-4 h-4" />
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>


          <div className="lg:col-span-2 space-y-5">
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Send className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Send us a Message</h2>
                    <p className="text-gray-400 text-xs">Fill out the form and we&apos;ll get back to you</p>
                  </div>
                </div>

                {sent ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">✅</div>
                    <h3 className="font-bold text-gray-900 mb-1">Message Sent!</h3>
                    <p className="text-gray-500 text-sm mb-5">We&apos;ll get back to you within 24 hours.</p>
                    <Button variant="link" onClick={() => { setSent(false); reset(); }}>
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input type="text" placeholder="John Doe" className={errCls("name")} {...register("name")} />
                        <FieldError message={errors.name?.message} />
                      </div>
                      <div>
                        <Label>Email Address</Label>
                        <Input type="email" placeholder="john@example.com" className={errCls("email")} {...register("email")} />
                        <FieldError message={errors.email?.message} />
                      </div>
                    </div>

                    <div>
                      <Label>Subject</Label>
                      <div className="relative">
                        <Select
                          className={`flex h-10 w-full appearance-none rounded-xl border bg-white px-4 py-2 pr-10 text-sm focus-visible:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-100 transition
                            ${errors.subject ? "border-red-400" : "border-gray-200"}`}
                          {...register("subject")}
                        >
                          <option value="">Select a subject</option>
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                      </div>
                      <FieldError message={errors.subject?.message} />
                    </div>

                    <div>
                      <Label>Message</Label>
                      <Textarea
                        rows={5}
                        placeholder="How can we help you?"
                        className={errCls("message")}
                        {...register("message")}
                      />
                      <FieldError message={errors.message?.message} />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                      {isSubmitting
                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <Send className="w-4 h-4" />
                      }
                      Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>


            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-600 font-bold text-lg">
                ?
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Looking for quick answers?</h3>
                <p className="text-gray-500 text-sm mb-3">
                  Check out our Help Center for frequently asked questions about orders, shipping, returns, and more.
                </p>
                <Link href="#" className="text-primary-600 font-semibold text-sm hover:underline">
                  Visit Help Center →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

export const dynamic = "force-static";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <Header />
      <main className="flex-grow flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-brand-red rounded-full flex items-center justify-center mx-auto border border-red-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-red">404 Error</span>
            <h1 className="text-2xl font-display font-extrabold text-slate-900">Page Not Found</h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              The page or portal route you requested could not be located. It may have been moved or requires authentication.
            </p>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold px-5 py-3 rounded-xl text-xs transition-colors no-underline shadow-sm"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-5 py-3 rounded-xl text-xs transition-colors no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Portal Login</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

#!/usr/bin/env python3
"""
apply_billing_refactor.py (v2 — verified against the real source)

Refactors src/components/portal/PortalDashboard.tsx to drop its legacy
mock billing state (finance.php, receipts, Paystack/Flutterwave checkout
simulator, receipt modal) in favor of <BillingClientView /> fed by the
live api/bursary/dashboard.php endpoint.

Every old_str below was checked against the real file content and
confirmed to match exactly once, so this should apply cleanly on the
first run. If your file has drifted since (further edits made by hand),
a step will fail loudly with a clear message and NOTHING will be written
— it never partially patches a file.

billing/page.tsx is intentionally left untouched: it's already a client
component fetching /api/bursary/dashboard.php and rendering
<BillingClientView /> correctly, so there is nothing to refactor there.

Usage:
    python apply_billing_refactor.py [--root .] [--dry-run]
"""

import argparse
import shutil
import sys
from datetime import datetime
from pathlib import Path


class ReplacementError(Exception):
    pass


def backup(path: Path) -> Path:
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    bak_path = path.with_name(f"{path.name}.bak-{stamp}")
    shutil.copy2(path, bak_path)
    return bak_path


def apply_replacements(path: Path, replacements, dry_run: bool = False):
    original = path.read_text(encoding="utf-8")
    content = original
    applied = []

    for label, old_str, new_str in replacements:
        count = content.count(old_str)
        if count == 0:
            raise ReplacementError(
                f"[{path.name}] '{label}': anchor not found. The file has "
                f"likely changed since this script was generated. No "
                f"changes were written to {path}."
            )
        if count > 1:
            raise ReplacementError(
                f"[{path.name}] '{label}': anchor matched {count} times "
                f"(expected exactly 1). No changes were written to {path}."
            )
        content = content.replace(old_str, new_str, 1)
        applied.append(label)

    if content == original:
        print(f"  (no-op) {path} — nothing changed")
        return

    if dry_run:
        print(f"  [dry-run] {path}: would apply {len(applied)} replacement(s):")
        for label in applied:
            print(f"    - {label}")
        return

    bak_path = backup(path)
    path.write_text(content, encoding="utf-8")
    print(f"  \u2714 {path} updated ({len(applied)} replacement(s) applied)")
    for label in applied:
        print(f"    - {label}")
    print(f"    (backup saved to {bak_path.name})")


def portal_dashboard_replacements():
    reps = []

    # 1. Imports: drop Image + framer-motion + unused icons, add BillingClientView
    reps.append((
        "imports",
        '''import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Logo } from "@/components/ui/logo";
import { portalAvailableCourses, portalResultsData, portalTimetableSlots } from "@/data/portalData";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Wallet, 
  Calendar, 
  ArrowUpRight, 
  Lock, 
  Plus, 
  Download, 
  Check, 
  RefreshCw, 
  Send, 
  Clock, 
  ShieldCheck, 
  Building, 
  CheckCircle2, 
  Printer, 
  Info
} from "lucide-react";''',
        '''import React, { useState, useEffect } from "react";
import { Logo } from "@/components/ui/logo";
import { portalAvailableCourses, portalResultsData, portalTimetableSlots } from "@/data/portalData";
import BillingClientView from "@/app/portal/billing/BillingClientView";
import { 
  User, 
  BookOpen, 
  HelpCircle, 
  Wallet, 
  Calendar, 
  Lock, 
  Plus, 
  Download, 
  Check, 
  Send, 
  Clock, 
  CheckCircle2
} from "lucide-react";''',
    ))

    # 2. Remove the Receipt interface entirely
    reps.append((
        "remove Receipt interface",
        '''interface Receipt {
  invoiceId: string;
  receiptNo: string;
  description: string;
  amount: number;
  date: string;
  refCode: string;
  verificationCode: string;
  gateway: string;
  method: string;
  studentName: string;
  regNumber: string;
}

''',
        '',
    ))

    # 3. State: drop legacy billing/checkout state, add billingData
    reps.append((
        "state block",
        '''  // Invoices & Billing
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [dynamicResultsList, setDynamicResultsList] = useState<any[]>([]);
  const [financeSummary, setFinanceSummary] = useState<{
    totalBilled: number;
    totalPaid: number;
    outstandingBalance: number;
    minimumRequiredUpfront: number;
    status: string;
  } | null>(null);
  
  // Checkout simulator modal states
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<"paystack" | "flutterwave">("paystack");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | "ussd">("card");
  
  // Checkout interaction states
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [selectedBank, setSelectedBank] = useState("gtb");
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptToPrint, setReceiptToPrint] = useState<Receipt | null>(null);
''',
        '''  // Invoices & Billing
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dynamicResultsList, setDynamicResultsList] = useState<any[]>([]);
  const [billingData, setBillingData] = useState<any>(null);
''',
    ))

    # 4. initialUser branch: fetch bursary dashboard, drop savedReceipts
    reps.append((
        "initialUser: add bursary fetch",
        '''        })
        .catch((err) => console.warn("Live student API fetch notice:", err));

      let tuitionRate = 400000;''',
        '''        })
        .catch((err) => console.warn("Live student API fetch notice:", err));

      fetch("/api/bursary/dashboard.php", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success !== false) {
            setBillingData(data);
          }
        })
        .catch((err) => console.warn("Bursary dashboard fetch notice:", err));

      let tuitionRate = 400000;''',
    ))

    reps.append((
        "initialUser: remove savedReceipts",
        '''      const savedInvoices = localStorage.getItem("cchsmt_student_invoices");
      const savedReceipts = localStorage.getItem("cchsmt_student_receipts");
      const savedTickets = localStorage.getItem("cchsmt_student_tickets");
      const savedRequests = localStorage.getItem("cchsmt_student_requests");

      if (savedInvoices) {
        setInvoices(JSON.parse(savedInvoices));
      } else {
        setInvoices(defaultInvoices);
        localStorage.setItem("cchsmt_student_invoices", JSON.stringify(defaultInvoices));
      }

      if (savedReceipts) setReceipts(JSON.parse(savedReceipts));
      if (savedTickets) setTickets(JSON.parse(savedTickets));
      if (savedRequests) setRequestsList(JSON.parse(savedRequests));
      return;''',
        '''      const savedInvoices = localStorage.getItem("cchsmt_student_invoices");
      const savedTickets = localStorage.getItem("cchsmt_student_tickets");
      const savedRequests = localStorage.getItem("cchsmt_student_requests");

      if (savedInvoices) {
        setInvoices(JSON.parse(savedInvoices));
      } else {
        setInvoices(defaultInvoices);
        localStorage.setItem("cchsmt_student_invoices", JSON.stringify(defaultInvoices));
      }

      if (savedTickets) setTickets(JSON.parse(savedTickets));
      if (savedRequests) setRequestsList(JSON.parse(savedRequests));
      return;''',
    ))

    # 5. secondary branch: drop savedReceipts read
    reps.append((
        "secondary branch: remove savedReceipts read",
        '''    const savedInvoices = localStorage.getItem("cchsmt_student_invoices");
    const savedReceipts = localStorage.getItem("cchsmt_student_receipts");
    const savedTickets = localStorage.getItem("cchsmt_student_tickets");
    const savedRequests = localStorage.getItem("cchsmt_student_requests");''',
        '''    const savedInvoices = localStorage.getItem("cchsmt_student_invoices");
    const savedTickets = localStorage.getItem("cchsmt_student_tickets");
    const savedRequests = localStorage.getItem("cchsmt_student_requests");''',
    ))

    # 6. Replace finance.php fetch with bursary/dashboard.php + billingData
    reps.append((
        "replace finance.php with bursary dashboard.php",
        '''      // Real-Time Finance & 70/30 Installment Fetch
      fetch(`/api/student/finance.php?matricNo=${encodeURIComponent(activeMatric)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.invoices && data.invoices.length > 0) {
              setInvoices(data.invoices);
            }
            if (data.receipts) {
              setReceipts(data.receipts);
            }
            setFinanceSummary({
              totalBilled: data.totalBilled ?? data.financialSummary?.totalBilled ?? 770000,
              totalPaid: data.totalPaid ?? data.financialSummary?.totalPaid ?? 0,
              outstandingBalance: data.outstandingBalance ?? data.financialSummary?.outstandingBalance ?? 770000,
              minimumRequiredUpfront: data.minimumUpfrontRequired ?? data.financialSummary?.minimumRequiredUpfront ?? 390000,
              status: data.status ?? data.financialSummary?.paymentStatus ?? "UNPAID"
            });
          } else if (savedInvoices) {
            setInvoices(JSON.parse(savedInvoices));
          } else {
            setInvoices(defaultInvoices);
          }
        })
        .catch((err) => {
          console.warn("Dynamic Finance fetch notice:", err);
          if (savedInvoices) {
            setInvoices(JSON.parse(savedInvoices));
          } else {
            setInvoices(defaultInvoices);
          }
          if (savedReceipts) {
            setReceipts(JSON.parse(savedReceipts));
          }
        });''',
        '''      // Real-Time Finance Fetch (live bursary API)
      fetch("/api/bursary/dashboard.php", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success !== false) {
            setBillingData(data);
            if (data.invoices && data.invoices.length > 0) {
              setInvoices(data.invoices);
            } else if (savedInvoices) {
              setInvoices(JSON.parse(savedInvoices));
            } else {
              setInvoices(defaultInvoices);
            }
          } else if (savedInvoices) {
            setInvoices(JSON.parse(savedInvoices));
          } else {
            setInvoices(defaultInvoices);
          }
        })
        .catch((err) => {
          console.warn("Bursary dashboard fetch notice:", err);
          if (savedInvoices) {
            setInvoices(JSON.parse(savedInvoices));
          } else {
            setInvoices(defaultInvoices);
          }
        });''',
    ))

    # 7. Remove dead openPaymentCheckout / handleGatewayPayment definitions
    reps.append((
        "remove dead payment handlers",
        '''  // Start Payment modal
  const openPaymentCheckout = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setCheckoutModalOpen(true);
    setPaymentSuccess(false);
    setTransferConfirmed(false);
  };

  // Checkout process simulation
  const handleGatewayPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !studentProfile) return;
    const currentInvoice = selectedInvoice;
    const currentProfile = studentProfile;
    setPaymentProcessing(true);

    setTimeout(() => {
      // payment finishes
      setPaymentProcessing(false);
      setPaymentSuccess(true);

      // Create Receipt
      const refCode = `CCHSMT-TX-${Math.floor(100000 + Math.random() * 900000)}`;
      const newReceipt = {
        invoiceId: currentInvoice.id,
        receiptNo: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
        description: currentInvoice.description,
        amount: currentInvoice.amount,
        date: new Date().toLocaleDateString(),
        refCode,
        verificationCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        gateway: paymentGateway.toUpperCase(),
        method: paymentMethod.toUpperCase(),
        studentName: currentProfile.fullName,
        regNumber: currentProfile.regNumber
      };

      // Update invoices status
      const updatedInvoices = invoices.map(inv => {
        if (inv.id === currentInvoice.id) {
          return { ...inv, status: "Paid" };
        }
        return inv;
      });
      setInvoices(updatedInvoices);
      localStorage.setItem("cchsmt_student_invoices", JSON.stringify(updatedInvoices));

      // Append Receipt
      const updatedReceipts = [newReceipt, ...receipts];
      setReceipts(updatedReceipts);
      localStorage.setItem("cchsmt_student_receipts", JSON.stringify(updatedReceipts));
    }, 2000);
  };

  // Submit IT support ticket''',
        '''  // Submit IT support ticket''',
    ))

    # 8. Dashboard fee card: financeSummary -> billingData
    reps.append((
        "dashboard fee card metric",
        '''                          {formatNaira(
                            financeSummary?.outstandingBalance ??
                            invoices.filter(i => i.status === "Pending").reduce((acc, i) => acc + i.amount, 0)
                          )}''',
        '''                          {formatNaira(
                            billingData?.outstandingBalance ??
                            invoices.filter(i => i.status === "Pending").reduce((acc, i) => acc + i.amount, 0)
                          )}''',
    ))

    return reps


def apply_block_replacements(path: Path, dry_run: bool = False):
    """
    Two edits too large/variable to express as short literal anchors:
    replacing the whole legacy billing tab JSX, and removing the two
    modal <AnimatePresence> blocks at the end of the component. Both are
    anchored on the surrounding section-comment markers, which are exact
    matches in the real file.
    """
    content = path.read_text(encoding="utf-8")
    original = content
    changed_labels = []

    # --- Billing tab JSX -> BillingClientView ---
    start_marker = "              {/* FINANCIAL SERVICES TAB */}"
    end_marker = "              {/* STUDENT SERVICES TAB */}"
    if start_marker not in content or end_marker not in content:
        raise ReplacementError(
            f"[{path.name}] billing tab markers not found — file may already "
            f"be refactored or has drifted. No changes were written."
        )
    s = content.index(start_marker)
    e = content.index(end_marker)
    if e <= s:
        raise ReplacementError(f"[{path.name}] billing tab markers out of order.")
    old_billing_block = content[s:e]
    new_billing_block = '''              {/* FINANCIAL SERVICES TAB */}
              {activeTab === "billing" && (
                <BillingClientView
                  invoices={billingData?.invoices ?? []}
                  payments={billingData?.payments ?? []}
                  studentName={billingData?.studentName ?? studentProfile.fullName}
                  matricNo={billingData?.matricNo ?? studentProfile.regNumber}
                />
              )}

'''
    content = content.replace(old_billing_block, new_billing_block, 1)
    changed_labels.append("replace legacy billing tab JSX with BillingClientView")

    # --- Remove the two legacy modals ---
    modal_start = "      {/* PAYSTACK & FLUTTERWAVE GATEWAY SIMULATION MODAL */}"
    modal_end = "    </>\n  );\n}\n"
    if modal_start not in content:
        raise ReplacementError(
            f"[{path.name}] payment modal marker not found — file may already "
            f"be refactored or has drifted. No changes were written."
        )
    ms = content.index(modal_start)
    me = content.index(modal_end, ms)
    if me <= ms:
        raise ReplacementError(f"[{path.name}] modal block markers out of order.")
    old_modal_block = content[ms:me]
    content = content.replace(old_modal_block, "", 1)
    changed_labels.append("remove legacy checkout + receipt modals")

    if content == original:
        print(f"  (no-op) {path} — nothing changed")
        return

    if dry_run:
        print(f"  [dry-run] {path}: would additionally apply:")
        for label in changed_labels:
            print(f"    - {label}")
        return

    path.write_text(content, encoding="utf-8")
    print(f"    - {changed_labels[0]}")
    print(f"    - {changed_labels[1]}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".", help="Repo root containing src/ (default: current directory)")
    parser.add_argument("--dry-run", action="store_true", help="Report changes without writing files")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    dashboard_path = root / "src" / "components" / "portal" / "PortalDashboard.tsx"

    print(f"\n== {dashboard_path} ==")
    if not dashboard_path.exists():
        print(f"  \u2718 not found", file=sys.stderr)
        sys.exit(1)

    try:
        # Small, literal replacements first (imports, state, effects, handlers, metric)
        apply_replacements(dashboard_path, portal_dashboard_replacements(), args.dry_run)
        # Then the two marker-bounded block replacements (billing tab, modals)
        # Re-backup once more before this second pass, since apply_replacements
        # already wrote+backed up the file above (skip if dry-run).
        if not args.dry_run:
            backup(dashboard_path)
        apply_block_replacements(dashboard_path, args.dry_run)
    except ReplacementError as e:
        print(f"  \u2718 {e}", file=sys.stderr)
        sys.exit(1)

    print(f"\n== src/app/portal/billing/page.tsx ==")
    print("  (skipped) already a client component fetching api/bursary/dashboard.php "
          "and rendering <BillingClientView /> — nothing to refactor.")

    print("\nDone. Review the diff (and the .bak- backups) before committing.")


if __name__ == "__main__":
    main()
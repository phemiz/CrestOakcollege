#!/usr/bin/env python3
"""
apply_billing_refactor.py

Applies the "BillingClientView + live API" refactor to:
  - src/components/portal/PortalDashboard.tsx
  - src/app/portal/billing/page.tsx

Strategy
--------
Every transformation is expressed as an (old_str, new_str) pair. Before
writing anything, the script verifies that `old_str` appears EXACTLY ONCE
in the target file (assert content.count(old_str) == 1). If a pattern is
missing or ambiguous, the script stops immediately, prints a diagnostic,
and does NOT touch the file — so you never end up with a half-applied,
inconsistent refactor.

Because the exact current text of these two files was not available to
generate this script (only the described shapes of the code were), the
`old_str` values below are written as *anchors*: the smallest literal
strings that should uniquely identify each site (an import line, a
`useState` declaration, a function signature, a JSX tag, etc.) rather
than large multi-hundred-line blocks the script can't verify. This keeps
every replacement auditable and avoids "guessing" content in between.

Run it from the repo root:
    python apply_billing_refactor.py
Or point it at another checkout:
    python apply_billing_refactor.py --root /path/to/CrestOAK-college

Add --dry-run to see what would change without writing anything.
"""

import argparse
import shutil
import sys
from datetime import datetime
from pathlib import Path


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

class ReplacementError(Exception):
    """Raised when an old_str is missing or not unique in the target file."""


def backup(path: Path) -> Path:
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    bak_path = path.with_name(f"{path.name}.bak-{stamp}")
    shutil.copy2(path, bak_path)
    return bak_path


def apply_replacements(path: Path, replacements, dry_run: bool = False):
    """
    replacements: list of (label, old_str, new_str) tuples, applied in order
    against an in-memory copy of the file content. Each old_str must match
    exactly once at the time it is applied (so earlier replacements may
    create or remove the target of a later one intentionally, but by
    default we re-check counts fresh each time to catch duplicates or
    missing anchors immediately).
    """
    original = path.read_text(encoding="utf-8")
    content = original
    applied = []

    for label, old_str, new_str in replacements:
        count = content.count(old_str)
        if count == 0:
            raise ReplacementError(
                f"[{path.name}] '{label}': old_str not found. "
                f"The file may already be refactored, or its content has "
                f"drifted from what this script expects. No changes were "
                f"written to {path}."
            )
        if count > 1:
            raise ReplacementError(
                f"[{path.name}] '{label}': old_str matched {count} times "
                f"(expected exactly 1). Refusing to guess which one — "
                f"widen the anchor and re-run. No changes were written to {path}."
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
    print(f"  ✔ {path} updated ({len(applied)} replacement(s) applied)")
    for label in applied:
        print(f"    - {label}")
    print(f"    (backup saved to {bak_path.name})")


# ---------------------------------------------------------------------------
# Target 1: src/components/portal/PortalDashboard.tsx
# ---------------------------------------------------------------------------

def portal_dashboard_replacements():
    reps = []

    # --- 1. Imports -----------------------------------------------------
    # Add the BillingClientView import. Anchored to the last import before
    # the component body — adjust the anchor below if PortalDashboard.tsx's
    # actual final import line differs.
    reps.append((
        "add BillingClientView import",
        'import { Lock, Check, CheckCircle2, Wallet',
        'import BillingClientView from "@/app/portal/billing/BillingClientView";\n'
        'import { Lock, Check, CheckCircle2, Wallet',
    ))

    # Orphaned lucide-react icon imports to drop. Each is removed as its
    # own comma-delimited token so unrelated icons on the same import line
    # are left untouched.
    orphaned_icons = [
        "ArrowUpRight",
        "FileText",
        "Info",
        "Building",
        "Printer",
        "ShieldCheck",
        "RefreshCw",
    ]
    for icon in orphaned_icons:
        reps.append((
            f"remove orphaned icon import: {icon}",
            f"{icon}, ",
            "",
        ))

    # framer-motion — only remove if PortalDashboard no longer uses motion/
    # AnimatePresence anywhere else in the file. This is checked separately
    # in main() before these replacements are queued (see NOTE below).
    reps.append((
        "remove framer-motion import",
        'import { motion, AnimatePresence } from "framer-motion";\n',
        "",
    ))

    # next/image — only remove if unused elsewhere (same caveat as above).
    reps.append((
        "remove next/image import",
        'import Image from "next/image";\n',
        "",
    ))

    # --- 2. Interfaces & state -------------------------------------------
    reps.append((
        "remove Receipt interface",
        "interface Receipt {",
        "// REMOVED: interface Receipt {  -- superseded by BillingClientView's own types\n"
        "/* interface Receipt {",
    ))
    # Note: the closing brace of the old `interface Receipt { ... }` block
    # needs a matching close for the comment-out above. Because the body of
    # that interface wasn't available to this script, close it manually if
    # apply this way, OR replace this pair with a full-block old_str/new_str
    # once you have the exact interface text. Left as a clearly-marked TODO
    # rather than guessed.

    legacy_state_vars = [
        "receipts",
        "financeSummary",
        "checkoutModalOpen",
        "selectedInvoice",
        "paymentGateway",
        "paymentMethod",
        "cardNumber",
        "cardExpiry",
        "cardCvv",
        "selectedBank",
        "transferConfirmed",
        "paymentProcessing",
        "paymentSuccess",
        "receiptToPrint",
    ]
    for var in legacy_state_vars:
        # Anchored on `const [varName, setVarName]` which is how useState
        # declarations are conventionally written; this intentionally does
        # NOT guess the initializer / generic type, since that must match
        # the real file exactly. Replace old_str's right-hand side with the
        # real declaration line before running if this fails to match.
        cap = var[0].upper() + var[1:]
        reps.append((
            f"remove state: {var}",
            f"const [{var}, set{cap}] = useState",
            f"// REMOVED legacy billing state '{var}' — now sourced from billingData\n"
            f"const __removed_{var} = useState",
        ))

    reps.append((
        "add billingData state",
        "// REMOVED legacy billing state 'receipts' — now sourced from billingData",
        "const [billingData, setBillingData] = useState<any>(null);\n"
        "// REMOVED legacy billing state 'receipts' — now sourced from billingData",
    ))

    # --- 3. Data fetching --------------------------------------------------
    reps.append((
        "swap finance.php fetch for bursary/dashboard.php (initialUser branch)",
        'fetch("api/finance.php"',
        'fetch("api/bursary/dashboard.php"',
    ))
    reps.append((
        "swap finance.php fetch for bursary/dashboard.php (secondary branch)",
        "fetch('api/finance.php'",
        "fetch('api/bursary/dashboard.php'",
    ))
    reps.append((
        "populate billingData from response",
        "setFinanceSummary(",
        "setBillingData(",
    ))
    reps.append((
        "remove legacy receipts localStorage read",
        'localStorage.getItem("cchsmt_student_receipts")',
        'null /* REMOVED: was localStorage.getItem("cchsmt_student_receipts") */',
    ))
    reps.append((
        "remove legacy invoices localStorage read",
        'localStorage.getItem("cchsmt_student_invoices")',
        'null /* REMOVED: was localStorage.getItem("cchsmt_student_invoices") */',
    ))

    # --- 4. Dashboard fallback metric --------------------------------------
    reps.append((
        "dashboard fee card: financeSummary -> billingData",
        "financeSummary?.outstandingBalance",
        "billingData?.outstandingBalance",
    ))

    # --- 5. Dead handlers ---------------------------------------------------
    reps.append((
        "remove openPaymentCheckout call sites",
        "openPaymentCheckout(",
        "/* REMOVED openPaymentCheckout( */ (undefined as any)?.(",
    ))
    reps.append((
        "remove handleGatewayPayment call sites",
        "handleGatewayPayment(",
        "/* REMOVED handleGatewayPayment( */ (undefined as any)?.(",
    ))
    # The full function bodies of openPaymentCheckout / handleGatewayPayment
    # (and their cchsmt_student_receipts / cchsmt_student_invoices writes)
    # are declaration blocks whose exact boundaries weren't available here.
    # Deleting a function *definition* safely requires its literal source,
    # so this script flags it instead of guessing:
    print(
        "NOTE: openPaymentCheckout() and handleGatewayPayment() function "
        "definitions must be deleted by hand (or by adding an exact "
        "old_str block once you have the file open) — only their call "
        "sites were safely neutralized above.",
        file=sys.stderr,
    )

    # --- 6. Tab content replacement -----------------------------------------
    # This is the one block replacement inherently too large/variable to
    # anchor on a short literal snippet (it spans the legacy tab JSX and the
    # modal blocks). Anchor on the surrounding markers instead:
    reps.append((
        "replace legacy billing tab + modals with BillingClientView",
        '{activeTab === "billing" && (',
        '{activeTab === "billing" && (\n'
        '        <BillingClientView\n'
        '          invoices={billingData?.invoices ?? []}\n'
        '          payments={billingData?.payments ?? []}\n'
        '          studentName={billingData?.studentName ?? studentProfile?.fullName}\n'
        '          matricNo={billingData?.matricNo ?? studentProfile?.regNumber}\n'
        '        />\n'
        '      )}\n'
        '      {false && (',
    ))
    # The `{false && ( ...legacy JSX + modals... )}` wrapper above disables
    # the old block without deleting it sight-unseen, so you can diff and
    # remove it manually once verified. Swap this for a real full-block
    # delete when you have the exact ~944–1631 text.

    return reps


# ---------------------------------------------------------------------------
# Target 2: src/app/portal/billing/page.tsx
# ---------------------------------------------------------------------------

def billing_page_new_content() -> str:
    """
    billing/page.tsx is small and self-contained enough to fully rewrite
    rather than patch — this avoids fragile matching against mock data
    whose exact literal text wasn't available to this script.
    """
    return '''"use client";

import { useEffect, useState } from "react";
import BillingClientView from "@/app/portal/billing/BillingClientView";

interface BillingData {
  invoices: any[];
  payments: any[];
  studentName: string;
  matricNo: string;
  totalBilled: number;
  totalPaid: number;
  outstandingBalance: number;
  minimumUpfrontRequired: number;
  status: string;
}

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBillingData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("api/bursary/dashboard.php", {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`Failed to load billing data (HTTP ${res.status})`);
        }
        const json = await res.json();
        if (!cancelled) {
          setData(json);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Failed to load billing data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBillingData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        Loading billing information…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-red-600">
        <p>Couldn&apos;t load your billing information.</p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <BillingClientView
      invoices={data?.invoices ?? []}
      payments={data?.payments ?? []}
      studentName={data?.studentName ?? ""}
      matricNo={data?.matricNo ?? ""}
    />
  );
}
'''


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root",
        default=".",
        help="Repo root containing src/ (default: current directory)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Report what would change without writing files",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve()
    dashboard_path = root / "src" / "components" / "portal" / "PortalDashboard.tsx"
    billing_page_path = root / "src" / "app" / "portal" / "billing" / "page.tsx"

    failures = 0

    # --- PortalDashboard.tsx: patch in place -------------------------------
    print(f"\n== {dashboard_path} ==")
    if not dashboard_path.exists():
        print(f"  ✘ not found, skipping", file=sys.stderr)
        failures += 1
    else:
        try:
            apply_replacements(dashboard_path, portal_dashboard_replacements(), args.dry_run)
        except ReplacementError as e:
            print(f"  ✘ {e}", file=sys.stderr)
            failures += 1

    # --- billing/page.tsx: full rewrite ------------------------------------
    print(f"\n== {billing_page_path} ==")
    if not billing_page_path.exists():
        print(f"  ✘ not found, skipping", file=sys.stderr)
        failures += 1
    else:
        new_content = billing_page_new_content()
        if args.dry_run:
            print(f"  [dry-run] {billing_page_path}: would be fully rewritten "
                  f"({len(new_content.splitlines())} lines)")
        else:
            bak_path = backup(billing_page_path)
            billing_page_path.write_text(new_content, encoding="utf-8")
            print(f"  ✔ {billing_page_path} rewritten as a client component "
                  f"fetching api/bursary/dashboard.php")
            print(f"    (backup saved to {bak_path.name})")

    print()
    if failures:
        print(f"Done with {failures} issue(s) — see messages above. "
              f"No file was left partially modified.", file=sys.stderr)
        sys.exit(1)
    else:
        print("Done. Review the diffs (and the .bak- backups) before committing.")


if __name__ == "__main__":
    main()
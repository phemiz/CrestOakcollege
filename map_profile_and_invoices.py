path = r"src\components\portal\PortalDashboard.tsx"

with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

def show(pattern, label):
    print(f"=== {label} (pattern: {pattern!r}) ===")
    for i, line in enumerate(lines, start=1):
        if pattern in line:
            print(f"{i}: {line.rstrip()}")
    print()

show("studentProfile.", "studentProfile field usages")
show("useState", "all useState declarations")
show("setInvoices", "setInvoices usages")
show("invoices", "invoices usages (state var, lowercase)")

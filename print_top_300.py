path = r"src\components\portal\PortalDashboard.tsx"

with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("".join(lines[0:300]))

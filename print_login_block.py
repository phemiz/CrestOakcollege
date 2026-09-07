path = r"src\components\portal\PortalDashboard.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "{!isLoggedIn || !studentProfile ? ("
end_marker = "// PORTAL LOGGED IN LAYOUT"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

block = content[start_idx:end_idx]
print(block)

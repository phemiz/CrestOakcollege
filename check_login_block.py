path = r"src\components\portal\PortalDashboard.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "{!isLoggedIn || !studentProfile ? ("
end_marker = "// PORTAL LOGGED IN LAYOUT"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

print("start_marker found at index:", start_idx)
print("end_marker found at index:", end_idx)

if start_idx == -1 or end_idx == -1:
    print("ABORT: one or both markers not found. Do not proceed.")
else:
    block = content[start_idx:end_idx]
    print("\n--- Block length in characters:", len(block), "---")
    print("\n--- First 200 chars of block ---")
    print(block[:200])
    print("\n--- Last 200 chars of block ---")
    print(block[-200:])
    print("\n--- Occurrence count of each marker in whole file ---")
    print("start_marker count:", content.count(start_marker))
    print("end_marker count:", content.count(end_marker))

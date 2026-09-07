path = r"src\components\portal\PortalDashboard.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()
    lines = content.splitlines(keepends=True)

# 1) Marker check for the login block
start_marker = "{!isLoggedIn || !studentProfile ? ("
end_marker = "// PORTAL LOGGED IN LAYOUT"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

with open("marker_check_result.txt", "w", encoding="utf-8") as out:
    out.write(f"start_marker found at index: {start_idx}\n")
    out.write(f"end_marker found at index: {end_idx}\n")
    if start_idx == -1 or end_idx == -1:
        out.write("ABORT: one or both markers not found. Do not proceed.\n")
    else:
        block = content[start_idx:end_idx]
        out.write(f"\nBlock length in characters: {len(block)}\n")
        out.write("\n--- First 200 chars of block ---\n")
        out.write(block[:200] + "\n")
        out.write("\n--- Last 200 chars of block ---\n")
        out.write(block[-200:] + "\n")
        out.write(f"\nstart_marker count: {content.count(start_marker)}\n")
        out.write(f"end_marker count: {content.count(end_marker)}\n")

# 2) Top of file - imports, types, state, handleLogin
with open("top_150.txt", "w", encoding="utf-8") as out:
    out.writelines(lines[0:150])

print("Done. Wrote marker_check_result.txt and top_150.txt")

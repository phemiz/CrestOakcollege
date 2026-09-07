path = r"src\components\portal\PortalDashboard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "const handleLogin = (e: React.FormEvent) => {"
end_marker = "setIsLoggedIn(true);\n    setStudentError(\"\");\n  };"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

with open("handlelogin_marker_check.txt", "w", encoding="utf-8") as out:
    out.write(f"start_idx: {start_idx}\n")
    out.write(f"end_idx: {end_idx}\n")
    out.write(f"start_marker count: {content.count(start_marker)}\n")
    out.write(f"end_marker count: {content.count(end_marker)}\n")
    if start_idx != -1 and end_idx != -1:
        block_len = (end_idx + len(end_marker)) - start_idx
        out.write(f"block length: {block_len}\n")

print("done")

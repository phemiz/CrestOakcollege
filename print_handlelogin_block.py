path = r"src\components\portal\PortalDashboard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "const handleLogin = (e: React.FormEvent) => {"
end_marker = "setIsLoggedIn(true);\n    setStudentError(\"\");\n  };"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)
block = content[start_idx:end_idx + len(end_marker)]

with open("handlelogin_block_full.txt", "w", encoding="utf-8") as out:
    out.write(block)

print("done, length:", len(block))

path = r"src\components\portal\PortalDashboard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

start = content.find("const handleLogin = (e: React.FormEvent) => {")
# find the matching end: the next top-level function/const after handleLogin
end = content.find("\n  const ", start + 10)
if end == -1:
    end = start + 3000

with open("handleLogin_full.txt", "w", encoding="utf-8") as out:
    out.write(content[start:end])

print("Wrote handleLogin_full.txt, length:", end - start)

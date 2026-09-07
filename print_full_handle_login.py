path = r"src\components\portal\PortalDashboard.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "const handleLogin = (e: React.FormEvent) => {"
start_idx = content.find(start_marker)

# find the matching closing brace by tracking depth from the opening one
depth = 0
end_idx = None
i = start_idx
started = False
while i < len(content):
    if content[i] == "{":
        depth += 1
        started = True
    elif content[i] == "}":
        depth -= 1
        if started and depth == 0:
            end_idx = i + 1
            break
    i += 1

print("start_idx:", start_idx, "end_idx:", end_idx)
print()
print(content[start_idx:end_idx])

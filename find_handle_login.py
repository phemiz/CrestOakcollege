path = r"src\components\portal\PortalDashboard.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

marker = "handleLogin"
idx = content.find(f"const {marker}")
if idx == -1:
    idx = content.find(f"function {marker}")
if idx == -1:
    idx = content.find(f"async function {marker}")

print("handleLogin definition found at index:", idx)
print("Total occurrences of the word handleLogin:", content.count(marker))

if idx != -1:
    print()
    print(content[idx:idx+1800])

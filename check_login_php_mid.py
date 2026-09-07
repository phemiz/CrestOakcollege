path = r"api\login.php"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

print("Total length:", len(content))
print()
print(content[3500:7500])

path = r"api\login.php"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

print(content[:1500])

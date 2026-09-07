path = r"api\student\login.php"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

print("Length:", len(content))
print()
print(content)

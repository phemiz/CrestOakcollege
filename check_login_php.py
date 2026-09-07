path = r"public_html\api\login.php"

try:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    print("FILE FOUND, length:", len(content))
    print()
    print(content)
except FileNotFoundError:
    print("NOT FOUND at:", path)

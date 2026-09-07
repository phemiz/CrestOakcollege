import shutil, datetime

path = r"src\components\portal\PortalDashboard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "const handleLogin = (e: React.FormEvent) => {"
end_marker = "setIsLoggedIn(true);\n    setStudentError(\"\");\n  };"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1 or content.count(start_marker) != 1 or content.count(end_marker) != 1:
    print("ABORT: markers not safely unique anymore. Stop and re-check.")
else:
    old_block = content[start_idx:end_idx + len(end_marker)]

    new_block = '''const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !studentPass.trim()) {
      setStudentError("Please enter both portal credentials.");
      return;
    }
    setStudentError("");
    try {
      const res = await fetch("/api/login.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: studentId, password: studentPass })
      });
      const data = await res.json();
      if (!data.success || !data.user) {
        setStudentError(data.message || "Invalid portal credentials.");
        return;
      }
      const user = data.user;
      const level = Number(user.level) || 100;
      const profile: StudentProfile = {
        fullName: user.name || "Student",
        regNumber: user.matricNo || user.username || studentId.toUpperCase(),
        email: user.email || "",
        phone: "",
        faculty: user.department || "",
        semester: "1st Semester, 2025/2026",
        level: `Year ${Math.ceil(level / 100)} / ${level} Level`,
        gpa: "3.82"
      };
      setStudentProfile(profile);
      localStorage.setItem("cchsmt_student_profile", JSON.stringify(profile));
      localStorage.setItem("isAuthenticated", "true");
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Login error:", err);
      setStudentError("Unable to reach the authentication server. Please try again.");
    }
  };'''

    print("=== OLD BLOCK (will be removed) ===")
    print(old_block)
    print("\\n=== NEW BLOCK (will be inserted) ===")
    print(new_block)
    print("\\nOld block length:", len(old_block), "| New block length:", len(new_block))

    with open("handlelogin_replace_preview.txt", "w", encoding="utf-8") as out:
        out.write("=== OLD BLOCK ===\\n" + old_block + "\\n\\n=== NEW BLOCK ===\\n" + new_block)

    print("\\nPreview written to handlelogin_replace_preview.txt. Review it, then run apply_handlelogin_fix.py to actually write the file.")

    with open("apply_handlelogin_fix.py", "w", encoding="utf-8") as out:
        out.write(f'''import shutil, datetime

path = r"src\\\\components\\\\portal\\\\PortalDashboard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = {start_marker!r}
end_marker = {end_marker!r}

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1 or content.count(start_marker) != 1 or content.count(end_marker) != 1:
    print("ABORT: markers changed since preview. Re-run the check script.")
else:
    old_block = content[start_idx:end_idx + len(end_marker)]
    new_block = {new_block!r}

    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = path + ".bak." + ts
    shutil.copy2(path, backup_path)
    print("Backup written to:", backup_path)

    new_content = content[:start_idx] + new_block + content[end_idx + len(end_marker):]
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print("Applied. File updated:", path)
''')
    print("apply_handlelogin_fix.py written.")

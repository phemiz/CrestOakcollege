import shutil, datetime

path = r"src\\components\\portal\\PortalDashboard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = 'const handleLogin = (e: React.FormEvent) => {'
end_marker = 'setIsLoggedIn(true);\n    setStudentError("");\n  };'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1 or content.count(start_marker) != 1 or content.count(end_marker) != 1:
    print("ABORT: markers changed since preview. Re-run the check script.")
else:
    old_block = content[start_idx:end_idx + len(end_marker)]
    new_block = 'const handleLogin = async (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!studentId.trim() || !studentPass.trim()) {\n      setStudentError("Please enter both portal credentials.");\n      return;\n    }\n    setStudentError("");\n    try {\n      const res = await fetch("/api/login.php", {\n        method: "POST",\n        credentials: "include",\n        headers: { "Content-Type": "application/json" },\n        body: JSON.stringify({ identifier: studentId, password: studentPass })\n      });\n      const data = await res.json();\n      if (!data.success || !data.user) {\n        setStudentError(data.message || "Invalid portal credentials.");\n        return;\n      }\n      const user = data.user;\n      const level = Number(user.level) || 100;\n      const profile: StudentProfile = {\n        fullName: user.name || "Student",\n        regNumber: user.matricNo || user.username || studentId.toUpperCase(),\n        email: user.email || "",\n        phone: "",\n        faculty: user.department || "",\n        semester: "1st Semester, 2025/2026",\n        level: `Year ${Math.ceil(level / 100)} / ${level} Level`,\n        gpa: "3.82"\n      };\n      setStudentProfile(profile);\n      localStorage.setItem("cchsmt_student_profile", JSON.stringify(profile));\n      localStorage.setItem("isAuthenticated", "true");\n      setIsLoggedIn(true);\n    } catch (err) {\n      console.error("Login error:", err);\n      setStudentError("Unable to reach the authentication server. Please try again.");\n    }\n  };'

    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = path + ".bak." + ts
    shutil.copy2(path, backup_path)
    print("Backup written to:", backup_path)

    new_content = content[:start_idx] + new_block + content[end_idx + len(end_marker):]
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)

    print("Applied. File updated:", path)

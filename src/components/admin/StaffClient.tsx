"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
  Loader2,
  Eye,
  EyeOff,
  Zap,
  BookOpen,
  CheckCircle2,
  Shield,
  KeyRound,
  Copy,
  Mail,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Clock
} from "lucide-react";
import { DEFAULT_DEPARTMENTS } from "@/constants/institutionalData";

interface StaffItem {
  id: string;
  staffNo: string;
  staffId?: string;
  sin?: string;
  email?: string;
  designation: string;
  joiningDate: Date | string;
  status?: "ACTIVE" | "SUSPENDED" | "ON_LEAVE";
  lastLogin?: string;
  allocatedCourses?: string[];
  user: {
    id?: string;
    username?: string | null;
    firstName: string;
    lastName: string;
    middleName: string | null;
    email: string;
    phoneNumber: string | null;
    roleName?: string;
    role: {
      name: string;
    };
  };
  department: {
    id: string;
    name: string;
  };
  lecturer?: {
    rank: string;
    specialization: string;
  } | null;
}

interface DropdownItem {
  id: string;
  name: string;
}

interface StaffClientProps {
  staffList: StaffItem[];
  departments: DropdownItem[];
}

export const resolveDepartment = (dept: string = "", staffId: string = "") => {
  if (dept && dept !== "Selected Department" && dept.trim() !== "") {
    return dept;
  }
  
  const codeMatch = staffId ? staffId.match(/(?:STAFF|STF|ADM)\/([A-Z]{3})\//i) : null;
  const code = codeMatch ? codeMatch[1].toUpperCase() : '';
  
  const DEPT_MAP: Record<string, string> = {
    'SCS': 'Department of Computer Science & IT',
    'NUR': 'Department of Nursing Sciences',
    'MLS': 'Department of Medical Laboratory Science',
    'CHS': 'Department of Community Health Sciences',
    'BUS': 'Department of Business Administration',
    'LAW': 'Department of Law & Criminology',
    'REG': 'Registry & Academic Affairs',
    'BUR': 'Bursary & Financial Services'
  };

  return DEPT_MAP[code] || 'General Administration';
};

function getStaffDeptCode(deptName: string = "") {
  const upper = deptName.toUpperCase();
  if (upper.includes("NURSING")) return "NUR";
  if (upper.includes("LABORATORY") || upper.includes("MLS")) return "MLS";
  if (upper.includes("COMMUNITY") || upper.includes("HEALTH") || upper.includes("CHEW")) return "CHS";
  if (upper.includes("COMPUTER") || upper.includes("SCIENCE") || upper.includes("IT")) return "SCS";
  if (upper.includes("BUSINESS") || upper.includes("MANAGEMENT")) return "BUS";
  if (upper.includes("LAW") || upper.includes("CRIMINOLOGY")) return "LAW";
  if (upper.includes("REGISTRY") || upper.includes("ADMIN")) return "REG";
  if (upper.includes("BURSARY") || upper.includes("FINANCE") || upper.includes("ACCOUNT")) return "BUR";
  return upper.substring(0, 3).replace(/[^A-Z]/g, "S") || "SCS";
}

const AVAILABLE_COURSES = [
  { code: "NUR101", title: "Introduction to Nursing & Clinical Ethics" },
  { code: "NUR102", title: "Clinical Nursing Anatomy & Physiology" },
  { code: "MLS201", title: "General Clinical Pathology & Haematology" },
  { code: "MLS202", title: "Medical Microbiology & Diagnostics" },
  { code: "CSC101", title: "Introduction to Computer Science & Python" },
  { code: "CSC301", title: "Database Systems & Data Warehousing" },
  { code: "CHEW101", title: "Primary Health Care & Community Medicine" },
  { code: "BUS201", title: "Principles of Management & Organization" }
];

export default function StaffClient({ staffList: initialStaff, departments: rawDepartments }: StaffClientProps) {
  const departments = (rawDepartments && rawDepartments.length > 0)
    ? rawDepartments
    : DEFAULT_DEPARTMENTS.map((d, i) => ({ id: `dept-${i + 1}`, name: d }));

  const router = useRouter();
  const [staffList, setStaffList] = useState<StaffItem[]>(initialStaff || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Issued Credentials Confirmation Modal
  const [issuedCredentials, setIssuedCredentials] = useState<{
    staffId: string;
    temporaryPassword: string;
    email: string;
    role: string;
    sendEmail: boolean;
    forcePasswordChange: boolean;
  } | null>(null);

  // Manage Credentials Modal State
  const [manageCredentialsStaff, setManageCredentialsStaff] = useState<StaffItem | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [magicLinkUrl, setMagicLinkUrl] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);

  const normalizeStaffItem = (item: any, idx?: number): StaffItem => {
    const sNo = item?.staffNo || item?.staff_id || item?.staffId || item?.sin || 'N/A';
    const dName = resolveDepartment(item?.department?.name || item?.department || '', sNo);
    return {
      id: item?.id || item?.staff_id || item?.staffNo || item?.sin || `staff-fallback-${idx ?? Math.random()}`,
      staffNo: sNo,
      designation: item?.designation || 'Staff',
      joiningDate: item?.joiningDate || item?.joining_date || new Date().toISOString().split('T')[0],
      status: item?.status || "ACTIVE",
      lastLogin: item?.lastLogin || new Date().toLocaleString(),
      allocatedCourses: Array.isArray(item?.allocatedCourses) ? item.allocatedCourses : [],
      user: {
        id: item?.user?.id || item?.id || `usr-${idx ?? Math.random()}`,
        username: item?.user?.username || item?.username || '',
        firstName: item?.user?.firstName || item?.firstName || item?.first_name || 'Staff',
        lastName: item?.user?.lastName || item?.lastName || item?.last_name || 'Member',
        middleName: item?.user?.middleName || item?.middleName || item?.middle_name || '',
        email: item?.user?.email || item?.email || '',
        phoneNumber: item?.user?.phoneNumber || item?.phone || item?.phoneNumber || '',
        role: {
          name: item?.user?.role?.name || item?.user?.roleName || item?.roleName || item?.role || 'LECTURER'
        }
      },
      department: {
        id: item?.department?.id || ('dept-' + String(dName).toLowerCase().replace(/[^a-z0-9]/g, '-')),
        name: dName
      },
      lecturer: (item?.lecturer || item?.academicRank || item?.academic_rank) ? {
        rank: item?.lecturer?.rank || item?.academicRank || item?.academic_rank || 'LECTURER_II',
        specialization: item?.lecturer?.specialization || item?.specialization || ''
      } : null
    };
  };

  useEffect(() => {
    if (Array.isArray(initialStaff) && initialStaff.length > 0) {
      setStaffList(initialStaff.map(normalizeStaffItem));
    }
  }, [initialStaff]);

  useEffect(() => {
    let isMounted = true;
    const fetchStaffMembers = async () => {
      try {
        const res = await fetch("/api/admin/staff.php?_t=" + Date.now(), {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("sessionToken")}`,
            "X-CSRF-Token": localStorage.getItem("csrfToken") || ""
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          const liveList = Array.isArray(data) 
            ? data 
            : Array.isArray(data?.staff) 
            ? data.staff 
            : Array.isArray(data?.staffList) 
            ? data.staffList 
            : Array.isArray(data?.data)
            ? data.data
            : [];
          if (Array.isArray(liveList)) {
            setStaffList(liveList.map(normalizeStaffItem));
          }
        }
      } catch (error) {
        console.error("Error fetching live staff records:", error);
      }
    };

    fetchStaffMembers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);

  // Course Allocation Modal
  const [courseStaff, setCourseStaff] = useState<StaffItem | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    middleName: "",
    phoneNumber: "",
    staffNo: "",
    designation: "",
    status: "ACTIVE" as "ACTIVE" | "SUSPENDED" | "ON_LEAVE",
    joiningDate: new Date().toISOString().split("T")[0],
    departmentId: "",
    roleName: "LECTURER" as "LECTURER" | "HOD" | "DEAN" | "REGISTRAR" | "BURSAR" | "STAFF" | "ADMIN" | "SUPER_ADMIN",
    rank: "LECTURER_II",
    specialization: "",
    sendEmail: true,
    forcePasswordChange: true
  });

  const computeSIN = (deptId: string, roleName: string) => {
    const selectedDept = departments.find((d) => d.id === deptId);
    const deptName = selectedDept?.name || "";
    const code = getStaffDeptCode(deptName);
    const isHealth = deptName.toUpperCase().includes("NURSING") || deptName.toUpperCase().includes("HEALTH") || deptName.toUpperCase().includes("MEDICAL") || code === "NUR" || code === "MLS";
    const collegePrefix = isHealth ? "CCHMS" : "CCHMT";
    const isAcademic = ["LECTURER", "HOD", "DEAN"].includes(roleName);
    const typePrefix = isAcademic ? "STF" : "ADM";
    const year = "2026";
    const countInDept = staffList.filter((s) => s.department?.id === deptId || (s.staffNo && s.staffNo.includes(code))).length;
    const nextIndex = String(countInDept + 1).padStart(3, "0");
    return `${collegePrefix}/${typePrefix}/${year}/${code}/${nextIndex}`;
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789#@!";
    let randPass = "CrestOak#";
    for (let i = 0; i < 5; i++) {
      randPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return randPass;
  };

  const handleNameChange = (field: "firstName" | "lastName", val: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: val };
      const fn = updated.firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const ln = updated.lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const suggestedUsername = fn && ln ? `${fn}.${ln}` : fn || ln;
      const suggestedEmail = suggestedUsername ? `${suggestedUsername}@crestoakcollege.com.ng` : "";
      return {
        ...updated,
        username: suggestedUsername,
        email: updated.email || suggestedEmail
      };
    });
  };

  const handleDepartmentChange = (deptId: string) => {
    setFormData((prev) => ({
      ...prev,
      departmentId: deptId,
      staffNo: editingStaff ? prev.staffNo : computeSIN(deptId, prev.roleName)
    }));
  };

  const handleRoleChange = (role: any) => {
    setFormData((prev) => ({
      ...prev,
      roleName: role,
      staffNo: editingStaff ? prev.staffNo : computeSIN(prev.departmentId, role)
    }));
  };

  const handleAutoGeneratePassword = () => {
    const pass = generateRandomPassword();
    setFormData((prev) => ({ ...prev, password: pass }));
    setShowPassword(true);
  };

  const openAddModal = () => {
    const defaultDept = departments[0]?.id || "";
    const autoPass = generateRandomPassword();
    setEditingStaff(null);
    setShowPassword(true);
    setFormData({
      username: "",
      email: "",
      password: autoPass,
      firstName: "",
      lastName: "",
      middleName: "",
      phoneNumber: "",
      staffNo: computeSIN(defaultDept, "LECTURER"),
      designation: "Lecturer II",
      status: "ACTIVE",
      joiningDate: new Date().toISOString().split("T")[0],
      departmentId: defaultDept,
      roleName: "LECTURER",
      rank: "LECTURER_II",
      specialization: "",
      sendEmail: true,
      forcePasswordChange: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (staff: StaffItem) => {
    setEditingStaff(staff);
    setShowPassword(false);
    setFormData({
      username: staff.user?.username || "",
      email: staff.user?.email || "",
      password: "",
      firstName: staff.user?.firstName || "",
      lastName: staff.user?.lastName || "",
      middleName: staff.user?.middleName || "",
      phoneNumber: staff.user?.phoneNumber || "",
      staffNo: staff.staffNo || "",
      designation: staff.designation || "",
      status: staff.status || "ACTIVE",
      joiningDate: typeof staff.joiningDate === "string" ? staff.joiningDate.split("T")[0] : new Date().toISOString().split("T")[0],
      departmentId: staff.department?.id || "",
      roleName: (staff.user?.role?.name as any) || "LECTURER",
      rank: staff.lecturer?.rank || "LECTURER_II",
      specialization: staff.lecturer?.specialization || "",
      sendEmail: false,
      forcePasswordChange: true
    });
    setIsModalOpen(true);
  };

  const openCourseAllocationModal = (staff: StaffItem) => {
    setCourseStaff(staff);
    setSelectedCourses(staff.allocatedCourses || ["NUR101", "CSC101"]);
  };

  const toggleCourseAllocation = (code: string) => {
    setSelectedCourses((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSaveCourseAllocation = async () => {
    if (!courseStaff) return;
    setIsSubmitting(true);
    try {
      setStaffList((prev) =>
        prev.map((s) => (s.id === courseStaff.id ? { ...s, allocatedCourses: selectedCourses } : s))
      );
      alert(`Course allocation updated successfully for ${courseStaff.user.firstName} ${courseStaff.user.lastName}! Assigned (${selectedCourses.length}) courses.`);
      setCourseStaff(null);
    } catch (err: any) {
      alert("Error saving course mapping: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.username) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!editingStaff && !formData.password) {
      alert("Please specify or auto-generate an initial staff portal password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedDept = departments.find((d) => d.id === formData.departmentId);
      const deptName = selectedDept ? selectedDept.name : "General Administration";
      const computedStaffNo = formData.staffNo || computeSIN(formData.departmentId, formData.roleName);

      const payload = {
        action: "save_staff",
        ...formData,
        staffNo: computedStaffNo,
        departmentName: deptName,
        id: editingStaff?.id
      };

      const res = await fetch("/api/admin/staff.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("sessionToken")}`,
          "X-CSRF-Token": localStorage.getItem("csrfToken") || ""
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      const returnedStaff = data.staff || data.data;
      const normalized: StaffItem = {
        id: editingStaff?.id || returnedStaff?.id || `staff-${Date.now()}`,
        staffNo: computedStaffNo,
        designation: formData.designation || "Lecturer",
        joiningDate: formData.joiningDate,
        status: formData.status,
        lastLogin: new Date().toLocaleString(),
        allocatedCourses: editingStaff?.allocatedCourses || ["NUR101"],
        user: {
          id: editingStaff?.user.id || `usr-${Date.now()}`,
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName || "",
          email: formData.email,
          phoneNumber: formData.phoneNumber || "",
          role: { name: formData.roleName }
        },
        department: {
          id: formData.departmentId,
          name: deptName
        },
        lecturer: {
          rank: formData.rank,
          specialization: formData.specialization
        }
      };

      if ((data.success || data.staff) && data.persistenceSuccess !== false) {
        // Re-fetch the staff list directly from the GET endpoint (/api/admin/staff.php) upon successful creation to confirm database persistence
        try {
          const getRes = await fetch("/api/admin/staff.php?t=" + Date.now(), {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("sessionToken")}`,
              "X-CSRF-Token": localStorage.getItem("csrfToken") || ""
            }
          });
          const getData = await getRes.json();
          if (getData.staffList && Array.isArray(getData.staffList)) {
            setStaffList(getData.staffList);
          } else if (editingStaff) {
            setStaffList((prev) => prev.map((s) => (s.id === editingStaff.id ? normalized : s)));
          } else {
            setStaffList((prev) => [normalized, ...prev]);
          }
        } catch {
          if (editingStaff) {
            setStaffList((prev) => prev.map((s) => (s.id === editingStaff.id ? normalized : s)));
          } else {
            setStaffList((prev) => [normalized, ...prev]);
          }
        }

        setIsModalOpen(false);

        // Issued credentials visual confirmation modal
        if (!editingStaff && (data.staff?.temporaryPassword || formData.password)) {
          setIssuedCredentials({
            staffId: computedStaffNo,
            temporaryPassword: data.staff?.temporaryPassword || formData.password,
            email: formData.email,
            role: formData.roleName,
            sendEmail: formData.sendEmail,
            forcePasswordChange: formData.forcePasswordChange
          });
        }
        router.refresh();
      } else {
        alert("Registration Error: Server failed to save record. " + (data.error || data.message || "Failed to write record to persistent database."));
      }
    } catch (err: any) {
      alert("Registration Error: Server failed to save record. " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manage Credentials / Reset Password Submit Handler
  const handleManageCredentialsReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manageCredentialsStaff || !resetPasswordValue) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/staff.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("sessionToken")}`,
          "X-CSRF-Token": localStorage.getItem("csrfToken") || ""
        },
        body: JSON.stringify({
          action: "password_reset",
          id: manageCredentialsStaff.id,
          sin: manageCredentialsStaff.sin || manageCredentialsStaff.staffNo,
          staffNo: manageCredentialsStaff.staffNo,
          staffId: manageCredentialsStaff.staffNo,
          password: resetPasswordValue,
          newPassword: resetPasswordValue,
          email: manageCredentialsStaff.user?.email || manageCredentialsStaff.email || "",
          roleName: manageCredentialsStaff.user?.role?.name || manageCredentialsStaff.user?.roleName || "LECTURER"
        })
      });
      const data = await res.json();
      if (data.success) {
        setIssuedCredentials({
          staffId: manageCredentialsStaff.staffNo,
          temporaryPassword: resetPasswordValue,
          email: manageCredentialsStaff.user?.email || manageCredentialsStaff.email || "",
          role: manageCredentialsStaff.user?.role?.name || manageCredentialsStaff.user?.roleName || "LECTURER",
          sendEmail: true,
          forcePasswordChange: true
        });
        setManageCredentialsStaff(null);
      } else {
        alert("Password reset failed: " + data.message);
      }
    } catch (err: any) {
      alert("Error resetting password: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openManageCredentials = (staff: StaffItem) => {
    setManageCredentialsStaff(staff);
    setResetPasswordValue(generateRandomPassword());
    setMagicLinkUrl(`https://staff.crestoakcollege.com.ng/login?magicToken=${Math.random().toString(36).substring(2)}${Date.now()}`);
    setCopiedLink(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff record?")) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/staff.php", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("sessionToken")}`,
          "X-CSRF-Token": localStorage.getItem("csrfToken") || ""
        },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setStaffList((prev) => prev.filter((s) => s.id !== id && s.staffNo !== id));
      } else {
        alert("Error deleting staff: " + (data.message || "Failed"));
      }
    } catch (err: any) {
      alert("Delete error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeStaffList = useMemo(() => {
    const list = Array.isArray(staffList) ? staffList : [];
    return list.map((staff, index) => {
      const deptName = typeof staff?.department === "string" 
        ? staff.department 
        : staff?.department?.name || 'Unassigned Department';
      const department = {
        id: staff?.department?.id || ('dept-' + String(deptName).toLowerCase().replace(/[^a-z0-9]/g, '-')),
        name: deptName
      };
      return {
        ...staff,
        uniqueKey: staff.id || staff.staffNo || `staff-row-${index}`,
        displayName: staff.user 
          ? `${staff.user.firstName || ''} ${staff.user.middleName || ''} ${staff.user.lastName || ''}`.replace(/\s+/g, ' ').trim() 
          : 'Unknown Staff',
        staffNo: staff.staffNo || staff.sin || 'N/A',
        department,
      };
    });
  }, [staffList]);

  const filteredStaff = safeStaffList.filter((staff) => {
    const fullName = staff.displayName.toLowerCase();
    const username = (staff.user?.username || "").toLowerCase();
    const email = (staff.user?.email || "").toLowerCase();
    const staffNo = (staff.staffNo || "").toLowerCase();

    const searchMatch =
      fullName.includes(searchTerm.toLowerCase()) ||
      username.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      staffNo.includes(searchTerm.toLowerCase());

    const deptMatch = deptFilter === "ALL" || staff.department?.id === deptFilter;
    const roleMatch = roleFilter === "ALL" || staff.user?.role?.name === roleFilter;

    return searchMatch && deptMatch && roleMatch;
  });

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-slate-900">Staff Registry & Credential Management</h2>
          <p className="text-xs text-slate-500 mt-1">Enterprise CCHMT SIN identification, Bcrypt credential onboarding, Registrar role governance & course mapping.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-red-600 hover:bg-red-700 text-white font-display font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Register New Staff</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name, SIN (CCHMT/STF/...), username, or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
          />
        </div>
        <div className="md:col-span-3">
          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
          >
            <option value="ALL">All Departments</option>
            {(departments || []).map((dept: any) => (
              <option key={dept?.id || dept?.name} value={dept?.id}>
                {dept?.name || dept?.title || 'General Department'}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="REGISTRAR">REGISTRAR (Chief Admin)</option>
            <option value="BURSAR">BURSAR (Chief Financial)</option>
            <option value="DEAN">DEAN</option>
            <option value="HOD">HOD</option>
            <option value="LECTURER">LECTURER</option>
            <option value="STAFF">STAFF</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Staff Identification (SIN)</th>
                <th className="py-3.5 px-4">Department / Unit</th>
                <th className="py-3.5 px-4">Role & Designation</th>
                <th className="py-3.5 px-4">Portal Access Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No staff records match your filters.
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((staff) => (
                  <tr key={staff.uniqueKey} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {staff.user?.firstName || "Staff"} {staff.user?.middleName || ""} {staff.user?.lastName || "Member"}
                      </div>
                      <div className="text-[11px] text-slate-400">{staff.user?.email || staff.email || "No Email"}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{staff.staffNo}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{resolveDepartment(staff.department?.name, staff.staffNo)}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            staff.user?.role?.name === "ADMIN" || staff.user?.role?.name === "SUPER_ADMIN"
                              ? "bg-purple-100 text-purple-700 border border-purple-200"
                              : staff.user?.role?.name === "REGISTRAR"
                              ? "bg-rose-100 text-rose-700 border border-rose-200"
                              : staff.user?.role?.name === "DEAN" || staff.user?.role?.name === "HOD"
                              ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                              : staff.user?.role?.name === "BURSAR"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : staff.user?.role?.name === "LECTURER"
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {staff.user?.role?.name || "LECTURER"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium">{staff.designation}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          (staff.status || "ACTIVE") === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : (staff.status || "ACTIVE") === "SUSPENDED"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {staff.status || "ACTIVE"}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3 inline" />
                        {staff.lastLogin ? `Login: ${staff.lastLogin.substring(0, 16)}` : "Recently active"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Course Mapping */}
                        <button
                          onClick={() => openCourseAllocationModal(staff)}
                          className="p-1.5 bg-white border border-slate-200 hover:bg-blue-50 text-blue-700 rounded-lg transition-colors cursor-pointer"
                          title="Course Allocation Mapping"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                        </button>

                        {/* Credential Management */}
                        <button
                          onClick={() => openManageCredentials(staff)}
                          className="p-1.5 bg-white border border-slate-200 hover:bg-purple-50 text-purple-700 rounded-lg transition-colors cursor-pointer"
                          title="Manage Credentials & Magic Link"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </button>

                        {/* Edit Staff Profile */}
                        <button
                          onClick={() => openEditModal(staff)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Staff Member"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {/* Delete / Archive */}
                        <button
                          onClick={() => handleDelete(staff.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Archive / Soft-Delete Staff Account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <div className="text-xs text-slate-500">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 1. Register New Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-display font-black text-slate-900">
                  {editingStaff ? "Edit Staff Member Profile" : "Register New Staff Member"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingStaff ? "Update staff member record and permissions." : "Create new academic or administrative staff account with CCHMT SIN identification."}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleNameChange("firstName", e.target.value)}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleNameChange("lastName", e.target.value)}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Middle Name</label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-slate-700">Staff Identification Number (SIN) *</label>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, staffNo: computeSIN(prev.departmentId, prev.roleName) }))}
                      className="text-[10px] font-semibold text-brand-navy hover:text-brand-red flex items-center gap-1 transition-colors"
                      title="Auto-generate fresh SIN"
                    >
                      <RefreshCw className="w-3 h-3" /> Auto-generate
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      value={formData.staffNo}
                      onChange={(e) => setFormData({ ...formData, staffNo: e.target.value })}
                      placeholder="Auto-generated e.g., CCHMS/2026/STF/0042 or CCHMT/STF/2026/NUR/002"
                      className="w-full p-2.5 pr-10 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-mono font-bold text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, staffNo: computeSIN(prev.departmentId, prev.roleName) }))}
                      className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                      title="Regenerate SIN"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    Auto-generated e.g., CCHMS/2026/STF/0042 or CCHMT/STF/2026/NUR/002
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Institutional Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Portal Access Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                  >
                    <option value="ACTIVE">ACTIVE (Granted Portal Access)</option>
                    <option value="SUSPENDED">SUSPENDED (Access Revoked)</option>
                    <option value="ON_LEAVE">ON LEAVE (Temporary Pause)</option>
                  </select>
                </div>
              </div>

              {/* Password Section */}
              <div className="flex flex-col gap-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">
                    Initial Portal Password {editingStaff ? "(Leave blank to keep unchanged)" : "*"}
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGeneratePassword}
                    className="text-[10px] text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Zap className="h-3 w-3" />
                    <span>Auto-Generate Password</span>
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={!editingStaff}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Set initial password for staff portal..."
                    className="w-full p-2.5 pr-10 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 text-xs font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Issuance Checkboxes */}
                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 text-[11px] font-semibold">
                    <input
                      type="checkbox"
                      checked={formData.sendEmail}
                      onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
                    />
                    <span>Send initial portal credentials (Staff ID, Email & Password) via Email.</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 text-[11px] font-semibold">
                    <input
                      type="checkbox"
                      checked={formData.forcePasswordChange}
                      onChange={(e) => setFormData({ ...formData, forcePasswordChange: e.target.checked })}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
                    />
                    <span>Force password change on first staff portal login.</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Primary Role Assignment *</label>
                  <select
                    value={formData.roleName}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                  >
                    <option value="LECTURER">LECTURER (Academic)</option>
                    <option value="HOD">HOD (Head of Department)</option>
                    <option value="DEAN">DEAN (Faculty Dean)</option>
                    <option value="REGISTRAR">REGISTRAR (Chief Administrative Officer)</option>
                    <option value="BURSAR">BURSAR (Chief Financial Officer)</option>
                    <option value="STAFF">STAFF (General Registry/Admin Officer)</option>
                    <option value="ADMIN">ADMIN (System Administrator)</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-700">Department *</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    required
                    className="p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 font-bold"
                  >
                    <option value="">-- Select Department --</option>
                    {(departments || []).map((dept: any) => (
                      <option key={dept?.id || dept?.name} value={dept?.id}>
                        {dept?.name || dept?.title || 'General Department'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingStaff ? "Update Staff Profile" : "Register Staff Member"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Issued Credentials Visual Confirmation Modal */}
      {issuedCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm uppercase">
                <CheckCircle2 className="h-5 w-5" />
                <span>Issued Staff Credentials</span>
              </div>
              <button onClick={() => setIssuedCredentials(null)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Staff Identification (SIN)</span>
                <span className="font-mono font-black text-sm text-slate-900">{issuedCredentials.staffId}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Temporary Password</span>
                <span className="font-mono font-black text-sm text-slate-900">{issuedCredentials.temporaryPassword}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Staff Institutional Email & Role</span>
                <span className="font-sans font-semibold text-xs text-slate-700 block">{issuedCredentials.email}</span>
                <span className="inline-block bg-emerald-200 text-emerald-900 font-extrabold text-[9px] px-2 py-0.5 rounded mt-1 uppercase">
                  Role: {issuedCredentials.role}
                </span>
              </div>

              <div className="pt-2 border-t border-emerald-200/60 flex items-center gap-2 text-[11px] font-bold text-emerald-900">
                <Mail className="h-3.5 w-3.5" />
                <span>Email Credentials Dispatch: {issuedCredentials.sendEmail ? "Sent" : "Manual Share"}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const text = `CrestOak Staff Portal Credentials:\nStaff ID (SIN): ${issuedCredentials.staffId}\nRole: ${issuedCredentials.role}\nPassword: ${issuedCredentials.temporaryPassword}\nLogin: https://staff.crestoakcollege.com.ng/login`;
                  navigator.clipboard.writeText(text);
                  setCopiedCreds(true);
                  setTimeout(() => setCopiedCreds(false), 2000);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {copiedCreds ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copiedCreds ? "Credentials Copied!" : "Copy Full Staff Access Payload"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Manage Credentials Drawer / Modal */}
      {manageCredentialsStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-purple-700 font-extrabold text-sm uppercase">
                <KeyRound className="h-5 w-5" />
                <span>Manage Staff Credentials</span>
              </div>
              <button onClick={() => setManageCredentialsStaff(null)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-700 font-medium">
              Staff: <strong className="font-mono">{manageCredentialsStaff.staffNo}</strong> ({manageCredentialsStaff.user.email}).
            </div>

            <form onSubmit={handleManageCredentialsReset} className="space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold text-slate-700">New Temporary Password</label>
                <button
                  type="button"
                  onClick={() => setResetPasswordValue(generateRandomPassword())}
                  className="text-[10px] text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Zap className="h-3 w-3" />
                  <span>Auto-Generate</span>
                </button>
              </div>

              <div className="relative flex items-center">
                <input
                  type={showResetPassword ? "text" : "password"}
                  required
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  className="w-full p-2.5 pr-10 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900 text-slate-900 text-xs font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="pt-2">
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Staff Magic Login Link</label>
                <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-[10px] text-slate-800 break-all select-all flex items-center justify-between">
                  <span>{magicLinkUrl}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(magicLinkUrl);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="ml-2 p-1 bg-white border border-slate-300 rounded hover:bg-slate-50 shrink-0 cursor-pointer"
                  >
                    {copiedLink ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-600" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setManageCredentialsStaff(null)}
                  className="bg-white border border-slate-300 px-4 py-2 rounded-xl text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-5 py-2 rounded-xl cursor-pointer"
                >
                  {isSubmitting ? "Updating..." : "Issue New Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Course Allocation Mapping Modal */}
      {courseStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-blue-700 font-extrabold text-sm uppercase">
                <BookOpen className="h-5 w-5" />
                <span>Course Allocation Mapping</span>
              </div>
              <button onClick={() => setCourseStaff(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Map taught course codes to <strong className="font-mono text-slate-900">{courseStaff?.staffNo}</strong> ({courseStaff?.user?.firstName || 'Staff'} {courseStaff?.user?.lastName || 'Member'}).
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {(AVAILABLE_COURSES || []).map((course: any) => {
                const isSelected = selectedCourses.includes(course?.code);
                return (
                  <div
                    key={course?.code || course?.id}
                    onClick={() => course?.code && toggleCourseAllocation(course.code)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-50 border-blue-300 text-blue-900"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div>
                      <span className="font-mono font-bold text-xs block">{course.code}</span>
                      <span className="text-[11px] font-medium text-slate-500">{course.title}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCourseStaff(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCourseAllocation}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer"
              >
                Save Course Mapping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

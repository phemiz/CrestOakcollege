"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/ui/logo";
import { Header } from "@/components/layout/header";
import { 
  User, 
  BookOpen, 
  FileText, 
  Wallet, 
  Calendar, 
  HelpCircle, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  UserCheck
} from "lucide-react";

interface ClientPortalShellProps {
  children: React.ReactNode;
  user: {
    id: string;
    fullName: string;
    matricNo: string;
    email: string;
    department: string;
    programme: string;
    avatarUrl: string | null;
  };
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
  }>;
}

export default function ClientPortalShell({ children, user, announcements }: ClientPortalShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cchsmt_user_session");
      localStorage.removeItem("cchsmt_demo_role");
      window.location.href = "/login";
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/portal", icon: User },
    { name: "Academic Profile", href: "/portal/profile", icon: UserCheck },
    { name: "Course Registration", href: "/portal/courses", icon: BookOpen },
    { name: "Grades & Results", href: "/portal/results", icon: FileText },
    { name: "Financial Services", href: "/portal/billing", icon: Wallet },
    { name: "Student Clearance", href: "/portal/clearance", icon: HelpCircle },
    { name: "Academic Calendar", href: "/portal/calendar", icon: Calendar },
  ];

  const unreadCount = announcements.filter(a => !readNotifIds.includes(a.id)).length;

  const markAllAsRead = () => {
    setReadNotifIds(announcements.map(a => a.id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg-light">
      <Header />

      {/* Portal Container */}
      <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm shrink-0 h-fit gap-6 sticky top-24">
          {/* User profile brief card */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-brand-blue-light font-display font-black overflow-hidden relative shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-display font-black text-brand-blue-dark text-sm truncate leading-snug">
                {user.fullName}
              </h4>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider truncate mt-0.5">{user.matricNo}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname === `${item.href}/` || (item.href !== "/portal" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                    isActive
                      ? "border-brand-red/20 bg-brand-red/5 text-brand-red shadow-sm"
                      : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-brand-blue-light"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className="w-full mt-4 flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-700 text-xs font-bold text-slate-500 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out Portal</span>
          </button>
        </aside>

        {/* Mobile Header / Nav toggle */}
        <div className="flex md:hidden justify-between items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <Menu size={18} />
            </button>
            <div>
              <h4 className="font-display font-black text-brand-blue-dark text-xs sm:text-sm">{user.fullName}</h4>
              <p className="text-slate-400 text-[8px] sm:text-[9px] font-black tracking-wider uppercase">{user.matricNo}</p>
            </div>
          </div>

          {/* Notifications dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 relative cursor-pointer"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-red text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer Modal */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <div className="relative flex flex-col w-4/5 max-w-sm bg-white h-full p-6 shadow-2xl z-10 animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <Logo size={40} showText={false} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User Bio */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-5">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-brand-blue-light font-display font-black overflow-hidden shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    user.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-black text-brand-blue-dark text-xs truncate leading-snug">
                    {user.fullName}
                  </h4>
                  <p className="text-slate-400 text-[8px] font-black uppercase tracking-wider mt-0.5 truncate">{user.matricNo}</p>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="flex flex-col gap-1.5 overflow-y-auto flex-grow">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname === `${item.href}/` || (item.href !== "/portal" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                        isActive
                          ? "border-brand-red/20 bg-brand-red/5 text-brand-red shadow-sm"
                          : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-brand-blue-light"
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <button
                onClick={handleSignOut}
                className="w-full mt-6 flex items-center justify-center gap-2 p-3 border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-700 text-xs font-bold text-slate-500 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out Portal</span>
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Workspace */}
        <main className="flex-grow flex flex-col lg:col-span-9 w-full min-h-[60vh] gap-6">
          {/* Desktop Top Header Bar */}
          <div className="hidden md:flex justify-between items-center bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <div>
              <h2 className="font-display font-black text-brand-blue-dark text-lg">CrestOak College Student Portal</h2>
              <p className="text-slate-400 text-xs mt-0.5 font-bold">{user.programme}</p>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-3 border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 relative transition-all cursor-pointer hover:border-slate-350"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-red text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl z-40 p-4 animate-fade-in-down">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
                    <span className="text-xs font-black text-brand-blue-dark uppercase tracking-wider">Campus Bulletins</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-[10px] text-brand-red hover:underline font-bold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 max-h-64 overflow-y-auto no-scrollbar">
                    {announcements.length === 0 ? (
                      <div className="text-center text-slate-400 py-6 text-xs font-semibold">No recent announcements.</div>
                    ) : (
                      announcements.map((a) => {
                        const isRead = readNotifIds.includes(a.id);
                        return (
                          <div 
                            key={a.id} 
                            onClick={() => setReadNotifIds([...readNotifIds, a.id])}
                            className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                              isRead 
                                ? "border-transparent bg-slate-50 text-slate-600" 
                                : "border-brand-red-light bg-brand-red-light/10 text-brand-blue-dark font-bold"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="truncate">{a.title}</span>
                              <span className="text-[8px] text-slate-400 font-bold shrink-0">{new Date(a.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 leading-normal font-semibold font-sans">{a.content}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Child Page workspace render */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex-grow">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
}

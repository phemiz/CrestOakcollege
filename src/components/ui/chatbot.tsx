"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  X, 
  Send, 
  ShieldCheck, 
  DollarSign, 
  MapPin, 
  Bookmark
} from "lucide-react";
import { Logo } from "./logo";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

let messageIdCounter = 0;
const generateMessageId = () => {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}-${Date.now()}`;
};

export const AdmissionsChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome",
      text: "Hello! I am your CrestOak Admissions Advisor. I can answer your questions about cut-off marks, school fee installment options, Badagry screening dates, and course accreditations. How can I help you today?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages list changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: generateMessageId(),
      text: textToSend,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulated chatbot response delay
    setTimeout(() => {
      const responseText = getBotResponse(textToSend);
      const botMessage: Message = {
        id: generateMessageId(),
        text: responseText,
        sender: "bot",
        timestamp: new Date()
      };
      
      setIsTyping(false);
      setMessages(prev => [...prev, botMessage]);
      
      if (!isOpen) {
        setHasNewMessage(true);
      }
    }, 1200);
  };

  const getBotResponse = (input: string): string => {
    const text = input.toLowerCase();

    if (text.includes("jamb") || text.includes("cut-off") || text.includes("cutoff") || text.includes("mark") || text.includes("score")) {
      return "For Undergraduate admissions, our general JAMB cut-off mark is 140. However, Nursing Sciences (B.Sc.) requires a minimum of 200, and Medical Laboratory Science (BMLs) requires 180. You can submit your JAMB score slip online under the Admissions tab.";
    }
    
    if (text.includes("fee") || text.includes("fees") || text.includes("naira") || text.includes("payment") || text.includes("split") || text.includes("installment") || text.includes("cost") || text.includes("tuition")) {
      return "CrestOak supports installment payments! Tuition fees are structured by faculty (Health/Law: ₦400,000; Applied Sciences/Tech: ₦300,000; Management/Social Sciences: ₦250,000 per session). We require a minimum of 70% upfront payment upon provisional admission acceptance, with the remaining 30% balance paid before semester exams.";
    }

    if (text.includes("screening") || text.includes("interview") || text.includes("date") || text.includes("venue") || text.includes("badagry") || text.includes("location") || text.includes("where") || text.includes("address")) {
      return "Our campus is located at 6/8 Isaac Street, Ibereko, Badagry, Lagos State. Physical credential screenings and oral interviews for the current batch commence on June 15, 2026. Make sure to bring your original WAEC/NECO credentials, JAMB slips, and passport photographs.";
    }

    if (text.includes("accredit") || text.includes("board") || text.includes("approved") || text.includes("nuc") || text.includes("nmcn") || text.includes("mlscn")) {
      return "All programs run by CrestOak College are fully aligned with National Universities Commission (NUC) standards. Furthermore, our professional healthcare modules are accredited by the Nursing and Midwifery Council of Nigeria (NMCN) and the Medical Laboratory Science Council of Nigeria (MLSCN).";
    }

    if (text.includes("atiba") || text.includes("affiliate") || text.includes("partner") || text.includes("supervise") || text.includes("degree") || text.includes("university")) {
      return "CrestOak operates in direct academic partnership and supervision with Atiba University, Oyo. This means your course curriculum is supervised by Atiba board professors, and your final degree is awarded by Atiba University, qualifying you for the National Youth Service Corps (NYSC) program.";
    }

    if (text.includes("contact") || text.includes("phone") || text.includes("call") || text.includes("whatsapp") || text.includes("email") || text.includes("support")) {
      return "You can contact our admissions registry team directly via phone at +234 815 588 4804 or +234 803 861 7259. You can also email us at info.crestoakcollege@gmail.com. We are happy to guide you through your registration!";
    }

    // Default fallback
    return "Thank you for your question! I recommend visiting the 'Admissions' page to try our Course Pathway Finder or calculate your fees. For direct registry support, you can reach out to our team at +234 815 588 4804.";
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setHasNewMessage(false);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-[100] print:hidden">
        <button
          onClick={toggleChat}
          className="relative bg-brand-blue hover:bg-brand-blue-dark text-white rounded-full p-4 shadow-xl border-4 border-white flex items-center justify-center transition-all hover:scale-105 cursor-pointer group"
          aria-label="Toggle admissions chat"
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
          
          {/* Unread notification pulse */}
          {hasNewMessage && !isOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-brand-red rounded-full border-2 border-white animate-ping" />
          )}

          {/* Hover helper text */}
          {!isOpen && (
            <span className="absolute right-14 bg-slate-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-xl whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none">
              Chat with Admissions AI Advisor
            </span>
          )}
        </button>
      </div>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-[100] w-[350px] sm:w-[380px] h-[520px] bg-white border border-slate-200/80 shadow-2xl rounded-3xl overflow-hidden flex flex-col print:hidden"
          >
            {/* Header */}
            <div className="bg-brand-blue text-white p-4 flex items-center justify-between relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/15 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-3 relative z-10">
                <Logo variant="crestoak" size={36} showText={false} />
                <div>
                  <h4 className="font-display font-bold text-sm">Admissions AI Advisor</h4>
                  <p className="text-[10px] text-slate-300 font-semibold flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Ask about Cut-offs, Fees, & Dates</span>
                  </p>
                </div>
              </div>

              <button
                onClick={toggleChat}
                className="text-white hover:text-slate-200 p-1.5 hover:bg-white/10 rounded-full transition-colors relative z-10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-grow p-4 overflow-y-auto bg-slate-50/50 flex flex-col gap-4">
              {messages.map((msg) => {
                const isBot = msg.sender === "bot";
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 max-w-[85%] ${
                      isBot ? "self-start" : "self-end flex-row-reverse"
                    }`}
                  >
                    {isBot && (
                      <div className="w-7 h-7 rounded-full bg-brand-blue-light/10 text-brand-blue border border-brand-blue-light/10 flex items-center justify-center shrink-0 text-xs font-bold font-display">
                        AI
                      </div>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed font-semibold ${
                        isBot
                          ? "bg-white border border-slate-150 text-slate-700 rounded-tl-none shadow-sm"
                          : "bg-brand-blue text-white rounded-tr-none shadow-md"
                      }`}
                    >
                      {msg.text}
                      <span
                        className={`text-[8px] font-medium block mt-1.5 text-right ${
                          isBot ? "text-slate-400" : "text-white/60"
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex gap-2 self-start max-w-[80%]">
                  <div className="w-7 h-7 rounded-full bg-brand-blue-light/10 text-brand-blue border border-brand-blue-light/10 flex items-center justify-center shrink-0 text-xs font-bold font-display">
                    AI
                  </div>
                  <div className="bg-white border border-slate-150 p-3.5 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions Panel (Only shows when chat isn't typing) */}
            {!isTyping && messages.length === 1 && (
              <div className="bg-white border-t border-slate-100 p-3 flex flex-col gap-2 shrink-0">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block px-1">Common Questions</span>
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-32 pr-0.5 no-scrollbar">
                  {[
                    { text: "What is the JAMB cut-off mark?", icon: ShieldCheck },
                    { text: "What are the school fees splits?", icon: DollarSign },
                    { text: "Where and when are screenings held?", icon: MapPin },
                    { text: "Is CrestOak in partnership with Atiba University?", icon: Bookmark }
                  ].map((q, qIdx) => {
                    const Icon = q.icon;
                    return (
                      <button
                        key={qIdx}
                        onClick={() => handleQuickQuestion(q.text)}
                        className="flex items-center gap-2 p-2 border border-slate-100 hover:border-brand-blue-light/30 rounded-xl bg-slate-50 text-left text-[10px] font-bold text-slate-600 hover:text-brand-blue transition-colors cursor-pointer"
                      >
                        <Icon size={12} className="text-brand-blue shrink-0" />
                        <span>{q.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chat Input Footer */}
            <div className="border-t border-slate-150 p-3 bg-white flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask admissions registry..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage(inputValue);
                }}
                className="flex-grow p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-blue text-slate-800"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                className="p-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl transition-all cursor-pointer flex items-center justify-center"
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

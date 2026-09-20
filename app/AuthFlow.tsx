import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";

const LOGO_SRC = "/h.png";

// Available emojis for avatar
const AVATAR_EMOJIS = [
  "😊", "🌟", "🔥", "💪", "🚀", "🎯", "✨", "🌈", 
  "🦊", "🐼", "🐨", "🦄", "🐲", "🐉", "🦋", "🐝",
  "🍕", "🎮", "⚡", "💎", "🎨", "🏆", "👑", "🌺",
  "🎭", "🎪", "🎨", "🎵", "🎶", "🎸", "🎺", "🎻",
  "🦁", "🐯", "🐻", "🐮", "🐷", "🐸", "🐵", "🐔",
  "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉"
];

const STEPS = [
  {
    key: "username",
    number: "01",
    label: "Username",
    question: "Create a username",
    hint: "Choose a unique name and pick an emoji avatar!",
    placeholder: "CoolGamer",
    type: "text",
    autoComplete: "username",
  },
  {
    key: "email",
    number: "02",
    label: "Email",
    question: "What's your campus email?",
    hint: "We'll send your order receipts here.",
    placeholder: "you@school.edu",
    type: "email",
    autoComplete: "email",
  },
  {
    key: "password",
    number: "03",
    label: "Password",
    question: "Create a password",
    hint: "At least 8 characters.",
    placeholder: "••••••••",
    type: "password",
    autoComplete: "new-password",
  },
  {
    key: "confirm",
    number: "04",
    label: "Confirm",
    question: "Type it once more",
    hint: "Just to make sure it's right.",
    placeholder: "••••••••",
    type: "password",
    autoComplete: "new-password",
  },
];

const SENTIMENTS = {
  username: ["Great username! ✨", "Love it! 💫", "Perfect! 🌟", "Awesome choice! 👋"],
  email: ["Valid email! 📧", "Good to go! ✅", "Perfect! ✨", "You're on a roll! 🚀"],
  password: ["Strong password! 💪", "Looking good! 🔒", "Almost there! 🌟", "Great security! 🛡️"],
  confirm: ["They match! 🎉", "Perfect! ✨", "Ready to go! 🚀", "You're all set! 🎯"],
};

// Typing sentiments - what RIRI says while user types
const TYPING_SENTIMENTS = {
  username: [
    "Almost there...",
    "Looking good!",
    "Nice choice!",
    "Getting there!",
    "Love the vibe!",
    "Keep going!",
    "You're doing great!",
    "Perfect username!"
  ],
  email: [
    "Checking...",
    "Looks valid!",
    "Good email!",
    "Almost there!",
    "Keep typing...",
    "Perfect format!",
    "You got this!"
  ],
  password: [
    "Make it strong!",
    "Adding security...",
    "Great start!",
    "Almost strong!",
    "Looking secure!",
    "You're doing great!",
    "Almost perfect!"
  ],
  confirm: [
    "Checking match...",
    "Almost there!",
    "Getting close!",
    "Keep going!",
    "You're almost done!",
    "Looking good!"
  ]
};

function getRandomTypingSentiment(stepKey) {
  const messages = TYPING_SENTIMENTS[stepKey] || ["Keep going! 💪"];
  return messages[Math.floor(Math.random() * messages.length)];
}

function getRandomSentiment(stepKey) {
  const messages = SENTIMENTS[stepKey] || ["Great job! ✨"];
  return messages[Math.floor(Math.random() * messages.length)];
}

/* ---------- SVG icons ---------- */
function IconCheck({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="7" fill="var(--accent)" />
      <path d="M4 7.2L6 9.2L10 4.8" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconWave({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M8 13.5V6.8a1.4 1.4 0 0 1 2.8 0v4.7M10.8 11.5V5.3a1.4 1.4 0 0 1 2.8 0v6.2M13.6 11.6V6.6a1.4 1.4 0 0 1 2.8 0v7.9M16.4 14.2v-2a1.3 1.3 0 0 1 2.6 0v3.3c0 3-2 5.5-5.6 5.5h-1.6c-2 0-2.9-.6-3.9-1.8L4.4 15c-.5-.7-.4-1.5.2-2 .6-.5 1.5-.4 2.1.2l1.3 1.5"
        stroke="var(--accent)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMail({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="var(--accent)" strokeWidth="1.4" />
      <path d="M4.5 7L12 12.5L19.5 7" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Enhanced RIRI Mascot with Sentiment States ---------- */
function RiriMascot({ 
  state = "idle", 
  flexLevel = 0, 
  sentiment = "", 
  showTag = true,
  typingSentiment = "",
  showTypingSentiment = false,
  avatarEmoji = "😊",
  size = "medium"
}) {
  const scale = 1 + flexLevel * 0.045;
  const showSentiment = sentiment.length > 0;
  const showTyping = showTypingSentiment && typingSentiment.length > 0;
  
  const svgSize = size === "large" ? 100 : size === "small" ? 48 : 64;

  return (
    <div className="riri-mascot-wrapper">
      <div className={`riri-mascot riri-${state}`} style={{ transform: `scale(${scale})` }}>
        <div className="riri-container">
          <svg width={svgSize} height={svgSize} viewBox="0 0 80 80" className="riri-svg">
            {/* Shadow */}
            <ellipse className="riri-shadow" cx="40" cy="70" rx="20" ry="5" fill="rgba(18,18,18,0.05)" />
            
            {/* Body */}
            <g className="riri-body-group">
              <path
                d="M40 12c16 0 28 12 28 28 0 14-10 24-22 26-3 9-15 10-19 2 5 0 8-3 9-7-10-3-16-12-16-21 0-16 12-28 20-28z"
                fill="var(--accent)"
              />
              <path
                d="M40 12c16 0 28 12 28 28 0 14-10 24-22 26-3 9-15 10-19 2 5 0 8-3 9-7-10-3-16-12-16-21 0-16 12-28 20-28z"
                fill="url(#ririGradient)"
                opacity="0.3"
              />
              <defs>
                <radialGradient id="ririGradient" cx="50%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="white" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
              
              <path className="riri-wing riri-wing-left" d="M30 32c-8-2-14 2-15 8 6 3 13 1 16-4z" fill="var(--accent-deep)" />
              <path className="riri-wing riri-wing-right" d="M54 40c8-2 14 2 15 8-6 3-13 1-16-4z" fill="var(--accent-deep)" />
              
              {/* Eyes - blink animation */}
              <circle className="riri-eye" cx="33" cy="38" r="6" fill="white" />
              <circle className="riri-eye" cx="49" cy="38" r="6" fill="white" />
              <circle className="riri-eye-ring" cx="33" cy="38" r="6.5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <circle className="riri-eye-ring" cx="49" cy="38" r="6.5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              
              <circle className="riri-pupil" cx="35" cy="38" r="2.8" fill="#141414" />
              <circle className="riri-pupil" cx="51" cy="38" r="2.8" fill="#141414" />
              <circle className="riri-sparkle-eye" cx="33.5" cy="36.5" r="1.2" fill="white" opacity="0.9" />
              <circle className="riri-sparkle-eye" cx="49.5" cy="36.5" r="1.2" fill="white" opacity="0.9" />
              <circle className="riri-sparkle-eye2" cx="36.5" cy="39.5" r="0.6" fill="white" opacity="0.5" />
              <circle className="riri-sparkle-eye2" cx="52.5" cy="39.5" r="0.6" fill="white" opacity="0.5" />
              
              {/* Mouth - changes based on state */}
              <path className="riri-mouth" d={state === "happy" ? "M36 47c4 3 8 3 12 0" : "M38 47c2.5 2 5.5 2 8 0"} stroke="#141414" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              
              {/* Blush - more pronounced when happy */}
              <ellipse cx="27" cy="44" rx="4.5" ry="2.5" fill="#FF9E9E" opacity={state === "happy" ? "0.5" : "0.3"} />
              <ellipse cx="55" cy="44" rx="4.5" ry="2.5" fill="#FF9E9E" opacity={state === "happy" ? "0.5" : "0.3"} />
              
              {/* Antenna */}
              <path d="M40 14c-2-4-6-6-10-6 4-2 8-2 10 6z" fill="#F5A623" opacity="0.8" />
              <path d="M40 14c2-4 6-6 10-6-4-2-8-2-10 6z" fill="#F5A623" opacity="0.8" />
              <circle cx="30" cy="8" r="2.5" fill="#F5A623">
                <animate attributeName="r" values="2.5;3;2.5" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="50" cy="8" r="2.5" fill="#F5A623">
                <animate attributeName="r" values="2.5;3;2.5" dur="2s" begin="1s" repeatCount="indefinite" />
              </circle>
              <circle cx="30" cy="8" r="4" fill="#F5A623" opacity="0.2">
                <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="50" cy="8" r="4" fill="#F5A623" opacity="0.2">
                <animate attributeName="r" values="4;6;4" dur="2s" begin="1s" repeatCount="indefinite" />
              </circle>
            </g>
            
            {/* Sparkles */}
            <g className="riri-sparkles">
              <circle className="spark spark-a" cx="12" cy="18" r="2.5" fill="var(--accent)" />
              <circle className="spark spark-b" cx="68" cy="14" r="2" fill="#F5A623" />
              <circle className="spark spark-c" cx="72" cy="48" r="2.5" fill="var(--accent)" />
              <circle className="spark spark-d" cx="8" cy="52" r="2" fill="#F5A623" />
            </g>
          </svg>
          
          {/* Display selected avatar emoji on RIRI */}
          <div className="riri-avatar-emoji">
            {avatarEmoji}
          </div>
          
          {/* RIRI AI Tag */}
          {showTag && (
            <div className="riri-ai-tag">
              <span className="riri-ai-icon">🤖</span>
              <span className="riri-ai-text">RIRI AI</span>
              <span className="riri-ai-pulse" />
            </div>
          )}
          
          {/* Sentiment bubble (success feedback) */}
          {showSentiment && (
            <div className="riri-sentiment-bubble">
              <span>{sentiment}</span>
              <div className="riri-bubble-tail" />
            </div>
          )}
        </div>
      </div>
      
      {/* Typing sentiment text below mascot */}
      {showTyping && (
        <div className="riri-typing-sentiment">
          <span className="riri-typing-text">{typingSentiment}</span>
        </div>
      )}
    </div>
  );
}

function passwordStrength(pw) {
  if (!pw) return { score: 0, label: "" };
  if (pw.length < 8) return { score: 1, label: "Too short" };
  let score = 1;
  if (/[0-9]/.test(pw) && /[a-zA-Z]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw) || pw.length >= 12) score++;
  const labels = ["Too short", "Fair", "Good", "Strong"];
  return { score, label: labels[score] };
}

export default function AuthFlow({ onDone }) {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ username: "", email: "", password: "", confirm: "" });
  const [selectedEmoji, setSelectedEmoji] = useState("😊");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loginValues, setLoginValues] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sentiment, setSentiment] = useState("");
  const [showSentiment, setShowSentiment] = useState(false);
  const [typingSentiment, setTypingSentiment] = useState("");
  const [showTypingSentiment, setShowTypingSentiment] = useState(false);
  const [showAvatarPrompt, setShowAvatarPrompt] = useState(false);
  const inputRefs = useRef([]);
  const sentimentTimeout = useRef(null);
  const typingTimeout = useRef(null);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const el = inputRefs.current[step];
    if (el) setTimeout(() => el.focus(), 420);
  }, [step, mode]);

  // Show avatar prompt when username has at least 2 characters
  useEffect(() => {
    if (values.username.trim().length >= 2 && step === 0) {
      setShowAvatarPrompt(true);
    } else {
      setShowAvatarPrompt(false);
    }
  }, [values.username, step]);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetForm = () => {
    setValues({ username: "", email: "", password: "", confirm: "" });
    setSelectedEmoji("😊");
    setLoginValues({ email: "", password: "" });
    setStep(0);
    setError(null);
    setSuccess(false);
    setSentiment("");
    setShowSentiment(false);
    setTypingSentiment("");
    setShowTypingSentiment(false);
    setShowEmojiPicker(false);
    setShowAvatarPrompt(false);
  };

  const switchMode = (next) => {
    setMode(next);
    setStep(0);
    setError(null);
    setSuccess(false);
    setSentiment("");
    setShowSentiment(false);
    setTypingSentiment("");
    setShowTypingSentiment(false);
    setShowEmojiPicker(false);
    setShowAvatarPrompt(false);
  };

  const validateStep = (i) => {
    const v = values[STEPS[i].key];
    if (STEPS[i].key === "username" && v.trim().length < 2) return "Enter at least 2 characters.";
    if (STEPS[i].key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
    if (STEPS[i].key === "password" && v.length < 8) return "Use at least 8 characters.";
    if (STEPS[i].key === "confirm" && v !== values.password) return "Passwords don't match.";
    return null;
  };

  const showSentimentMessage = (stepKey) => {
    if (sentimentTimeout.current) clearTimeout(sentimentTimeout.current);
    const msg = getRandomSentiment(stepKey);
    setSentiment(msg);
    setShowSentiment(true);
    sentimentTimeout.current = setTimeout(() => {
      setShowSentiment(false);
    }, 2500);
  };

  // Handle typing with sentiment
  const handleTyping = (e, stepKey) => {
    const value = e.target.value;
    setValues((v) => ({ ...v, [stepKey]: value }));

    // Show typing sentiment with debounce
    if (value.length > 0 && value.length % 3 === 0) {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      const msg = getRandomTypingSentiment(stepKey);
      setTypingSentiment(msg);
      setShowTypingSentiment(true);
      
      typingTimeout.current = setTimeout(() => {
        setShowTypingSentiment(false);
      }, 2000);
    }
  };

  const handleNext = async () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    
    const currentStepKey = STEPS[step].key;
    showSentimentMessage(currentStepKey);
    
    if (step < STEPS.length - 1) {
      setTimeout(() => {
        setStep((s) => s + 1);
      }, 500);
      return;
    }
    
    setLoading(true);
    try {
      // Combine emoji with username for display
      const fullUsername = `${selectedEmoji} ${values.username.trim()}`;
      
      const result = await signup({
        name: fullUsername,
        displayName: fullUsername,
        email: values.email.trim(),
        password: values.password,
        avatar: selectedEmoji, // Store the emoji as avatar
      });

      if (!result.success) {
        setError(result.message || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      try {
        sessionStorage.setItem("unimart:justLoggedIn", "1");
      } catch {
        // ignore
      }
      window.dispatchEvent(new Event("unimart:authChanged"));

      setSuccess(true);
      setTimeout(() => {
        if (onDone) {
          onDone(result.user?.role || "buyer");
        } else {
          router.replace("/");
        }
        resetForm();
      }, 1800);
    } catch (err) {
      setError(err?.message || "Unable to complete authentication. Please try again.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 0) return;
    setError(null);
    setSentiment("");
    setShowSentiment(false);
    setTypingSentiment("");
    setShowTypingSentiment(false);
    setStep((s) => s - 1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNext();
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!loginValues.email.trim() || !loginValues.password.trim()) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const result = await login(loginValues.email.trim(), loginValues.password);

      if (!result.success) {
        setError(result.message || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      try {
        sessionStorage.setItem("unimart:justLoggedIn", "1");
      } catch {
        // ignore
      }
      window.dispatchEvent(new Event("unimart:authChanged"));

      if (onDone) {
        onDone(result.user?.role || "buyer");
      } else {
        router.replace("/");
      }
      resetForm();
    } catch (err) {
      setError(err?.message || "Unable to complete authentication. Please try again.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const username = values.username.trim();
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email);
  const strength = useMemo(() => passwordStrength(values.password), [values.password]);
  const confirmMatches = values.confirm.length > 0 && values.confirm === values.password;
  const confirmMismatch = values.confirm.length > 0 && values.confirm !== values.password;
  const progressPct = loading ? 100 : ((step + 1) / STEPS.length) * 100;

  // Determine mascot state based on typing and validation
  const mascotState = success
    ? "celebrate"
    : loading
    ? "spin"
    : step === 0 && username.length >= 3
    ? "happy"
    : step === 1 && emailLooksValid
    ? "happy"
    : step === 2 && strength.score >= 2
    ? "happy"
    : step === 3 && confirmMatches
    ? "cheer"
    : showSentiment
    ? "talk"
    : username.length > 0 || values.email.length > 0 || values.password.length > 0
    ? "idle"
    : "idle";

  const getProgressMessage = () => {
    if (loading) return "RIRI AI is creating your account...";
    if (step === 0) return "Pick a cool username and emoji avatar";
    if (step === 1) return "We'll send updates here";
    if (step === 2) return "Make it a strong one";
    if (step === 3) return "Almost done!";
    return "";
  };

  // Get typing sentiment for current step
  const currentTypingSentiment = showTypingSentiment ? typingSentiment : "";

  return (
    <div className="auth-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

        :root {
          --ink: #16171A;
          --ink-soft: #45474C;
          --paper: #F3F5F5;
          --panel: #FFFFFF;
          --line: #E3E8E8;
          --muted: #93999B;
          --accent: #0E7C86;
          --accent-deep: #0A5F67;
          --accent-soft: #E1F3F4;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .auth-page {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--paper);
          font-family: 'Inter', sans-serif;
          color: var(--ink);
          padding: 0;
        }

        /* Desktop Layout - Two Column */
        .auth-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          max-width: 1100px;
          height: auto;
          max-height: 90vh;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
          overflow: hidden;
          margin: 20px;
        }

        /* Left Panel - Branding & Mascot */
        .auth-brand-panel {
          background: linear-gradient(135deg, var(--accent-soft) 0%, #ffffff 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 32px;
          position: relative;
          overflow-y: auto;
        }

        .auth-brand-panel::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(14,124,134,0.05) 0%, transparent 70%);
          animation: rotateGradient 20s linear infinite;
          pointer-events: none;
        }

        @keyframes rotateGradient {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .brand-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 380px;
        }

        .brand-logo {
          margin-bottom: 24px;
        }

        .brand-logo img {
          height: 56px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 2px 8px rgba(14,124,134,0.15));
        }

        .brand-mascot {
          margin: 24px 0;
        }

        .brand-headline {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 32px;
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin-bottom: 12px;
        }

        .brand-subheadline {
          font-size: 15px;
          color: var(--muted);
          line-height: 1.5;
          margin-bottom: 24px;
        }

        .brand-features {
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }

        .brand-feature {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: var(--ink-soft);
        }

        .brand-feature-icon {
          width: 28px;
          height: 28px;
          background: var(--accent-soft);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        /* Right Panel - Form */
        .auth-form-panel {
          display: flex;
          flex-direction: column;
          padding: 40px 36px;
          overflow-y: auto;
          max-height: 90vh;
        }

        .form-container {
          max-width: 420px;
          width: 100%;
          margin: 0 auto;
        }

        /* Tabs */
        .tab-row {
          position: relative;
          display: flex;
          background: var(--accent-soft);
          border-radius: 999px;
          padding: 4px;
          margin-bottom: 24px;
        }
        .tab-indicator {
          position: absolute;
          top: 4px;
          left: 4px;
          height: calc(100% - 8px);
          width: calc(50% - 4px);
          background: white;
          border-radius: 999px;
          transition: transform 320ms cubic-bezier(0.65,0,0.35,1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .tab-btn {
          position: relative;
          z-index: 1;
          flex: 1;
          padding: 12px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 14px;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          transition: color 0.2s;
        }
        .tab-btn.active { color: var(--accent-deep); }

        /* Mobile Layout */
        @media (max-width: 968px) {
          .auth-page {
            padding: 0;
          }
          
          .auth-container {
            grid-template-columns: 1fr;
            max-width: 100%;
            max-height: none;
            height: 100vh;
            height: 100dvh;
            border-radius: 0;
            box-shadow: none;
            margin: 0;
          }

          .auth-brand-panel {
            display: none;
          }

          .auth-form-panel {
            padding: 24px 20px;
            max-height: none;
          }

          .mobile-logo {
            display: block !important;
            text-align: center;
            margin-bottom: 24px;
          }

          .mobile-logo img {
            height: 48px;
            width: auto;
          }
        }

        @media (max-width: 480px) {
          .auth-form-panel {
            padding: 20px 16px;
          }
        }

        /* --- RIRI Mascot Wrapper --- */
        .riri-mascot-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .riri-mascot {
          position: relative;
          flex-shrink: 0;
          animation: ririBob 2.8s ease-in-out infinite;
          transition: transform 0.3s ease;
          z-index: 5;
        }
        @keyframes ririBob {
          0%, 100% { translate: 0 0; }
          50% { translate: 0 -5px; }
        }

        .riri-container {
          position: relative;
          display: inline-flex;
          align-items: flex-end;
        }

        /* --- RIRI Avatar Emoji Display --- */
        .riri-avatar-emoji {
          position: absolute;
          bottom: -4px;
          right: -6px;
          font-size: 24px;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.15));
          animation: emojiFloat 2.5s ease-in-out infinite;
          z-index: 15;
          background: white;
          border-radius: 50%;
          padding: 2px;
          border: 2px solid white;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        @keyframes emojiFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.05); }
        }

        /* --- RIRI Typing Sentiment Text --- */
        .riri-typing-sentiment {
          text-align: center;
          font-size: 11px;
          color: var(--accent);
          font-weight: 500;
          min-height: 20px;
          animation: sentimentFade 0.3s ease-out;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.02em;
        }
        .riri-typing-text {
          background: var(--accent-soft);
          padding: 2px 12px;
          border-radius: 12px;
          display: inline-block;
        }
        @keyframes sentimentFade {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* --- RIRI AI Tag --- */
        .riri-ai-tag {
          position: absolute;
          top: -8px;
          right: -12px;
          background: linear-gradient(135deg, #0E7C86, #0A5F67);
          color: white;
          padding: 3px 10px 3px 8px;
          border-radius: 16px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.04em;
          box-shadow: 0 4px 16px rgba(14,124,134,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
          white-space: nowrap;
          font-family: 'Space Grotesk', sans-serif;
          border: 1.5px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(4px);
          animation: tagPulse 2.5s ease-in-out infinite;
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 20;
        }
        
        .riri-ai-icon {
          font-size: 11px;
          line-height: 1;
        }
        .riri-ai-text {
          font-size: 9px;
          letter-spacing: 0.06em;
        }
        .riri-ai-pulse {
          position: absolute;
          inset: -2px;
          border-radius: 16px;
          border: 1.5px solid rgba(14,124,134,0.3);
          animation: tagPulseRing 2.5s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes tagPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 16px rgba(14,124,134,0.35); }
          50% { transform: scale(1.03); box-shadow: 0 4px 24px rgba(14,124,134,0.5); }
        }
        @keyframes tagPulseRing {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0; }
        }

        .riri-sentiment-bubble {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          background: var(--accent);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          animation: bubbleIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 4px 12px rgba(14,124,134,0.2);
          z-index: 10;
        }
        .riri-bubble-tail {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid var(--accent);
        }
        @keyframes bubbleIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px) scale(0.8); }
          to { opacity: 1; transform: translateX(-50%) translateY(-8px) scale(1); }
        }

        /* Mascot animations */
        .riri-eye { animation: blink 4.5s ease-in-out infinite; transform-origin: center; }
        @keyframes blink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }

        .riri-wing-left, .riri-wing-right { transform-origin: 40px 42px; }
        .riri-wave .riri-wing-right { animation: wingWave 0.55s ease-in-out 3; }
        .riri-wave .riri-wing-left { animation: wingWave 0.55s ease-in-out 3 reverse; }
        @keyframes wingWave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-25deg); }
        }

        .riri-happy { animation: ririBob 2.8s ease-in-out infinite, nodHead 0.5s ease-in-out infinite; }
        @keyframes nodHead {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(4deg); }
        }

        .riri-cheer .riri-body-group { animation: cheerPop 0.5s cubic-bezier(0.34,1.56,0.64,1) infinite alternate; }
        @keyframes cheerPop {
          0% { transform: scale(1); }
          100% { transform: scale(1.06); }
        }

        .riri-spin .riri-body-group { animation: spinLoop 1.1s linear infinite; transform-origin: 40px 40px; }
        @keyframes spinLoop {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .riri-celebrate { animation: celebrateJump 0.7s cubic-bezier(0.34,1.56,0.64,1) 1; }
        @keyframes celebrateJump {
          0% { translate: 0 0; }
          35% { translate: 0 -18px; }
          60% { translate: 0 2px; }
          100% { translate: 0 0; }
        }

        .riri-talk .riri-mouth { animation: talkMouth 0.2s ease-in-out infinite alternate; }
        @keyframes talkMouth {
          0% { d: path("M38 47c2.5 2 5.5 2 8 0"); }
          100% { d: path("M38 47c2.5 3 5.5 3 8 0"); }
        }

        .riri-sparkles .spark { opacity: 0; }
        .riri-celebrate .spark { animation: sparkBurst 0.9s ease-out 0.15s 1; }
        .spark-a { animation-delay: 0.1s !important; }
        .spark-b { animation-delay: 0.2s !important; }
        .spark-c { animation-delay: 0.15s !important; }
        .spark-d { animation-delay: 0.25s !important; }
        @keyframes sparkBurst {
          0% { opacity: 0; transform: scale(0.3) translate(0,0); }
          40% { opacity: 1; }
          100% { opacity: 0; transform: scale(1.1) translate(var(--tx,0), var(--ty,-10px)); }
        }
        .spark-a { --tx: -10px; --ty: -14px; }
        .spark-b { --tx: 10px; --ty: -16px; }
        .spark-c { --tx: 12px; --ty: 8px; }
        .spark-d { --tx: -12px; --ty: 10px; }

        /* --- Progress --- */
        .progress-track {
          height: 4px;
          width: 100%;
          background: var(--accent-soft);
          border-radius: 999px;
          overflow: hidden;
          margin: 16px 0 12px;
          position: relative;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent), var(--accent-deep));
          border-radius: 999px;
          transition: width 480ms cubic-bezier(0.65,0,0.35,1);
          position: relative;
        }
        .progress-fill.loading::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%);
          background-size: 200% 100%;
          animation: shimmer 1.1s linear infinite;
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }

        .progress-message {
          font-size: 12px;
          color: var(--muted);
          text-align: center;
          margin-bottom: 16px;
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        /* --- Form --- */
        .form-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }

        .form-step-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          color: var(--muted);
          margin-bottom: 4px;
          text-transform: uppercase;
        }

        .form-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 24px;
          letter-spacing: -0.02em;
          line-height: 1.2;
          color: var(--ink);
        }
        .form-hint {
          font-size: 13px;
          color: var(--muted);
          margin-top: 6px;
          line-height: 1.5;
        }

        /* --- Emoji Picker --- */
        .field-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          margin-top: 8px;
          gap: 8px;
          flex-wrap: wrap;
        }

        .emoji-trigger {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          border: 1px solid var(--line);
          background: #FAFAFA;
          font-size: 22px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          position: relative;
        }
        .emoji-trigger:hover {
          border-color: var(--accent);
          background: white;
        }
        .emoji-trigger.open {
          border-color: var(--accent);
          background: white;
          box-shadow: 0 0 0 4px var(--accent-soft);
        }
        .emoji-trigger .chevron {
          position: absolute;
          bottom: 2px;
          right: 2px;
          font-size: 10px;
          color: var(--muted);
          transition: transform 0.3s ease;
        }
        .emoji-trigger.open .chevron {
          transform: rotate(180deg);
        }

        .field-input-flex {
          flex: 1;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid var(--line);
          background: #FAFAFA;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          color: var(--ink);
          outline: none;
          transition: all 0.2s ease;
          -webkit-appearance: none;
          min-width: 0;
        }
        .field-input-flex:focus {
          border-color: var(--accent);
          background: white;
          box-shadow: 0 0 0 4px var(--accent-soft);
        }

        .emoji-picker-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 100%;
          max-width: 320px;
          background: white;
          border-radius: 14px;
          border: 1px solid var(--line);
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
          padding: 10px;
          z-index: 100;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          animation: dropdownIn 0.2s ease-out;
          max-height: 260px;
          overflow-y: auto;
        }
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .emoji-option {
          width: 100%;
          aspect-ratio: 1;
          border: none;
          background: transparent;
          font-size: 22px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .emoji-option:hover {
          background: var(--accent-soft);
          transform: scale(1.1);
        }
        .emoji-option.selected {
          background: var(--accent-soft);
          box-shadow: inset 0 0 0 2px var(--accent);
        }

        .avatar-prompt {
          width: 100%;
          margin-top: 10px;
          padding: 10px 14px;
          background: var(--accent-soft);
          border-radius: 10px;
          font-size: 12px;
          color: var(--accent-deep);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: slideDown 0.3s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .avatar-prompt .prompt-emoji {
          font-size: 18px;
        }

        /* Regular field input for non-username steps */
        .field-input {
          width: 100%;
          margin-top: 8px;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid var(--line);
          background: #FAFAFA;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          color: var(--ink);
          outline: none;
          transition: all 0.2s ease;
          -webkit-appearance: none;
        }
        .field-input:focus {
          border-color: var(--accent);
          background: white;
          box-shadow: 0 0 0 4px var(--accent-soft);
        }
        .field-input.shake { animation: shake 0.4s ease; border-color: #C94747; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .field-validation {
          margin-top: 10px;
          font-size: 13px;
          color: var(--muted);
          min-height: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.3s;
        }
        .field-validation.valid { color: var(--accent); font-weight: 500; }

        .strength-row {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .strength-bars { display: flex; gap: 4px; flex: 1; }
        .strength-bar {
          height: 4px;
          flex: 1;
          border-radius: 999px;
          background: var(--accent-soft);
          overflow: hidden;
        }
        .strength-bar span {
          display: block; height: 100%; width: 0%; background: var(--accent);
          transition: width 0.35s ease;
        }
        .strength-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.06em;
          color: var(--muted);
          min-width: 62px;
          text-align: right;
        }

        .error-banner {
          margin-top: 16px;
          padding: 12px 16px;
          border-radius: 12px;
          background: #FBEEEE;
          border: 1px solid #EBC9C9;
          color: #A33636;
          font-size: 13px;
          animation: bubbleIn 0.3s ease-out;
        }

        /* --- Navigation --- */
        .nav-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 24px;
        }
        .btn-primary {
          flex: 1;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 15px;
          padding: 14px 20px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, var(--accent), var(--accent-deep));
          color: white;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.2s;
          box-shadow: 0 4px 12px rgba(14,124,134,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-primary:hover { 
          background: linear-gradient(135deg, var(--accent-deep), #085055);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(14,124,134,0.3);
        }
        .btn-primary:active { transform: scale(0.98); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        
        .btn-ghost {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          font-size: 14px;
          padding: 14px;
          border-radius: 999px;
          border: none;
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          transition: color 0.2s;
          min-width: 70px;
        }
        .btn-ghost:hover { color: var(--ink); }

        .switch-line {
          margin-top: 20px;
          font-size: 13px;
          color: var(--muted);
          text-align: center;
        }
        .switch-link {
          font-weight: 600;
          color: var(--accent);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-size: 13px;
        }

        /* --- Success --- */
        .success-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 32px 0;
          min-height: 280px;
        }
        .success-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 24px;
          margin-top: 16px;
          opacity: 0;
          animation: fadeUp 0.5s ease-out 0.35s forwards;
        }
        .success-text {
          margin-top: 8px;
          font-size: 14px;
          color: var(--muted);
          opacity: 0;
          animation: fadeUp 0.5s ease-out 0.5s forwards;
        }
        .success-foot {
          margin-top: 20px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.16em;
          color: var(--muted);
          opacity: 0;
          animation: fadeUp 0.5s ease-out 0.65s forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* --- Login form --- */
        .login-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .login-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 28px;
          text-align: center;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }
        .login-sub {
          text-align: center;
          font-size: 14px;
          color: var(--muted);
          margin-bottom: 24px;
        }

        .login-field {
          margin-top: 16px;
        }
        .login-field label {
          font-size: 13px;
          font-weight: 600;
          display: block;
          margin-bottom: 6px;
          color: var(--ink-soft);
        }
      `}</style>

      <div className="auth-container">
        {/* Left Panel - Branding (Desktop Only) */}
        <div className="auth-brand-panel">
          <div className="brand-content">
            <div className="brand-logo">
              <img src={LOGO_SRC} alt="Swoop" />
            </div>
            
            <div className="brand-mascot">
              <RiriMascot 
                state="happy" 
                showTag={true}
                typingSentiment="Welcome to Swoop!"
                showTypingSentiment={true}
                avatarEmoji="🚀"
                size="large"
              />
            </div>

            <h1 className="brand-headline">
              Your Campus<br />Marketplace
            </h1>
            <p className="brand-subheadline">
              Join thousands of students buying, selling, and discovering amazing deals on campus.
            </p>

            <div className="brand-features">
              <div className="brand-feature">
                <div className="brand-feature-icon">🛍️</div>
                <span>Shop verified products from fellow students</span>
              </div>
              <div className="brand-feature">
                <div className="brand-feature-icon">🤖</div>
                <span>AI-powered authentication & safety</span>
              </div>
              <div className="brand-feature">
                <div className="brand-feature-icon">⚡</div>
                <span>Fast, secure transactions</span>
              </div>
              <div className="brand-feature">
                <div className="brand-feature-icon">🎓</div>
                <span>Exclusive campus community</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="auth-form-panel">
          <div className="form-container">
            {/* Mobile Logo (hidden on desktop) */}
            <div className="mobile-logo" style={{ display: 'none' }}>
              <img src={LOGO_SRC} alt="Swoop" />
            </div>

            {/* Tabs */}
            <div className="tab-row">
              <div className="tab-indicator" style={{ transform: mode === "signup" ? "translateX(100%)" : "translateX(0%)" }} />
              <button className={`tab-btn ${mode === "login" ? "active" : ""}`} onClick={() => switchMode("login")}>
                Log in
              </button>
              <button className={`tab-btn ${mode === "signup" ? "active" : ""}`} onClick={() => switchMode("signup")}>
                Sign up
              </button>
            </div>

            {mode === "login" ? (
              /* --- LOGIN FORM with RIRI AI --- */
              <form onSubmit={handleLoginSubmit}>
                <div className="login-header">
                  <div className="login-title">Welcome back</div>
                  <RiriMascot 
                    state="idle" 
                    showTag={true}
                    typingSentiment="I'm RIRI, your AI assistant"
                    showTypingSentiment={true}
                    avatarEmoji={selectedEmoji}
                    size="small"
                  />
                </div>
                <div className="login-sub">Sign in to continue shopping</div>

                <div className="login-field">
                  <label>Email address</label>
                  <input
                    type="email"
                    className="field-input"
                    value={loginValues.email}
                    onChange={(e) => setLoginValues((v) => ({ ...v, email: e.target.value }))}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div className="login-field">
                  <label>Password</label>
                  <input
                    type="password"
                    className="field-input"
                    value={loginValues.password}
                    onChange={(e) => setLoginValues((v) => ({ ...v, password: e.target.value }))}
                    placeholder="Your password"
                    autoComplete="current-password"
                  />
                </div>

                {error && <div className="error-banner">{error}</div>}

                <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 24 }}>
                  {loading ? "Signing in…" : "Sign in"}
                </button>

                <div className="switch-line">
                  New to Swoop?{" "}
                  <button type="button" className="switch-link" onClick={() => switchMode("signup")}>
                    Create an account
                  </button>
                </div>
              </form>
            ) : success ? (
              /* --- SUCCESS STATE --- */
              <div className="success-wrap">
                <RiriMascot state="celebrate" showTag={true} avatarEmoji={selectedEmoji} size="large" />
                <div className="success-title">
                  Welcome{username ? `, ${selectedEmoji} ${username}` : ""}! 🎉
                </div>
                <div className="success-text">Your account is ready. Taking you to Swoop now…</div>
                <div className="success-foot">✨ RIRI AI is excited to have you! ✨</div>
              </div>
            ) : (
              /* --- SIGNUP FLOW --- */
              <div>
                {/* Header with mascot */}
                <div className="form-header">
                  <div>
                    <div className="form-step-badge">
                      Step {STEPS[step].number} of {String(STEPS.length).padStart(2, "0")}
                    </div>
                    <div className="form-title">{STEPS[step].question}</div>
                    <div className="form-hint">{STEPS[step].hint}</div>
                  </div>
                  <RiriMascot 
                    state={mascotState} 
                    flexLevel={step === 2 ? strength.score : 0}
                    sentiment={showSentiment ? sentiment : ""}
                    showTag={true}
                    typingSentiment={currentTypingSentiment}
                    showTypingSentiment={showTypingSentiment}
                    avatarEmoji={selectedEmoji}
                    size="small"
                  />
                </div>

                {/* Progress */}
                <div className="progress-track">
                  <div className={`progress-fill ${loading ? "loading" : ""}`} style={{ width: `${progressPct}%` }} />
                </div>
                <div className="progress-message">{getProgressMessage()}</div>

                {/* Input - with emoji picker for username step */}
                {STEPS[step].key === "username" ? (
                  <>
                    <div className="field-input-wrapper" ref={emojiPickerRef}>
                      <button 
                        type="button"
                        className={`emoji-trigger ${showEmojiPicker ? "open" : ""}`}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        title="Click to choose your avatar emoji"
                      >
                        {selectedEmoji}
                        <span className="chevron">▾</span>
                      </button>
                      
                      <input
                        ref={(el) => {
                          inputRefs.current[step] = el;
                        }}
                        type="text"
                        className="field-input-flex"
                        value={values.username}
                        onChange={(e) => handleTyping(e, "username")}
                        onKeyDown={handleKeyDown}
                        placeholder={STEPS[step].placeholder}
                        autoComplete="username"
                      />
                      
                      {showEmojiPicker && (
                        <div className="emoji-picker-dropdown">
                          {AVATAR_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              className={`emoji-option ${selectedEmoji === emoji ? "selected" : ""}`}
                              onClick={() => {
                                setSelectedEmoji(emoji);
                                setShowEmojiPicker(false);
                              }}
                              title={`Select ${emoji} as your avatar`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Avatar prompt - shows when username has at least 2 characters */}
                    {showAvatarPrompt && (
                      <div className="avatar-prompt">
                        <span className="prompt-emoji">👆</span>
                        <span>
                          <strong>Tap the emoji</strong> to choose your avatar! 
                          You can always change it later.
                        </span>
                      </div>
                    )}

                    {username.length >= 2 && (
                      <div className="field-validation valid">
                        <IconWave /> {selectedEmoji} {username} — awesome username!
                      </div>
                    )}
                  </>
                ) : (
                  <input
                    ref={(el) => {
                      inputRefs.current[step] = el;
                    }}
                    type={STEPS[step].type}
                    className={`field-input ${STEPS[step].key === "confirm" && confirmMismatch ? "shake" : ""}`}
                    value={values[STEPS[step].key]}
                    onChange={(e) => handleTyping(e, STEPS[step].key)}
                    onKeyDown={handleKeyDown}
                    placeholder={STEPS[step].placeholder}
                    autoComplete={STEPS[step].autoComplete}
                  />
                )}

                {/* Live validation feedback for other steps */}
                {STEPS[step].key === "email" && emailLooksValid && (
                  <div className="field-validation valid">
                    <IconMail /> Valid email address!
                  </div>
                )}

                {STEPS[step].key === "password" && values.password.length > 0 && (
                  <div className="strength-row">
                    <div className="strength-bars">
                      {[0, 1, 2].map((barIdx) => (
                        <div className="strength-bar" key={barIdx}>
                          <span style={{ width: strength.score > barIdx ? "100%" : "0%" }} />
                        </div>
                      ))}
                    </div>
                    <span className="strength-label">{strength.label}</span>
                  </div>
                )}

                {STEPS[step].key === "confirm" && values.confirm.length > 0 && (
                  <div className={`field-validation ${confirmMatches ? "valid" : ""}`}>
                    {confirmMatches ? (
                      <>✨ Passwords match!</>
                    ) : confirmMismatch ? (
                      <>⚠️ Passwords don't match</>
                    ) : null}
                  </div>
                )}

                {error && <div className="error-banner">{error}</div>}

                {/* Navigation */}
                <div className="nav-row">
                  {step > 0 && (
                    <button type="button" className="btn-ghost" onClick={handleBack}>
                      ← Back
                    </button>
                  )}
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={handleNext} 
                    disabled={loading}
                  >
                    {loading ? "Creating…" : step === STEPS.length - 1 ? (
                      <>Create account →</>
                    ) : (
                      <>Next →</>
                    )}
                  </button>
                </div>

                <div className="switch-line">
                  Already have an account?{" "}
                  <button type="button" className="switch-link" onClick={() => switchMode("login")}>
                    Log in
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
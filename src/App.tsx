/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent, useCallback, MouseEvent } from 'react';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'motion/react';
import emailjs from '@emailjs/browser';
import { 
  Cloud, 
  Terminal, 
  Cpu, 
  Server, 
  Send, 
  Github, 
  Linkedin, 
  Mail, 
  Volume2, 
  Image as ImageIcon, 
  Sparkles,
  Loader2,
  Download,
  Upload,
  ChevronRight,
  Code2
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const roles = ["Delivery Velocity", "Cloud Pipelines", "DevOps Workflows"];
const skills = [
  { name: "AWS", level: 90, icon: <Cloud className="w-5 h-5" /> },
  { name: "Docker", level: 85, icon: <Server className="w-5 h-5" /> },
  { name: "Kubernetes", level: 80, icon: <Cpu className="w-5 h-5" /> },
  { name: "Terraform", level: 88, icon: <Terminal className="w-5 h-5" /> },
];

// Magnetic Button Component
const MagneticButton = ({ children, className, onClick, disabled }: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) / 4;
    const y = (clientY - (top + height / 2)) / 4;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  );
};

export default function App() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  
  // AI States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Canvas Animation Logic (Phase 2 Upgrade)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: any[] = [];
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 20 : 60;
    const scale = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      ctx.scale(scale, scale);
    };

    const createParticles = () => {
      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const scrollPos = window.scrollY;
      
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY + (scrollPos * 0.05); // Parallax effect

        if (p.x > window.innerWidth) p.x = 0;
        if (p.x < 0) p.x = window.innerWidth;
        if (p.y > window.innerHeight) p.y = 0;
        if (p.y < 0) p.y = window.innerHeight;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`;
        ctx.fill();
      });

      // Draw tech grid
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      const offset = (scrollPos * 0.2) % gridSize;

      for (let x = 0; x < window.innerWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, window.innerHeight);
        ctx.stroke();
      }
      for (let y = offset; y < window.innerHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(window.innerWidth, y);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    createParticles();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Typing effect
  useEffect(() => {
    const handleTyping = () => {
      const currentRole = roles[roleIndex];
      if (isDeleting) {
        setDisplayText(currentRole.substring(0, displayText.length - 1));
        setTypingSpeed(50);
      } else {
        setDisplayText(currentRole.substring(0, displayText.length + 1));
        setTypingSpeed(150);
      }

      if (!isDeleting && displayText === currentRole) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex, typingSpeed]);

  const handleTTS = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: "Welcome to my digital space. I'm Balaji, and I specialize in turning complex infrastructure into seamless automation. Let's build something extraordinary together." }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audio.onended = () => setIsSpeaking(false);
        await audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setIsSpeaking(false);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setEditedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageEdit = async () => {
    if (!selectedImage || !editPrompt) return;
    setIsEditing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const base64Data = selectedImage.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: "image/png" } },
            { text: editPrompt },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setEditedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error("Image Edit Error:", error);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen selection:bg-blue-500/30 overflow-x-hidden">
      {/* Scroll Progress */}
      <motion.div
        id="progress"
        className="fixed top-0 left-0 right-0 h-1 bg-blue-500 z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none opacity-40"
      />

      <nav className="fixed top-0 w-full z-40 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold tracking-tighter flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span>Balaji</span>
          </motion.div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
            <a href="#projects" className="hover:text-blue-400 transition-colors">Project</a>
            <a href="#certificates" className="hover:text-blue-400 transition-colors">Certificate</a>
            <a href="#about" className="hover:text-blue-400 transition-colors">About</a>
            <a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="h-screen flex flex-col justify-center items-center text-center px-6 relative">
          <motion.div
            style={{ opacity }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-8 uppercase tracking-widest"
            >
              <Sparkles className="w-3 h-3" />
              Available for new projects
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tighter leading-[0.9] text-granite">
              Automating <br />
              <span className="text-apple-vibrant">{displayText}</span>
              <span className="animate-pulse text-blue-500">_</span>
            </h1>
            
            <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Bridging the gap between development and operations through intelligent automation. 
              I streamline workflows to ensure your software is deployed faster and more reliably.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <MagneticButton
                onClick={() => {
                  const subject = encodeURIComponent("Hello Balaji!");
                  window.location.href = `mailto:balajiparvathi13@gmail.com?subject=${subject}`;
                }}
                className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-600/40"
              >
                Say Hello
              </MagneticButton>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <div className="w-[1px] h-12 bg-gradient-to-b from-blue-500 to-transparent" />
          </motion.div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-32 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-white/10 rounded-[3rem] p-8 md:p-20 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <Code2 className="w-64 h-64 text-blue-500" />
              </div>
              
              <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <div className="space-y-8">
                  <div className="inline-block px-4 py-1 rounded-full bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest">
                    Academic Project (2025)
                  </div>
                  <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-granite">
                    My <br />
                    <span className="text-apple-vibrant">Projects.</span>
                  </h2>
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-white">The Cookbook for Food and Beverages</h3>
                    <ul className="space-y-4 text-gray-400 text-lg leading-relaxed list-disc pl-5">
                      <li>Designed and developed a dynamic, database-driven recipe website with intuitive category browsing, search filters, and responsive UI using JavaScript, HTML, CSS, and MySQL.</li>
                      <li>Integrated AI tools to personalize content suggestions and auto-generate recipe variations based on user preferences.</li>
                    </ul>
                  </div>
                  
                  <div className="pt-8">
                    <MagneticButton 
                      onClick={() => window.open('https://github.com/BalajiJD', '_blank')}
                      className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all flex items-center gap-3"
                    >
                      <Github className="w-5 h-5" />
                      View on GitHub
                    </MagneticButton>
                  </div>
                </div>

                <div className="relative aspect-video bg-black/60 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl group">
                  <img 
                    src="https://picsum.photos/seed/cookbook/1200/800" 
                    alt="Cookbook Project" 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-10">
                    <div className="space-y-2">
                      <p className="text-blue-400 font-bold text-sm uppercase tracking-widest">Full Stack Development</p>
                      <p className="text-white text-xl font-bold">Cookbook Platform</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Certificates Section */}
        <section id="certificates" className="py-32 px-6 bg-white/[0.01]">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-granite">
                Professional <br />
                <span className="text-apple-vibrant">Certifications.</span>
              </h2>
              <MagneticButton 
                onClick={() => window.open('https://www.linkedin.com/in/balaji-p-b37352284/details/certifications/', '_blank')}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
              >
                View Certificate
              </MagneticButton>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "International Conference Presentation",
                  org: "Velammal Institute of Technology — ICAICS-2025",
                  date: "March 28, 2025",
                  detail: "Paper ID: 2025/048. Presented paper: ”A Culinary Journey: An Implementation of Cookbook for Food and Beverages”",
                  icon: <Sparkles className="w-6 h-6" />
                },
                {
                  title: "MongoDB Certified",
                  org: "MongoDB University",
                  date: "December 23, 2024",
                  detail: "Completed ”Introduction to MongoDB (For Students)”",
                  icon: <Code2 className="w-6 h-6" />
                },
                {
                  title: "IoT Workshop Participation",
                  org: "External Certification",
                  date: "February 20, 2025",
                  detail: "Attended ”Introduction to IoT” workshop",
                  icon: <Cpu className="w-6 h-6" />
                }
              ].map((cert, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:border-blue-500/30 transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                    {cert.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{cert.title}</h3>
                  <p className="text-blue-400 text-sm font-bold mb-4">{cert.org}</p>
                  <p className="text-gray-500 text-xs font-mono mb-6 uppercase tracking-widest">{cert.date}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{cert.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-granite">
                  About <br />
                  <span className="text-apple-vibrant">Balaji </span>
                </h2>
                <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                  <div className="space-y-2">
                    <p className="font-bold text-white">Profile Summary</p>
                    <p>
                       BCA graduate and AWS-certified specialist focused on Cloud & DevOps engineering and automated infrastructure.
                    </p>
                    <p>
                      Expert in Kubernetes, Terraform, and CI/CD, with a proven ability to optimize deployment pipelines and migrate server environments for maximum efficiency. Technically proficient in Linux, Python, and MySQL, dedicated to architecting scalable, highly available, and cost-effective cloud solutions.
                    </p>
                  </div>
                  <div className="pt-4 space-y-2 border-t border-white/5">
                    <p><span className="text-white font-bold">Email:</span> balajiparvathi13@gmail.com</p>
                    <p><span className="text-white font-bold">LinkedIn:</span> <a href="https://www.linkedin.com/in/balaji-p-b37352284" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">balaji-p-b37352284</a></p>
                  </div>
                </div>
              </div>

              <div className="space-y-10 bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-6 text-white">Technical Arsenal</h3>
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                          {skill.icon}
                        </div>
                        <span className="font-bold tracking-tight">{skill.name}</span>
                      </div>
                      <span className="text-xs font-mono text-blue-400/60">{skill.level}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        viewport={{ once: true }}
                        className="h-full bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-24">
              <div>
                <h2 className="text-5xl md:text-7xl font-bold mb-10 tracking-tighter text-granite">
                  Start a <br />
                  <span className="text-apple-vibrant">Project.</span>
                </h2>
                <p className="text-gray-400 text-lg mb-12 leading-relaxed max-w-md">
                  Ready to elevate your infrastructure? Let's discuss how we can build something 
                  resilient, scalable, and future-proof.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-6 group cursor-pointer">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Email Me</p>
                      <p className="text-lg font-bold">balajiparvathi13@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <a href="https://github.com/BalajiJD" target="_blank" rel="noopener noreferrer">
                      <MagneticButton className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all border border-white/5">
                        <Github className="w-6 h-6" />
                      </MagneticButton>
                    </a>
                    <a href="https://www.linkedin.com/in/balaji-p-b37352284" target="_blank" rel="noopener noreferrer">
                      <MagneticButton className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all border border-white/5">
                        <Linkedin className="w-6 h-6" />
                      </MagneticButton>
                    </a>
                  </div>
                </div>
              </div>

              <form 
                onSubmit={async (e) => { 
                  e.preventDefault(); 
                  setIsSubmitting(true);
                  const form = e.target as HTMLFormElement;
                  const formData = new FormData(form);
                  const name = formData.get('name') as string;
                  const email = formData.get('email') as string;
                  const subject = formData.get('subject') as string;
                  const details = formData.get('details') as string;

                  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
                  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
                  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

                  if (serviceId && templateId && publicKey) {
                    try {
                      await emailjs.send(serviceId, templateId, {
                        from_name: name,
                        from_email: email,
                        subject: subject,
                        message: details,
                        to_email: 'balajiparvathi13@gmail.com'
                      }, publicKey);
                      alert('Message sent successfully! 🚀');
                      form.reset();
                    } catch (error) {
                      console.error('EmailJS Error:', error);
                      alert('Failed to send message. Opening email client instead...');
                      const mailtoUrl = `mailto:balajiparvathi13@gmail.com?subject=${encodeURIComponent(subject || 'Project Inquiry')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${details}`)}`;
                      window.location.href = mailtoUrl;
                    }
                  } else {
                    // Fallback to mailto if keys are missing
                    const mailtoUrl = `mailto:balajiparvathi13@gmail.com?subject=${encodeURIComponent(subject || 'Project Inquiry')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${details}`)}`;
                    window.location.href = mailtoUrl;
                  }
                  setIsSubmitting(false);
                }}
                className="space-y-6 bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem]"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input name="name" required placeholder="Name" className="bg-white/5 border border-white/10 rounded-2xl p-5 focus:border-blue-500 outline-none transition-all font-medium" />
                    <input name="email" required type="email" placeholder="Email" className="bg-white/5 border border-white/10 rounded-2xl p-5 focus:border-blue-500 outline-none transition-all font-medium" />
                  </div>
                  <input name="subject" placeholder="Subject" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:border-blue-500 outline-none transition-all font-medium" />
                  <textarea name="details" required placeholder="Project Details" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:border-blue-500 outline-none transition-all h-40 resize-none font-medium" />
                </div>
                <MagneticButton 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                </MagneticButton>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 px-6 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tighter">Balaji</span>
          </div>
          <p className="text-gray-600 text-[10px] uppercase tracking-[0.3em] font-bold">
            © {new Date().getFullYear()} Personal Product Experience • Phase 2.5
          </p>
          <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  BarChart3, 
  Repeat, 
  Shield, 
  Zap, 
  Smartphone, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import './LandingPage.css'; // Import landing page specific styles

// Dynamic Financial Background Animation Component
const FinanceGraphBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDarkMode } = useTheme();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    let particles: Particle[] = [];
    let connections: Connection[] = [];
    let stockData: number[] = [];
    
    // Generate random stock-like data
    for (let i = 0; i < 200; i++) {
      stockData.push(50 + Math.random() * 20 * Math.sin(i / 10));
    }
    
    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };
    
    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 1.5; 
        if (this.y < canvas.height * 0.5) {
          this.y += canvas.height * 0.5;
        }
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.color = isDarkMode ? 
          `rgba(59, 130, 246, ${Math.random() * 0.3 + 0.2})` : 
          `rgba(37, 99, 235, ${Math.random() * 0.3 + 0.2})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;
        
        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }
    
    // Connection class
    class Connection {
      from: Particle;
      to: Particle;
      
      constructor(from: Particle, to: Particle) {
        this.from = from;
        this.to = to;
      }
      
      draw() {
        const distance = Math.sqrt(
          Math.pow(this.from.x - this.to.x, 2) + 
          Math.pow(this.from.y - this.to.y, 2)
        );
        
        if (distance < 150) {
          ctx.beginPath();
          ctx.moveTo(this.from.x, this.from.y);
          ctx.lineTo(this.to.x, this.to.y);
          ctx.strokeStyle = isDarkMode ? 
            `rgba(59, 130, 246, ${0.1 - distance / 1500})` : 
            `rgba(37, 99, 235, ${0.1 - distance / 1500})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    
    // Initialize particles
    const initParticles = () => {
      particles = [];
      connections = [];
      
      // Create particles
      for (let i = 0; i < 80; i++) {
        particles.push(new Particle());
      }
      
      // Create connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          connections.push(new Connection(particles[i], particles[j]));
        }
      }
    };
    
    // Draw stock chart
    const drawStockChart = () => {
      const chartHeight = 100;
      const chartY = canvas.height - 50;
      const segmentWidth = canvas.width / (stockData.length - 1);
      
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isDarkMode ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.5)';
      
      for (let i = 0; i < stockData.length; i++) {
        const x = i * segmentWidth;
        const y = chartY - stockData[i];
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();
      
      // Fill area under chart
      ctx.lineTo(canvas.width, chartY);
      ctx.lineTo(0, chartY);
      ctx.fillStyle = isDarkMode ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.15)';
      ctx.fill();
    };
    
    // Draw floating percentage indicators
    const drawFloatingIndicators = (timestamp: number) => {
      const indicators = [
        { value: '+8.2%', color: '#22c55e', x: canvas.width * 0.2, y: canvas.height * 0.7 },
        { value: '+3.7%', color: '#22c55e', x: canvas.width * 0.7, y: canvas.height * 0.75 },
        { value: '-2.1%', color: '#ef4444', x: canvas.width * 0.5, y: canvas.height * 0.8 },
        { value: '+12.5%', color: '#22c55e', x: canvas.width * 0.85, y: canvas.height * 0.85 }
      ];
      
      indicators.forEach((indicator, i) => {
        const offsetY = Math.sin(timestamp / 1000 + i) * 10;
        
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = indicator.color;
        ctx.fillText(indicator.value, indicator.x, indicator.y + offsetY);
      });
    };
    
    // Draw glowing dots
    const drawGlowingDots = (timestamp: number) => {
      const dots = [
        { x: canvas.width * 0.1, y: canvas.height * 0.65 },
        { x: canvas.width * 0.8, y: canvas.height * 0.7 },
        { x: canvas.width * 0.3, y: canvas.height * 0.8 },
        { x: canvas.width * 0.7, y: canvas.height * 0.75 },
        { x: canvas.width * 0.5, y: canvas.height * 0.85 }
      ];
      
      dots.forEach((dot, i) => {
        const radius = 3 + Math.sin(timestamp / 1000 + i * 2) * 2;
        const alpha = 0.5 + Math.sin(timestamp / 1000 + i) * 0.2;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, radius * 4);
        gradient.addColorStop(0, `rgba(6, 182, 212, ${alpha})`);
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
        
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isDarkMode ? 'rgba(6, 182, 212, 1)' : 'rgba(6, 182, 212, 0.9)';
        ctx.fill();
      });
    };
    
    // Animation loop
    const animate = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw financial elements first
      drawStockChart();
      drawFloatingIndicators(timestamp);
      drawGlowingDots(timestamp);
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      // Draw connections
      connections.forEach(connection => {
        connection.draw();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Initialize and start animation
    handleResize();
    window.addEventListener('resize', handleResize);
    animationFrameId = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);
  
  return <canvas ref={canvasRef} className="finance-background" />;
};

const LandingPage = () => {
  const { isDarkMode } = useTheme();
  const featuresRef = useRef<HTMLElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page-container bg-gray-50 dark:bg-gray-900 relative">
      {/* Advanced Animated Background */}
      <FinanceGraphBackground />
      
      {/* Navbar */}
      <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm dark:shadow-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-blue-600 dark:text-blue-400">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                  <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-200">Spendle</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/signin" 
                className="px-5 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Log in
              </Link>
              <Link 
                to="/signin" 
                className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content container - ensure all sections are semi-transparent */}
      <div className="overflow-auto">
        {/* Hero Section */}
        <section className="py-16 md:py-24 border-2 border-white/20 dark:border-gray-700/20 rounded-xl my-8 mx-4 sm:mx-8 shadow-lg shadow-black/5 dark:shadow-black/20 backdrop-blur-[1px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  <span className="block">Simplify Your</span>
                  <span className="block text-blue-600 dark:text-blue-400">Financial Journey</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                  Track expenses, set savings goals, and gain insights into your spending habits – all in one beautiful, easy-to-use app.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link 
                    to="/signin" 
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <button 
                    onClick={scrollToFeatures}
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-700 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                  >
                    Learn More
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="hidden lg:block relative">
                <div className="w-full h-[450px] bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg shadow-xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-md p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg transform rotate-1 transition-all duration-300 hover:rotate-0">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Overview</h3>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">September 2023</span>
                      </div>
                      <div className="space-y-4">
                        <div className="h-40 bg-gray-50 dark:bg-gray-700 rounded-md p-3 relative overflow-hidden">
                          <svg className="w-full h-full" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="0" y1="30" x2="300" y2="30" stroke="currentColor" className="text-gray-200 dark:text-gray-600" strokeWidth="1" strokeDasharray="4 4" />
                            <line x1="0" y1="60" x2="300" y2="60" stroke="currentColor" className="text-gray-200 dark:text-gray-600" strokeWidth="1" strokeDasharray="4 4" />
                            <line x1="0" y1="90" x2="300" y2="90" stroke="currentColor" className="text-gray-200 dark:text-gray-600" strokeWidth="1" strokeDasharray="4 4" />
                            
                            <path 
                              d="M20,100 Q40,90 60,85 T100,55 T140,60 T180,40 T220,30 T260,20 T300,15"
                              stroke="url(#blueGradient)" 
                              strokeWidth="3" 
                              fill="none" 
                              strokeLinecap="round"
                              className="drop-shadow-md"
                            />
                            
                            <path 
                              d="M20,100 Q40,90 60,85 T100,55 T140,60 T180,40 T220,30 T260,20 T300,15 V120 H20 Z"
                              fill="url(#areaGradient)" 
                              opacity="0.2"
                            />
                            
                            <defs>
                              <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#06b6d4" />
                              </linearGradient>
                              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            
                            <circle cx="280" cy="18" r="4" fill="#10b981" className="animate-pulse" />
                          </svg>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Income</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">₹45,000</div>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Expenses</div>
                            <div className="text-xl font-bold text-gray-900 dark:text-white">₹28,350</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="py-16 border-2 border-white/20 dark:border-gray-700/20 rounded-xl my-8 mx-4 sm:mx-8 shadow-lg shadow-black/5 dark:shadow-black/20 backdrop-blur-[1px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Powerful Features, Simplified Finance</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Everything you need to take control of your finances in one elegant solution.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/50 rounded-md flex items-center justify-center mb-4">
                  <LayoutDashboard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Intuitive Dashboard</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get a clear overview of your finances at a glance with visual summaries and quick insights.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/50 rounded-md flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Savings Goals</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Set and track financial goals with progress indicators and timelines for achievement.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/50 rounded-md flex items-center justify-center mb-4">
                  <Repeat className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Recurring Management</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Never miss a bill or subscription payment with automated tracking of recurring transactions.
                </p>
              </div>
              
              {/* Feature 4 */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/50 rounded-md flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Advanced Analytics</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Gain powerful insights into your spending patterns with detailed financial analytics.
                </p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white/10 to-transparent dark:from-gray-900/10 pointer-events-none"></div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 border-2 border-white/20 dark:border-gray-700/20 rounded-xl my-8 mx-4 sm:mx-8 shadow-lg shadow-black/5 dark:shadow-black/20 backdrop-blur-[1px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-teal-500/10 to-cyan-500/10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How Spendle Works</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Simple steps to financial clarity and control
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative p-8">
                <div className="absolute top-0 left-0 w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">1</div>
                <div className="pl-8 pt-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Track Your Expenses</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Log your daily expenses and income easily with our intuitive interface. Categorize transactions to better understand your spending habits.
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="relative p-8">
                <div className="absolute top-0 left-0 w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">2</div>
                <div className="pl-8 pt-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Set Meaningful Goals</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Create savings goals for big purchases, emergency funds, or any financial milestone. Watch your progress visually as you save.
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="relative p-8">
                <div className="absolute top-0 left-0 w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold">3</div>
                <div className="pl-8 pt-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Gain Financial Insights</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Analyze your finances through detailed reports and visualizations. Make informed decisions based on actual spending patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white/10 to-transparent dark:from-gray-900/10 pointer-events-none"></div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 border-2 border-white/20 dark:border-gray-700/20 rounded-xl my-8 mx-4 sm:mx-8 shadow-lg shadow-black/5 dark:shadow-black/20 backdrop-blur-[1px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">What Users Say</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Join thousands who have transformed their financial lives
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-blue-600"></div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Rahul M.</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Software Engineer</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  "Spendle has completely changed how I manage my finances. The savings goals feature helped me save for my wedding in record time!"
                </p>
                <div className="flex mt-4 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-purple-600"></div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Priya K.</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Freelance Designer</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  "As a freelancer with variable income, Spendle helps me stay on top of my finances. The recurring expenses feature is a lifesaver!"
                </p>
                <div className="flex mt-4 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              {/* Testimonial 3 */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-green-600"></div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Amit S.</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Small Business Owner</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  "The analytics in Spendle helped me identify unnecessary expenses in my personal finances, saving me thousands every year!"
                </p>
                <div className="flex mt-4 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white/10 to-transparent dark:from-gray-900/10 pointer-events-none"></div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 border-2 border-white/20 dark:border-gray-700/20 rounded-xl my-8 mx-4 sm:mx-8 shadow-lg shadow-black/5 dark:shadow-black/20 backdrop-blur-[1px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-violet-500/10 to-indigo-500/10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Why Choose Spendle?</h2>
                <div className="space-y-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-md flex items-center justify-center">
                        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Secure & Private</h3>
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Your financial data is encrypted and stored securely. We prioritize your privacy above all else.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-md flex items-center justify-center">
                        <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Fast & Responsive</h3>
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Built with modern technology to ensure a smooth, responsive experience across all devices.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-md flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Use Anywhere</h3>
                      <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Access your financial data from any device with our responsive design that works across all platforms.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative hidden lg:block">
                <div className="absolute -inset-4">
                  <div className="w-full h-full mx-auto opacity-30 blur-lg filter bg-gradient-to-r from-blue-400 to-purple-400 dark:from-blue-700 dark:to-purple-700 animate-pulse"></div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Financial planning" 
                  className="relative w-full h-auto rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white/10 to-transparent dark:from-gray-900/10 pointer-events-none"></div>
        </section>

        {/* CTA Section */}
        <section className="py-16 border-2 border-blue-500/30 dark:border-blue-600/30 rounded-xl my-8 mx-4 sm:mx-8 shadow-xl shadow-blue-500/10 dark:shadow-blue-800/20 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/60 via-blue-700/60 to-indigo-700/60"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgOGgydi0yaC0ydjJ6bTIgMGgydjJoLTJ2LTJ6bS0yLTR2MmgtMnYtMmgyek0zMCAyOGgtMnYyaDJ2LTJ6bS00LTRoMnYyaC0ydi0yek0zNCAyMHYtMmgydjJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bTQtOGgtMnYyaDJ2LTJ6bTIgMHYtMmgydjJoLTJ6bS00IDEwaDJ2MmgtMnYtMnptMCAxMHYtMmgydjJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Financial Life?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of users who have taken control of their finances with Spendle.
            </p>
            <Link 
              to="/signin" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 transition-colors duration-300"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-b from-white/30 to-white/20 dark:from-gray-900/30 dark:to-gray-900/20 backdrop-blur-sm py-12 border-t-2 border-white/15 dark:border-gray-800/25 mt-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-600 dark:text-blue-400">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                  <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                </svg>
                <span className="ml-2 text-lg font-bold text-gray-900 dark:text-gray-200">Spendle</span>
              </div>
              
              <div className="flex space-x-6 mb-4 md:mb-0">
                <button 
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Privacy
                </button>
                <button 
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Terms
                </button>
                <button 
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Contact
                </button>
              </div>
              
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                © {new Date().getFullYear()} Spendle. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage; 
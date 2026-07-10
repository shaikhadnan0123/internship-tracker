import React, { useState, useMemo } from 'react';
import { 
  Cloud, 
  Search, 
  Filter, 
  Cpu, 
  Database, 
  Layers, 
  Calculator, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  Info, 
  Coins, 
  Terminal,
  Activity,
  ArrowUpRight,
  HelpCircle,
  Clock,
  Shield,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FreeProduct {
  name: string;
  category: 'compute' | 'storage' | 'data' | 'ai' | 'devops';
  limit: string;
  description: string;
  icon: any;
  metric: string;
  freeLimitVal: number;
  excessRate: number; // simulated cost per unit above limit
  rateUnit: string;
}

interface TrialOffer {
  name: string;
  duration: string;
  benefits: string[];
  description: string;
}

export default function GcpFreeTierView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showQuiz, setShowQuiz] = useState(false);
  
  // Quiz states
  const [quizAnswers, setQuizAnswers] = useState({
    underDevelopment: null as boolean | null,
    underFiveYears: null as boolean | null,
    usingAi: null as boolean | null,
  });

  // Calculator states
  const [calcUsage, setCalcUsage] = useState({
    computeVms: 1, // e2-micro count
    cloudRunReqs: 2.0, // Million requests
    cloudStorageGb: 5, // GB
    bigQueryTb: 1.0, // TB query scan
    firestoreGb: 1, // GB
    functionsInvocations: 2.0, // Million
  });

  const categories = [
    { id: 'all', label: 'All Products', icon: Layers },
    { id: 'compute', label: 'Compute', icon: Cpu },
    { id: 'storage', label: 'Storage & DB', icon: Database },
    { id: 'data', label: 'Data & Analytics', icon: Activity },
    { id: 'ai', label: 'AI & Machine Learning', icon: Sparkles },
    { id: 'devops', label: 'Dev & DevOps', icon: Code },
  ];

  const products: FreeProduct[] = [
    {
      name: 'Compute Engine',
      category: 'compute',
      limit: '1 e2-micro instance per month',
      description: 'Scalable, high-performance virtual machines suitable for background jobs or lightweight hosting.',
      icon: Cpu,
      metric: 'Instances',
      freeLimitVal: 1,
      excessRate: 7.13,
      rateUnit: 'VM/mo'
    },
    {
      name: 'Cloud Storage',
      category: 'storage',
      limit: '5 GB-months Standard Storage',
      description: 'Best-in-class performance, reliability, and pricing for all your unstructured object storage needs.',
      icon: Database,
      metric: 'GB Storage',
      freeLimitVal: 5,
      excessRate: 0.026,
      rateUnit: 'GB/mo'
    },
    {
      name: 'BigQuery',
      category: 'data',
      limit: '1 TB queries per month',
      description: 'Fully managed, petabyte scale, serverless analytics data warehouse with built-in ML.',
      icon: Activity,
      metric: 'TB Scanned',
      freeLimitVal: 1,
      excessRate: 5.00,
      rateUnit: 'TB'
    },
    {
      name: 'Cloud Run',
      category: 'compute',
      limit: '2 million requests per month',
      description: 'A fully managed serverless environment to run stateless containers, build apps, or host websites.',
      icon: Cloud,
      metric: 'M Requests',
      freeLimitVal: 2,
      excessRate: 0.40,
      rateUnit: 'M Reqs'
    },
    {
      name: 'Google Kubernetes Engine',
      category: 'compute',
      limit: '1 Autopilot / Zonal cluster per month',
      description: 'One-click container orchestration via Kubernetes clusters, managed by Google, with zero cluster management fees.',
      icon: Layers,
      metric: 'Cluster',
      freeLimitVal: 1,
      excessRate: 73.00,
      rateUnit: 'Cluster/mo'
    },
    {
      name: 'Cloud Build',
      category: 'devops',
      limit: '120 build-minutes per day',
      description: 'Fast, consistent, reliable builds on Google Cloud supporting multiple programming languages.',
      icon: Code,
      metric: 'Build Mins/day',
      freeLimitVal: 120,
      excessRate: 0.003,
      rateUnit: 'Min'
    },
    {
      name: 'Firestore',
      category: 'storage',
      limit: '1 GB storage',
      description: 'NoSQL document database that simplifies storing, syncing, and querying data for global applications.',
      icon: Database,
      metric: 'GB Storage',
      freeLimitVal: 1,
      excessRate: 0.18,
      rateUnit: 'GB/mo'
    },
    {
      name: 'Pub/Sub',
      category: 'data',
      limit: '10 GB messages per month',
      description: 'A global service for real-time and reliable messaging and streaming data ingestion.',
      icon: Activity,
      metric: 'GB Ingested',
      freeLimitVal: 10,
      excessRate: 0.06,
      rateUnit: 'GB'
    },
    {
      name: 'Cloud Run functions',
      category: 'compute',
      limit: '2 million invocations per month',
      description: 'A serverless environment to build, deploy, and connect cloud services with lightweight code snippets.',
      icon: Terminal,
      metric: 'M Invocations',
      freeLimitVal: 2,
      excessRate: 0.40,
      rateUnit: 'M Invocations'
    },
    {
      name: 'Vision AI',
      category: 'ai',
      limit: '1,000 units per month',
      description: 'Label detection, OCR, facial detection, and pre-trained machine learning capabilities for image analysis.',
      icon: Sparkles,
      metric: 'Units',
      freeLimitVal: 1000,
      excessRate: 1.50,
      rateUnit: '1K Units'
    },
    {
      name: 'Speech-to-Text',
      category: 'ai',
      limit: '60 minutes per month',
      description: 'Speech-to-text transcription powered by Google\'s state-of-the-art neural network speech models.',
      icon: Sparkles,
      metric: 'Minutes',
      freeLimitVal: 60,
      excessRate: 1.44,
      rateUnit: 'Hour'
    },
    {
      name: 'Natural Language API',
      category: 'ai',
      limit: '5,000 units per month',
      description: 'Derive insights from unstructured text using Google machine learning and sentiment analysis.',
      icon: Sparkles,
      metric: 'Units',
      freeLimitVal: 5000,
      excessRate: 1.00,
      rateUnit: '1K Units'
    },
    {
      name: 'Cloud KMS Autokey',
      category: 'devops',
      limit: '100 active key versions / mo',
      description: 'Get Cloud KMS keys on-demand for consistent alignment with recommended encryption practices.',
      icon: Shield,
      metric: 'Active Keys',
      freeLimitVal: 100,
      excessRate: 0.06,
      rateUnit: 'Key/mo'
    },
    {
      name: 'Video Intelligence API',
      category: 'ai',
      limit: '1,000 units per month',
      description: 'Pre-trained ML models that recognize objects, places, and actions in stored and streaming video.',
      icon: Sparkles,
      metric: 'Units',
      freeLimitVal: 1000,
      excessRate: 1.20,
      rateUnit: '1K Units'
    },
    {
      name: 'Workflows',
      category: 'data',
      limit: '5,000 free internal steps / mo',
      description: 'Run fully-managed sequences of service calls across Google Cloud and any HTTP APIs.',
      icon: Terminal,
      metric: 'Steps',
      freeLimitVal: 5000,
      excessRate: 0.01,
      rateUnit: '1K Steps'
    },
    {
      name: 'Cloud Source Repositories',
      category: 'devops',
      limit: 'Free access for up to 5 users',
      description: 'Multiple private Git repositories hosted on Google Cloud with simple IAM integrations.',
      icon: Code,
      metric: 'Users',
      freeLimitVal: 5,
      excessRate: 1.00,
      rateUnit: 'User/mo'
    },
    {
      name: 'Secret Manager',
      category: 'storage',
      limit: '6 secret versions per month',
      description: 'Securely store API keys, passwords, certificates, and other sensitive data with fine-grained access control.',
      icon: Shield,
      metric: 'Active Secrets',
      freeLimitVal: 6,
      excessRate: 0.06,
      rateUnit: 'Secret/mo'
    },
    {
      name: 'Cloud Shell',
      category: 'devops',
      limit: '5 GB persistent storage included',
      description: 'Online development and operations environment accessible anywhere with your browser.',
      icon: Terminal,
      metric: 'GB Storage',
      freeLimitVal: 5,
      excessRate: 0,
      rateUnit: 'None'
    },
    {
      name: 'Workload Manager',
      category: 'devops',
      limit: '5,000 resource evaluations / mo',
      description: 'Rule-based validation service for evaluating your workloads running on Google Cloud.',
      icon: HelpCircle,
      metric: 'Evaluations',
      freeLimitVal: 5000,
      excessRate: 0.05,
      rateUnit: '100 Evs'
    }
  ];

  const trialOffers: TrialOffer[] = [
    {
      name: 'Gemini Enterprise app – Business edition',
      duration: '30-Day Free Trial',
      description: 'Great for individuals, small businesses, and teams up to 300—no IT setup needed.',
      benefits: [
        'Manage, deploy, and secure AI agents on a single platform',
        'Build custom agents with a no-code agent builder',
        'Ground agents in your critical data with powerful connectors'
      ]
    },
    {
      name: 'Google Kubernetes Engine (GKE)',
      duration: '90-Day Free Trial',
      description: 'Try GKE with the full set of premium product capabilities for no fee.',
      benefits: [
        'Fleet-based team management',
        'Managed GitOps-based configuration management',
        'GKE on hybrid and multicloud setups'
      ]
    },
    {
      name: 'Cloud SQL Instance',
      duration: '30-Day Free Trial',
      description: 'Start a trial with an 8 vCPU Enterprise Plus instance with premium storage.',
      benefits: [
        '8 vCPU Enterprise Plus instance, 64 GB memory, and 100 GB storage',
        'Sub-second downtime maintenance with Enterprise Plus edition',
        'Gemini-assisted management and vector search integrations'
      ]
    },
    {
      name: 'Spanner Database',
      duration: '90-Day Free Trial',
      description: 'Create a Spanner free trial instance with 10 GB of storage at no cost.',
      benefits: [
        'Always-on database with virtually unlimited scale',
        'Industry-leading 99.999% availability SLA',
        'Brings together relational, graph, key-value, and search'
      ]
    },
    {
      name: 'AlloyDB for PostgreSQL',
      duration: '30-Day Free Trial',
      description: 'Start a trial with an 8 vCPU basic primary instance and high capacity storage.',
      benefits: [
        'PostgreSQL database with increased transactional performance',
        'Built-in generative AI with Gemini Enterprise Agent Platform',
        'Accelerated analytical queries with columnar engine'
      ]
    },
    {
      name: 'Looker Analytics',
      duration: '30-Day Free Trial',
      description: 'Create a trial instance with all standard features at no cost.',
      benefits: [
        'Connect to data in 50+ different databases',
        'Build and manage centralized data models',
        'Access and analyze your trusted data'
      ]
    },
    {
      name: 'Bigtable NoSQL',
      duration: '10-Day Free Trial',
      description: 'Start a trial with a 1 node SSD cluster and high storage capacity.',
      benefits: [
        'Cassandra and HBase-compatible low-latency NoSQL database',
        'Low latency, high throughput for streaming and analytical workloads',
        'Automatic, seamless data tiering between RAM, SSD and HDD'
      ]
    }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            prod.limit.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Calculator computations
  const calculatedCost = useMemo(() => {
    const computeExcess = Math.max(0, calcUsage.computeVms - 1) * 7.13;
    const runExcess = Math.max(0, calcUsage.cloudRunReqs - 2.0) * 0.40;
    const storageExcess = Math.max(0, calcUsage.cloudStorageGb - 5) * 0.026;
    const bqExcess = Math.max(0, calcUsage.bigQueryTb - 1.0) * 5.00;
    const firestoreExcess = Math.max(0, calcUsage.firestoreGb - 1) * 0.18;
    const fnExcess = Math.max(0, calcUsage.functionsInvocations - 2.0) * 0.40;

    const total = computeExcess + runExcess + storageExcess + bqExcess + firestoreExcess + fnExcess;
    return {
      compute: computeExcess,
      run: runExcess,
      storage: storageExcess,
      bq: bqExcess,
      firestore: firestoreExcess,
      functions: fnExcess,
      total: Math.round(total * 100) / 100
    };
  }, [calcUsage]);

  const calculatorGaugeColor = useMemo(() => {
    if (calculatedCost.total === 0) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (calculatedCost.total < 300) return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  }, [calculatedCost.total]);

  // Quiz evaluation
  const quizResult = useMemo(() => {
    const { underDevelopment, underFiveYears, usingAi } = quizAnswers;
    if (underDevelopment === null || underFiveYears === null) return null;
    if (underDevelopment === false || underFiveYears === false) {
      return {
        eligible: false,
        title: 'Not Eligible for Startups Tier yet',
        description: 'The Google for Startups program is tailored for early-stage registered startups under 5 years old. However, you can still build, test, and host your project completely for free using the Google Cloud Free Tier!',
        credit: '$300 Credit + Always Free limits'
      };
    }
    if (usingAi === true) {
      return {
        eligible: true,
        title: 'Eligible for AI Startups Program!',
        description: 'Outstanding! Because you are building AI solutions using Google Cloud, you qualify for the AI Startups program. This unlocks premium credits, priority access to engineers, and credits for Vertex AI and Gemini.',
        credit: 'Up to $350,000 USD in Cloud Credits'
      };
    }
    return {
      eligible: true,
      title: 'Eligible for Startups Cloud Program!',
      description: 'Excellent! Your early-stage startup meets the requirements for the Google for Startups program. You can unlock infrastructure credits to build and scale your proof of concept.',
      credit: 'Up to $200,000 USD in Cloud Credits'
    };
  }, [quizAnswers]);

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn max-w-7xl mx-auto" id="gcp-free-tier-container">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 flex items-center gap-3 tracking-tight">
            <Cloud className="w-8 h-8 text-indigo-400 animate-pulse" />
            GOOGLE CLOUD FREE PROGRAM
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-semibold mt-1">
            Build, deploy, and scale your internship projects or proof-of-concepts at zero cost.
          </p>
        </div>
      </div>

      {/* Hero Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: $300 Credits */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/15 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:opacity-25 transition-all">
            <Coins className="w-20 h-20 text-indigo-400" />
          </div>
          <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
            For New Customers
          </span>
          <h3 className="text-xl font-black text-white mt-3">$300 Free Credit</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-semibold mt-2.5">
            Get $300 in free credits to try any Google Cloud products. You won’t be charged until you manually activate your paid account.
          </p>
        </div>

        {/* Card 2: 20+ Free Tier Products */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/15 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:opacity-25 transition-all">
            <Layers className="w-20 h-20 text-indigo-400" />
          </div>
          <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Always Free
          </span>
          <h3 className="text-xl font-black text-white mt-3">20+ Free Tier Products</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-semibold mt-2.5">
            Get monthly free usage of AI APIs, Compute, Cloud Storage, BigQuery, and more—not charged against your $300 credit.
          </p>
        </div>

        {/* Card 3: Free Solutions Deployer */}
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/15 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:opacity-25 transition-all">
            <Award className="w-20 h-20 text-indigo-400" />
          </div>
          <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Pre-built templates
          </span>
          <h3 className="text-xl font-black text-white mt-3">Pre-Built Solutions</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-semibold mt-2.5">
            Apply credits towards pre-built architectures recommended by Google, such as dynamic web setups, VMs, or three-tier web applications.
          </p>
        </div>
      </div>

      {/* Main Grid: Calculator (Left) and Startup/Quiz (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Cost Calculator Section */}
        <div className="lg:col-span-8 liquid-glass-card rounded-2xl p-5 md:p-6 border border-white/15 flex flex-col gap-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              GCP Free Tier Usage & Budget Simulator
            </h3>
          </div>

          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Drag the sliders to estimate your architecture's monthly footprint. We'll automatically identify if you remain within the **Always Free** limits, or project charges.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-2">
            {/* Compute Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Compute Engine VMs</span>
                <span className="text-indigo-400 font-black">{calcUsage.computeVms} / 1 e2-micro</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="3" 
                step="1"
                value={calcUsage.computeVms}
                onChange={(e) => setCalcUsage(prev => ({ ...prev, computeVms: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[9px] text-slate-500 font-bold uppercase">Limit: 1 free VM per month</span>
            </div>

            {/* Cloud Run Requests */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Cloud Run Requests</span>
                <span className="text-indigo-400 font-black">{calcUsage.cloudRunReqs.toFixed(1)}M / 2.0M</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                step="0.5"
                value={calcUsage.cloudRunReqs}
                onChange={(e) => setCalcUsage(prev => ({ ...prev, cloudRunReqs: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[9px] text-slate-500 font-bold uppercase">Limit: 2 Million requests per month</span>
            </div>

            {/* Cloud Storage */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Standard Storage</span>
                <span className="text-indigo-400 font-black">{calcUsage.cloudStorageGb} GB / 5 GB</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50" 
                step="2"
                value={calcUsage.cloudStorageGb}
                onChange={(e) => setCalcUsage(prev => ({ ...prev, cloudStorageGb: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[9px] text-slate-500 font-bold uppercase">Limit: 5 GB-months Standard Storage</span>
            </div>

            {/* BigQuery Queries */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">BigQuery Scanned Data</span>
                <span className="text-indigo-400 font-black">{calcUsage.bigQueryTb.toFixed(1)} TB / 1.0 TB</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="5" 
                step="0.2"
                value={calcUsage.bigQueryTb}
                onChange={(e) => setCalcUsage(prev => ({ ...prev, bigQueryTb: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[9px] text-slate-500 font-bold uppercase">Limit: 1 TB query scans per month</span>
            </div>

            {/* Firestore Storage */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Firestore Storage</span>
                <span className="text-indigo-400 font-black">{calcUsage.firestoreGb} GB / 1 GB</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                step="1"
                value={calcUsage.firestoreGb}
                onChange={(e) => setCalcUsage(prev => ({ ...prev, firestoreGb: parseInt(e.target.value) }))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[9px] text-slate-500 font-bold uppercase">Limit: 1 GB Firestore Storage</span>
            </div>

            {/* Cloud Run functions Invocations */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white">Functions Invocations</span>
                <span className="text-indigo-400 font-black">{calcUsage.functionsInvocations.toFixed(1)}M / 2.0M</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                step="0.5"
                value={calcUsage.functionsInvocations}
                onChange={(e) => setCalcUsage(prev => ({ ...prev, functionsInvocations: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[9px] text-slate-500 font-bold uppercase">Limit: 2 Million invocations per month</span>
            </div>
          </div>

          {/* Calculator Output Display */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 mt-3 transition-colors ${calculatorGaugeColor}`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-lg">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">Estimated Monthly Bill</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-snug">
                  {calculatedCost.total === 0 
                    ? '100% Free! You fit perfectly inside Google\'s Always Free Monthly allotments.'
                    : `You exceed the free limit by $${calculatedCost.total.toFixed(2)}. Covered by your $300 credits!`}
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <span className="text-2xl font-black block">${calculatedCost.total.toFixed(2)}</span>
              <span className="text-[8px] font-black uppercase tracking-widest opacity-60">/ Month</span>
            </div>
          </div>

          {/* Architecture Architecture Recommendations */}
          <div className="bg-slate-900/30 rounded-xl border border-white/5 p-4 flex flex-col gap-2.5 text-xs font-semibold leading-relaxed">
            <div className="flex items-center gap-2 text-indigo-300 font-extrabold uppercase text-[10px] tracking-wider">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>Smart Recommendation:</span>
            </div>
            {calculatedCost.total === 0 ? (
              <span className="text-slate-400">Excellent! Your proposed project fits entirely in the free sandbox. This is the optimal architecture to host internship prototypes or student portfolio projects forever for free!</span>
            ) : (
              <div className="flex flex-col gap-1.5 text-slate-400">
                <span>Your architecture exceeded the Always Free Tier limits:</span>
                <ul className="list-disc pl-4 space-y-1">
                  {calcUsage.computeVms > 1 && <li>Using {calcUsage.computeVms} VMs exceeds the 1 free e2-micro instance (adds ~${calculatedCost.compute.toFixed(2)}/mo).</li>}
                  {calcUsage.cloudStorageGb > 5 && <li>Exceeding 5 GB standard storage adds $0.026/GB (adds ~${calculatedCost.storage.toFixed(2)}/mo).</li>}
                  {calcUsage.bigQueryTb > 1.0 && <li>Scanning {calcUsage.bigQueryTb.toFixed(1)} TB in BigQuery queries exceeds 1 TB/mo free allotment (adds ~${calculatedCost.bq.toFixed(2)}/mo).</li>}
                  {calcUsage.cloudRunReqs > 2.0 && <li>Cloud Run requests exceeding 2 Million add $0.40 per million (adds ~${calculatedCost.run.toFixed(2)}/mo).</li>}
                  {calcUsage.firestoreGb > 1 && <li>Firestore documents storage exceeding 1 GB adds $0.18/GB (adds ~${calculatedCost.firestore.toFixed(2)}/mo).</li>}
                </ul>
                <span className="text-indigo-300 font-bold block mt-1">Tip: Use Cloud Run containers instead of static VMs, and cache database outputs locally to remain 100% inside the Always Free Tier boundaries!</span>
              </div>
            )}
          </div>
        </div>

        {/* Startups Eligibility Panel */}
        <div className="lg:col-span-4 liquid-glass-card rounded-2xl p-5 md:p-6 border border-white/15 flex flex-col justify-between gap-5 h-full">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <Award className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Startups Program Check
              </h3>
            </div>

            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Google Cloud offers massive credit programs for startups. Take this simple eligibility check to see what tier you could unlock.
            </p>

            {!showQuiz ? (
              <div className="bg-slate-900/40 rounded-xl p-4 border border-white/5 flex flex-col gap-3 text-center my-2.5">
                <Coins className="w-12 h-12 text-indigo-400 mx-auto opacity-70 animate-bounce" />
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">Google for Startups Cloud Program</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-semibold">
                    Unlock up to $200,000 USD (up to $350,000 USD for AI startups) in cloud infrastructure credits.
                  </p>
                </div>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg cursor-pointer transition-all duration-200"
                >
                  Verify Startup Eligibility
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 mt-2.5">
                {/* Question 1 */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                    1. Do you have a product under development?
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setQuizAnswers(prev => ({ ...prev, underDevelopment: true }))}
                      className={`flex-1 py-1.5 rounded text-xs font-black uppercase cursor-pointer border ${
                        quizAnswers.underDevelopment === true 
                          ? 'bg-indigo-600 border-indigo-400 text-white' 
                          : 'bg-slate-900/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuizAnswers(prev => ({ ...prev, underDevelopment: false }))}
                      className={`flex-1 py-1.5 rounded text-xs font-black uppercase cursor-pointer border ${
                        quizAnswers.underDevelopment === false 
                          ? 'bg-indigo-600 border-indigo-400 text-white' 
                          : 'bg-slate-900/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Question 2 */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                    2. Company age &lt; 5 years & no Series A raised?
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setQuizAnswers(prev => ({ ...prev, underFiveYears: true }))}
                      className={`flex-1 py-1.5 rounded text-xs font-black uppercase cursor-pointer border ${
                        quizAnswers.underFiveYears === true 
                          ? 'bg-indigo-600 border-indigo-400 text-white' 
                          : 'bg-slate-900/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuizAnswers(prev => ({ ...prev, underFiveYears: false }))}
                      className={`flex-1 py-1.5 rounded text-xs font-black uppercase cursor-pointer border ${
                        quizAnswers.underFiveYears === false 
                          ? 'bg-indigo-600 border-indigo-400 text-white' 
                          : 'bg-slate-900/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Question 3 */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                    3. Building custom AI features using Vertex / Gemini?
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setQuizAnswers(prev => ({ ...prev, usingAi: true }))}
                      className={`flex-1 py-1.5 rounded text-xs font-black uppercase cursor-pointer border ${
                        quizAnswers.usingAi === true 
                          ? 'bg-indigo-600 border-indigo-400 text-white' 
                          : 'bg-slate-900/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuizAnswers(prev => ({ ...prev, usingAi: false }))}
                      className={`flex-1 py-1.5 rounded text-xs font-black uppercase cursor-pointer border ${
                        quizAnswers.usingAi === false 
                          ? 'bg-indigo-600 border-indigo-400 text-white' 
                          : 'bg-slate-900/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Result Section */}
                <AnimatePresence>
                  {quizResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-3.5 rounded-xl border mt-2 flex flex-col gap-2 ${
                        quizResult.eligible 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                          : 'bg-slate-900/80 border-slate-800 text-slate-400'
                      }`}
                    >
                      <h4 className="text-xs font-black uppercase tracking-wider">{quizResult.title}</h4>
                      <p className="text-[10px] leading-relaxed font-semibold">{quizResult.description}</p>
                      <div className="border-t border-white/10 pt-2 flex items-center justify-between font-bold text-[10px]">
                        <span>Est. Benefit:</span>
                        <span className="text-white font-black">{quizResult.credit}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={() => {
                    setQuizAnswers({ underDevelopment: null, underFiveYears: null, usingAi: null });
                    setShowQuiz(false);
                  }}
                  className="w-full text-center text-[10px] text-slate-500 hover:text-white uppercase font-black tracking-widest cursor-pointer mt-1"
                >
                  Reset Checklist
                </button>
              </div>
            )}
          </div>
          
          <div className="border-t border-white/10 pt-4 flex items-center justify-between shrink-0">
            <span className="text-[9px] text-slate-500 font-bold uppercase">Google for Startups</span>
            <a 
              href="https://cloud.google.com/startup" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs font-black uppercase tracking-wide text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
            >
              <span>Learn Program</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 20+ Always Free Catalog Section */}
      <div className="liquid-glass-card rounded-2xl p-5 md:p-6 border border-white/15 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Always Free Products Catalog ({filteredProducts.length})
            </h3>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Search free products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="liquid-glass-input text-xs pl-9 pr-3 py-2 rounded-lg outline-none w-full sm:w-56"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-[10px] text-slate-400 hover:text-white font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filters row */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                  isSelected 
                    ? 'bg-indigo-600 border-indigo-400 text-white' 
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          <AnimatePresence>
            {filteredProducts.map((prod) => {
              const Icon = prod.icon;
              return (
                <motion.div
                  key={prod.name}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-slate-950/40 hover:bg-slate-950/65 rounded-xl border border-white/5 hover:border-indigo-500/25 p-4 flex flex-col justify-between gap-4 transition-all duration-300 group"
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:scale-105 transition-transform">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-200 group-hover:text-white transition-colors">{prod.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">{prod.description}</p>
                  </div>
                  
                  <div className="border-t border-white/5 pt-3.5 flex items-center justify-between">
                    <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-widest">Included Limit</span>
                    <span className="text-[11px] font-extrabold text-indigo-300 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wide">
                      {prod.limit}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-slate-500 font-bold uppercase tracking-wider">
              No matching Google Cloud free tier products found.
            </div>
          )}
        </div>
      </div>

      {/* GCP Free Trials Timeline / Cards */}
      <div className="liquid-glass-card rounded-2xl p-5 md:p-6 border border-white/15 flex flex-col gap-5">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
          <Clock className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Explore Premium Free Trials
          </h3>
        </div>

        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
          Google Cloud provides standalone product free trials for both standard database services and advanced AI assistant agents, letting you test production architectures.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {trialOffers.map((trial) => (
            <div 
              key={trial.name}
              className="bg-slate-950/40 rounded-xl border border-white/5 hover:border-indigo-500/20 p-4.5 flex flex-col justify-between gap-4 transition-all duration-300"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2.5">
                  <h4 className="font-extrabold text-sm text-slate-100 leading-snug">{trial.name}</h4>
                  <span className="text-[9px] font-black text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full shrink-0 uppercase tracking-wide">
                    {trial.duration}
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">{trial.description}</p>
                
                <div className="flex flex-col gap-1.5 mt-1.5">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Key Trial Benefits</span>
                  {trial.benefits.map((benefit, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2 text-[10.5px] text-slate-300 font-semibold">
                      <span className="text-indigo-400 font-black shrink-0 mt-0.5">✓</span>
                      <span className="leading-snug">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

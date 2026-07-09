"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Brain,
  AlertTriangle,
  MapPin,
  DollarSign,
  Compass,
  Award,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { industries } from "@/data/industries";
import { getIndustryInsights } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const Dashboard = ({ initialData }) => {
  const [insight, setInsight] = useState(initialData.insight);
  const [user, setUser] = useState(initialData.user);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [loading, setLoading] = useState(false);

  // Retrieve list of specializations
  const rolesList = [
    "Full Stack Developer",
    "Backend Developer",
    "Frontend Developer",
    "Mobile Developer",
    "DevOps Engineer",
    "Cloud Engineer",
    "AI/ML Engineer",
    "Data Engineer",
    "QA Engineer",
    "Cybersecurity Engineer",
    "Game Developer",
    "Embedded Software Engineer",
    "Software Architect",
  ];

  // Re-fetch insights when the selected role changes
  const handleRoleChange = async (role) => {
    setSelectedRole(role);
    setLoading(true);
    try {
      const data = await getIndustryInsights(role);
      setInsight(data.insight);
      setUser(data.user);
    } catch (error) {
      toast.error(error.message || "Failed to load insights for this role.");
    } finally {
      setLoading(false);
    }
  };

  // 1. Calculate Personalized Alignment Score
  const userSkills = user.skills || [];
  const topSkills = insight.topSkills || [];
  const matchingSkills = topSkills.filter((skill) =>
    userSkills.some(
      (us) =>
        us.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(us.toLowerCase())
    )
  );
  const fitPercentage = topSkills.length > 0
    ? Math.round((matchingSkills.length / topSkills.length) * 100)
    : 0;

  // Suggest a top skill that the user does not have
  const nextSkillToLearn = topSkills.find(
    (skill) =>
      !userSkills.some(
        (us) =>
          us.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(us.toLowerCase())
      )
  ) || "N/A";

  // Helper to get demand level progress percentage
  const getDemandPercentage = (level) => {
    if (!level) return 50;
    switch (level.toLowerCase()) {
      case "high": return 90;
      case "medium": return 60;
      case "low": return 30;
      default: return 50;
    }
  };

  // Formatter for Currency
  const formatSalary = (amount) => {
    if (selectedCountry === "India") {
      return `₹${(amount / 100000).toFixed(1)} LPA`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  // Sparkline data for cards
  const sparklineData = [
    { value: 400 },
    { value: 600 },
    { value: 800 },
    { value: 500 },
    { value: 900 },
    { value: 1200 },
  ];

  return (
    <div className="space-y-6 text-foreground p-4 bg-background min-h-screen">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Industry Insights</h1>
          <p className="text-muted-foreground text-sm">
            Real-time market intelligence to power your career decisions.
          </p>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-[220px]">
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              disabled={loading}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            >
              <option value="all">All Roles</option>
              {rolesList.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* <div className="w-full sm:w-[130px]">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="India">India</option>
              <option value="USA">USA</option>
            </select>
          </div> */}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground text-sm font-medium">Fetching dynamic market insights...</p>
        </div>
      ) : (
        <>
          {/* Core Snapshot Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Market Outlook */}
            <Card className="bg-neutral-900/40 border-neutral-800/80 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Market Outlook
                </CardTitle>
                {insight.marketOutlook === "Bullish" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-extrabold tracking-tight text-foreground">
                  {insight.marketOutlook || "Stable"}
                </div>
                <div className="text-xs text-green-500 font-semibold flex items-center gap-1">
                  <span>+12.4% vs last month</span>
                </div>
                <div className="h-10 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData}>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        fill="rgba(16, 185, 129, 0.1)"
                        strokeWidth={1.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Demand Level */}
            <Card className="bg-neutral-900/40 border-neutral-800/80 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Demand Level
                </CardTitle>
                <Briefcase className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-extrabold tracking-tight text-foreground">
                  {insight.demandLevel || "Medium"}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Market Demand Level</span>
                    <span>{insight.demandLevel || "Medium"}</span>
                  </div>
                  <Progress
                    value={getDemandPercentage(insight.demandLevel)}
                    className="h-2 bg-neutral-800"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Active Jobs */}
            <Card className="bg-neutral-900/40 border-neutral-800/80 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Active Job Postings
                </CardTitle>
                <Compass className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-extrabold tracking-tight text-foreground">
                  {(insight.activeJobs || 12850).toLocaleString()}
                </div>
                <div className="text-xs text-blue-400 font-semibold">
                  +8.7% vs last month
                </div>
                <div className="h-10 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData}>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="rgba(59, 130, 246, 0.1)"
                        strokeWidth={1.5}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Skill Gap Alert */}
            <Card className="bg-neutral-900/40 border-neutral-800/80 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Skill Gap Alert
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-sm font-bold text-foreground line-clamp-2">
                  {insight.skillGapAlert || "High demand, low supply in modern tech stack."}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Immediate training recommended to stay competitive.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Hiring Hubs and Salary Range */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Hiring Hubs */}
            <Card className="bg-neutral-900/40 border-neutral-800/80">
              <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-bold">Top Hiring Hubs</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Regional vacancy distribution for this role
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-center justify-around gap-6">
                {/* Donut Chart */}
                <div className="w-[180px] h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={insight.topHubs || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="share"
                      >
                        {(insight.topHubs || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Cities Details */}
                <div className="space-y-2 w-full sm:w-auto">
                  {(insight.topHubs || []).map((hub, index) => (
                    <div key={hub.city} className="flex items-center justify-between gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-medium text-foreground">{hub.city}</span>
                      </div>
                      <span className="text-muted-foreground font-semibold">{hub.share}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Salary Range (Annual CTC) */}
            <Card className="bg-neutral-900/40 border-neutral-800/80">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Salary Range (Annual CTC)</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Median benchmark compensation across seniority levels
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4 h-full items-center">
                {/* Entry */}
                <div className="bg-neutral-950/40 border border-neutral-800/60 p-4 rounded-xl flex flex-col justify-between h-[140px] relative overflow-hidden">
                  <span className="text-xs text-muted-foreground font-semibold">Entry Level</span>
                  <div className="text-xl font-extrabold text-foreground z-10">
                    {formatSalary(insight.salaryRange?.entry || 350000)}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Median Starting</span>
                  <div className="absolute bottom-0 left-0 right-0 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[{ v: 10 }, { v: 15 }, { v: 13 }, { v: 22 }]}>
                        <Area type="monotone" dataKey="v" stroke="#10b981" fill="rgba(16, 185, 129, 0.15)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Mid */}
                <div className="bg-neutral-950/40 border border-neutral-800/60 p-4 rounded-xl flex flex-col justify-between h-[140px] relative overflow-hidden">
                  <span className="text-xs text-muted-foreground font-semibold">Mid Level</span>
                  <div className="text-xl font-extrabold text-foreground z-10">
                    {formatSalary(insight.salaryRange?.mid || 900000)}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Median Professional</span>
                  <div className="absolute bottom-0 left-0 right-0 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[{ v: 20 }, { v: 25 }, { v: 28 }, { v: 35 }]}>
                        <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="rgba(59, 130, 246, 0.15)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Senior */}
                <div className="bg-neutral-950/40 border border-neutral-800/60 p-4 rounded-xl flex flex-col justify-between h-[140px] relative overflow-hidden">
                  <span className="text-xs text-muted-foreground font-semibold">Senior Level</span>
                  <div className="text-xl font-extrabold text-foreground z-10">
                    {formatSalary(insight.salaryRange?.senior || 1800000)}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Median Lead/Staff</span>
                  <div className="absolute bottom-0 left-0 right-0 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[{ v: 30 }, { v: 45 }, { v: 40 }, { v: 55 }]}>
                        <Area type="monotone" dataKey="v" stroke="#8b5cf6" fill="rgba(139, 92, 246, 0.15)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Domain Comparison */}
          {insight.domainComparison && (
            <Card className="bg-neutral-900/40 border-neutral-800/80">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Domain Comparison</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Comparing median salary and job counts across related tracks
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insight.domainComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="domain" stroke="#888" fontSize={11} />
                    <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" fontSize={11} label={{ value: 'LPA', angle: -90, position: 'insideLeft', fill: '#8b5cf6' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={11} label={{ value: 'Job Count', angle: 90, position: 'insideRight', fill: '#3b82f6' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#171717",
                        borderColor: "#262626",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="medianSalary" name="Median Salary" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                      {(insight.domainComparison || []).map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.domain.toLowerCase().includes(selectedRole.toLowerCase()) ? "#ec4899" : "#8b5cf6"} />
                      ))}
                    </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="jobCount" name="Job Count" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Skills, Tech, and Radar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Top In-Demand Skills */}
            <Card className="bg-neutral-900/40 border-neutral-800/80">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-400" />
                  Top In-Demand
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(insight.topSkills || []).map((skill, index) => (
                  <div key={skill} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{skill}</span>
                      <span className="text-muted-foreground">{100 - index * 6}%</span>
                    </div>
                    <Progress value={100 - index * 6} className="h-1.5 bg-neutral-800" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Emerging Technologies */}
            <Card className="bg-neutral-900/40 border-neutral-800/80">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  Emerging Tech
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(insight.emergingTech || []).map((tech) => (
                  <div key={tech} className="flex items-center justify-between border-b border-neutral-800/50 pb-2 text-xs">
                    <span className="font-semibold">{tech}</span>
                    <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/5">
                      New
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Declining Skills */}
            <Card className="bg-neutral-900/40 border-neutral-800/80">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  Declining Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(insight.decliningSkills || []).map((skill) => (
                  <div key={skill} className="flex items-center justify-between border-b border-neutral-800/50 pb-2 text-xs">
                    <span className="font-semibold text-neutral-400">{skill}</span>
                    <Badge variant="outline" className="border-red-500/30 text-red-500 bg-red-500/5">
                      Declining
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Skill Proximity */}
            <Card className="bg-neutral-900/40 border-neutral-800/80">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-400" />
                  Skill Proximity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(insight.skillProximity || []).map((pair, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs border-b border-neutral-800/50 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-foreground">{pair.skill}</span>
                      <span className="text-neutral-500">&#8596;</span>
                      <span className="font-medium text-muted-foreground">{pair.pairsWith}</span>
                    </div>
                    <Badge className="bg-purple-900/20 text-purple-400 hover:bg-purple-900/20">{pair.frequency}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* AI Summary and Job Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Summary */}
            <Card className="bg-neutral-900/40 border-neutral-800/80 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  AI Market Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-sm text-neutral-300 leading-relaxed">
                  The market outlook for this specialized role shows strong structural adjustments. 
                  Upskilling in emerging frameworks like AI agents, cloud architectures, and next-gen runtime libraries is heavily favored by top employers.
                </div>
                
                <div className="bg-purple-950/20 border border-purple-500/10 p-4 rounded-xl flex items-start gap-3">
                  <Award className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Key Takeaway</h4>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      Focus on cloud hosting solutions, micro-framework integrations, and client validation libraries to remain competitive.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                    <span>AI Confidence Score</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2 bg-neutral-800" />
                </div>
              </CardContent>
            </Card>

            {/* Personalized Insight Fit */}
            <Card className="bg-neutral-900/40 border-neutral-800/80">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  Personalized Fit
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Your skill match alignment score
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-6">
                {/* Radial Gauge */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#262626" strokeWidth="8" fill="transparent" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#f59e0b"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * fitPercentage) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-2xl font-extrabold text-foreground">{fitPercentage}%</div>
                </div>

                <div className="text-center">
                  <h4 className="text-sm font-bold">
                    {fitPercentage > 75
                      ? "Excellent Alignment!"
                      : fitPercentage > 40
                      ? "Good Fit"
                      : "Upskilling Recommended"}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on matching {matchingSkills.length} of the top {topSkills.length} skills listed.
                  </p>
                </div>

                {nextSkillToLearn !== "N/A" && (
                  <div className="bg-neutral-950/40 border border-neutral-800/60 p-3 rounded-xl w-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-400" />
                      <div className="text-left">
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase">Top Skill to Learn</div>
                        <div className="text-xs font-bold text-foreground">{nextSkillToLearn}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-500" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

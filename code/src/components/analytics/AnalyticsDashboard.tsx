import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Star, 
  MessageSquare, 
  Calendar,
  Award,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  totalUsers: number;
  totalProjects: number;
  totalViews: number;
  totalFeedback: number;
  userGrowth: Array<{ month: string; users: number }>;
  projectTrends: Array<{ month: string; projects: number }>;
  sdgDistribution: Array<{ name: string; value: number; color: string }>;
  topProjects: Array<{ title: string; views: number; rating: number }>;
  engagementMetrics: {
    avgSessionTime: number;
    bounceRate: number;
    returnVisitors: number;
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    // Simulate API call
    const fetchAnalytics = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setData({
        totalUsers: 1247,
        totalProjects: 89,
        totalViews: 15632,
        totalFeedback: 234,
        userGrowth: [
          { month: 'Jan', users: 120 },
          { month: 'Feb', users: 190 },
          { month: 'Mar', users: 300 },
          { month: 'Apr', users: 500 },
          { month: 'May', users: 800 },
          { month: 'Jun', users: 1247 },
        ],
        projectTrends: [
          { month: 'Jan', projects: 5 },
          { month: 'Feb', projects: 8 },
          { month: 'Mar', projects: 12 },
          { month: 'Apr', projects: 18 },
          { month: 'May', projects: 25 },
          { month: 'Jun', projects: 89 },
        ],
        sdgDistribution: [
          { name: 'Quality Education', value: 35, color: '#3B82F6' },
          { name: 'Clean Energy', value: 25, color: '#10B981' },
          { name: 'Climate Action', value: 20, color: '#F59E0B' },
          { name: 'Good Health', value: 15, color: '#EF4444' },
          { name: 'Others', value: 5, color: '#8B5CF6' },
        ],
        topProjects: [
          { title: 'Smart Water Management', views: 1234, rating: 4.8 },
          { title: 'AI Crop Optimization', views: 987, rating: 4.6 },
          { title: 'Renewable Energy Tracker', views: 856, rating: 4.9 },
          { title: 'Waste Reduction App', views: 743, rating: 4.7 },
        ],
        engagementMetrics: {
          avgSessionTime: 8.5,
          bounceRate: 23.4,
          returnVisitors: 67.8,
        },
      });
      setLoading(false);
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: 'Total Users', value: data.totalUsers, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: 'Total Projects', value: data.totalProjects, icon: Target, color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: 'Total Views', value: data.totalViews, icon: Eye, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { label: 'Total Feedback', value: data.totalFeedback, icon: MessageSquare, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive insights into platform performance</p>
        </div>
        
        <div className="flex space-x-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Growth</h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Project Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Trends</h3>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.projectTrends}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="projects" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* SDG Distribution and Top Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SDG Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SDG Distribution</h3>
            <PieChart className="h-5 w-5 text-purple-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={data.sdgDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.sdgDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Projects</h3>
            <Award className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="space-y-4">
            {data.topProjects.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{project.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{project.views} views</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{project.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Engagement Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Engagement Metrics</h3>
          <Activity className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.engagementMetrics.avgSessionTime}m</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Session Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.engagementMetrics.bounceRate}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Bounce Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.engagementMetrics.returnVisitors}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Return Visitors</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboard;

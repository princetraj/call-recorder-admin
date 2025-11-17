import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneOff } from 'lucide-react';
import { Loading } from '../components/ui';
import { apiService } from '../services/api';
import { CallLogStatistics } from '../types';
import toast from 'react-hot-toast';

type Period = 'daily' | 'weekly' | 'monthly';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('daily');
  const [stats, setStats] = useState<CallLogStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCallLogStatistics(period);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getPeriodLabel = (p: Period) => {
    switch (p) {
      case 'daily':
        return 'Today';
      case 'weekly':
        return 'This Week';
      case 'monthly':
        return 'This Month';
    }
  };

  const handleCardClick = (callType?: string) => {
    const params = new URLSearchParams();
    if (callType) {
      params.set('call_type', callType);
    }
    params.set('period', period);
    navigate(`/call-logs?${params.toString()}`);
  };

  return (
    <Layout title="Dashboard">
      {isLoading ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          {/* Period Selector */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Call Statistics</h2>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    period === p
                      ? 'bg-rose-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {getPeriodLabel(p)}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="cursor-pointer hover:scale-105 transition-transform" onClick={() => handleCardClick()}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Total Calls</p>
                      <p className="text-3xl font-bold text-neutral-900 mt-1">
                        {stats?.total_calls || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-rose-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="cursor-pointer hover:scale-105 transition-transform" onClick={() => handleCardClick('incoming')}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Incoming</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">
                        {stats?.incoming || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <PhoneIncoming className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="cursor-pointer hover:scale-105 transition-transform" onClick={() => handleCardClick('outgoing')}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Outgoing</p>
                      <p className="text-3xl font-bold text-blue-600 mt-1">
                        {stats?.outgoing || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <PhoneOutgoing className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="cursor-pointer hover:scale-105 transition-transform" onClick={() => handleCardClick('missed')}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Missed</p>
                      <p className="text-3xl font-bold text-red-600 mt-1">
                        {stats?.missed || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <PhoneMissed className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="cursor-pointer hover:scale-105 transition-transform" onClick={() => handleCardClick('rejected')}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-600">Rejected</p>
                      <p className="text-3xl font-bold text-orange-600 mt-1">
                        {stats?.rejected || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <PhoneOff className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-600">Total Call Duration</p>
                  <p className="text-2xl font-semibold text-neutral-900 mt-1">
                    {stats ? formatDuration(stats.total_duration) : '0m'}
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-600">Average Call Duration</p>
                  <p className="text-2xl font-semibold text-neutral-900 mt-1">
                    {stats && stats.average_duration > 0
                      ? `${Math.round(stats.average_duration)}s`
                      : '0s'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
};

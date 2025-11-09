import React from 'react';
import { Layout } from '../components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed } from 'lucide-react';
import { useCallLogs } from '../hooks/useCallLogs';
import { Loading } from '../components/ui';

export const Dashboard: React.FC = () => {
  const { data, isLoading } = useCallLogs({ per_page: 100 });

  const stats = React.useMemo(() => {
    if (!data?.call_logs) return null;

    const logs = data.call_logs;
    return {
      total: logs.length,
      incoming: logs.filter((l) => l.call_type === 'incoming').length,
      outgoing: logs.filter((l) => l.call_type === 'outgoing').length,
      missed: logs.filter((l) => l.call_type === 'missed').length,
      totalDuration: logs.reduce((sum, l) => sum + l.call_duration, 0),
    };
  }, [data]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Layout title="Dashboard">
      {isLoading ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Total Calls</p>
                    <p className="text-3xl font-bold text-neutral-900 mt-1">
                      {stats?.total || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-rose-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    {stats ? formatDuration(stats.totalDuration) : '0m'}
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-600">Average Call Duration</p>
                  <p className="text-2xl font-semibold text-neutral-900 mt-1">
                    {stats && stats.total > 0
                      ? `${Math.round(stats.totalDuration / stats.total)}s`
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

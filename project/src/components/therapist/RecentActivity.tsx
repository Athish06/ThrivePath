import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { StickyNote } from 'lucide-react';

const recentActivities = [
  {
    id: '1',
    message: 'Session completed with Emma Johnson',
    time: '2 hours ago',
    color: 'bg-green-500',
  },
  {
    id: '2',
    message: 'New assessment scheduled for Liam Smith',
    time: '4 hours ago',
    color: 'bg-blue-500',
  },
  {
    id: '3',
    message: 'Progress report generated for Sophia Davis',
    time: '1 day ago',
    color: 'bg-purple-500',
  },
  {
    id: '4',
    message: 'Homework assigned to Emma Johnson',
    time: '2 days ago',
    color: 'bg-orange-500',
  },
  {
    id: '5',
    message: 'Parent meeting scheduled',
    time: '3 days ago',
    color: 'bg-teal-500',
  },
];

export const RecentActivity = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.9, duration: 0.6 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            <CardTitle>Recent Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity: any, index: number) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                className="group p-4 rounded-2xl bg-background/60 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className={`h-3 w-3 rounded-full ${activity.color} mt-1.5 flex-shrink-0`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

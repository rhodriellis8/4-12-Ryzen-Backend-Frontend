
import React from 'react';
import Hero from './Hero';
import CalendarWidget from './CalendarWidget';

interface DashboardViewProps {
  user?: any;
}

const DashboardView: React.FC<DashboardViewProps> = ({ user }) => {
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.display_name?.split(' ')[0] || user?.email?.split('@')[0];

  return (
    <div className="pb-10">
      <Hero userName={userName} />
      <div className="mt-8">
        <CalendarWidget />
      </div>
    </div>
  );
};

export default DashboardView;

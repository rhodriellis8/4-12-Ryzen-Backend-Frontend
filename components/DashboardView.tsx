
import React from 'react';
import Hero from './Hero';
import CalendarWidget from './CalendarWidget';

const DashboardView: React.FC = () => {
  return (
    <div className="pb-10">
      <Hero />
      <div className="mt-8">
        <CalendarWidget />
      </div>
    </div>
  );
};

export default DashboardView;

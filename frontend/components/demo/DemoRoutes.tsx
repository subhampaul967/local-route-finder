'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { demoRoutes, DemoRoute } from '@/lib/demoData';
import { Clock, MapPin, IndianRupee, Users, ArrowRight } from 'lucide-react';

interface DemoRouteCardProps {
  route: DemoRoute;
  onSelect: (from: string, to: string) => void;
}

const DemoRouteCard: React.FC<DemoRouteCardProps> = ({ route, onSelect }) => {
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'walk': return '🚶';
      case 'bus': return '🚌';
      case 'auto': return '🛺';
      case 'train': return '🚆';
      default: return '📍';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'walk': return 'bg-blue-100 text-blue-800';
      case 'bus': return 'bg-green-100 text-green-800';
      case 'auto': return 'bg-yellow-100 text-yellow-800';
      case 'train': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelect(route.from, route.to)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Demo Route
          </Badge>
          <span className="text-sm text-gray-600">Sample Journey</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-600" />
          <span className="font-medium text-sm">{route.from}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-600" />
          <span className="font-medium text-sm">{route.to}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{route.journey.totalTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>{route.journey.totalDistance}</span>
        </div>
        <div className="flex items-center gap-1">
          <IndianRupee className="w-3 h-3" />
          <span>{route.journey.totalFare}</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-gray-500 mb-1">Journey Steps:</div>
        <div className="flex gap-1 flex-wrap">
          {route.journey.steps.slice(0, 3).map((step, index) => (
            <Badge key={step.id} variant="outline" className={`text-xs ${getModeColor(step.mode)}`}>
              {getModeIcon(step.mode)} {step.mode}
            </Badge>
          ))}
          {route.journey.steps.length > 3 && (
            <Badge variant="outline" className="text-xs bg-gray-100">
              +{route.journey.steps.length - 3} more
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};

interface DemoRoutesProps {
  onSelectRoute: (from: string, to: string) => void;
}

export const DemoRoutes: React.FC<DemoRoutesProps> = ({ onSelectRoute }) => {
  const [showDemo, setShowDemo] = useState(false);

  if (!showDemo) {
    return (
      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={() => setShowDemo(true)}
          className="border-green-500 text-green-400 hover:bg-green-500/10 w-full"
        >
          🎯 Try Demo Route
        </Button>
        <p className="text-xs text-slate-400 mt-2">
          See how the app works with sample data
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">
          🎯 Sample Routes (Click to try)
        </h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowDemo(false)}
          className="text-slate-400 hover:text-slate-300 h-6 px-2"
        >
          ✕
        </Button>
      </div>
      
      <div className="space-y-2">
        {demoRoutes.map((route) => (
          <DemoRouteCard 
            key={route.id} 
            route={route} 
            onSelect={onSelectRoute}
          />
        ))}
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-400">
          💡 Click any route above to see the journey details
        </p>
      </div>
    </div>
  );
};

export interface DemoRoute {
  id: string;
  from: string;
  to: string;
  fromType: 'station' | 'location';
  toType: 'college' | 'location';
  journey: {
    steps: JourneyStep[];
    totalTime: string;
    totalDistance: string;
    totalFare: string;
  };
}

export interface JourneyStep {
  id: string;
  mode: 'walk' | 'bus' | 'auto' | 'train';
  from: string;
  to: string;
  duration: string;
  distance: string;
  fare: string;
  description: string;
}

export const demoRoutes: DemoRoute[] = [
  {
    id: 'central-to-engineering',
    from: 'Central Railway Station',
    to: 'Government Engineering College',
    fromType: 'station',
    toType: 'college',
    journey: {
      steps: [
        {
          id: 'step-1',
          mode: 'walk',
          from: 'Central Railway Station',
          to: 'Bus Stop Platform 3',
          duration: '3 mins',
          distance: '200m',
          fare: 'Free',
          description: 'Walk to bus stop platform 3'
        },
        {
          id: 'step-2',
          mode: 'bus',
          from: 'Bus Stop Platform 3',
          to: 'Main Market Bus Stand',
          duration: '15 mins',
          distance: '4.2 km',
          fare: '₹15',
          description: 'Take Route 12A bus towards Main Market'
        },
        {
          id: 'step-3',
          mode: 'auto',
          from: 'Main Market Bus Stand',
          to: 'Engineering College Gate',
          duration: '8 mins',
          distance: '2.1 km',
          fare: '₹40',
          description: 'Shared auto to college campus'
        },
        {
          id: 'step-4',
          mode: 'walk',
          from: 'Engineering College Gate',
          to: 'Government Engineering College',
          duration: '2 mins',
          distance: '150m',
          fare: 'Free',
          description: 'Walk to main college building'
        }
      ],
      totalTime: '28 mins',
      totalDistance: '6.65 km',
      totalFare: '₹55'
    }
  },
  {
    id: 'airport-to-university',
    from: 'City Airport Terminal',
    to: 'State University Campus',
    fromType: 'station',
    toType: 'college',
    journey: {
      steps: [
        {
          id: 'step-1',
          mode: 'bus',
          from: 'City Airport Terminal',
          to: 'Airport Metro Station',
          duration: '10 mins',
          distance: '3.5 km',
          fare: '₹20',
          description: 'Airport shuttle bus to metro station'
        },
        {
          id: 'step-2',
          mode: 'train',
          from: 'Airport Metro Station',
          to: 'University Metro Station',
          duration: '25 mins',
          distance: '12 km',
          fare: '₹35',
          description: 'Metro train Blue Line towards University'
        },
        {
          id: 'step-3',
          mode: 'auto',
          from: 'University Metro Station',
          to: 'State University Campus',
          duration: '6 mins',
          distance: '1.8 km',
          fare: '₹35',
          description: 'Shared auto to university campus'
        }
      ],
      totalTime: '41 mins',
      totalDistance: '17.3 km',
      totalFare: '₹90'
    }
  }
];

export const sampleStations = [
  { name: 'Central Railway Station', location: 'City Center', popular: true },
  { name: 'City Airport Terminal', location: 'Airport Road', popular: true },
  { name: 'North Bus Stand', location: 'North District', popular: false },
  { name: 'South Bus Stand', location: 'South District', popular: false },
  { name: 'East Railway Station', location: 'East End', popular: false },
  { name: 'West Metro Station', location: 'West Sector', popular: true },
  { name: 'Main Market Bus Stand', location: 'Downtown', popular: true },
  { name: 'University Metro Station', location: 'University Area', popular: true }
];

export const sampleColleges = [
  { name: 'Government Engineering College', type: 'Engineering', location: 'North Campus' },
  { name: 'State University Campus', type: 'University', location: 'University Area' },
  { name: 'Medical College Hospital', type: 'Medical', location: 'Health District' },
  { name: 'Arts and Science College', type: 'Arts & Science', location: 'City Center' },
  { name: 'Polytechnic Institute', type: 'Technical', location: 'Industrial Area' },
  { name: 'Women\'s College', type: 'Arts & Science', location: 'South District' },
  { name: 'Law College', type: 'Law', location: 'Court Complex' },
  { name: 'Management Institute', type: 'Management', location: 'Business District' }
];

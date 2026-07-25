export type ReportCategory =
  | 'road_hazard'
  | 'flooding'
  | 'power_outage'
  | 'public_safety'
  | 'infrastructure'
  | 'health_risk'
  | 'other';

export interface Report {
  id: string;
  lat: number;
  lon: number;
  radiusMeters: number;
  category: ReportCategory;
  description: string;
  timestamp: number;
  up: number;
  down: number;
  flagged: boolean;
  score: number;
}

export const CATEGORIES: { value: ReportCategory; label: string; icon: string }[] = [
  { value: 'road_hazard',   label: 'Road Hazard',    icon: 'warning'            },
  { value: 'flooding',      label: 'Flooding',        icon: 'water'              },
  { value: 'power_outage',  label: 'Power Outage',    icon: 'flash'              },
  { value: 'public_safety', label: 'Public Safety',   icon: 'shield-checkmark'   },
  { value: 'infrastructure',label: 'Infrastructure',  icon: 'construct'          },
  { value: 'health_risk',   label: 'Health Risk',     icon: 'medical'            },
  { value: 'other',         label: 'Other',           icon: 'ellipsis-horizontal'},
];

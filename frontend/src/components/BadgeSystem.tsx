/**
 * BadgeSystem — Gamification badges earned based on prediction history.
 * Displayed on the Analytics and History pages.
 */
import type { HealthRecord } from '@/store/records';

interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earned: boolean;
  color: string;
}

interface Props {
  records: HealthRecord[];
}

function computeBadges(records: HealthRecord[]): Badge[] {
  const hasRecords = records.length > 0;
  const has10 = records.length >= 10;
  const hasGoodAqi = records.some((r) => r.aqi === 1);
  const hasSevereAqi = records.some((r) => r.aqi === 5 || r.predictedRisk === 'Severe');
  const allLow = records.length >= 3 && records.every((r) => r.predictedRisk === 'Low');
  const savedThisWeek = records.filter((r) => {
    const d = new Date(r.createdAt);
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length >= 3;

  return [
    {
      id: 'first-check',
      emoji: '🥇',
      name: 'First Check',
      description: 'Saved your first health prediction',
      earned: hasRecords,
      color: '#f59e0b',
    },
    {
      id: 'clean-air',
      emoji: '🌿',
      name: 'Clean Air Day',
      description: 'Recorded an AQI Level 1 (Good) day',
      earned: hasGoodAqi,
      color: '#22c55e',
    },
    {
      id: 'data-enthusiast',
      emoji: '📊',
      name: 'Data Enthusiast',
      description: 'Saved 10 or more health records',
      earned: has10,
      color: '#6366f1',
    },
    {
      id: 'stay-safe',
      emoji: '⚡',
      name: 'Stay Safe!',
      description: 'Detected a Severe/Very Poor AQI day',
      earned: hasSevereAqi,
      color: '#ef4444',
    },
    {
      id: 'streak',
      emoji: '🔥',
      name: 'Week Warrior',
      description: 'Logged 3+ checks in the last 7 days',
      earned: savedThisWeek,
      color: '#f97316',
    },
    {
      id: 'all-clear',
      emoji: '🏆',
      name: 'All Clear',
      description: 'All your last 3+ predictions are Low risk',
      earned: allLow,
      color: '#10b981',
    },
  ];
}

export default function BadgeSystem({ records }: Props) {
  const badges = computeBadges(records);
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="rounded-2xl border p-6 bg-gradient-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">🏅 Badges</h2>
          <p className="text-sm text-muted-foreground">{earnedCount}/{badges.length} earned</p>
        </div>
        {/* Progress bar */}
        <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-gradient-sky transition-smooth rounded-full"
            style={{ width: `${(earnedCount / badges.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`relative rounded-xl border p-3 text-center transition-all duration-300 ${
              b.earned
                ? 'border-transparent shadow-sm scale-100'
                : 'opacity-40 grayscale'
            }`}
            style={b.earned ? { borderColor: b.color + '44', backgroundColor: b.color + '11' } : {}}
            title={b.description}
          >
            {b.earned && (
              <div
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ backgroundColor: b.color }}
              />
            )}
            <div className="text-2xl mb-1">{b.emoji}</div>
            <p className="text-xs font-semibold leading-tight">{b.name}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-tight hidden sm:block">
              {b.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

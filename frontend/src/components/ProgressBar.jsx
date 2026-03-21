export default function ProgressBar({
  label,
  percent,
  currentLevel,
  targetLevel,
  lastUpdated,
  showLevels = true,
  color = 'indigo',
}) {
  const colorMap = {
    indigo: {
      bar: 'bg-indigo-500',
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
      low: 'bg-indigo-200',
    },
    green: {
      bar: 'bg-green-500',
      bg: 'bg-green-100',
      text: 'text-green-600',
      low: 'bg-green-200',
    },
    orange: {
      bar: 'bg-orange-500',
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      low: 'bg-orange-200',
    },
    red: {
      bar: 'bg-red-400',
      bg: 'bg-red-100',
      text: 'text-red-600',
      low: 'bg-red-200',
    },
  };

  // Auto pick color based on percent
  const autoColor =
    percent >= 75 ? 'green' : percent >= 40 ? 'indigo' : percent >= 20 ? 'orange' : 'red';

  const c = colorMap[color === 'auto' ? autoColor : color];

  const levelLabel = {
    beginner: '🟡 Beginner',
    intermediate: '🟠 Intermediate',
    advanced: '🟢 Advanced',
  };

  return (
    <div className="w-full">
      {/* Top row — label + percent */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${c.text}`}>{percent}%</span>
      </div>

      {/* Progress bar */}
      <div className={`w-full h-2.5 rounded-full ${c.bg} overflow-hidden`}>
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${c.bar}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      {/* Bottom row — levels + last updated */}
      {showLevels && (currentLevel || targetLevel || lastUpdated) && (
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {currentLevel && (
              <span>{levelLabel[currentLevel] || currentLevel}</span>
            )}
            {currentLevel && targetLevel && (
              <span className="text-gray-300">→</span>
            )}
            {targetLevel && (
              <span className="text-gray-400">
                Goal: {levelLabel[targetLevel] || targetLevel}
              </span>
            )}
          </div>
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Updated {new Date(lastUpdated).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
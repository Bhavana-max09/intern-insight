export default function SkillBadge({ skill, level, onRemove, showLevel = true }) {
  const levelStyles = {
    beginner: {
      badge: 'bg-blue-100 text-blue-700 border border-blue-200',
      dot: 'bg-blue-500',
      label: 'Beginner',
    },
    intermediate: {
      badge: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      dot: 'bg-yellow-500',
      label: 'Intermediate',
    },
    advanced: {
      badge: 'bg-green-100 text-green-700 border border-green-200',
      dot: 'bg-green-500',
      label: 'Advanced',
    },
  };

  const style = levelStyles[level] || levelStyles.beginner;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${style.badge}`}
    >
      {/* Level dot */}
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />

      {/* Skill name */}
      <span>{skill}</span>

      {/* Level label */}
      {showLevel && (
        <span className="opacity-60 text-xs">· {style.label}</span>
      )}

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity font-bold text-sm leading-none"
          title={`Remove ${skill}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
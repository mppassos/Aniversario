function PullToRefreshIndicator({ progress, isRefreshing }) {
  if (!progress && !isRefreshing) return null;

  const degrees = progress * 360;
  const isReady = progress >= 0.8;

  return (
    <div
      className="flex justify-center items-center h-16 transition-transform duration-200"
      style={{
        transform: `translateY(${Math.min(progress * 40, 40)}px)`,
        opacity: progress > 0 ? 1 : 0,
      }}
    >
      {isRefreshing ? (
        <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="flex items-center gap-2">
          <i
            className="bi bi-arrow-down text-xl transition-transform duration-200"
            style={{
              color: isReady ? '#2563eb' : '#94a3b8',
              transform: `rotate(${degrees}deg)`,
            }}
          />
          <span 
            className="text-xs font-medium"
            style={{ color: isReady ? '#2563eb' : '#94a3b8' }}
          >
            {isReady ? 'Solte para atualizar' : 'Puxe para atualizar'}
          </span>
        </div>
      )}
    </div>
  );
}

export default PullToRefreshIndicator;
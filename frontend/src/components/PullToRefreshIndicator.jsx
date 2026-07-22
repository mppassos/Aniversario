function PullToRefreshIndicator({ progress, isRefreshing }) {
  const visible = progress > 0 || isRefreshing;

  return (
    <div
      className="ptr-container"
      style={{
        height: visible ? `${Math.min(progress * 56, 56)}px` : '0px',
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="flex items-center gap-2 py-2">
        {isRefreshing ? (
          <>
            <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-brand-600">
              Atualizando...
            </span>
          </>
        ) : (
          <>
            <i
              className="bi bi-arrow-down-circle text-lg transition-all duration-200"
              style={{
                color: progress >= 0.8 ? '#2563eb' : '#94a3b8',
                transform: `rotate(${progress * 180}deg)`,
              }}
            />
            <span
              className="text-xs font-medium transition-colors duration-200"
              style={{ color: progress >= 0.8 ? '#2563eb' : '#94a3b8' }}
            >
              {progress >= 0.8 ? 'Solte para atualizar' : 'Puxe para atualizar'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default PullToRefreshIndicator;
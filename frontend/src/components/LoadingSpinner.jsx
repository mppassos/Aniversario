function LoadingSpinner({ texto = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-3"></div>
      <p className="text-sm text-gray-500">{texto}</p>
    </div>
  );
}

export default LoadingSpinner;
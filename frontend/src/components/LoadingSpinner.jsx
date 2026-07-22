function LoadingSpinner({ texto = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-600 animate-spin" />
      </div>
      <p className="text-sm text-gray-500 font-medium">{texto}</p>
    </div>
  );
}

export default LoadingSpinner;
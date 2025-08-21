export default function AuthCard({ title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="text-base text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {children}
      </div>
    </main>
  );
}

import React, { useState } from 'react';

export function TokenDialog({ onToken }: { onToken: (token: string) => void }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.startsWith('pk.')) {
      setError('Token must start with "pk."');
      return;
    }
    onToken(token);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-xl overflow-hidden p-6 text-card-foreground">
        <h2 className="text-xl font-bold mb-2">GroundCheck — Enter Mapbox Token</h2>
        <p className="text-sm text-muted-foreground mb-4">
          A free Mapbox public token (pk.*) is required to render the map.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              data-testid="input-mapbox-token"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setError('');
              }}
              placeholder="pk.eyJ1Ii..."
              className="w-full px-3 py-2 bg-input border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono"
            />
            {error && <p className="text-destructive text-xs mt-1 font-mono">{error}</p>}
          </div>

          <div className="flex items-center justify-between">
            <a 
              href="https://account.mapbox.com/access-tokens/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Get a token at account.mapbox.com
            </a>
            <button
              type="submit"
              data-testid="button-load-map"
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-sm rounded hover:bg-primary/90 transition-colors"
            >
              Load Map
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

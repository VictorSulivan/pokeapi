import React, { useState } from 'react';
import '../style.css';

export default function App() {
  const [teamA, setTeamA] = useState([]); // { id, name, sprite }
  const [teamB, setTeamB] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('A');
  const [lastDraw, setLastDraw] = useState(null); // { id, name, sprite }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isComplete = teamA.length === 6 && teamB.length === 6;

  const fetchRandomPokemon = async () => {
    try {
      setLoading(true);
      setError('');
      const randomNumber = Math.ceil(Math.random() * 150) + 1;
      const res = await fetch(`/api/pokemon/${randomNumber}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const pokemon = {
        id: data.id,
        name: data.name,
        sprite: data.sprites.front_default || ''
      };

      if (currentPlayer === 'A' && teamA.length < 6) {
        setTeamA(prev => [...prev, pokemon]);
        setCurrentPlayer(teamB.length < 6 ? 'B' : 'A');
      } else if (currentPlayer === 'B' && teamB.length < 6) {
        setTeamB(prev => [...prev, pokemon]);
        setCurrentPlayer(teamA.length < 6 ? 'A' : 'B');
      }

      setLastDraw(pokemon);
    } catch (e) {
      setError('Impossible de charger le Pokémon.');
    } finally {
      setLoading(false);
    }
  };

  const handleDraw = () => {
    if (isComplete) return;
    // Si l'équipe courante est déjà pleine, bascule automatiquement
    if (currentPlayer === 'A' && teamA.length >= 6) setCurrentPlayer('B');
    if (currentPlayer === 'B' && teamB.length >= 6) setCurrentPlayer('A');
    fetchRandomPokemon();
  };

  const resetMatch = () => {
    setTeamA([]);
    setTeamB([]);
    setCurrentPlayer('A');
    setLastDraw(null);
    setError('');
  };

  const Team = ({ title, list }) => (
    <div className="team-column">
      <h2 className="team-title">{title}</h2>
      <div className="team-grid">
        {Array.from({ length: 6 }).map((_, idx) => {
          const p = list[idx];
          return (
            <div key={idx} className={`pokemon-slot ${p ? 'filled' : ''}`}>
              {p ? (
                <>
                  <img src={p.sprite} alt={p.name} />
                  <div className="pokemon-info">#{p.id} {p.name}</div>
                </>
              ) : (
                <span style={{ color: '#aaa' }}>—</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div id="wrapper">
      {/* Équipe A - Gauche */}
      <Team title="Dresseur A" list={teamA} />

      {/* Colonne centrale - Actions */}
      <div className="center-column">
        <div className="status-text">
          {isComplete ? 'Draft terminé !' : `Tour du dresseur ${currentPlayer}`}
        </div>
        
        {lastDraw && (
          <div className="last-draw">
            Dernier tirage:<br />
            <strong>#{lastDraw.id} {lastDraw.name}</strong>
          </div>
        )}

        <div
          id="button"
          onClick={loading || isComplete ? undefined : handleDraw}
          style={{ 
            opacity: loading || isComplete ? 0.6 : 1, 
            cursor: loading || isComplete ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'Tirage…' : (isComplete ? 'Draft terminée' : `Tirer pour ${currentPlayer}`)}
        </div>

        <div 
          id="button" 
          onClick={resetMatch}
          style={{ width: '100%', backgroundColor: '#6c757d' }}
        >
          Réinitialiser
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {isComplete && (
          <div className="complete-message">
            Les deux équipes ont 6 Pokémon.<br />
            Comparez et décidez du vainqueur !
          </div>
        )}
      </div>

      {/* Équipe B - Droite */}
      <Team title="Dresseur B" list={teamB} />
    </div>
  );
}



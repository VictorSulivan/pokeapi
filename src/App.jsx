import React, { useState } from 'react';
import '../style.css';

export default function App() {
  const [gameMode, setGameMode] = useState(null); // null, 'normal', 'noDuplicate'
  const [teamA, setTeamA] = useState([]); // { id, name, sprite }
  const [teamB, setTeamB] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('A');
  const [lastDraw, setLastDraw] = useState(null); // { id, name, sprite }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drawnPokemonIds, setDrawnPokemonIds] = useState(new Set()); // Pour mode noDuplicate

  const isComplete = teamA.length === 6 && teamB.length === 6;

  const fetchRandomPokemon = async (attempts = 0) => {
    if (attempts === 0) {
      setLoading(true);
      setError('');
    }

    if (attempts > 50) {
      setError('Impossible de trouver un Pokémon disponible (trop de tentatives).');
      setLoading(false);
      return;
    }

    try {
      const randomNumber = Math.ceil(Math.random() * 150) + 1;
      
      // Mode noDuplicate : vérifier si déjà tiré
      if (gameMode === 'noDuplicate' && drawnPokemonIds.has(randomNumber)) {
        fetchRandomPokemon(attempts + 1);
        return;
      }

      const res = await fetch(`/api/pokemon/${randomNumber}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const pokemon = {
        id: data.id,
        name: data.name,
        sprite: data.sprites.front_default || ''
      };

      // Mode noDuplicate : ajouter à la liste des tirés
      if (gameMode === 'noDuplicate') {
        setDrawnPokemonIds(prev => new Set([...prev, pokemon.id]));
      }

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
    if (isComplete || gameMode === null) return;
    // Si l'équipe courante est déjà pleine, bascule automatiquement
    if (currentPlayer === 'A' && teamA.length >= 6) setCurrentPlayer('B');
    if (currentPlayer === 'B' && teamB.length >= 6) setCurrentPlayer('A');
    fetchRandomPokemon(0);
  };

  const resetMatch = () => {
    setGameMode(null);
    setTeamA([]);
    setTeamB([]);
    setCurrentPlayer('A');
    setLastDraw(null);
    setError('');
    setDrawnPokemonIds(new Set());
  };

  const startGame = (mode) => {
    setGameMode(mode);
    setTeamA([]);
    setTeamB([]);
    setCurrentPlayer('A');
    setLastDraw(null);
    setError('');
    setDrawnPokemonIds(new Set());
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
                <span style={{ color: '#7f8c8d', fontSize: '24px', fontWeight: 'bold' }}>—</span>
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
        {gameMode === null ? (
          <>
            <div className="status-text">Choisir un mode de jeu</div>
            <div className="game-mode-selection">
              <div 
                className="mode-button"
                onClick={() => startGame('normal')}
              >
                <strong>Mode Normal</strong>
                <div className="mode-description">
                  Les Pokémon peuvent être tirés plusieurs fois
                </div>
              </div>
              <div 
                className="mode-button"
                onClick={() => startGame('noDuplicate')}
              >
                <strong>Mode Sans Doublon</strong>
                <div className="mode-description">
                  Chaque Pokémon ne peut être tiré qu'une seule fois
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="status-text">
              {isComplete ? 'Draft terminé !' : `Tour du dresseur ${currentPlayer}`}
              <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                Mode: {gameMode === 'noDuplicate' ? 'Sans Doublon' : 'Normal'}
              </div>
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
          </>
        )}
      </div>

      {/* Équipe B - Droite */}
      <Team title="Dresseur B" list={teamB} />
    </div>
  );
}



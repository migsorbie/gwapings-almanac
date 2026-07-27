import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Trophy, Users, User, ScrollText } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('history');
  
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <header className="bg-blue-900 text-white p-6 shadow-md">
        <h1 className="text-3xl font-bold">Gwapings Fantasy Basketball Almanac</h1>
        <p className="text-blue-200 mt-1">Documenting 19 Seasons of Greatness</p>
      </header>

      <nav className="flex bg-white shadow-sm overflow-x-auto">
        <TabButton id="history" current={activeTab} set={setActiveTab} icon={<Trophy size={18}/>} label="League History" />
        <TabButton id="player" current={activeTab} set={setActiveTab} icon={<User size={18}/>} label="Player Journey" />
      </nav>

      <main className="p-6 max-w-7xl mx-auto">
        {activeTab === 'history' && <LeagueHistory />}
        {activeTab === 'player' && <PlayerSearch />}
      </main>
    </div>
  );
}

function TabButton({ id, current, set, icon, label }) {
  const isActive = current === id;
  return (
    <button 
      onClick={() => set(id)}
      className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${isActive ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
    >
      {icon} {label}
    </button>
  );
}

// --- TAB 1: LEAGUE HISTORY ---
function LeagueHistory() {
  const [champions, setChampions] = useState([]);

  useEffect(() => {
    async function fetchChampions() {
      const { data, error } = await supabase
        .from('seasons')
        .select(`season_year, team_name, reign_number, playoff_result, league, franchises(current_franchise_name)`)
        .eq('is_champion', true)
        .order('season_year', { ascending: false });
      
      if (!error && data) setChampions(data);
    }
    fetchChampions();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Trophy className="text-yellow-500"/> Hall of Champions</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-sm border-b">
              <th className="p-3">Season</th>
              <th className="p-3">League</th>
              <th className="p-3">Champion Team</th>
              <th className="p-3">Franchise</th>
              <th className="p-3">Reign #</th>
            </tr>
          </thead>
          <tbody>
            {champions.map((champ) => (
              <tr key={champ.season_year + champ.league} className="border-b hover:bg-gray-50">
                <td className="p-3 font-semibold">{champ.season_year}</td>
                <td className="p-3">{champ.league}</td>
                <td className="p-3">{champ.team_name}</td>
                <td className="p-3">{champ.franchises?.current_franchise_name}</td>
                <td className="p-3">{champ.reign_number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- TAB 2: PLAYER JOURNEY ---
function PlayerSearch() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('v_player_fantasy_journey')
      .select('*')
      .ilike('player_name', `%${search}%`)
      .order('season_year', { ascending: false });

    if (!error && data) setResults(data);
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Player Journey Search</h2>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input 
          type="text" 
          placeholder="Enter NBA Player Name (e.g. Dwyane Wade)" 
          className="border p-2 rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Search</button>
      </form>

      {loading && <p>Loading stats...</p>}
      
      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-2">Season</th>
                <th className="p-2">Player</th>
                <th className="p-2">NBA Tm</th>
                <th className="p-2">G</th>
                <th className="p-2">MPG</th>
                <th className="p-2">FPPG</th>
                <th className="p-2">Fantasy Team</th>
                <th className="p-2">W-L</th>
                <th className="p-2">GM</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-2">{row.season_year}</td>
                  <td className="p-2 font-bold">{row.player_name}</td>
                  <td className="p-2">{row.nba_team}</td>
                  <td className="p-2">{row.g}</td>
                  <td className="p-2">{row.mpg}</td>
                  <td className="p-2 font-semibold text-blue-700">{row.fppg}</td>
                  <td className="p-2">{row.seasonal_team_name}</td>
                  <td className="p-2">{row.wins}-{row.losses}</td>
                  <td className="p-2 text-gray-500">{row.gms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
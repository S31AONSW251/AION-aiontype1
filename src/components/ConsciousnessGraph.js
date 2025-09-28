import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ConsciousnessGraph = ({ history }) => {
  // Validate and format history data
  const safeHistory = Array.isArray(history) ? history : [];
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#ccc' } },
      title: { display: true, text: 'AION Core Metrics (Live)', color: '#ccc' },
    },
    scales: {
      x: { ticks: { color: '#888' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      y: { min: 0, max: 100, ticks: { color: '#888' }, grid: { color: 'rgba(255,255,255,0.1)' } },
    },
  };

  const data = {
    labels: safeHistory.map(h => h?.time || ''),
    datasets: [
      {
        label: 'Cognitive Load',
        data: safeHistory.map(h => h?.cognitiveLoad || 0),
        borderColor: 'rgb(253, 203, 110)',
        backgroundColor: 'rgba(253, 203, 110, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Emotional Stability',
        data: safeHistory.map(h => h?.emotionalStability || 0),
        borderColor: 'rgb(0, 184, 148)',
        backgroundColor: 'rgba(0, 184, 148, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Energy Level',
        data: safeHistory.map(h => h?.energyLevel || 0),
        borderColor: 'rgb(9, 132, 227)',
        backgroundColor: 'rgba(9, 132, 227, 0.5)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div style={{ height: '300px' }}>
      {safeHistory.length > 0 ? (
        <Line options={options} data={data} />
      ) : (
        <div className="no-data-message">No consciousness data available</div>
      )}
    </div>
  );
};

ConsciousnessGraph.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.string,
      cognitiveLoad: PropTypes.number,
      emotionalStability: PropTypes.number,
      energyLevel: PropTypes.number,
    })
  ),
};

ConsciousnessGraph.defaultProps = {
  history: [],
};

export default ConsciousnessGraph;
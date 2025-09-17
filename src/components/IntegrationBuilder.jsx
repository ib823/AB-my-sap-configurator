import React, { useState } from 'react';
import { Link2, Plus, Trash2, Settings, Database, Cloud, Server, Zap } from 'lucide-react';

export const IntegrationBuilder = ({ packages }) => {
  const [integrations, setIntegrations] = useState([
    { id: 1, source: 'SAP', target: 'Salesforce', type: 'API', complexity: 'Medium', effort: 30 },
    { id: 2, source: 'SAP', target: 'Bank Systems', type: 'File', complexity: 'Simple', effort: 15 },
    { id: 3, source: 'SAP', target: 'MyInvois', type: 'API', complexity: 'Complex', effort: 45 }
  ]);

  const [newIntegration, setNewIntegration] = useState({
    source: '',
    target: '',
    type: 'API',
    complexity: 'Medium'
  });

  const integrationTypes = ['API', 'File Transfer', 'Real-time', 'Batch', 'Event-driven', 'Database'];
  const complexityLevels = ['Simple', 'Medium', 'Complex'];
  
  const effortMap = {
    Simple: { API: 15, 'File Transfer': 10, 'Real-time': 20, Batch: 12, 'Event-driven': 25, Database: 18 },
    Medium: { API: 30, 'File Transfer': 20, 'Real-time': 40, Batch: 25, 'Event-driven': 45, Database: 35 },
    Complex: { API: 50, 'File Transfer': 35, 'Real-time': 65, Batch: 40, 'Event-driven': 70, Database: 55 }
  };

  const addIntegration = () => {
    if (newIntegration.source && newIntegration.target) {
      const effort = effortMap[newIntegration.complexity][newIntegration.type];
      setIntegrations([...integrations, {
        ...newIntegration,
        id: Date.now(),
        effort
      }]);
      setNewIntegration({ source: '', target: '', type: 'API', complexity: 'Medium' });
    }
  };

  const removeIntegration = (id) => {
    setIntegrations(integrations.filter(i => i.id !== id));
  };

  const totalIntegrationEffort = integrations.reduce((sum, i) => sum + i.effort, 0);

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
          Integration Architecture
        </h2>
        <div style={{
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '8px',
          fontWeight: '600'
        }}>
          Total: {totalIntegrationEffort} PD
        </div>
      </div>

      {/* Add Integration Form */}
      <div style={{
        background: '#f7fafc',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: '500' }}>
              Source System
            </label>
            <input
              type="text"
              value={newIntegration.source}
              onChange={(e) => setNewIntegration({ ...newIntegration, source: e.target.value })}
              placeholder="e.g., SAP"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: '500' }}>
              Target System
            </label>
            <input
              type="text"
              value={newIntegration.target}
              onChange={(e) => setNewIntegration({ ...newIntegration, target: e.target.value })}
              placeholder="e.g., Salesforce"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: '500' }}>
              Type
            </label>
            <select
              value={newIntegration.type}
              onChange={(e) => setNewIntegration({ ...newIntegration, type: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {integrationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', fontWeight: '500' }}>
              Complexity
            </label>
            <select
              value={newIntegration.complexity}
              onChange={(e) => setNewIntegration({ ...newIntegration, complexity: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {complexityLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <button
            onClick={addIntegration}
            style={{
              padding: '8px 16px',
              background: '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: '500'
            }}
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </div>

      {/* Integration List */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {integrations.map(integration => (
          <div key={integration.id} style={{
            padding: '15px',
            background: '#f7fafc',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Link2 size={20} style={{ color: '#667eea' }} />
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>
                  {integration.source} → {integration.target}
                </div>
                <div style={{ fontSize: '12px', color: '#718096' }}>
                  {integration.type} • {integration.complexity} • {integration.effort} PD
                </div>
              </div>
            </div>
            <button
              onClick={() => removeIntegration(integration.id)}
              style={{
                padding: '6px',
                background: '#fed7d7',
                color: '#c53030',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Integration Architecture Diagram */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
        borderRadius: '8px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>
          Architecture Overview
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <Server size={40} style={{ color: '#667eea', margin: '0 auto 10px' }} />
            <div style={{ fontWeight: '600', fontSize: '14px' }}>On-Premise</div>
            <div style={{ fontSize: '12px', color: '#718096' }}>SAP Core Systems</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Cloud size={40} style={{ color: '#764ba2', margin: '0 auto 10px' }} />
            <div style={{ fontWeight: '600', fontSize: '14px' }}>Cloud</div>
            <div style={{ fontSize: '12px', color: '#718096' }}>BTP & SaaS</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Database size={40} style={{ color: '#f093fb', margin: '0 auto 10px' }} />
            <div style={{ fontWeight: '600', fontSize: '14px' }}>External</div>
            <div style={{ fontSize: '12px', color: '#718096' }}>Third-party Systems</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationBuilder;

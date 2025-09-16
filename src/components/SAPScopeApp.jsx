import React, { useState, useMemo } from 'react';
import { useApp } from './AppProvider';

function SAPScopeApp() {
  const { state, updatePackage, calculateTotalEffort } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(state.packages.map(p => p.category)));
    return ['all', ...cats];
  }, [state.packages]);

  const filteredPackages = useMemo(() => {
    return state.packages.filter(pkg => {
      const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [state.packages, searchQuery, selectedCategory]);

  const totalEffort = calculateTotalEffort();

  return (
    <div style={{ padding: '24px', fontFamily: '-apple-system, sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '24px' }}>
        SAP Package Selection
      </h1>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <input
          type="text"
          placeholder="Search packages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #e5e5e7',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '10px',
            border: '1px solid #e5e5e7',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredPackages.map(pkg => (
          <div
            key={pkg.id}
            style={{
              border: pkg.selected ? '2px solid #007AFF' : '1px solid #e5e5e7',
              borderRadius: '12px',
              padding: '20px',
              background: pkg.selected ? 'rgba(0,122,255,0.05)' : 'white',
              cursor: 'pointer'
            }}
            onClick={() => updatePackage(pkg.id, { selected: !pkg.selected })}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>{pkg.icon}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{pkg.name}</h3>
                <p style={{ margin: '4px 0 0', color: '#8E8E93', fontSize: '14px' }}>{pkg.description}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{pkg.total_effort_pd} PD</div>
                <div style={{ fontSize: '14px', color: '#8E8E93' }}>SGD ${pkg.sgd_price.toLocaleString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        background: 'white',
        border: '1px solid #e5e5e7',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '14px', color: '#8E8E93', marginBottom: '8px' }}>Total Effort</div>
        <div style={{ fontSize: '24px', fontWeight: '700' }}>{totalEffort} PD</div>
      </div>
    </div>
  );
}

export default SAPScopeApp;

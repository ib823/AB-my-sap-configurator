import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Briefcase, TrendingUp, Award } from 'lucide-react';

export const ResourcePlanner = ({ packages, totals, timeline }) => {
  const [resources, setResources] = useState([
    { id: 1, name: 'Project Manager', role: 'PM', level: 'Senior', allocation: 100, rate: 1200 },
    { id: 2, name: 'Solution Architect', role: 'Architect', level: 'Principal', allocation: 80, rate: 1500 },
    { id: 3, name: 'Finance Consultant', role: 'FI', level: 'Senior', allocation: 100, rate: 1000 },
    { id: 4, name: 'HR Consultant', role: 'HCM', level: 'Senior', allocation: 100, rate: 1000 },
    { id: 5, name: 'Technical Lead', role: 'Technical', level: 'Senior', allocation: 100, rate: 1100 },
    { id: 6, name: 'Integration Specialist', role: 'Integration', level: 'Mid', allocation: 80, rate: 900 },
    { id: 7, name: 'Basis Administrator', role: 'Basis', level: 'Senior', allocation: 60, rate: 950 },
    { id: 8, name: 'Business Analyst', role: 'BA', level: 'Mid', allocation: 100, rate: 800 }
  ]);

  const skillMatrix = {
    'Finance Core': ['FI', 'Architect', 'Technical'],
    'HCM Core': ['HCM', 'Architect', 'Technical'],
    'HCM Localization': ['HCM', 'Technical'],
    'Supply Chain': ['SCM', 'Architect', 'Technical'],
    'Manufacturing': ['PP', 'Architect', 'Technical'],
    'CRM': ['CRM', 'Architect', 'Integration'],
    'Platform': ['Basis', 'Integration', 'Technical'],
    'Analytics': ['BI', 'Technical', 'BA'],
    'Compliance': ['FI', 'HCM', 'Technical']
  };

  const roleRequirements = useMemo(() => {
    const requirements = {};
    const selectedPackages = packages.filter(p => p.selected || p.modules.some(m => m.selected));
    
    selectedPackages.forEach(pkg => {
      const requiredRoles = skillMatrix[pkg.category] || ['Technical'];
      requiredRoles.forEach(role => {
        if (!requirements[role]) requirements[role] = 0;
        requirements[role] += pkg.selected ? 1 : 0.5;
      });
    });
    
    // Always need PM and Architect
    requirements['PM'] = Math.max(requirements['PM'] || 0, 1);
    requirements['Architect'] = Math.max(requirements['Architect'] || 0, 1);
    
    return requirements;
  }, [packages]);

  const teamMetrics = useMemo(() => {
    const totalAllocation = resources.reduce((sum, r) => sum + r.allocation, 0) / 100;
    const totalCost = resources.reduce((sum, r) => sum + (r.rate * r.allocation / 100), 0);
    const duration = Math.ceil(totals.effort / (totalAllocation * 20));
    const totalProjectCost = totalCost * duration * 20;
    
    return {
      teamSize: resources.length,
      effectiveTeam: totalAllocation.toFixed(1),
      dailyRate: totalCost,
      monthlyRate: totalCost * 20,
      duration,
      laborCost: totalProjectCost
    };
  }, [resources, totals]);

  const addResource = () => {
    const newResource = {
      id: Date.now(),
      name: `New Resource ${resources.length + 1}`,
      role: 'Technical',
      level: 'Mid',
      allocation: 100,
      rate: 900
    };
    setResources([...resources, newResource]);
  };

  const updateResource = (id, field, value) => {
    setResources(resources.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const removeResource = (id) => {
    setResources(resources.filter(r => r.id !== id));
  };

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
          Resource Planning
        </h2>
        <button
          onClick={addResource}
          style={{
            padding: '10px 20px',
            background: '#48bb78',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}
        >
          <UserPlus size={18} />
          Add Resource
        </button>
      </div>

      {/* Team Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '8px',
          color: 'white'
        }}>
          <Users size={20} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '20px', fontWeight: '700' }}>{teamMetrics.teamSize}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Team Members</div>
        </div>
        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '8px',
          color: 'white'
        }}>
          <Briefcase size={20} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '20px', fontWeight: '700' }}>{teamMetrics.effectiveTeam}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Effective FTE</div>
        </div>
        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          borderRadius: '8px',
          color: 'white'
        }}>
          <TrendingUp size={20} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '20px', fontWeight: '700' }}>${teamMetrics.dailyRate}</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Daily Rate</div>
        </div>
        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
          borderRadius: '8px',
          color: 'white'
        }}>
          <Award size={20} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '20px', fontWeight: '700' }}>${(teamMetrics.laborCost/1000).toFixed(0)}K</div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Total Labor Cost</div>
        </div>
      </div>

      {/* Skill Requirements */}
      <div style={{
        padding: '15px',
        background: '#f7fafc',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
          Required Skills Based on Selected Packages
        </h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {Object.entries(roleRequirements).map(([role, count]) => (
            <span key={role} style={{
              padding: '6px 12px',
              background: count > 1 ? '#fed7d7' : '#c6f6d5',
              color: count > 1 ? '#c53030' : '#22543d',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: '500'
            }}>
              {role}: {count.toFixed(1)} needed
            </span>
          ))}
        </div>
      </div>

      {/* Resource Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f7fafc' }}>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Role</th>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Level</th>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Allocation %</th>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Daily Rate</th>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(resource => (
              <tr key={resource.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px' }}>
                  <input
                    type="text"
                    value={resource.name}
                    onChange={(e) => updateResource(resource.id, 'name', e.target.value)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      padding: '5px',
                      fontSize: '13px'
                    }}
                  />
                </td>
                <td style={{ padding: '10px' }}>
                  <select
                    value={resource.role}
                    onChange={(e) => updateResource(resource.id, 'role', e.target.value)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      padding: '5px',
                      fontSize: '13px'
                    }}
                  >
                    {['PM', 'Architect', 'FI', 'HCM', 'SCM', 'PP', 'CRM', 'Technical', 'Integration', 'Basis', 'BA', 'BI'].map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '10px' }}>
                  <select
                    value={resource.level}
                    onChange={(e) => updateResource(resource.id, 'level', e.target.value)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      padding: '5px',
                      fontSize: '13px'
                    }}
                  >
                    {['Junior', 'Mid', 'Senior', 'Principal'].map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '10px' }}>
                  <input
                    type="number"
                    value={resource.allocation}
                    onChange={(e) => updateResource(resource.id, 'allocation', parseInt(e.target.value))}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      padding: '5px',
                      fontSize: '13px',
                      width: '70px'
                    }}
                    min="0"
                    max="100"
                  />
                </td>
                <td style={{ padding: '10px' }}>
                  <input
                    type="number"
                    value={resource.rate}
                    onChange={(e) => updateResource(resource.id, 'rate', parseInt(e.target.value))}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      padding: '5px',
                      fontSize: '13px',
                      width: '80px'
                    }}
                  />
                </td>
                <td style={{ padding: '10px' }}>
                  <button
                    onClick={() => removeResource(resource.id)}
                    style={{
                      padding: '5px 10px',
                      background: '#fed7d7',
                      color: '#c53030',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resource Allocation Chart */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#f7fafc',
        borderRadius: '8px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
          Resource Allocation by Role
        </h3>
        <div style={{ display: 'grid', gap: '8px' }}>
          {Object.entries(
            resources.reduce((acc, r) => {
              if (!acc[r.role]) acc[r.role] = 0;
              acc[r.role] += r.allocation / 100;
              return acc;
            }, {})
          ).map(([role, fte]) => (
            <div key={role} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '100px', fontSize: '13px', fontWeight: '500' }}>{role}</span>
              <div style={{ flex: 1, background: '#e2e8f0', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(fte * 100, 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(to right, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '8px',
                  color: 'white',
                  fontSize: '11px'
                }}>
                  {fte.toFixed(1)} FTE
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourcePlanner;

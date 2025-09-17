import React, { useMemo } from 'react';
import { Calendar, Clock, Users, AlertCircle } from 'lucide-react';

export const TimelineGenerator = ({ packages, totals }) => {
  const timeline = useMemo(() => {
    const selectedPackages = packages.filter(p => p.selected || p.modules.some(m => m.selected));
    
    // Group by phases
    const phases = [
      { 
        name: 'Phase 1: Foundation', 
        duration: 2, 
        packages: selectedPackages.filter(p => p.layer === 'core' && p.critical_path),
        color: '#667eea'
      },
      { 
        name: 'Phase 2: Core Modules', 
        duration: 3, 
        packages: selectedPackages.filter(p => p.layer === 'core' && !p.critical_path),
        color: '#764ba2'
      },
      { 
        name: 'Phase 3: Extensions', 
        duration: 2, 
        packages: selectedPackages.filter(p => p.layer === 'supplementary'),
        color: '#f093fb'
      },
      { 
        name: 'Phase 4: Integration', 
        duration: 2, 
        packages: selectedPackages.filter(p => p.layer === 'integration'),
        color: '#f5576c'
      },
      { 
        name: 'Phase 5: Analytics & Optimization', 
        duration: 1, 
        packages: selectedPackages.filter(p => p.layer === 'analytics'),
        color: '#30cfd0'
      },
      { 
        name: 'Phase 6: UAT & Go-Live', 
        duration: 1, 
        packages: [],
        color: '#48bb78'
      }
    ];

    // Calculate cumulative timeline
    let cumulativeMonth = 0;
    return phases.map((phase, index) => {
      const phaseEffort = phase.packages.reduce((sum, pkg) => {
        if (pkg.selected) return sum + pkg.total_effort_pd;
        return sum + pkg.modules.filter(m => m.selected).reduce((mSum, m) => mSum + m.effort_pd, 0);
      }, 0);

      const result = {
        ...phase,
        startMonth: cumulativeMonth,
        endMonth: cumulativeMonth + phase.duration,
        effort: phaseEffort,
        resources: Math.ceil(phaseEffort / (phase.duration * 20))
      };
      
      cumulativeMonth += phase.duration;
      return result;
    }).filter(phase => phase.packages.length > 0 || phase.name.includes('UAT'));
  }, [packages]);

  const totalDuration = timeline.reduce((sum, phase) => sum + phase.duration, 0);
  const peakResources = Math.max(...timeline.map(p => p.resources || 0));

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '20px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: '600' }}>
        Implementation Timeline
      </h2>

      {/* Timeline Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={20} style={{ color: '#667eea' }} />
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>{totalDuration} months</div>
            <div style={{ fontSize: '12px', color: '#718096' }}>Total Duration</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={20} style={{ color: '#f093fb' }} />
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>{peakResources} resources</div>
            <div style={{ fontSize: '12px', color: '#718096' }}>Peak Team Size</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} style={{ color: '#30cfd0' }} />
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>{totals.effort.toFixed(0)} PD</div>
            <div style={{ fontSize: '12px', color: '#718096' }}>Total Effort</div>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div style={{ 
        background: '#f7fafc', 
        borderRadius: '8px', 
        padding: '20px',
        overflowX: 'auto'
      }}>
        <div style={{ minWidth: '600px' }}>
          {/* Month headers */}
          <div style={{ 
            display: 'flex', 
            marginBottom: '10px',
            paddingLeft: '150px'
          }}>
            {Array.from({ length: totalDuration }, (_, i) => (
              <div key={i} style={{
                flex: 1,
                minWidth: '60px',
                textAlign: 'center',
                fontSize: '12px',
                color: '#718096',
                fontWeight: '500'
              }}>
                Month {i + 1}
              </div>
            ))}
          </div>

          {/* Phase bars */}
          {timeline.map((phase, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
              minHeight: '40px'
            }}>
              <div style={{
                width: '150px',
                fontSize: '13px',
                fontWeight: '500',
                paddingRight: '10px'
              }}>
                {phase.name}
              </div>
              <div style={{
                flex: 1,
                display: 'flex',
                position: 'relative'
              }}>
                <div style={{
                  marginLeft: `${(phase.startMonth / totalDuration) * 100}%`,
                  width: `${(phase.duration / totalDuration) * 100}%`,
                  minWidth: '60px'
                }}>
                  <div style={{
                    background: phase.color,
                    height: '35px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '0 8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {phase.effort > 0 && `${phase.effort} PD`}
                    {phase.name.includes('UAT') && 'Testing'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase Details */}
      <div style={{ marginTop: '30px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>
          Phase Breakdown
        </h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {timeline.map((phase, index) => (
            <div key={index} style={{
              padding: '15px',
              background: '#f7fafc',
              borderRadius: '8px',
              borderLeft: `4px solid ${phase.color}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{phase.name}</span>
                <span style={{ fontSize: '13px', color: '#718096' }}>
                  Months {phase.startMonth + 1}-{phase.endMonth}
                </span>
              </div>
              {phase.packages.length > 0 && (
                <div style={{ fontSize: '12px', color: '#4a5568' }}>
                  {phase.packages.map(p => p.name).join(', ')}
                </div>
              )}
              {phase.resources > 0 && (
                <div style={{ marginTop: '5px', fontSize: '12px', color: '#718096' }}>
                  Team Size: {phase.resources} resources • {phase.effort} PD
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineGenerator;

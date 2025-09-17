import React, { useMemo } from 'react';
import { AlertTriangle, Shield, TrendingDown, CheckCircle } from 'lucide-react';

export const RiskAssessment = ({ packages, totals, clientProfile, resources }) => {
  const risks = useMemo(() => {
    const riskList = [];
    
    // Complexity risks
    const layers = new Set(packages.filter(p => p.selected || p.modules.some(m => m.selected)).map(p => p.layer));
    if (layers.size > 3) {
      riskList.push({
        category: 'Technical',
        risk: 'High implementation complexity',
        impact: 'High',
        probability: 'Medium',
        mitigation: 'Implement phased approach with clear integration points'
      });
    }

    // Critical path risks
    const criticalPackages = packages.filter(p => p.critical_path && (p.selected || p.modules.some(m => m.selected)));
    if (criticalPackages.length > 5) {
      riskList.push({
        category: 'Schedule',
        risk: 'Multiple critical path dependencies',
        impact: 'High',
        probability: 'High',
        mitigation: 'Establish parallel workstreams with dedicated teams'
      });
    }

    // Compliance risks
    const compliancePackages = packages.filter(p => p.compliance_critical && (p.selected || p.modules.some(m => m.selected)));
    if (compliancePackages.length > 0 && !packages.find(p => p.id === 'malaysia_myinvois')?.selected) {
      riskList.push({
        category: 'Compliance',
        risk: 'Missing e-invoice compliance (MyInvois)',
        impact: 'High',
        probability: 'High',
        mitigation: 'Implement MyInvois integration before 2025 deadline'
      });
    }

    // Resource risks
    if (totals.effort > 1500) {
      riskList.push({
        category: 'Resource',
        risk: 'Large team coordination challenges',
        impact: 'Medium',
        probability: 'Medium',
        mitigation: 'Implement strong PMO and communication protocols'
      });
    }

    // Integration risks
    const integrationPackages = packages.filter(p => p.layer === 'integration' && (p.selected || p.modules.some(m => m.selected)));
    if (integrationPackages.length > 2) {
      riskList.push({
        category: 'Integration',
        risk: 'Complex integration landscape',
        impact: 'High',
        probability: 'Medium',
        mitigation: 'Design comprehensive integration architecture upfront'
      });
    }

    // Change management risks
    if (clientProfile.client_maturity === 'sap_naive') {
      riskList.push({
        category: 'Change Management',
        risk: 'Limited SAP experience in organization',
        impact: 'High',
        probability: 'High',
        mitigation: 'Extensive training program and change management'
      });
    }

    // Data migration risks
    if (clientProfile.system_landscape !== 'greenfield') {
      riskList.push({
        category: 'Data',
        risk: 'Legacy data migration complexity',
        impact: 'High',
        probability: 'Medium',
        mitigation: 'Early data profiling and cleansing activities'
      });
    }

    return riskList;
  }, [packages, totals, clientProfile]);

  const riskScore = useMemo(() => {
    const impactMap = { Low: 1, Medium: 2, High: 3 };
    const total = risks.reduce((sum, r) => 
      sum + (impactMap[r.impact] * impactMap[r.probability]), 0
    );
    return {
      score: total,
      level: total < 10 ? 'Low' : total < 20 ? 'Medium' : total < 30 ? 'High' : 'Critical'
    };
  }, [risks]);

  const getColorForRisk = (impact, probability) => {
    const score = 
      (impact === 'High' ? 3 : impact === 'Medium' ? 2 : 1) *
      (probability === 'High' ? 3 : probability === 'Medium' ? 2 : 1);
    
    if (score >= 6) return '#e53e3e'; // Red
    if (score >= 3) return '#ed8936'; // Orange
    return '#f6e05e'; // Yellow
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
          Risk Assessment
        </h2>
        <div style={{
          padding: '10px 20px',
          background: riskScore.level === 'Critical' ? '#e53e3e' :
                     riskScore.level === 'High' ? '#ed8936' :
                     riskScore.level === 'Medium' ? '#f6e05e' : '#48bb78',
          color: 'white',
          borderRadius: '8px',
          fontWeight: '600'
        }}>
          Risk Level: {riskScore.level} ({riskScore.score})
        </div>
      </div>

      {/* Risk Matrix */}
      <div style={{
        background: '#f7fafc',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
          Risk Matrix
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: '2px' }}>
          <div></div>
          <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: '500', padding: '5px' }}>Low</div>
          <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: '500', padding: '5px' }}>Medium</div>
          <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: '500', padding: '5px' }}>High</div>
          
          {['High', 'Medium', 'Low'].map(impact => (
            <React.Fragment key={impact}>
              <div style={{ fontSize: '12px', fontWeight: '500', padding: '5px' }}>{impact}</div>
              {['Low', 'Medium', 'High'].map(probability => {
                const count = risks.filter(r => r.impact === impact && r.probability === probability).length;
                return (
                  <div key={`${impact}-${probability}`} style={{
                    background: getColorForRisk(impact, probability),
                    opacity: count > 0 ? 1 : 0.3,
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '20px',
                    borderRadius: '4px'
                  }}>
                    {count > 0 ? count : ''}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
          <div></div>
          <div style={{ gridColumn: 'span 3', textAlign: 'center', fontSize: '11px', marginTop: '5px', color: '#718096' }}>
            Probability →
          </div>
        </div>
        <div style={{ writingMode: 'vertical-rl', position: 'absolute', left: '10px', fontSize: '11px', color: '#718096' }}>
          Impact ↑
        </div>
      </div>

      {/* Risk List */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {risks.map((risk, index) => (
          <div key={index} style={{
            padding: '20px',
            background: '#f7fafc',
            borderRadius: '8px',
            borderLeft: `4px solid ${getColorForRisk(risk.impact, risk.probability)}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} style={{ color: getColorForRisk(risk.impact, risk.probability) }} />
                <span style={{ fontWeight: '600', fontSize: '16px' }}>{risk.risk}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  padding: '4px 8px',
                  background: risk.impact === 'High' ? '#fed7d7' : risk.impact === 'Medium' ? '#feebc8' : '#c6f6d5',
                  color: risk.impact === 'High' ? '#c53030' : risk.impact === 'Medium' ? '#c05621' : '#22543d',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>
                  Impact: {risk.impact}
                </span>
                <span style={{
                  padding: '4px 8px',
                  background: risk.probability === 'High' ? '#fed7d7' : risk.probability === 'Medium' ? '#feebc8' : '#c6f6d5',
                  color: risk.probability === 'High' ? '#c53030' : risk.probability === 'Medium' ? '#c05621' : '#22543d',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>
                  Probability: {risk.probability}
                </span>
                <span style={{
                  padding: '4px 8px',
                  background: '#e6f6ff',
                  color: '#0969da',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>
                  {risk.category}
                </span>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#4a5568', marginBottom: '10px' }}>
              <Shield size={14} style={{ display: 'inline', marginRight: '5px', color: '#48bb78' }} />
              <strong>Mitigation:</strong> {risk.mitigation}
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
        borderRadius: '8px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>
          Risk Mitigation Recommendations
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px', fontSize: '14px' }}>
            Establish dedicated risk management office with weekly reviews
          </li>
          <li style={{ marginBottom: '8px', fontSize: '14px' }}>
            Implement early prototyping for high-risk modules
          </li>
          <li style={{ marginBottom: '8px', fontSize: '14px' }}>
            Maintain 15% contingency buffer for timeline and budget
          </li>
          <li style={{ marginBottom: '8px', fontSize: '14px' }}>
            Engage third-party quality assurance for critical milestones
          </li>
          <li style={{ marginBottom: '8px', fontSize: '14px' }}>
            Create detailed fallback plans for each high-impact risk
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RiskAssessment;

import React, { useMemo } from 'react';
import { DollarSign, PieChart, TrendingUp, Calculator, CreditCard } from 'lucide-react';

export const BudgetBreakdown = ({ packages, totals, resources, clientProfile }) => {
  const breakdown = useMemo(() => {
    // Software licensing
    const softwareCost = totals.cost;
    
    // Labor costs (from resources)
    const laborRate = resources ? 
      resources.reduce((sum, r) => sum + (r.rate * r.allocation / 100), 0) : 
      8000; // Default team rate
    const duration = Math.ceil(totals.effort / 20);
    const laborCost = laborRate * duration * 20;
    
    // Infrastructure (15% of software)
    const infrastructureCost = softwareCost * 0.15;
    
    // Training (5% of total)
    const trainingCost = softwareCost * 0.05;
    
    // Contingency (15% of total)
    const subtotal = softwareCost + laborCost + infrastructureCost + trainingCost;
    const contingency = subtotal * 0.15;
    
    // Support & maintenance (annual - 20% of software)
    const annualSupport = softwareCost * 0.20;
    
    const total = subtotal + contingency;
    
    return {
      software: softwareCost,
      labor: laborCost,
      infrastructure: infrastructureCost,
      training: trainingCost,
      contingency: contingency,
      subtotal: subtotal,
      total: total,
      annualSupport: annualSupport,
      duration: duration
    };
  }, [packages, totals, resources, clientProfile]);

  const paymentSchedule = useMemo(() => {
    const phases = [
      { phase: 'Contract Signing', percentage: 20, timing: 'Month 0' },
      { phase: 'Blueprint Completion', percentage: 20, timing: 'Month 2' },
      { phase: 'Development Completion', percentage: 25, timing: 'Month 4' },
      { phase: 'UAT Completion', percentage: 20, timing: 'Month 6' },
      { phase: 'Go-Live', percentage: 10, timing: 'Month 7' },
      { phase: 'Post Go-Live Support', percentage: 5, timing: 'Month 8' }
    ];
    
    return phases.map(p => ({
      ...p,
      amount: breakdown.total * p.percentage / 100
    }));
  }, [breakdown]);

  const getCategoryBreakdown = useMemo(() => {
    const categoryTotals = {};
    
    packages.forEach(pkg => {
      if (pkg.selected || pkg.modules.some(m => m.selected)) {
        if (!categoryTotals[pkg.category]) {
          categoryTotals[pkg.category] = 0;
        }
        
        if (pkg.selected) {
          categoryTotals[pkg.category] += pkg.sgd_price;
        } else {
          const selectedModules = pkg.modules.filter(m => m.selected);
          categoryTotals[pkg.category] += (selectedModules.length / pkg.modules.length) * pkg.sgd_price;
        }
      }
    });
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / breakdown.software * 100).toFixed(1)
    }));
  }, [packages, breakdown]);

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
          Budget Breakdown
        </h2>
        <div style={{
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
          color: 'white',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '18px'
        }}>
          Total: SGD ${breakdown.total.toLocaleString()}
        </div>
      </div>

      {/* Cost Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
          borderRadius: '8px',
          borderLeft: '4px solid #667eea'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <CreditCard size={20} style={{ color: '#667eea' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#4a5568' }}>Software Licensing</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c' }}>
            ${breakdown.software.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>
            {((breakdown.software / breakdown.total) * 100).toFixed(1)}% of total
          </div>
        </div>

        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%)',
          borderRadius: '8px',
          borderLeft: '4px solid #f093fb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Calculator size={20} style={{ color: '#f093fb' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#4a5568' }}>Implementation Labor</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c' }}>
            ${breakdown.labor.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>
            {breakdown.duration} months @ ${(breakdown.labor / breakdown.duration / 1000).toFixed(0)}K/month
          </div>
        </div>

        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #fa709a15 0%, #fee14015 100%)',
          borderRadius: '8px',
          borderLeft: '4px solid #fa709a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <PieChart size={20} style={{ color: '#fa709a' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#4a5568' }}>Infrastructure</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c' }}>
            ${breakdown.infrastructure.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>
            Hardware & cloud services
          </div>
        </div>

        <div style={{
          padding: '15px',
          background: 'linear-gradient(135deg, #30cfd015 0%, #33086715 100%)',
          borderRadius: '8px',
          borderLeft: '4px solid #30cfd0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <TrendingUp size={20} style={{ color: '#30cfd0' }} />
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#4a5568' }}>Training & Change</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c' }}>
            ${breakdown.training.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px' }}>
            User enablement program
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div style={{
        padding: '20px',
        background: '#f7fafc',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
          Software Cost by Category
        </h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {getCategoryBreakdown.map((cat, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ width: '150px', fontSize: '13px', fontWeight: '500' }}>{cat.category}</span>
              <div style={{ flex: 1, background: '#e2e8f0', borderRadius: '4px', height: '24px', overflow: 'hidden' }}>
                <div style={{
                  width: `${cat.percentage}%`,
                  height: '100%',
                  background: `linear-gradient(to right, #667eea, #764ba2)`,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '8px',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>
                  {cat.percentage}%
                </div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', minWidth: '80px', textAlign: 'right' }}>
                ${(cat.amount / 1000).toFixed(0)}K
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Schedule */}
      <div style={{
        padding: '20px',
        background: '#f7fafc',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
          Payment Schedule
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Milestone</th>
              <th style={{ padding: '10px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Timing</th>
              <th style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: '600' }}>%</th>
              <th style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: '600' }}>Amount (SGD)</th>
            </tr>
          </thead>
          <tbody>
            {paymentSchedule.map((payment, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px', fontSize: '13px' }}>{payment.phase}</td>
                <td style={{ padding: '10px', fontSize: '13px', color: '#718096' }}>{payment.timing}</td>
                <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px' }}>{payment.percentage}%</td>
                <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: '600' }}>
                  ${payment.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Summary */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '8px',
        color: 'white'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>
          Total Investment Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
          <span>Software Licensing:</span>
          <span style={{ textAlign: 'right', fontWeight: '600' }}>${breakdown.software.toLocaleString()}</span>
          
          <span>Implementation Services:</span>
          <span style={{ textAlign: 'right', fontWeight: '600' }}>${breakdown.labor.toLocaleString()}</span>
          
          <span>Infrastructure & Hardware:</span>
          <span style={{ textAlign: 'right', fontWeight: '600' }}>${breakdown.infrastructure.toLocaleString()}</span>
          
          <span>Training & Change Management:</span>
          <span style={{ textAlign: 'right', fontWeight: '600' }}>${breakdown.training.toLocaleString()}</span>
          
          <span>Contingency (15%):</span>
          <span style={{ textAlign: 'right', fontWeight: '600' }}>${breakdown.contingency.toLocaleString()}</span>
          
          <div style={{ gridColumn: 'span 2', borderTop: '2px solid rgba(255,255,255,0.3)', margin: '10px 0' }}></div>
          
          <span style={{ fontSize: '20px', fontWeight: '700' }}>Total Project Investment:</span>
          <span style={{ textAlign: 'right', fontSize: '20px', fontWeight: '700' }}>
            SGD ${breakdown.total.toLocaleString()}
          </span>
          
          <div style={{ gridColumn: 'span 2', marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}>
            <div style={{ fontSize: '13px', marginBottom: '5px' }}>
              + Annual Support & Maintenance: SGD ${breakdown.annualSupport.toLocaleString()}/year
            </div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>
              3-Year TCO: SGD ${(breakdown.total + breakdown.annualSupport * 3).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetBreakdown;

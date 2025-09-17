export class PDFReportGenerator {
  static generateReport(packages, totals, clientProfile, timeline) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SAP Implementation Proposal - ${clientProfile.company_name}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
          }
          h1 { margin: 0 0 10px 0; font-size: 32px; }
          h2 { 
            color: #667eea; 
            border-bottom: 2px solid #667eea; 
            padding-bottom: 10px;
            margin-top: 30px;
          }
          .executive-summary {
            background: #f7fafc;
            padding: 20px;
            border-left: 4px solid #667eea;
            margin: 20px 0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin: 20px 0;
          }
          .stat-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
          }
          .stat-label {
            font-size: 12px;
            color: #718096;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th {
            background: #667eea;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
          }
          tr:nth-child(even) {
            background: #f7fafc;
          }
          .package-section {
            margin: 20px 0;
            padding: 20px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            page-break-inside: avoid;
          }
          .timeline-bar {
            height: 30px;
            background: linear-gradient(to right, #667eea, #764ba2);
            border-radius: 15px;
            margin: 10px 0;
            position: relative;
            color: white;
            display: flex;
            align-items: center;
            padding: 0 15px;
            font-size: 12px;
          }
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #718096;
            font-size: 12px;
          }
          .risk-matrix {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin: 20px 0;
          }
          .risk-item {
            padding: 10px;
            border-radius: 6px;
            font-size: 13px;
          }
          .risk-high { background: #fed7d7; color: #742a2a; }
          .risk-medium { background: #feebc8; color: #744210; }
          .risk-low { background: #c6f6d5; color: #22543d; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SAP Implementation Proposal</h1>
          <p style="margin: 0; opacity: 0.9;">
            ${clientProfile.company_name || 'Client Company'} | ${new Date().toLocaleDateString()}
          </p>
          <p style="margin: 5px 0 0; opacity: 0.9;">
            Prepared by: ABeam Consulting
          </p>
        </div>

        <div class="executive-summary">
          <h3 style="margin-top: 0;">Executive Summary</h3>
          <p>
            This proposal outlines a comprehensive SAP implementation strategy tailored for 
            ${clientProfile.company_name || 'your organization'}. The solution encompasses 
            ${totals.packageCount} packages with ${totals.moduleCount} modules, 
            requiring an investment of SGD ${totals.cost.toLocaleString()} over 
            ${Math.ceil(totals.effort / 20)} months.
          </p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${totals.packageCount}</div>
            <div class="stat-label">Packages</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${totals.moduleCount}</div>
            <div class="stat-label">Modules</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${totals.effort.toFixed(0)}</div>
            <div class="stat-label">Person Days</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">$${(totals.cost/1000).toFixed(0)}K</div>
            <div class="stat-label">Investment (SGD)</div>
          </div>
        </div>

        <h2>Selected Packages</h2>
        <table>
          <thead>
            <tr>
              <th>Package</th>
              <th>Category</th>
              <th>Modules</th>
              <th>Effort (PD)</th>
              <th>Cost (SGD)</th>
            </tr>
          </thead>
          <tbody>
            ${packages
              .filter(p => p.selected || p.modules.some(m => m.selected))
              .map(p => `
                <tr>
                  <td><strong>${p.name}</strong></td>
                  <td>${p.category}</td>
                  <td>${p.selected ? p.modules.length : p.modules.filter(m => m.selected).length}/${p.modules.length}</td>
                  <td>${p.selected ? p.total_effort_pd : p.modules.filter(m => m.selected).reduce((s, m) => s + m.effort_pd, 0)}</td>
                  <td>$${p.selected ? p.sgd_price.toLocaleString() : Math.round(p.sgd_price * p.modules.filter(m => m.selected).length / p.modules.length).toLocaleString()}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>

        <h2>Implementation Timeline</h2>
        <p>The implementation follows a phased approach optimizing resource allocation and risk management:</p>
        ${timeline ? timeline.map(phase => `
          <div class="timeline-bar">
            ${phase.name} • ${phase.duration} months • ${phase.effort || 0} PD
          </div>
        `).join('') : '<p>Timeline generation pending...</p>'}

        <h2>Risk Assessment</h2>
        <div class="risk-matrix">
          <div class="risk-item risk-low">
            <strong>Low Risk:</strong> Standard implementation with proven methodologies
          </div>
          <div class="risk-item risk-medium">
            <strong>Medium Risk:</strong> Integration complexity requires careful planning
          </div>
          <div class="risk-item risk-high">
            <strong>High Risk:</strong> Change management and user adoption critical
          </div>
        </div>

        <h2>Malaysia Compliance</h2>
        <p>This implementation includes full compliance with Malaysian regulations:</p>
        <ul>
          <li>EPF, SOCSO, EIS statutory deductions</li>
          <li>PCB tax calculations and submissions</li>
          <li>SST configuration and returns</li>
          <li>MyInvois/DRC e-invoice integration</li>
          <li>Bank Negara reporting requirements</li>
        </ul>

        <h2>Next Steps</h2>
        <ol>
          <li>Review and approve the proposed scope</li>
          <li>Finalize project timeline and resource allocation</li>
          <li>Sign project charter and agreements</li>
          <li>Initiate project kickoff and team mobilization</li>
          <li>Begin Phase 1: Foundation implementation</li>
        </ol>

        <div class="footer">
          <p>
            © ${new Date().getFullYear()} ABeam Consulting Ltd. All rights reserved.<br>
            This proposal is confidential and proprietary.
          </p>
        </div>
      </body>
      </html>
    `;

    return htmlContent;
  }

  static downloadPDF(packages, totals, clientProfile, timeline) {
    const htmlContent = this.generateReport(packages, totals, clientProfile, timeline);
    
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
    
    // Wait for content to load then print
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      
      // Remove iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 100);
    };
  }
}

export default PDFReportGenerator;

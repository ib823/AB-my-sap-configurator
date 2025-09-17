import jsPDF from 'jspdf';
import 'jspdf-autotable';

export class RealPDFGenerator {
  static generatePDF(packages, totals, clientProfile, timeline) {
    const doc = new jsPDF();
    
    // Add header with gradient background effect
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('SAP Implementation Proposal', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(clientProfile.company_name || 'Client Company', 105, 30, { align: 'center' });
    doc.text(new Date().toLocaleDateString(), 105, 36, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Executive Summary Box
    doc.setFillColor(247, 250, 252);
    doc.rect(10, 50, 190, 45, 'F');
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.rect(10, 50, 190, 45);
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Executive Summary', 15, 60);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const summaryText = `This proposal outlines a comprehensive SAP implementation strategy for ${clientProfile.company_name || 'your organization'}. 
The solution encompasses ${totals.packageCount} packages with ${totals.moduleCount} modules, requiring an investment of 
SGD ${totals.cost.toLocaleString()} over ${Math.ceil(totals.effort / 20)} months. The implementation will be delivered by ABeam Consulting 
with proven methodologies and Malaysia-specific expertise.`;
    
    const splitText = doc.splitTextToSize(summaryText, 180);
    doc.text(splitText, 15, 70);
    
    // Key Metrics
    let yPos = 105;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Project Metrics', 15, yPos);
    
    yPos += 10;
    doc.autoTable({
      startY: yPos,
      head: [['Metric', 'Value', 'Notes']],
      body: [
        ['Total Packages', totals.packageCount.toString(), 'Selected for implementation'],
        ['Total Modules', totals.moduleCount.toString(), 'Across all packages'],
        ['Total Effort', `${totals.effort.toFixed(1)} PD`, 'Person Days'],
        ['Duration', `${Math.ceil(totals.effort / 20)} months`, 'Estimated timeline'],
        ['Software Cost', `SGD ${totals.cost.toLocaleString()}`, 'Licensing fees'],
        ['Total Investment', `SGD ${(totals.cost * 2.85).toLocaleString()}`, 'Including services']
      ],
      theme: 'striped',
      headStyles: { fillColor: [102, 126, 234] },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 10 }
    });
    
    // Add new page for packages
    doc.addPage();
    
    // Packages header
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Selected Packages', 105, 13, { align: 'center' });
    
    // Reset colors
    doc.setTextColor(0, 0, 0);
    
    // Packages table
    const packageData = packages
      .filter(p => p.selected || p.modules.some(m => m.selected))
      .map(p => [
        p.name,
        p.category,
        p.selected ? p.total_effort_pd.toFixed(1) : p.modules.filter(m => m.selected).reduce((sum, m) => sum + m.effort_pd, 0).toFixed(1),
        `SGD ${(p.selected ? p.sgd_price : Math.round(p.sgd_price * p.modules.filter(m => m.selected).length / p.modules.length)).toLocaleString()}`,
        p.selected ? 'Full' : 'Partial'
      ]);
    
    doc.autoTable({
      startY: 30,
      head: [['Package', 'Category', 'Effort (PD)', 'Cost', 'Selection']],
      body: packageData,
      theme: 'grid',
      headStyles: { fillColor: [102, 126, 234] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 25, halign: 'center' }
      }
    });
    
    // Add timeline if available
    if (timeline && timeline.length > 0) {
      const finalY = doc.previousAutoTable.finalY || 100;
      
      if (finalY > 200) {
        doc.addPage();
        yPos = 30;
      } else {
        yPos = finalY + 15;
      }
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Implementation Timeline', 15, yPos);
      
      yPos += 10;
      
      const timelineData = timeline.map(phase => [
        phase.name,
        `${phase.duration} months`,
        `Month ${phase.startMonth + 1}-${phase.endMonth}`,
        phase.effort ? `${phase.effort} PD` : '-'
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Phase', 'Duration', 'Timeline', 'Effort']],
        body: timelineData,
        theme: 'striped',
        headStyles: { fillColor: [102, 126, 234] },
        styles: { fontSize: 10 }
      });
    }
    
    // Add footer to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
      doc.text('© 2024 ABeam Consulting Ltd. - Confidential', 15, 285);
    }
    
    // Save the PDF
    doc.save(`SAP_Proposal_${clientProfile.company_name || 'Client'}_${new Date().toISOString().split('T')[0]}.pdf`);
  }
  
  static generateDetailedPDF(packages, totals, clientProfile, timeline, resources, risks) {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Cover page
    this.addCoverPage(doc, clientProfile, totals);
    
    // Table of contents
    doc.addPage();
    this.addTableOfContents(doc);
    
    // Executive summary
    doc.addPage();
    this.addExecutiveSummary(doc, clientProfile, totals);
    
    // Packages details
    doc.addPage();
    this.addPackagesSection(doc, packages);
    
    // Timeline
    doc.addPage();
    this.addTimelineSection(doc, timeline);
    
    // Resources
    if (resources && resources.length > 0) {
      doc.addPage();
      this.addResourcesSection(doc, resources);
    }
    
    // Risk assessment
    if (risks && risks.length > 0) {
      doc.addPage();
      this.addRiskSection(doc, risks);
    }
    
    // Add page numbers
    this.addPageNumbers(doc);
    
    doc.save(`SAP_Detailed_Proposal_${clientProfile.company_name || 'Client'}_${new Date().toISOString().split('T')[0]}.pdf`);
  }
  
  static addCoverPage(doc, clientProfile, totals) {
    // Gradient background effect
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 210, 297, 'F');
    
    // White box for content
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20, 50, 170, 180, 5, 5, 'F');
    
    // Logo placeholder
    doc.setFillColor(118, 75, 162);
    doc.circle(105, 80, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('ABeam', 105, 83, { align: 'center' });
    
    // Title
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('SAP Implementation', 105, 120, { align: 'center' });
    doc.text('Proposal', 105, 135, { align: 'center' });
    
    // Client name
    doc.setFontSize(20);
    doc.setFont(undefined, 'normal');
    doc.text(clientProfile.company_name || 'Your Company', 105, 160, { align: 'center' });
    
    // Key metrics box
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(2);
    doc.line(40, 175, 170, 175);
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    const metrics = [
      `${totals.packageCount} Packages`,
      `${totals.effort.toFixed(0)} Person Days`,
      `${Math.ceil(totals.effort / 20)} Months`,
      `SGD ${(totals.cost / 1000).toFixed(0)}K`
    ];
    
    metrics.forEach((metric, index) => {
      doc.text(metric, 55 + (index % 2) * 70, 190 + Math.floor(index / 2) * 15);
    });
    
    // Date
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 105, 220, { align: 'center' });
    
    // Footer
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Building Beyond As One', 105, 270, { align: 'center' });
  }
  
  static addTableOfContents(doc) {
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Table of Contents', 15, 30);
    
    const sections = [
      { title: '1. Executive Summary', page: 3 },
      { title: '2. Selected Packages', page: 4 },
      { title: '3. Implementation Timeline', page: 5 },
      { title: '4. Resource Planning', page: 6 },
      { title: '5. Risk Assessment', page: 7 },
      { title: '6. Budget Breakdown', page: 8 },
      { title: '7. Next Steps', page: 9 }
    ];
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    sections.forEach((section, index) => {
      const yPos = 50 + index * 10;
      doc.text(section.title, 20, yPos);
      doc.text(section.page.toString(), 180, yPos, { align: 'right' });
      
      // Dotted line
      doc.setLineDash([1, 1]);
      doc.line(80, yPos - 2, 175, yPos - 2);
      doc.setLineDash([]);
    });
  }
  
  static addExecutiveSummary(doc, clientProfile, totals) {
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Executive Summary', 15, 30);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    const summary = [
      `ABeam Consulting is pleased to present this comprehensive SAP implementation proposal for ${clientProfile.company_name || 'your organization'}.`,
      '',
      'Project Scope:',
      `• ${totals.packageCount} SAP packages selected for implementation`,
      `• ${totals.moduleCount} modules across core business functions`,
      `• Full Malaysia regulatory compliance including SST, EPF, SOCSO, and MyInvois`,
      '',
      'Investment Summary:',
      `• Software Licensing: SGD ${totals.cost.toLocaleString()}`,
      `• Implementation Services: SGD ${(totals.cost * 1.5).toLocaleString()}`,
      `• Total Investment: SGD ${(totals.cost * 2.85).toLocaleString()}`,
      '',
      'Timeline:',
      `• Duration: ${Math.ceil(totals.effort / 20)} months`,
      `• Effort: ${totals.effort.toFixed(1)} person days`,
      `• Go-live: ${new Date(Date.now() + Math.ceil(totals.effort / 20) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
      '',
      'Key Benefits:',
      '• Streamlined business processes',
      '• Real-time reporting and analytics',
      '• Enhanced regulatory compliance',
      '• Improved operational efficiency',
      '• Scalable platform for growth'
    ];
    
    let yPos = 45;
    summary.forEach(line => {
      if (line.startsWith('•')) {
        doc.text(line, 25, yPos);
      } else if (line.includes(':') && !line.startsWith('•')) {
        doc.setFont(undefined, 'bold');
        doc.text(line, 15, yPos);
        doc.setFont(undefined, 'normal');
      } else {
        doc.text(line, 15, yPos);
      }
      yPos += 7;
    });
  }
  
  static addPackagesSection(doc, packages) {
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Selected Packages', 15, 30);
    
    const selectedPackages = packages.filter(p => p.selected || p.modules.some(m => m.selected));
    
    let yPos = 45;
    selectedPackages.forEach(pkg => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }
      
      // Package header
      doc.setFillColor(247, 250, 252);
      doc.rect(15, yPos - 5, 180, 10, 'F');
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`${pkg.icon} ${pkg.name}`, 20, yPos);
      
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(pkg.description, 20, yPos);
      
      yPos += 8;
      doc.setFontSize(9);
      doc.text(`Category: ${pkg.category} | Effort: ${pkg.total_effort_pd} PD | Cost: SGD ${pkg.sgd_price.toLocaleString()}`, 20, yPos);
      
      yPos += 12;
    });
  }
  
  static addTimelineSection(doc, timeline) {
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Implementation Timeline', 15, 30);
    
    if (!timeline || timeline.length === 0) {
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text('Timeline will be finalized during project initiation phase.', 15, 45);
      return;
    }
    
    // Timeline visualization
    const startY = 50;
    const barHeight = 15;
    const monthWidth = 15;
    const totalMonths = Math.max(...timeline.map(p => p.endMonth));
    
    // Month headers
    doc.setFontSize(9);
    for (let i = 0; i <= totalMonths; i++) {
      doc.text(`M${i + 1}`, 40 + i * monthWidth, startY - 5);
    }
    
    // Phase bars
    timeline.forEach((phase, index) => {
      const yPos = startY + index * (barHeight + 5);
      const xStart = 40 + phase.startMonth * monthWidth;
      const width = phase.duration * monthWidth;
      
      // Bar
      doc.setFillColor(102 + index * 20, 126 + index * 10, 234 - index * 20);
      doc.rect(xStart, yPos, width, barHeight, 'F');
      
      // Label
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(phase.name, xStart + 2, yPos + 9);
      
      doc.setTextColor(0, 0, 0);
    });
  }
  
  static addResourcesSection(doc, resources) {
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Resource Planning', 15, 30);
    
    const resourceData = resources.map(r => [
      r.name,
      r.role,
      r.level,
      `${r.allocation}%`,
      `SGD ${r.rate}/day`
    ]);
    
    doc.autoTable({
      startY: 45,
      head: [['Name', 'Role', 'Level', 'Allocation', 'Rate']],
      body: resourceData,
      theme: 'striped',
      headStyles: { fillColor: [102, 126, 234] },
      styles: { fontSize: 10 }
    });
  }
  
  static addRiskSection(doc, risks) {
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Risk Assessment', 15, 30);
    
    const riskData = risks.map(r => [
      r.risk,
      r.category,
      r.impact,
      r.probability,
      r.mitigation
    ]);
    
    doc.autoTable({
      startY: 45,
      head: [['Risk', 'Category', 'Impact', 'Probability', 'Mitigation']],
      body: riskData,
      theme: 'grid',
      headStyles: { fillColor: [234, 102, 102] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 50 },
        4: { cellWidth: 60 }
      }
    });
  }
  
  static addPageNumbers(doc) {
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      
      // Skip page numbers on cover page
      if (i > 1) {
        doc.text(`Page ${i - 1} of ${pageCount - 1}`, 105, 285, { align: 'center' });
      }
      
      doc.text('© 2024 ABeam Consulting Ltd. - Confidential', 15, 285);
      doc.text(new Date().toLocaleDateString(), 195, 285, { align: 'right' });
    }
  }
}

export default RealPDFGenerator;

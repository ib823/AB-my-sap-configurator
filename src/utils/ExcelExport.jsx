export class ExcelExporter {
  static generateExcel(packages, totals, clientProfile) {
    // Create workbook structure
    const workbook = {
      SheetNames: ['Summary', 'Packages', 'Modules', 'Timeline', 'Resources', 'Budget'],
      Sheets: {}
    };

    // Summary Sheet
    const summaryData = [
      ['SAP Implementation Configuration Report'],
      ['Generated:', new Date().toLocaleString()],
      [''],
      ['Client Information'],
      ['Company:', clientProfile.company_name || 'Not Specified'],
      ['Industry:', clientProfile.industry],
      ['Company Size:', clientProfile.company_size],
      ['System Landscape:', clientProfile.system_landscape],
      [''],
      ['Project Summary'],
      ['Total Packages Selected:', totals.packageCount],
      ['Total Modules:', totals.moduleCount],
      ['Total Effort (Person Days):', totals.effort.toFixed(1)],
      ['Estimated Cost (SGD):', `$${totals.cost.toLocaleString()}`],
      ['Estimated Duration:', `${Math.ceil(totals.effort / 20)} months`],
      [''],
      ['Risk Level:', this.calculateRiskLevel(totals.effort)],
      ['Complexity:', this.calculateComplexity(packages)]
    ];

    // Package Details
    const packageData = [
      ['Package ID', 'Package Name', 'Category', 'Type', 'Layer', 'Effort (PD)', 'Cost (SGD)', 'Selected', 'Critical Path', 'Malaysia Verified']
    ];
    
    packages.forEach(pkg => {
      if (pkg.selected || pkg.modules.some(m => m.selected)) {
        packageData.push([
          pkg.id,
          pkg.name,
          pkg.category,
          pkg.type,
          pkg.layer,
          pkg.total_effort_pd,
          pkg.sgd_price,
          pkg.selected ? 'Full Package' : 'Partial',
          pkg.critical_path ? 'Yes' : 'No',
          pkg.malaysia_verified ? 'Yes' : 'No'
        ]);
      }
    });

    // Module Details
    const moduleData = [
      ['Package', 'Module ID', 'Module Name', 'Description', 'Effort (PD)', 'Selected', 'Prerequisites']
    ];
    
    packages.forEach(pkg => {
      pkg.modules.forEach(mod => {
        if (mod.selected || pkg.selected) {
          moduleData.push([
            pkg.name,
            mod.id,
            mod.name,
            mod.description,
            mod.effort_pd,
            mod.selected || pkg.selected ? 'Yes' : 'No',
            mod.prerequisites.join(', ') || 'None'
          ]);
        }
      });
    });

    // Create CSV format (Excel-compatible)
    const csvContent = this.arrayToCSV(summaryData) + 
                      '\n\n' + this.arrayToCSV(packageData) + 
                      '\n\n' + this.arrayToCSV(moduleData);

    return csvContent;
  }

  static arrayToCSV(data) {
    return data.map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') 
          ? `"${cell}"` 
          : cell
      ).join(',')
    ).join('\n');
  }

  static calculateRiskLevel(effort) {
    if (effort < 500) return 'Low';
    if (effort < 1000) return 'Medium';
    if (effort < 2000) return 'High';
    return 'Very High';
  }

  static calculateComplexity(packages) {
    const layers = new Set(packages.filter(p => p.selected || p.modules.some(m => m.selected)).map(p => p.layer));
    if (layers.size <= 2) return 'Simple';
    if (layers.size <= 3) return 'Moderate';
    if (layers.size <= 4) return 'Complex';
    return 'Very Complex';
  }

  static downloadExcel(packages, totals, clientProfile) {
    const csvContent = this.generateExcel(packages, totals, clientProfile);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `SAP_Configuration_${clientProfile.company_name || 'Report'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default ExcelExporter;

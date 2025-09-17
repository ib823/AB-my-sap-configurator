export class DataManager {
  // Export configuration to JSON
  static exportConfiguration(packages, clientProfile, integrations, resources, malaysiaForms) {
    const exportData = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      clientProfile,
      packages: packages.filter(p => p.selected || p.modules.some(m => m.selected)),
      integrations,
      resources,
      malaysiaForms: malaysiaForms.filter(f => f.selected),
      metadata: {
        totalPackages: packages.filter(p => p.selected).length,
        totalModules: packages.reduce((sum, p) => {
          if (p.selected) return sum + p.modules.length;
          return sum + p.modules.filter(m => m.selected).length;
        }, 0),
        totalEffort: packages.reduce((sum, p) => {
          if (p.selected) return sum + p.total_effort_pd;
          return sum + p.modules.filter(m => m.selected).reduce((s, m) => s + m.effort_pd, 0);
        }, 0)
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAP_Config_${clientProfile.company_name || 'Export'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import configuration from JSON
  static importConfiguration(jsonData, setPackages, setClientProfile, setIntegrations, setResources, setMalaysiaForms) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      if (data.clientProfile) {
        setClientProfile(data.clientProfile);
      }
      
      if (data.packages) {
        setPackages(prev => prev.map(pkg => {
          const imported = data.packages.find(p => p.id === pkg.id);
          if (imported) {
            return {
              ...pkg,
              selected: imported.selected,
              modules: pkg.modules.map(mod => {
                const importedMod = imported.modules.find(m => m.id === mod.id);
                return importedMod ? { ...mod, selected: importedMod.selected } : mod;
              })
            };
          }
          return pkg;
        }));
      }
      
      if (data.integrations) {
        setIntegrations(data.integrations);
      }
      
      if (data.resources) {
        setResources(data.resources);
      }
      
      if (data.malaysiaForms) {
        setMalaysiaForms(prev => prev.map(form => {
          const imported = data.malaysiaForms.find(f => f.id === form.id);
          return imported ? { ...form, selected: imported.selected } : form;
        }));
      }
      
      return { success: true, message: 'Configuration imported successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to import configuration: ' + error.message };
    }
  }

  // Generate unique configuration ID
  static generateConfigId() {
    return `CONFIG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Validate configuration data
  static validateConfiguration(data) {
    const errors = [];
    
    if (!data.version) errors.push('Missing version information');
    if (!data.timestamp) errors.push('Missing timestamp');
    if (!data.packages || !Array.isArray(data.packages)) errors.push('Invalid packages data');
    if (!data.clientProfile) errors.push('Missing client profile');
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default DataManager;

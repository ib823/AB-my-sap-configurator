export class DependencyValidator {
  static validatePackageSelection(packages, packageId, action = 'select') {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return { valid: false, errors: ['Package not found'], warnings: [] };

    const errors = [];
    const warnings = [];
    const selectedPackageIds = packages.filter(p => p.selected).map(p => p.id);

    if (action === 'select') {
      // Check prerequisites
      pkg.prerequisites.forEach(prereqId => {
        if (!selectedPackageIds.includes(prereqId)) {
          const prereqPkg = packages.find(p => p.id === prereqId);
          errors.push({
            type: 'missing_prerequisite',
            message: `Requires "${prereqPkg?.name}" to be selected first`,
            packageId: prereqId
          });
        }
      });

      // Check for recommended packages
      if (pkg.category === 'HCM Localization' && !selectedPackageIds.includes('core_hr')) {
        warnings.push({
          type: 'recommended',
          message: 'Recommended to select "Core HR" package',
          packageId: 'core_hr'
        });
      }

      // Check for critical path dependencies
      if (pkg.critical_path) {
        const criticalDeps = packages.filter(p => 
          p.critical_path && 
          p.layer === 'core' && 
          p.id !== packageId &&
          !selectedPackageIds.includes(p.id)
        );
        
        if (criticalDeps.length > 0) {
          warnings.push({
            type: 'critical_path',
            message: `Consider selecting other critical path packages: ${criticalDeps.map(p => p.name).join(', ')}`,
            packages: criticalDeps.map(p => p.id)
          });
        }
      }
    } else if (action === 'deselect') {
      // Check if other packages depend on this
      const dependentPackages = packages.filter(p => 
        p.selected && 
        p.prerequisites.includes(packageId)
      );

      if (dependentPackages.length > 0) {
        errors.push({
          type: 'has_dependents',
          message: `Cannot deselect. Required by: ${dependentPackages.map(p => p.name).join(', ')}`,
          packages: dependentPackages.map(p => p.id)
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateModuleSelection(pkg, moduleId, packages) {
    const module = pkg.modules.find(m => m.id === moduleId);
    if (!module) return { valid: false, errors: ['Module not found'], warnings: [] };

    const errors = [];
    const warnings = [];
    const selectedModuleIds = pkg.modules.filter(m => m.selected).map(m => m.id);

    // Check module prerequisites
    module.prerequisites.forEach(prereqId => {
      if (!selectedModuleIds.includes(prereqId)) {
        const prereqModule = pkg.modules.find(m => m.id === prereqId);
        errors.push({
          type: 'missing_module_prerequisite',
          message: `Requires module "${prereqModule?.name}" first`,
          moduleId: prereqId
        });
      }
    });

    // Check cross-package dependencies
    if (pkg.prerequisites.length > 0) {
      const missingPackages = pkg.prerequisites.filter(prereqId => 
        !packages.find(p => p.id === prereqId)?.selected
      );
      
      if (missingPackages.length > 0) {
        warnings.push({
          type: 'package_prerequisite',
          message: `Package requires: ${missingPackages.join(', ')}`,
          packages: missingPackages
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  static getImplementationOrder(packages) {
    const selected = packages.filter(p => p.selected || p.modules.some(m => m.selected));
    const ordered = [];
    const visited = new Set();

    const visit = (pkgId) => {
      if (visited.has(pkgId)) return;
      const pkg = selected.find(p => p.id === pkgId);
      if (!pkg) return;

      visited.add(pkgId);
      pkg.prerequisites.forEach(prereq => visit(prereq));
      ordered.push(pkg);
    };

    selected.forEach(pkg => visit(pkg.id));
    return ordered;
  }

  static generateDependencyGraph(packages) {
    const nodes = packages.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      selected: p.selected
    }));

    const edges = [];
    packages.forEach(pkg => {
      pkg.prerequisites.forEach(prereq => {
        edges.push({
          source: prereq,
          target: pkg.id,
          type: 'requires'
        });
      });
    });

    return { nodes, edges };
  }
}

export default DependencyValidator;

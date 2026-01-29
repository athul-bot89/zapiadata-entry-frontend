import React, { useState, useEffect } from 'react';

const TreeSelector = ({ 
  treeData, 
  onDataChange, 
  requiredRoot = true,
  title = "Configure Points Categories",
  instructions = "Select the categories where you want to offer points."
}) => {
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [nodeData, setNodeData] = useState({});
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));

  // Notify parent component of data changes
  useEffect(() => {
    if (onDataChange) {
      const filledTree = buildFilledTree();
      const isValid = !requiredRoot || (selectedNodes.has('root') && nodeData['root']?.no_of_points);
      onDataChange({
        data: filledTree,
        isValid: isValid,
        selectedCount: selectedNodes.size,
        hasRootConfigured: selectedNodes.has('root') && nodeData['root']?.no_of_points
      });
    }
  }, [selectedNodes, nodeData]);

  // Toggle node selection
  const toggleNodeSelection = (nodePath) => {
    const newSelectedNodes = new Set(selectedNodes);
    if (newSelectedNodes.has(nodePath)) {
      newSelectedNodes.delete(nodePath);
      // Remove node data when deselected
      const newNodeData = { ...nodeData };
      delete newNodeData[nodePath];
      setNodeData(newNodeData);
    } else {
      newSelectedNodes.add(nodePath);
      // Initialize node data with default values
      if (!nodeData[nodePath]) {
        setNodeData({
          ...nodeData,
          [nodePath]: {
            no_of_points: '',
            min_condition: '',
            max_condition: '',
            ismajor: false,
            conditions: []
          }
        });
      }
    }
    setSelectedNodes(newSelectedNodes);
  };

  // Toggle node expansion in tree view
  const toggleNodeExpansion = (nodePath) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(nodePath)) {
      newExpandedNodes.delete(nodePath);
    } else {
      newExpandedNodes.add(nodePath);
    }
    setExpandedNodes(newExpandedNodes);
  };

  // Update node data
  const updateNodeData = (nodePath, field, value) => {
    setNodeData(prevData => ({
      ...prevData,
      [nodePath]: {
        ...prevData[nodePath],
        [field]: value
      }
    }));
  };

  // Build the complete tree with user-filled data
  const buildFilledTree = () => {
    const fillNode = (node, path = '') => {
      const currentPath = path ? `${path}.${node.name}` : node.name;
      const filledNode = { ...node };
      
      // Apply user-filled data if this node was selected
      if (selectedNodes.has(currentPath) && nodeData[currentPath]) {
        Object.assign(filledNode, nodeData[currentPath]);
      }
      
      // Recursively fill categories
      if (node.categories) {
        filledNode.categories = node.categories.map(cat => 
          fillNode(cat, currentPath)
        );
      }
      
      // Recursively fill subcategories
      if (node.subcategories) {
        filledNode.subcategories = node.subcategories.map(subcat => 
          fillNode(subcat, currentPath)
        );
      }
      
      // Recursively fill services
      if (node.services) {
        filledNode.services = node.services.map(service => 
          fillNode(service, currentPath)
        );
      }
      
      return filledNode;
    };
    
    return fillNode(treeData);
  };

  // Render a tree node recursively
  const renderTreeNode = (node, path = '', level = 0) => {
    const currentPath = path ? `${path}.${node.name}` : node.name;
    const isSelected = selectedNodes.has(currentPath);
    const isExpanded = expandedNodes.has(currentPath);
    const hasChildren = node.categories?.length > 0 || 
                       node.subcategories?.length > 0 || 
                       node.services?.length > 0;
    
    return (
      <div key={currentPath} className="mb-2">
        <div 
          className={`flex items-start p-3 rounded-lg transition-all duration-200 ${
            isSelected ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
          }`}
          style={{ marginLeft: `${level * 24}px` }}
        >
          {/* Expand/Collapse button */}
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleNodeExpansion(currentPath)}
              className="mr-2 text-gray-400 hover:text-gray-600 transition-transform duration-200"
              style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          
          {/* Checkbox for selection */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleNodeSelection(currentPath)}
            className="mr-3 mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          
          {/* Node name and type */}
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2">
              <span className="font-medium text-gray-800">
                {node.name}
              </span>
              {currentPath === 'root' && requiredRoot && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <svg className="-ml-0.5 mr-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Required
                </span>
              )}
              {level > 0 && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  path.includes('services') ? 'bg-green-100 text-green-700' : 
                  path.includes('subcategories') ? 'bg-orange-100 text-orange-700' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                  {path.includes('services') ? '🎯 Service' : 
                   path.includes('subcategories') ? '📁 Subcategory' : 
                   '📂 Category'}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Show input fields if node is selected */}
        {isSelected && nodeData[currentPath] && (
          <div className="ml-6 mt-3 p-4 bg-gradient-to-br from-white to-blue-50 border border-blue-200 rounded-lg shadow-sm"
               style={{ marginLeft: `${(level * 24) + 48}px` }}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-xs font-semibold text-gray-700 mb-2">
                  <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Points Awarded
                </label>
                <input
                  type="number"
                  value={nodeData[currentPath].no_of_points || ''}
                  onChange={(e) => updateNodeData(currentPath, 'no_of_points', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 10"
                />
              </div>
              
              <div>
                <label className="flex items-center text-xs font-semibold text-gray-700 mb-2">
                  <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Min Amount (₹)
                </label>
                <input
                  type="number"
                  value={nodeData[currentPath].min_condition || ''}
                  onChange={(e) => updateNodeData(currentPath, 'min_condition', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 100"
                />
              </div>
              
              <div>
                <label className="flex items-center text-xs font-semibold text-gray-700 mb-2">
                  <svg className="w-3 h-3 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Max Amount (₹)
                </label>
                <input
                  type="number"
                  value={nodeData[currentPath].max_condition || ''}
                  onChange={(e) => updateNodeData(currentPath, 'max_condition', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 10000"
                />
              </div>
              
              <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id={`${currentPath}-major`}
                    checked={nodeData[currentPath].ismajor || false}
                    onChange={(e) => updateNodeData(currentPath, 'ismajor', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Major Category</span>
                </label>
              </div>
            </div>
          </div>
        )}
        
        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <div className="mt-1">
            {node.categories?.map(cat => renderTreeNode(cat, currentPath, level + 1))}
            {node.subcategories?.map(subcat => renderTreeNode(subcat, currentPath, level + 1))}
            {node.services?.map(service => renderTreeNode(service, currentPath, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="border-b border-gray-100 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-2 mr-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-500">Select and configure categories</p>
            </div>
          </div>
          <div className="flex items-center bg-purple-50 px-4 py-2 rounded-full">
            <svg className="w-4 h-4 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-purple-700">{selectedNodes.size} Selected</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">
              <p className="font-semibold text-amber-900 mb-1">Quick Guide:</p>
              <p className="text-amber-800">{instructions}</p>
              {requiredRoot && (
                <p className="text-amber-800 mt-1">
                  • The <span className="font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">root node</span> is mandatory and sets default points
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-[450px] overflow-y-auto custom-scrollbar">
          {renderTreeNode(treeData)}
        </div>
      </div>
      
      {/* Warning if root is required but not configured */}
      {requiredRoot && (!selectedNodes.has('root') || !nodeData['root']?.no_of_points) && (
        <div className="border-t border-gray-100 p-4 bg-red-50">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">
              Please select and configure the root node with points before submitting.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeSelector;
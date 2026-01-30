import React, { useState, useEffect } from 'react';

// Custom styles for animations and scrollbar
const customStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: linear-gradient(to bottom, #f3f4f6, #e5e7eb);
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #3b82f6, #6366f1);
    border-radius: 10px;
    border: 2px solid #f3f4f6;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #2563eb, #4f46e5);
  }
`;

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
            conditions: ['']
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
    setNodeData(prevData => {
      const updatedNode = {
        ...prevData[nodePath],
        [field]: value
      };
      
      // Automatically set ismajor to true if any field has a value, false otherwise
      const hasValues = updatedNode.no_of_points || 
                       updatedNode.min_condition || 
                       updatedNode.max_condition || 
                       (updatedNode.conditions && updatedNode.conditions.some(c => c && c.trim() !== ''));
      
      updatedNode.ismajor = hasValues ? true : false;
      
      return {
        ...prevData,
        [nodePath]: updatedNode
      };
    });
  };

  // Add a new condition to a node
  const addCondition = (nodePath) => {
    setNodeData(prevData => {
      const currentConditions = prevData[nodePath]?.conditions || [];
      return {
        ...prevData,
        [nodePath]: {
          ...prevData[nodePath],
          conditions: [...currentConditions, '']
        }
      };
    });
  };

  // Update a specific condition
  const updateCondition = (nodePath, index, value) => {
    setNodeData(prevData => {
      const currentConditions = [...(prevData[nodePath]?.conditions || [])];
      currentConditions[index] = value;
      
      const updatedNode = {
        ...prevData[nodePath],
        conditions: currentConditions
      };
      
      // Automatically set ismajor to true if any field has a value, false otherwise
      const hasValues = updatedNode.no_of_points || 
                       updatedNode.min_condition || 
                       updatedNode.max_condition || 
                       (updatedNode.conditions && updatedNode.conditions.some(c => c && c.trim() !== ''));
      
      updatedNode.ismajor = hasValues ? true : false;
      
      return {
        ...prevData,
        [nodePath]: updatedNode
      };
    });
  };

  // Remove a specific condition
  const removeCondition = (nodePath, index) => {
    setNodeData(prevData => {
      const currentConditions = [...(prevData[nodePath]?.conditions || [])];
      currentConditions.splice(index, 1);
      
      const updatedNode = {
        ...prevData[nodePath],
        conditions: currentConditions
      };
      
      // Automatically set ismajor to true if any field has a value, false otherwise
      const hasValues = updatedNode.no_of_points || 
                       updatedNode.min_condition || 
                       updatedNode.max_condition || 
                       (updatedNode.conditions && updatedNode.conditions.some(c => c && c.trim() !== ''));
      
      updatedNode.ismajor = hasValues ? true : false;
      
      return {
        ...prevData,
        [nodePath]: updatedNode
      };
    });
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
      <div key={currentPath} className="mb-3">
        <div 
          className={`flex items-start p-4 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${
            isSelected 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-2 border-blue-400 transform scale-[1.02]' 
              : 'bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 border-2 border-gray-200 hover:border-blue-300'
          }`}
          style={{ marginLeft: `${level * 28}px` }}
        >
          {/* Expand/Collapse button */}
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleNodeExpansion(currentPath)}
              className={`mr-3 p-1 rounded-lg transition-all duration-300 ${
                isSelected 
                  ? 'text-white hover:bg-white/20' 
                  : 'text-gray-500 hover:bg-blue-100 hover:text-blue-600'
              }`}
              style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          
          {/* Checkbox for selection */}
          <div className="mr-3 mt-0.5">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleNodeSelection(currentPath)}
              className={`w-5 h-5 rounded-md cursor-pointer transition-all ${
                isSelected 
                  ? 'bg-white text-blue-600 border-2 border-white focus:ring-2 focus:ring-white/50' 
                  : 'text-blue-600 border-2 border-gray-300 hover:border-blue-500 focus:ring-2 focus:ring-blue-500'
              }`}
            />
          </div>
          
          {/* Node name and type */}
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2">
              <span className={`font-semibold text-lg ${
                isSelected ? 'text-white' : 'text-gray-800'
              }`}>
                {node.name}
              </span>
              {currentPath === 'root' && requiredRoot && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
                }`}>
                  <svg className="-ml-0.5 mr-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Required
                </span>
              )}
              {level > 0 && (
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : path.includes('services') 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300' 
                      : path.includes('subcategories') 
                        ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-300' 
                        : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-300'
                }`}>
                  {path.includes('services') ? '🎯 Service' : 
                   path.includes('subcategories') ? '📁 Subcategory' : 
                   '📂 Category'}
                </span>
              )}
              {isSelected && nodeData[currentPath]?.no_of_points && (
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-white/20 text-white text-xs font-bold">
                  ⭐ {nodeData[currentPath].no_of_points} pts
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Show input fields if node is selected */}
        {isSelected && nodeData[currentPath] && (
          <div className="ml-6 mt-4 p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-xl shadow-lg animate-fadeIn"
               style={{ marginLeft: `${(level * 28) + 56}px` }}>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 mr-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  Points Awarded
                </label>
                <input
                  type="number"
                  value={nodeData[currentPath].no_of_points || ''}
                  onChange={(e) => updateNodeData(currentPath, 'no_of_points', e.target.value)}
                  className="w-full px-4 py-3 text-sm font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors bg-white"
                  placeholder="e.g., 10"
                />
              </div>
              
              <div>
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 mr-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Min Amount (₹)
                </label>
                <input
                  type="number"
                  value={nodeData[currentPath].min_condition || ''}
                  onChange={(e) => updateNodeData(currentPath, 'min_condition', e.target.value)}
                  className="w-full px-4 py-3 text-sm font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-400 transition-colors bg-white"
                  placeholder="e.g., 100"
                />
              </div>
              
              <div>
                <label className="flex items-center text-sm font-bold text-gray-800 mb-2">
                  <div className="w-6 h-6 mr-2 bg-gradient-to-r from-red-400 to-pink-400 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Max Amount (₹)
                </label>
                <input
                  type="number"
                  value={nodeData[currentPath].max_condition || ''}
                  onChange={(e) => updateNodeData(currentPath, 'max_condition', e.target.value)}
                  className="w-full px-4 py-3 text-sm font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-red-400 transition-colors bg-white"
                  placeholder="e.g., 10000"
                />
              </div>
              
              <div className="flex items-center">
                {nodeData[currentPath].ismajor && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-green-700">Active</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Conditions Section */}
            <div className="col-span-2 mt-5 pt-5 border-t-2 border-gray-200">
              <label className="flex items-center text-sm font-bold text-gray-800 mb-3">
                <div className="w-6 h-6 mr-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                Conditions
              </label>
              
              <div className="space-y-3">
                {(nodeData[currentPath].conditions || ['']).map((condition, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <span className="text-sm font-bold text-gray-500 w-6">{index + 1}.</span>
                    <input
                      type="text"
                      value={condition}
                      onChange={(e) => updateCondition(currentPath, index, e.target.value)}
                      className="flex-1 px-4 py-3 text-sm font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400 transition-colors bg-white"
                      placeholder={`Enter condition ${index + 1}`}
                    />
                    {(nodeData[currentPath].conditions?.length || 1) > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCondition(currentPath, index)}
                        className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Remove condition"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addCondition(currentPath)}
                  className="mt-3 flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Condition
                </button>
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
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:shadow-xl transition-shadow duration-300">
        <div className="border-b-2 border-gray-200 p-6 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full p-3 mr-4 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-600 font-medium">Select and configure categories for point allocation</p>
            </div>
          </div>
          <div className="flex items-center bg-gradient-to-r from-purple-100 to-indigo-100 px-5 py-3 rounded-full border-2 border-purple-300 shadow-md">
            <svg className="w-5 h-5 text-purple-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-base font-bold text-purple-800">{selectedNodes.size} Selected</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6 p-5 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-xl shadow-md">
          <div className="flex items-start">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm">
              <p className="font-bold text-amber-900 mb-2 text-base">Quick Guide:</p>
              <p className="text-amber-800 font-medium">{instructions}</p>
              {requiredRoot && (
                <p className="text-amber-800 mt-2 flex items-center">
                  <span className="mr-2 text-lg">•</span>
                  The <span className="font-bold bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 px-3 py-1 rounded-md mx-1 border border-purple-300">root node</span> is mandatory and sets default points
                </p>
              )}
              <div className="mt-3 flex items-center space-x-4 text-xs text-amber-700">
                <span className="flex items-center"><span className="text-lg mr-1">📂</span> Click checkbox to select</span>
                <span className="flex items-center"><span className="text-lg mr-1">▶</span> Click arrow to expand</span>
                <span className="flex items-center"><span className="text-lg mr-1">⭐</span> Configure points for each</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-300 rounded-xl p-5 max-h-[500px] overflow-y-auto custom-scrollbar shadow-inner">
          {renderTreeNode(treeData)}
        </div>
      </div>
      
      {/* Warning if root is required but not configured */}
      {requiredRoot && (!selectedNodes.has('root') || !nodeData['root']?.no_of_points) && (
        <div className="border-t-2 border-red-200 p-5 bg-gradient-to-r from-red-50 to-pink-50">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mr-3 shadow-md animate-pulse">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-bold text-red-800">
              ⚠️ Please select and configure the root node with points before submitting.
            </p>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default TreeSelector;
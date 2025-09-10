// KnowledgePanel.js - Improved version
import React, { useState, useMemo } from 'react';

// A simple modal component for confirmations
const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
    <div className="modal-backdrop">
        <div className="modal-content">
            <p>{message}</p>
            <div className="modal-actions">
                <button onClick={onCancel} className="modal-button cancel">Cancel</button>
                <button onClick={onConfirm} className="modal-button confirm">Confirm</button>
            </div>
        </div>
    </div>
);

// The main, enhanced Knowledge Panel
const KnowledgePanel = ({ soulState, setActiveTab, onAdd, onUpdate, onDelete }) => {
    // State for managing UI interactivity
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('key_asc');
    const [editingKey, setEditingKey] = useState(null);
    const [editingValue, setEditingValue] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    const [itemToDelete, setItemToDelete] = useState(null);
    const [formErrors, setFormErrors] = useState({}); // NEW: For form validation

    // Validate form function
    const validateForm = (key, value) => {
        const errors = {};
        if (!key.trim()) errors.key = 'Key is required';
        if (!value.trim()) errors.value = 'Value is required';
        if (key.length > 50) errors.key = 'Key must be less than 50 characters';
        return errors;
    };

    // Memoized filtering and sorting for performance
    const filteredAndSortedKnowledge = useMemo(() => {
        return Object.entries(soulState.knowledgeBase || {})
            .filter(([key, data]) => {
                const valueStr = String((data && data.value) || '').toLowerCase();
                return key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    valueStr.includes(searchTerm.toLowerCase());
            })
            .sort((a, b) => {
                const [keyA, dataA] = a;
                const [keyB, dataB] = b;
                switch (sortOption) {
                    case 'key_asc':
                        return keyA.localeCompare(keyB);
                    case 'key_desc':
                        return keyB.localeCompare(keyA);
                    case 'date_new':
                        return new Date(dataB?.timestamp || 0) - new Date(dataA?.timestamp || 0);
                    case 'date_old':
                        return new Date(dataA?.timestamp || 0) - new Date(dataB?.timestamp || 0);
                    default:
                        return 0;
                }
            });
    }, [soulState.knowledgeBase, searchTerm, sortOption]);

    // Handlers for editing
    const handleEditStart = (key, currentValue) => {
        setEditingKey(key);
        setEditingValue(currentValue);
        setFormErrors({}); // Clear errors when starting edit
    };

    const handleEditCancel = () => {
        setEditingKey(null);
        setEditingValue('');
        setFormErrors({});
    };

    const handleEditSave = () => {
        const errors = validateForm(editingKey, editingValue);
        if (Object.keys(errors).length === 0) {
            onUpdate(editingKey, editingValue.trim());
            handleEditCancel();
        } else {
            setFormErrors(errors);
        }
    };

    // Handlers for adding new knowledge
    const handleAdd = (e) => {
        e.preventDefault();
        const errors = validateForm(newKey, newValue);
        if (Object.keys(errors).length === 0) {
            onAdd(newKey.trim(), newValue.trim());
            setNewKey('');
            setNewValue('');
            setShowAddForm(false);
            setFormErrors({});
        } else {
            setFormErrors(errors);
        }
    };
    
    // Handlers for deletion
    const handleDeleteRequest = (key) => {
        setItemToDelete(key);
    };

    const confirmDelete = () => {
        if(itemToDelete) {
            onDelete(itemToDelete);
            setItemToDelete(null);
        }
    };

    return (
        <div className="knowledge-panel">
            {itemToDelete && (
                <ConfirmationModal 
                    message={`Are you sure you want to delete the knowledge item "${itemToDelete}"?`}
                    onConfirm={confirmDelete}
                    onCancel={() => setItemToDelete(null)}
                />
            )}
            <div className="knowledge-header">
                <h3>AION's Knowledge Base</h3>
                <div className="header-actions">
                    {/* 🧠 Add New Fact Button */}
                    <button 
                        className="add-knowledge-btn" 
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            setFormErrors({});
                        }}
                        aria-expanded={showAddForm}
                    >
                        {showAddForm ? 'Cancel' : 'Add New Fact'}
                    </button>
                    <button className="back-button" onClick={() => setActiveTab("chat")}>
                        <i className="icon-arrow-left"></i> Back to Chat
                    </button>
                </div>
            </div>

            {/* 🧠 Add New Fact Form */}
            {showAddForm && (
                <div className="add-knowledge-form agent-card">
                    <form onSubmit={handleAdd}>
                        <input 
                            type="text" 
                            placeholder="Key (e.g., 'My Birthday')" 
                            value={newKey} 
                            onChange={(e) => setNewKey(e.target.value)} 
                            required 
                            aria-invalid={!!formErrors.key}
                            aria-describedby={formErrors.key ? "key-error" : undefined}
                        />
                        {formErrors.key && <span id="key-error" className="error-text">{formErrors.key}</span>}
                        <textarea 
                            placeholder="Value (e.g., 'is on October 26th')" 
                            value={newValue} 
                            onChange={(e) => setNewValue(e.target.value)} 
                            required 
                            aria-invalid={!!formErrors.value}
                            aria-describedby={formErrors.value ? "value-error" : undefined}
                        />
                        {formErrors.value && <span id="value-error" className="error-text">{formErrors.value}</span>}
                        <button type="submit">Save Knowledge</button>
                    </form>
                </div>
            )}
            
            <div className="knowledge-description">
                <p>
                    This is what I have learned and stored. You can manage my knowledge directly here.
                </p>
            </div>
            
            {/* 🔍 Search and Sort Controls */}
            <div className="knowledge-controls agent-card">
                <input
                    type="text"
                    placeholder="Search knowledge..."
                    className="knowledge-search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search knowledge base"
                />
                <select 
                    className="knowledge-sort" 
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value)}
                    aria-label="Sort knowledge by"
                >
                    <option value="key_asc">Sort by Key (A-Z)</option>
                    <option value="key_desc">Sort by Key (Z-A)</option>
                    <option value="date_new">Sort by Date (Newest)</option>
                    <option value="date_old">Sort by Date (Oldest)</option>
                </select>
            </div>

            <div className="knowledge-list">
                {filteredAndSortedKnowledge.length > 0 ? (
                    filteredAndSortedKnowledge.map(([key, data]) => (
                        <div key={key} className="knowledge-item agent-card">
                             {editingKey === key ? (
                                <div className="knowledge-edit-view">
                                    <strong>{key}:</strong>
                                    <textarea 
                                        value={editingValue} 
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        aria-label={`Edit value for ${key}`}
                                    />
                                    <div className="knowledge-actions">
                                        <button className="action-button save" onClick={handleEditSave}>Save</button>
                                        <button className="action-button" onClick={handleEditCancel}>Cancel</button>
                                    </div>
                                </div>
                             ) : (
                                <div className="knowledge-display-view">
                                    <div className="knowledge-content">
                                        <div className="knowledge-key"><strong>{key}:</strong></div>
                                        <div className="knowledge-value">{String(data.value)}</div>
                                    </div>
                                    <div className="knowledge-meta">
                                        <div className="knowledge-time">Learned: {data?.timestamp ? new Date(data.timestamp).toLocaleString() : 'Unknown'}</div>
                                        <div className="knowledge-actions">
                                            <button 
                                                className="action-button" 
                                                onClick={() => handleEditStart(key, data.value)}
                                                aria-label={`Edit ${key}`}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="action-button delete" 
                                                onClick={() => handleDeleteRequest(key)}
                                                aria-label={`Delete ${key}`}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                             )}
                        </div>
                    ))
                ) : (
                    <div className="agent-card">
                        <p>
                            {searchTerm 
                                ? `No knowledge found matching "${searchTerm}". Try a different search term.`
                                : "No knowledge found. Teach me something new!"
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KnowledgePanel;
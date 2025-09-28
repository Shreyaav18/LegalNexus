import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, User, Calendar, FileText, TrendingUp } from 'lucide-react';

const CasePriorityDashboard = () => {
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    const mockCases = [
      {
        id: 1,
        case_number: 'LN2024000001',
        title: 'Personal Injury Claim - Car Accident',
        client_name: 'John Doe',
        assigned_lawyer_name: 'Sarah Johnson',
        priority_level: 1,
        urgency_score: 95,
        status: 'investigation',
        deadline: '2024-01-15T10:00:00Z',
        days_until_deadline: -2,
        is_overdue: true,
        case_type: 'personal_injury',
        priority_factors: ['Overdue', 'High priority level', 'Urgent case type']
      },
      {
        id: 2,
        case_number: 'LN2024000002',
        title: 'Criminal Defense - Theft Charges',
        client_name: 'Jane Smith',
        assigned_lawyer_name: 'Michael Brown',
        priority_level: 1,
        urgency_score: 88,
        status: 'hearing',
        deadline: '2024-01-20T14:00:00Z',
        days_until_deadline: 3,
        is_overdue: false,
        case_type: 'criminal',
        priority_factors: ['Due this week', 'High priority level', 'Urgent case type']
      },
      {
        id: 3,
        case_number: 'LN2024000003',
        title: 'Contract Dispute - Business Partnership',
        client_name: 'ABC Corp',
        assigned_lawyer_name: null,
        priority_level: 2,
        urgency_score: 72,
        status: 'filed',
        deadline: '2024-02-01T12:00:00Z',
        days_until_deadline: 14,
        is_overdue: false,
        case_type: 'corporate',
        priority_factors: ['High priority level', 'Important client', 'Needs assignment']
      },
      {
        id: 4,
        case_number: 'LN2024000004',
        title: 'Family Law - Child Custody',
        client_name: 'Robert Wilson',
        assigned_lawyer_name: 'Emily Davis',
        priority_level: 3,
        urgency_score: 65,
        status: 'investigation',
        deadline: '2024-02-15T16:00:00Z',
        days_until_deadline: 28,
        is_overdue: false,
        case_type: 'family',
        priority_factors: ['Due this month']
      }
    ];

    const mockStats = {
      total_cases: 156,
      critical_cases: 12,
      high_priority_cases: 34,
      overdue_cases: 8,
      due_this_week: 15,
      urgent_cases: 23,
      average_urgency_score: 58.2
    };

    setTimeout(() => {
      setCases(mockCases);
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  }, []);

  const getPriorityColor = (priorityLevel, urgencyScore) => {
    if (urgencyScore >= 90) return 'text-red-600 bg-red-50 border-red-200';
    if (urgencyScore >= 70) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (urgencyScore >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getPriorityLabel = (priorityLevel) => {
    const labels = {
      1: 'Critical',
      2: 'High',
      3: 'Medium',
      4: 'Low',
      5: 'Routine'
    };
    return labels[priorityLevel] || 'Unknown';
  };

  const getUrgencyLevel = (score) => {
    if (score >= 90) return 'CRITICAL';
    if (score >= 70) return 'HIGH';
    if (score >= 50) return 'MEDIUM';
    if (score >= 30) return 'LOW';
    return 'ROUTINE';
  };

  const filteredCases = cases.filter(cases => {
    switch(filter) {
      case 'overdue': return cases.is_overdue;
      case 'critical': return cases.urgency_score >= 90;
      case 'unassigned': return !cases.assigned_lawyer_name;
      case 'due_soon': return cases.days_until_deadline <= 7 && !cases.is_overdue;
      default: return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading case priorities...</p>
        </div>
      </div>
    );  
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Case Priority Dashboard</h1>
          <p className="text-gray-600">Monitor and manage case priorities in real-time</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cases</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_cases}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Cases</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical_cases}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Cases</p>
                <p className="text-2xl font-bold text-orange-600">{stats.overdue_cases}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Priority Score</p>
                <p className="text-2xl font-bold text-green-600">{stats.average_urgency_score?.toFixed(1)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Cases ({cases.length})
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'overdue' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Overdue ({cases.filter(c => c.is_overdue).length})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'critical' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Critical ({cases.filter(c => c.urgency_score >= 90).length})
            </button>
            <button
              onClick={() => setFilter('unassigned')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unassigned' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unassigned ({cases.filter(c => !c.assigned_lawyer_name).length})
            </button>
            <button
              onClick={() => setFilter('due_soon')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'due_soon' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Due Soon ({cases.filter(c => c.days_until_deadline <= 7 && !c.is_overdue).length})
            </button>
          </div>
        </div>

        {/* Cases List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Prioritized Cases ({filteredCases.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredCases.map((case_item) => (
              <div key={case_item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Case Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(case_item.priority_level, case_item.urgency_score)}`}>
                        {getUrgencyLevel(case_item.urgency_score)}
                      </div>
                      <span className="text-sm font-medium text-blue-600">#{case_item.case_number}</span>
                      {case_item.is_overdue && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                          <AlertTriangle className="h-3 w-3" />
                          OVERDUE
                        </div>
                      )}
                      {!case_item.assigned_lawyer_name && (
                        <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                          UNASSIGNED
                        </div>
                      )}
                    </div>

                    {/* Case Title and Details */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {case_item.title}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Client</p>
                          <p className="text-sm font-medium text-gray-900">{case_item.client_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Lawyer</p>
                          <p className="text-sm font-medium text-gray-900">
                            {case_item.assigned_lawyer_name || 'Not assigned'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Deadline</p>
                          <p className={`text-sm font-medium ${case_item.is_overdue ? 'text-red-600' : case_item.days_until_deadline <= 7 ? 'text-orange-600' : 'text-gray-900'}`}>
                            {case_item.days_until_deadline < 0 
                              ? `${Math.abs(case_item.days_until_deadline)} days overdue`
                              : case_item.days_until_deadline === 0
                              ? 'Due today'
                              : `${case_item.days_until_deadline} days left`
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {case_item.status.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Priority Factors */}
                    {case_item.priority_factors && case_item.priority_factors.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Priority Factors:</p>
                        <div className="flex flex-wrap gap-2">
                          {case_item.priority_factors.map((factor, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs border border-blue-200"
                            >
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Priority Score */}
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Priority Score</p>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-20 rounded-full bg-gray-200 overflow-hidden`}>
                          <div 
                            className={`h-full transition-all duration-300 ${
                              case_item.urgency_score >= 90 ? 'bg-red-500' :
                              case_item.urgency_score >= 70 ? 'bg-orange-500' :
                              case_item.urgency_score >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${case_item.urgency_score}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {case_item.urgency_score}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Priority Level</p>
                      <p className="text-sm font-medium text-gray-900">
                        {getPriorityLabel(case_item.priority_level)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                  {!case_item.assigned_lawyer_name && (
                    <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                      Assign Lawyer
                    </button>
                  )}
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                    Update Status
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
                    Change Priority
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCases.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No cases found matching the selected filter.</p>
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <AlertTriangle className="h-6 w-6 text-red-500 mb-2" />
                <h3 className="font-medium text-gray-900 mb-1">Review Overdue Cases</h3>
                <p className="text-sm text-gray-600">
                  {stats.overdue_cases} cases need immediate attention
                </p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <User className="h-6 w-6 text-purple-500 mb-2" />
                <h3 className="font-medium text-gray-900 mb-1">Assign Lawyers</h3>
                <p className="text-sm text-gray-600">
                  {cases.filter(c => !c.assigned_lawyer_name).length} cases need assignment
                </p>
              </button>
              
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <TrendingUp className="h-6 w-6 text-blue-500 mb-2" />
                <h3 className="font-medium text-gray-900 mb-1">Recalculate Priorities</h3>
                <p className="text-sm text-gray-600">
                  Update all case priority scores
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasePriorityDashboard;
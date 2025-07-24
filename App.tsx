import React, { useState, useMemo } from 'react';
import { Upload, Calendar, BarChart3, DollarSign, MapPin, Download, TrendingUp, ChevronRight, X, Clock, Users, Truck, Brain, Target, AlertCircle, CheckCircle } from 'lucide-react';

const ShuttleManagementPlatform = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [hourlyRate, setHourlyRate] = useState(84);
  const [drillDownData, setDrillDownData] = useState(null);
  const [showDrillDown, setShowDrillDown] = useState(false);
  
  // Generate realistic sample data
  const generateSampleData = () => {
    const locations = ['Marriott Downtown', 'Hilton Anchorage', 'Sheraton Anchorage'];
    const timeBlocks = [];
    
    // Generate 30-minute time blocks for 24 hours
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        timeBlocks.push(timeString);
      }
    }
    
    const data = [];
    const daysInMonth = 30;
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = weekdays[(day - 1) % 7];
      
      timeBlocks.forEach(timeBlock => {
        locations.forEach(location => {
          // Create realistic demand patterns
          const hour = parseInt(timeBlock.split(':')[0]);
          let basePassengers = 0;
          
          // Peak hours: 5-9 AM and 3-7 PM
          if (hour >= 5 && hour <= 9) {
            basePassengers = Math.floor(Math.random() * 8) + 3;
          } else if (hour >= 15 && hour <= 19) {
            basePassengers = Math.floor(Math.random() * 6) + 2;
          } else if (hour >= 10 && hour <= 14) {
            basePassengers = Math.floor(Math.random() * 4) + 1;
          } else {
            basePassengers = Math.floor(Math.random() * 2);
          }
          
          // Weekend adjustment
          if (dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday') {
            basePassengers = Math.floor(basePassengers * 0.7);
          }
          
          data.push({
            date: `${selectedMonth}-${day.toString().padStart(2, '0')}`,
            time_block: timeBlock,
            pickup_location: location,
            passenger_count: basePassengers,
            day_of_week: dayOfWeek
          });
        });
      });
    }
    
    return data;
  };

  const [shuttleData] = useState(generateSampleData());

  // Calculate analytics
  const analytics = useMemo(() => {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const locations = ['Marriott Downtown', 'Hilton Anchorage', 'Sheraton Anchorage'];
    
    // Time block × Day of Week analysis
    const timeBlockDayAnalysis = {};
    
    shuttleData.forEach(record => {
      const key = record.time_block;
      
      if (!timeBlockDayAnalysis[key]) {
        timeBlockDayAnalysis[key] = {};
        weekdays.forEach(day => {
          timeBlockDayAnalysis[key][day] = { total: 0, count: 0 };
        });
      }
      
      timeBlockDayAnalysis[key][record.day_of_week].total += record.passenger_count;
      timeBlockDayAnalysis[key][record.day_of_week].count += 1;
    });
    
    // Calculate averages and shuttle counts
    Object.keys(timeBlockDayAnalysis).forEach(timeBlock => {
      weekdays.forEach(day => {
        const data = timeBlockDayAnalysis[timeBlock][day];
        data.average = data.count > 0 ? data.total / data.count : 0;
        // Buffer logic optimized for 4-shuttle loop system (16 passengers per shuttle)
        data.shuttleCount = Math.min(4, Math.ceil(data.average / 16) + 1);
      });
    });
    
    return { timeBlockDayAnalysis };
  }, [shuttleData]);

  // Calculate total cost
  const totalMonthlyCost = useMemo(() => {
    let totalShuttleHours = 0;
    Object.values(analytics.timeBlockDayAnalysis).forEach(timeBlock => {
      Object.values(timeBlock).forEach(dayData => {
        totalShuttleHours += dayData.shuttleCount * 0.5; // 30-minute blocks
      });
    });
    return totalShuttleHours * hourlyRate * 4; // 4 weeks per month
  }, [analytics, hourlyRate]);

  // Drill-down handler
  const handleDrillDown = (timeBlock, day) => {
    const relevantData = shuttleData.filter(record => 
      record.time_block === timeBlock && record.day_of_week === day
    );
    
    setDrillDownData({
      timeBlock,
      day,
      data: relevantData,
      summary: analytics.timeBlockDayAnalysis[timeBlock][day]
    });
    setShowDrillDown(true);
  };

  const renderDrillDownModal = () => {
    if (!showDrillDown || !drillDownData) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {drillDownData.timeBlock} - {drillDownData.day}
              </h2>
              <p className="text-gray-600">Detailed passenger breakdown by location</p>
            </div>
            <button
              onClick={() => setShowDrillDown(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Total Passengers</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {drillDownData.summary.average.toFixed(1)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-green-600" />
                <span className="font-medium">Shuttles Needed</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {drillDownData.summary.shuttleCount}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Loop Efficiency</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {((drillDownData.summary.average / (drillDownData.summary.shuttleCount * 16)) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h3 className="font-medium">Pickup Location Breakdown</h3>
            </div>
            <div className="divide-y">
              {['Marriott Downtown', 'Hilton Anchorage', 'Sheraton Anchorage'].map(location => {
                const locationData = drillDownData.data.filter(d => d.pickup_location === location);
                const avgPassengers = locationData.length > 0 
                  ? locationData.reduce((sum, d) => sum + d.passenger_count, 0) / locationData.length 
                  : 0;
                
                return (
                  <div key={location} className="px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{location}</p>
                      <p className="text-sm text-gray-600">Average per day</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{avgPassengers.toFixed(1)}</p>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, (avgPassengers / 8) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Key Metrics */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Daily Average</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(shuttleData.reduce((sum, r) => sum + r.passenger_count, 0) / 30)}
              </p>
              <p className="text-xs text-gray-500">passengers/day</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Peak Hour</p>
              <p className="text-2xl font-bold text-gray-900">07:00</p>
              <p className="text-xs text-gray-500">highest demand</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Routes</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-xs text-gray-500">pickup locations</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
              <p className="text-2xl font-bold text-gray-900">${totalMonthlyCost.toLocaleString()}</p>
              <p className="text-xs text-gray-500">at ${hourlyRate}/hour</p>
            </div>
            <DollarSign className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Time Block × Day of Week Grid */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Average Passengers by Time Block & Day (24-Hour Operations)</h3>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Time Block</th>
                <th className="text-center p-2 font-medium">Mon</th>
                <th className="text-center p-2 font-medium">Tue</th>
                <th className="text-center p-2 font-medium">Wed</th>
                <th className="text-center p-2 font-medium">Thu</th>
                <th className="text-center p-2 font-medium">Fri</th>
                <th className="text-center p-2 font-medium">Sat</th>
                <th className="text-center p-2 font-medium">Sun</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(analytics.timeBlockDayAnalysis)
                .map(([timeBlock, dayData]) => (
                <tr key={timeBlock} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{timeBlock}</td>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <td key={day} className="text-center p-2">
                      <button
                        onClick={() => handleDrillDown(timeBlock, day)}
                        className={`inline-block px-2 py-1 rounded text-xs hover:shadow-md transition-shadow cursor-pointer ${
                          dayData[day].average > 6 ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                          dayData[day].average > 3 ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                          'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {dayData[day].average.toFixed(1)}
                        <ChevronRight className="inline h-3 w-3 ml-1" />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shuttle Count Optimization */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Optimized Shuttle Count</h3>
        <div className="space-y-3">
          {Object.entries(analytics.timeBlockDayAnalysis)
            .slice(10, 16) // Show peak hours
            .map(([timeBlock, dayData]) => {
              const avgShuttles = Object.values(dayData).reduce((sum, d) => sum + d.shuttleCount, 0) / 7;
              return (
                <div key={timeBlock} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">{timeBlock}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{avgShuttles.toFixed(1)} shuttles</span>
                    <div className={`w-3 h-3 rounded-full ${
                      avgShuttles > 3.5 ? 'bg-red-500' :
                      avgShuttles > 2 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );

  const renderDataManagement = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Data Upload & Management</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900">Upload shuttle data</p>
          <p className="text-sm text-gray-600 mb-4">
            Accept Excel/CSV files with columns: date, time_block, pickup_location, passenger_count
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Choose File
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Current Data Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{shuttleData.length}</p>
            <p className="text-sm text-gray-600">Total Records</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">30</p>
            <p className="text-sm text-gray-600">Days</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">3</p>
            <p className="text-sm text-gray-600">Locations</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">48</p>
            <p className="text-sm text-gray-600">Time Blocks</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCostModeling = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Cost Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Shuttle Rate ($)
            </label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="70"
              max="100"
            />
            <p className="text-xs text-gray-500 mt-1">Range: $73-$95 per hour</p>
          </div>
          <div className="flex items-end">
            <div className="w-full">
              <p className="text-sm font-medium text-gray-700 mb-2">Monthly Cost Estimate</p>
              <p className="text-3xl font-bold text-blue-600">${totalMonthlyCost.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Based on optimized shuttle allocation</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Cost Breakdown by Day</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
            const dayCost = Object.values(analytics.timeBlockDayAnalysis).reduce((sum, timeBlock) => {
              return sum + (timeBlock[day]?.shuttleCount || 0) * 0.5 * hourlyRate;
            }, 0) * 4; // 4 weeks
            
            return (
              <div key={day} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-1">{day.substring(0, 3)}</p>
                <p className="text-lg font-bold text-gray-900">${dayCost.toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Shuttle Tech Platform</h1>
                <p className="text-sm text-gray-600">ANC Airport Crew Transportation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="2024-01">January 2024</option>
                <option value="2024-02">February 2024</option>
                <option value="2024-03">March 2024</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Analytics Dashboard', icon: BarChart3 },
              { id: 'data', label: 'Data Management', icon: Upload },
              { id: 'cost', label: 'Cost Modeling', icon: DollarSign }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'data' && renderDataManagement()}
        {activeTab === 'cost' && renderCostModeling()}
      </div>
      
      {/* Drill-down Modal */}
      {renderDrillDownModal()}
    </div>
  );
};

export default ShuttleManagementPlatform;
import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar } from 'lucide-react';

const HolidayManager = ({ holidays, setHolidays, onClose }) => {
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });

  const addHoliday = () => {
    if (newHoliday.date && newHoliday.name) {
      setHolidays([...holidays, newHoliday]);
      setNewHoliday({ date: '', name: '' });
    }
  };

  const removeHoliday = (index) => {
    setHolidays(holidays.filter((_, i) => i !== index));
  };

  const malaysiaHolidays2025 = [
    { date: "2025-01-01", name: "New Year's Day" },
    { date: "2025-01-28", name: "Chinese New Year" },
    { date: "2025-01-29", name: "Chinese New Year Holiday" },
    { date: "2025-03-28", name: "Awal Ramadan" },
    { date: "2025-03-31", name: "Hari Raya Aidilfitri" },
    { date: "2025-04-01", name: "Hari Raya Aidilfitri Holiday" },
    { date: "2025-05-01", name: "Labour Day" },
    { date: "2025-05-12", name: "Wesak Day" },
    { date: "2025-06-02", name: "Yang di-Pertuan Agong's Birthday" },
    { date: "2025-06-07", name: "Hari Raya Aidiladha" },
    { date: "2025-08-31", name: "National Day" },
    { date: "2025-09-16", name: "Malaysia Day" },
    { date: "2025-10-27", name: "Deepavali" },
    { date: "2025-12-25", name: "Christmas Day" }
  ];

  const loadMalaysiaHolidays = () => {
    setHolidays(malaysiaHolidays2025);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "white",
        borderRadius: "12px",
        width: "600px",
        maxHeight: "80vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{
          padding: "24px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Calendar size={24} />
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>Holiday Management</h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          <button
            onClick={loadMalaysiaHolidays}
            style={{
              width: "100%",
              padding: "12px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              marginBottom: "20px"
            }}
          >
            Load Malaysia Public Holidays 2025
          </button>

          <div style={{ 
            display: "flex", 
            gap: "12px", 
            marginBottom: "20px",
            padding: "16px",
            background: "#f9fafb",
            borderRadius: "8px"
          }}>
            <input
              type="date"
              value={newHoliday.date}
              onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
              style={{
                flex: 1,
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            />
            <input
              type="text"
              placeholder="Holiday name"
              value={newHoliday.name}
              onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
              style={{
                flex: 2,
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            />
            <button
              onClick={addHoliday}
              style={{
                padding: "8px 16px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "0 24px 24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "#6b7280" }}>
            Current Holidays ({holidays.length})
          </h3>
          {holidays.length === 0 ? (
            <div style={{ 
              padding: "40px", 
              background: "#f9fafb", 
              borderRadius: "8px",
              textAlign: "center",
              color: "#9ca3af"
            }}>
              No holidays configured
            </div>
          ) : (
            <div style={{ space: "8px" }}>
              {holidays.map((holiday, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  background: idx % 2 === 0 ? "#f9fafb" : "white",
                  borderRadius: "6px",
                  marginBottom: "4px"
                }}>
                  <div>
                    <div style={{ fontWeight: "500", fontSize: "14px" }}>{holiday.name}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {new Date(holiday.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => removeHoliday(idx)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#ef4444",
                      padding: "4px"
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HolidayManager;
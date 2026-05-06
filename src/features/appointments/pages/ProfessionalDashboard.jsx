import { useEffect, useState } from "react";
import { useAppointments, useAppointments } from "../hooks/useAppointments";
import { AppointmentCard } from "../components/AppointmentCard";
import { useAuth } from "../../../providers/AuthProvider";

import React from 'react'
import { Key } from "lucide-react";

export default function ProfessionalDashboard() {
    const { useAppointments, fetchAppointments, updateStatus}= useAppointments();
    const {profile } = useAuth();
    const [filter, setfilter] = useState("padding"); //pading, confirmed, completed

    useEffect(() => {
        fetchAppointments({status: filter});

    },[filter, fetchAppointments]);

    const handleConfirm = (id) =>updateStatus(id, "comfirmed");
    const handleComplete = (id) =>updateStatus(id, "completed", notes);
    const handleNoshow =(id)=>updateStatus(id, "no_show");
  return (
    <div className="dashboard-container">
        <header className="dashboard-header">
            <h1> citas-{profile?.dependencies?.name}</h1>
            <div className="filter-tabs">
                {["pending", "confirmed", "completed"].map((status)=>(
                    <button
                    Key={status}
                    classme={filter===status ? "active":""}
                    onClick={()=>setfilter(status)}
                    >
                    {status ==="peding" && "pendientes"}
                    {status ==="confirmed" && "confirmadas"}
                    {status ==="completed" && "completados"}
                    
                </button>
                ))}
                
            </div>
        </header>
        <div className="appointments-grid">
                {isLoading ? (
                    <p>Cargando citas...</p>
                ) : (
                    useAppointments.map((apt) => (
                        <div key={apt.id} className="appointments-wrapper">
                            <AppointmentCard appointments={apt} isAprendiz={false}/>

                            {filter === "pending" && (
                                <div className="professional-actions">
                                    <button
                                    onClick={() => handleConfirm(apt.id)}
                                    className="btn-succes"
                                    >
                                        Confirmar
                                    </button>
                                    <button
                                        onClick={() => handleShow(apt.id)}
                                        className="btn-secondary"
                                    >
                                        No asistió
                                    </button>
                                </div>
                            )}
                            {filter === "confirmed" &&(
                                <div className="profesional-actions">
                                    <button
                                        onclick={() => handleComplete(apt.id, "Atencion completada")
                                        }
                                        className="btn-primary"
                                        >
                                            Completar Atencion
                                    </button>
                                </div>
                            )}
                            
                        </div>
                    ))
                )}
            </div>
        </div>
    );
            
    
}

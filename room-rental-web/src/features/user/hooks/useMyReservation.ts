import { useEffect, useState } from "react";
import { reservationApi } from "../../reservations/api/reservationApi";
import {type ReservationResponse } from "../../reservations/types/reservation";

export function useMyReservation(){
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [data, setData] = useState<ReservationResponse[]>([]);

    const loadMyReservation =async ()=>{
        try{
            setLoading(true);
            const reservation = await reservationApi.getMyReservation();
            setData(reservation);
        }catch(error){
            setError(true);
        }finally{
            setLoading(false);
        }
    }
    useEffect(()=>{
        loadMyReservation();
    },[]);
    return {
        data,
        loading,
        error,
        loadMyReservation
    }

}
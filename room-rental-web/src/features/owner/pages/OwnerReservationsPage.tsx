import { useState } from "react";
import { CalendarCheck, CreditCard } from "../../../components/ui/MaterialIcon.tsx";
import { Button, EmptyState, LoadingState, Modal, PageHeader, Pagination } from "../../../components/ui";
import { useReservations } from "../../reservations/hooks/useReservations";
import { useReservationStatusMutation } from "../../reservations/hooks/useReservationStatusMutation";
import { useReservationPaymentFlow } from "../../reservations/hooks/useReservationPaymentFlow";
import type { ReservationResponse } from "../../reservations/types/reservation";
import { BakongPaymentDialog } from "../../payment/components/BakongPaymentDialog";
import { ReservationFilters } from "../../reservations/components/ReservationFilters";
import { ReservationTable } from "../../reservations/components/ReservationTable";
import { OwnerReservationCreateDialog } from "../components/reservations/OwnerReservationCreateDialog.tsx";
import { useLocationScope } from "../../location-scope/LocationScopeProvider";

export default function OwnerReservationsPage(){
  const scope = useLocationScope();
  const [createOpen,setCreateOpen]=useState(false); const [keyword,setKeyword]=useState(""); const [status,setStatus]=useState(""); const [date,setDate]=useState(new Date().toISOString().slice(0,10)); const [page,setPage]=useState(0); const [view,setView]=useState<ReservationResponse|null>(null);
  const list = useReservations({ locationId: scope.currentLocationId ?? undefined, keyword:keyword.trim()||undefined, status:status||undefined, date:date||undefined, page, size:20, sort:"startAt,desc" });
  const confirm=useReservationStatusMutation("confirm"), cancel=useReservationStatusMutation("cancel"), checkIn=useReservationStatusMutation("checkIn"), checkOut=useReservationStatusMutation("checkOut");
  const paymentFlow=useReservationPaymentFlow();
  const onAction=(action:"confirm"|"cancel"|"checkIn"|"checkOut", item:ReservationResponse)=>{ const mutation={confirm,cancel,checkIn,checkOut}[action]; void mutation.mutateAsync(item.id).then(updated=>setView(current=>current?.id===updated.id?updated:current)); };
  const clear=()=>{setKeyword("");setStatus("");setDate("");setPage(0)};
  if(scope.isLoading) return <LoadingState/>;
  return <div className="mx-auto w-full max-w-[1600px] space-y-6"><PageHeader icon={<CalendarCheck size={19}/>} title="Reservations" actions={<Button leftIcon={<CalendarCheck size={17}/>} onClick={()=>setCreateOpen(true)}>New reservation</Button>}/><ReservationFilters keyword={keyword} status={status} date={date} onKeywordChange={(v)=>{setKeyword(v);setPage(0)}} onStatusChange={(v)=>{setStatus(v);setPage(0)}} onDateChange={(v)=>{setDate(v);setPage(0)}}/>{paymentFlow.error&&<div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{paymentFlow.error}</div>}{list.isLoading&&<LoadingState/>}{list.isError&&<EmptyState title="Unable to load reservations" description="Something went wrong while loading reservations." action={<Button variant="secondary" onClick={()=>void list.refetch()}>Try again</Button>}/>} {!list.isLoading&&!list.isError&&list.data?.empty&&<EmptyState title="No reservations found" description="Change the filters or create a new reservation." action={<Button variant="secondary" onClick={clear}>Clear filters</Button>}/>} {!list.isLoading&&!list.isError&&list.data&&!list.data.empty&&<><ReservationTable reservations={list.data.content} onView={setView} onAction={onAction} onPayment={(item)=>paymentFlow.start(item.id)}/><Pagination pagination={list.data} onPageChange={setPage}/></>}<OwnerReservationCreateDialog open={createOpen} onClose={()=>setCreateOpen(false)} initialState={{ locationId: scope.currentLocationId ?? undefined }} /><BakongPaymentDialog open={paymentFlow.open} onClose={paymentFlow.close} reservationId={paymentFlow.reservationId} onCompleted={()=>void list.refetch()}/><Modal open={Boolean(view)} onClose={()=>setView(null)} title={view ? view.referenceNo : "Reservation details"}>{view&&<div className="space-y-5"><div className="grid gap-3 sm:grid-cols-2"><Info label="Room" value={`${view.roomNumber} · ${view.roomName}`}/><Info label="Status" value={view.status}/><Info label="Contact" value={view.contactName}/><Info label="Amount" value={`${view.totalAmount.toFixed(2)} ${view.currencyCode}`}/><Info label="Start" value={view.startAt}/><Info label="End" value={view.endAt}/></div><p className="text-sm text-slate-600">{view.purpose || "No purpose."}</p><div className="flex justify-end"><Button variant="secondary" onClick={()=>setView(null)}>Close</Button></div></div>}</Modal></div>;
}
function Info({label,value}:{label:string;value:string}){return <div className="rounded-xl border border-slate-200 px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm font-medium text-slate-800">{value}</p></div>}

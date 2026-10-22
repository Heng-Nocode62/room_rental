import { useEffect, useRef, useState } from "react";

import type { RoomResponse } from "../../rooms/types/room";
import type { RoomTypeResponse } from "../../room-types/types/roomType";
import type { LocationResponse } from "../../locations/types/location";
import type { ReservationQrResponse } from "../../payments/types/reservationQr";

import { reservationQrApi } from "../../payments/api/reservationQrApi";
import { PaymentQrDialog } from "./PaymentQrDialog";
import { BookingDialog } from "../../user/components/BookingDialog";

interface BookingDialogWithQrProps {
  open: boolean;
  onClose: () => void;
  room: RoomResponse;
  roomType?: RoomTypeResponse;
  location?: LocationResponse;
  initialDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  onCreated?: (reservationId: number) => void;
}

export function BookingDialogWithQr({
  open,
  onClose,
  room,
  roomType,
  location,
  initialDate,
  initialStartTime,
  initialEndTime,
  onCreated,
}: BookingDialogWithQrProps) {
  const [bookingDialogOpen, setBookingDialogOpen] =
    useState(open);

  const [qrDialogOpen, setQrDialogOpen] =
    useState(false);

  const [qrLoading, setQrLoading] =
    useState(false);

  const [qrError, setQrError] =
    useState<string | null>(null);

  const [qrData, setQrData] =
    useState<ReservationQrResponse | null>(null);

  const [reservationId, setReservationId] =
    useState<number | null>(null);

  // The existing BookingDialog calls onClose immediately after onCreated.
  // After creation, that close should hide only the booking form.
  const reservationCreatedRef = useRef(false);

  useEffect(() => {
    if (open) {
      reservationCreatedRef.current = false;

      setBookingDialogOpen(true);
      setQrDialogOpen(false);
      setQrLoading(false);
      setQrError(null);
      setQrData(null);
      setReservationId(null);
    } else {
      setBookingDialogOpen(false);
      setQrDialogOpen(false);
    }
  }, [open]);

  const generateQr = async (
    createdReservationId: number,
  ) => {
    setReservationId(createdReservationId);
    setQrDialogOpen(true);
    setQrLoading(true);
    setQrError(null);
    setQrData(null);

    try {
      const result =
        await reservationQrApi.generateForReservation(
          createdReservationId,
        );

      setQrData(result);
    } catch (error) {
      setQrError(
        error instanceof Error
          ? error.message
          : "Unable to generate a Bakong QR code. Please try again.",
      );
    } finally {
      setQrLoading(false);
    }
  };

  const handleReservationCreated = (
    createdReservationId: number,
  ) => {
    reservationCreatedRef.current = true;
    setBookingDialogOpen(false);

    void generateQr(createdReservationId);
  };

  const handleBookingClose = () => {
    setBookingDialogOpen(false);

    if (!reservationCreatedRef.current) {
      // The customer closed the booking form without creating
      // a reservation. Close the entire flow.
      onClose();
    }
  };

  const finishFlow = () => {
    setQrDialogOpen(false);

    if (reservationId !== null) {
      // Notify the parent only after the QR flow is closed.
      // This preserves its existing query refresh and close behavior.
      onCreated?.(reservationId);
    }

    onClose();
  };

  return (
    <>
      <BookingDialog
        open={open && bookingDialogOpen}
        onClose={handleBookingClose}
        room={room}
        roomType={roomType}
        location={location}
        initialDate={initialDate}
        initialStartTime={initialStartTime}
        initialEndTime={initialEndTime}
        onCreated={handleReservationCreated}
      />

      <PaymentQrDialog
        open={open && qrDialogOpen}
        onClose={finishFlow}
        data={qrData}
        loading={qrLoading}
        error={qrError}
        onRetry={() => {
          if (reservationId !== null) {
            void generateQr(reservationId);
          }
        }}
      />
    </>
  );
}
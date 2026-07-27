"use client";

import { BrowserMultiFormatReader } from "@zxing/browser";
import { useEffect, useRef } from "react";

type Props = {
  onScan: (barcode: string) => void;
};

export default function CameraScanner({ onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let controls: any;

    async function startScanner() {
      try {
        // Get available cameras
        const devices =
          await BrowserMultiFormatReader.listVideoInputDevices();

        if (devices.length === 0) {
          alert("No camera found.");
          return;
        }

        // Prefer rear camera on phones
        const preferredCamera =
          devices.find((device) =>
            device.label.toLowerCase().includes("back")
          ) || devices[0];

        // Start scanning
        controls = await reader.decodeFromVideoDevice(
          preferredCamera.deviceId,
          videoRef.current!,
          (result) => {
            if (result) {
              const barcode = result.getText();

              // Stop scanner
              controls.stop();

              // Return scanned barcode
              onScan(barcode);
            }
          }
        );
      } catch (error) {
        console.error("Scanner Error:", error);
      }
    }

    startScanner();

    return () => {
      try {
        controls?.stop();
      } catch {}

      try {
        reader.reset();
      } catch {}
    };
  }, [onScan]);

  return (
    <div className="w-full">
      <video
        ref={videoRef}
        className="w-full h-80 object-cover rounded-lg border"
        autoPlay
        playsInline
        muted
      />
    </div>
  );
}
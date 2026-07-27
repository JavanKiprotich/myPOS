"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

type Props = {
  onScan: (barcode: string) => void;
};

export default function CameraScanner({ onScan }: Props) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 250,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScan]);

  return <div id="reader" />;
}
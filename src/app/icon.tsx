import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#054239",
          borderRadius: 14,
          position: "relative",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "4px solid #b9a779",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "9px solid transparent",
              borderRight: "9px solid transparent",
              borderBottom: "26px solid #ffffff",
              transform: "translateY(2px)",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 6,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#b9a779",
          }}
        />
      </div>
    ),
    size
  );
}

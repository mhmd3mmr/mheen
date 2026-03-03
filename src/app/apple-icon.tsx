import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 36,
          position: "relative",
        }}
      >
        <div
          style={{
            width: 102,
            height: 102,
            borderRadius: "50%",
            border: "10px solid #b9a779",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "24px solid transparent",
              borderRight: "24px solid transparent",
              borderBottom: "66px solid #ffffff",
              transform: "translateY(4px)",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 16,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#b9a779",
          }}
        />
      </div>
    ),
    size
  );
}

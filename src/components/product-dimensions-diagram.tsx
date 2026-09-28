import type { ProductMeasures } from "@/lib/types/commerce";

function Label({
  x,
  y,
  children,
  anchor = "middle",
}: {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill="#0b2b55"
      fontSize="11"
      fontFamily="ui-sans-serif, system-ui, sans-serif"
    >
      {children}
    </text>
  );
}

export function ProductDimensionsDiagram({ measures }: { measures: ProductMeasures }) {
  const width = measures.widthCm;
  const height = measures.heightCm;
  if (width == null || height == null) return null;

  const maxDrawW = 220;
  const maxDrawH = 200;
  const scale = Math.min(maxDrawW / width, maxDrawH / height);
  const bodyW = width * scale;
  const bodyH = height * scale;
  const originX = 86;
  const originY = 36;
  const hasLegs = measures.legHeightCm != null && measures.cabinetHeightCm != null;
  const cabinetH = hasLegs ? measures.cabinetHeightCm! * scale : bodyH;
  const legH = hasLegs ? measures.legHeightCm! * scale : 0;
  const depth = measures.depthCm;
  const extrusion = depth != null ? Math.min(36, depth * scale * 0.35) : 0;

  const viewW = originX + bodyW + extrusion + 90;
  const viewH = originY + bodyH + 48;

  return (
    <div className="overflow-hidden rounded-[var(--radius)] bg-white px-4 py-6">
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="mx-auto h-auto w-full max-w-md"
        role="img"
        aria-label={`Dimension diagram: width ${width} cm, height ${height} cm${depth != null ? `, depth ${depth} cm` : ""}`}
      >
        {extrusion > 0 ? (
          <path
            d={`M ${originX} ${originY} L ${originX + extrusion} ${originY - extrusion * 0.45} L ${originX + bodyW + extrusion} ${originY - extrusion * 0.45} L ${originX + bodyW + extrusion} ${originY + bodyH - extrusion * 0.45} L ${originX + bodyW} ${originY + bodyH} L ${originX + bodyW} ${originY} Z`}
            fill="#f7f5f1"
            stroke="#0b2b55"
            strokeWidth="1.4"
          />
        ) : null}
        <rect
          x={originX}
          y={originY}
          width={bodyW}
          height={hasLegs ? cabinetH : bodyH}
          fill="#fff"
          stroke="#0b2b55"
          strokeWidth="1.6"
        />
        {hasLegs ? (
          <>
            <line
              x1={originX + 10}
              y1={originY + cabinetH}
              x2={originX + 10}
              y2={originY + cabinetH + legH}
              stroke="#0b2b55"
              strokeWidth="1.6"
            />
            <line
              x1={originX + bodyW - 10}
              y1={originY + cabinetH}
              x2={originX + bodyW - 10}
              y2={originY + cabinetH + legH}
              stroke="#0b2b55"
              strokeWidth="1.6"
            />
            {measures.crossbarFromFloorCm != null ? (
              <line
                x1={originX + 10}
                y1={originY + bodyH - measures.crossbarFromFloorCm * scale}
                x2={originX + bodyW - 10}
                y2={originY + bodyH - measures.crossbarFromFloorCm * scale}
                stroke="#0b2b55"
                strokeWidth="1.4"
              />
            ) : null}
          </>
        ) : null}

        <line x1={originX} y1={originY + bodyH + 18} x2={originX + bodyW} y2={originY + bodyH + 18} stroke="#0b2b55" strokeWidth="1" />
        <Label x={originX + bodyW / 2} y={originY + bodyH + 34}>{`L ${width} cm`}</Label>

        <line x1={originX - 22} y1={originY} x2={originX - 22} y2={originY + bodyH} stroke="#0b2b55" strokeWidth="1" />
        <Label x={originX - 30} y={originY + bodyH / 2} anchor="end">{`H ${height} cm`}</Label>

        {depth != null ? (
          <Label x={originX + bodyW + extrusion + 8} y={originY + 8} anchor="start">{`P ${depth} cm`}</Label>
        ) : null}
        {hasLegs ? (
          <Label x={originX + bodyW + 8} y={originY + cabinetH / 2 + 4} anchor="start">{`Cabinet ${measures.cabinetHeightCm} cm`}</Label>
        ) : null}
      </svg>
    </div>
  );
}

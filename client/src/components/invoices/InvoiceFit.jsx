import { useLayoutEffect, useRef, useState } from "react";

const DOCUMENT_WIDTH = 720;

// Shows the invoice at a fixed width and shrinks it to fit narrow screens,
// so it looks the same on every device. Printing always uses the full size.
function InvoiceFit({ children }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) return;

    const update = () =>
      setScale(Math.min(1, element.clientWidth / DOCUMENT_WIDTH));

    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ maxWidth: DOCUMENT_WIDTH }}
      className="mx-auto w-full"
    >
      <div
        style={{ width: DOCUMENT_WIDTH, "--invoice-scale": scale }}
        className="[zoom:var(--invoice-scale)] print:[zoom:1]"
      >
        {children}
      </div>
    </div>
  );
}

export default InvoiceFit;
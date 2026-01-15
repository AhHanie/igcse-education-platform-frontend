import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";

/* ================= TYPES ================= */

export interface DropdownOption {
  id: number | string;
  subjectName: string;
  icon?: string;
}

export interface CustomDropdownProps {
  options: DropdownOption[];
  selected: (option: DropdownOption) => void;
  subjectId?: number | string | null;
  subjectName?: string;
  icon?: string;
}

export interface CustomDropdownRef {
  close: () => void;
}

/* ================= COMPONENT ================= */

const CustomDropdown = forwardRef<CustomDropdownRef, CustomDropdownProps>(
  ({ options, selected, subjectId, subjectName, icon }, ref) => {
    const [open, setOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    /* expose methods to parent */
    useImperativeHandle(ref, () => ({
      close: () => setOpen(false),
    }));

    const handleSelect = (option: DropdownOption) => {
      selected(option);
      setOpen(false);
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div
        ref={dropdownRef}
        style={{ width: "100%", position: "relative" }}
      >
        {/* Dropdown Header */}
        <div
          onClick={() => setOpen((prev) => !prev)}
          style={{
            width: "100%",
            height: "45px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 10px",
            cursor: "pointer",
            // color: subjectId ? "hsl(var(--text))" : "hsl(var(--muted))",
            userSelect: "none",
            fontWeight: 500,
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
          }}
        >
          {`${icon}  ${subjectName}` || "Select subject"}
          <span style={{ fontSize: "14px" }}>
            {open ? "▲" : "▼"}
          </span>
        </div>

        {/* Dropdown Menu */}
        {open && (
          <div
            style={{
              position: "absolute",
              top: "45px",
              left: 0,
              width: "100%",
              background: "hsl(var(--card))",
              maxHeight: "350px",
              borderRadius: "8px",
              zIndex: 99,
              overflowY: "auto",
              color: "hsl(var(--primary))",
              fontSize: "14px",
            }}
          >
            {options.map((opt) => (
              <div
                    key={opt.id}
                    onClick={() => handleSelect(opt)}
                    style={{
                        padding: "10px",
                        cursor: "pointer",
                        background:
                        subjectId === opt.id ? "hsl(var(--muted-foreground))" : "transparent",
                        color:
                        subjectId === opt.id ? "hsl(var(--card))" : "hsl(var(--foreground))",
                        transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        if (subjectId !== opt.id) {
                        e.currentTarget.style.background = "hsl(var(--muted))";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (subjectId !== opt.id) {
                        e.currentTarget.style.background = "transparent";
                        }
                    }}
                    >
                    {opt.icon} {opt.subjectName}
                    </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

export default CustomDropdown;

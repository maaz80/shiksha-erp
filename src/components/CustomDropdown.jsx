import { useState, useRef, useEffect, useMemo } from "react";
import { HiChevronDown, HiCheck, HiOutlineSearch, HiX } from "react-icons/hi";

/**
 * Universal CustomDropdown for CRM & ERP
 * - Fully accessible, click-outside handled
 * - Supports arrays of strings or objects { value, label, badge, badgeColor, icon, sublabel, disabled }
 * - Integrated auto-search for long lists (e.g. Courses, Batches, Students)
 * - Pixel-perfect borders, subtle shadows, smooth transitions & rounded styling
 */
export default function CustomDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select an option...",
  disabled = false,
  size = "md", // "sm" | "md" | "lg"
  className = "",
  buttonClassName = "",
  menuClassName = "",
  searchable, // if undefined, auto-enables when options.length > 7
  searchPlaceholder = "Search...",
  align = "auto", // "left" | "right" | "auto"
  rounded = "rounded-xl"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuAlign, setMenuAlign] = useState("left");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const menuRef = useRef(null);

  // Normalize options to consistent object structure
  const normalizedOptions = useMemo(() => {
    return (options || []).map((opt) => {
      if (typeof opt === "object" && opt !== null) {
        const val = opt.value !== undefined ? opt.value : opt.label;
        const lbl = opt.label !== undefined ? opt.label : String(opt.value);
        return {
          value: val,
          label: lbl,
          badge: opt.badge,
          badgeColor: opt.badgeColor || "bg-blue-50 text-blue-700 border-blue-200",
          icon: opt.icon,
          sublabel: opt.sublabel,
          disabled: !!opt.disabled
        };
      }
      return {
        value: opt,
        label: String(opt),
        disabled: false
      };
    });
  }, [options]);

  // Determine if search input should be visible
  const isSearchable = searchable !== undefined ? searchable : normalizedOptions.length > 7;

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return normalizedOptions;
    const term = searchTerm.toLowerCase();
    return normalizedOptions.filter((opt) => {
      const matchLabel = String(opt.label).toLowerCase().includes(term);
      const matchSub = opt.sublabel ? String(opt.sublabel).toLowerCase().includes(term) : false;
      const matchVal = String(opt.value).toLowerCase().includes(term);
      return matchLabel || matchSub || matchVal;
    });
  }, [normalizedOptions, searchTerm]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((o) => String(o.value) === String(value));
  }, [normalizedOptions, value]);

  // Check alignment to prevent dropdown overflowing right screen edge
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      if (align === "auto") {
        const rect = dropdownRef.current.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        if (rect.left + 260 > screenWidth) {
          setMenuAlign("right");
        } else {
          setMenuAlign("left");
        }
      } else {
        setMenuAlign(align);
      }

      // Auto-focus search input if searchable
      if (isSearchable && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
    } else {
      setSearchTerm("");
    }
  }, [isOpen, align, isSearchable]);

  // Click outside & Escape key listeners
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Size variations
  const sizeStyles = {
    sm: "h-8 px-3 py-1 text-xs gap-1.5",
    md: "h-9.5 px-3.5 py-2 text-xs sm:text-[13px] gap-2",
    lg: "h-11 px-4 py-2.5 text-sm gap-2.5"
  };

  return (
    <div className={`relative inline-block w-full ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full ${rounded} border text-left font-medium flex items-center justify-between transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed ${
          sizeStyles[size] || sizeStyles.md
        } ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/15 bg-white text-slate-900 shadow-2xs"
            : "border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-slate-300 text-slate-700 shadow-2xs"
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {selectedOption?.icon && (
            <span className="shrink-0 text-slate-500">{selectedOption.icon}</span>
          )}
          <span className={`truncate ${selectedOption ? "font-semibold text-slate-800" : "text-slate-400 font-normal"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${selectedOption.badgeColor}`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        <HiChevronDown
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"
          } ${isOpen ? "rotate-180 text-blue-600" : "hover:text-slate-600"}`}
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="listbox"
          className={`absolute z-[9999] mt-1.5 min-w-full w-max max-w-[min(100vw-2rem,380px)] bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-900/10 p-1 flex flex-col transition-all duration-150 ease-out origin-top animate-in fade-in zoom-in-95 ${
            menuAlign === "right" ? "right-0" : "left-0"
          } ${menuClassName}`}
        >
          {/* Search Box if list is long */}
          {isSearchable && (
            <div className="p-1 pb-1.5 border-b border-slate-100">
              <div className="relative flex items-center">
                <HiOutlineSearch className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  >
                    <HiX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-0.5 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-slate-400 italic">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => {
                      if (!opt.disabled) {
                        onChange(opt.value);
                        setIsOpen(false);
                      }
                    }}
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between gap-2.5 text-left transition-colors duration-150 cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      {opt.icon && <span className="shrink-0 text-slate-500">{opt.icon}</span>}
                      <div className="truncate">
                        <span className="block truncate">{opt.label}</span>
                        {opt.sublabel && (
                          <span className="block text-[10px] text-slate-400 font-normal truncate">
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
                      {opt.badge && (
                        <span
                          className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-md font-bold border ${opt.badgeColor}`}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <HiCheck className="w-4 h-4 text-blue-600 shrink-0 ml-1.5 stroke-[1.5]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

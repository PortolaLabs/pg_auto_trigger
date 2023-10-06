import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import classes from "../../utils/classes";
import getStringLengthOfChildren from "../../utils/getStringLengthOfChildren";
import { IconType } from "../Icon/types";
import { AsMap, TooltipProps } from "./types";
import style from "./style/Tooltip.module.scss";
import Icon from "../Icon";
import { FaInfoCircle } from "react-icons/fa";

export default function Tooltip<T extends keyof AsMap>({ as, className, title, children, icon = <FaInfoCircle />, ...props }: TooltipProps<T>) {
  const Tag: any = as || "span";

  const length = getStringLengthOfChildren(title);
  const wrapperClasses = classes([style.tooltip, className, length > 30 && style.multiline]);

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const targetRef = useRef<any>(null);

  // Create a ref to attach the tooltip portal to
  const tooltipContainer = useRef(document.createElement("div"));

  useEffect(() => {
    // Appending the tooltip container to the body on mount
    document.body.appendChild(tooltipContainer.current);

    // Removing the tooltip container from the body on unmount
    return () => {
      document.body.removeChild(tooltipContainer.current);
    };
  }, []);

  const showTooltip = () => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX,
      });
      setTooltipVisible(true);
    }
  };

  const hideTooltip = () => {
    setTooltipVisible(false);
  };

  const tooltipMessage = tooltipVisible && (
    <span className={style.message} style={{ position: "fixed", top: `${position.top}px`, left: `${position.left}px` }}>
      {title}
    </span>
  );

  const iconElement = typeof icon === "string" ? <Icon icon={icon as IconType} /> : icon;

  return (
    <Tag {...props} className={wrapperClasses}>
      {children}
      <span className={style.icon} onMouseEnter={showTooltip} onMouseLeave={hideTooltip} ref={targetRef}>
        {iconElement}
        {ReactDOM.createPortal(tooltipMessage, tooltipContainer.current)}
      </span>
    </Tag>
  );
}

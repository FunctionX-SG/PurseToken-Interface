import React, { useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import Toast from "../Toast/Toast";
import "./ToastList.css";
import { useToast } from "../state/toast/hooks";

export default function ToastList(props:any){
    const { position } = props
    const [toast, , removeToast] = useToast()
    const listRef = useRef(null);

    const handleScrolling = useCallback((el:any) => {
        const isTopPosition = ["top-left", "top-right"].includes(position);
        if (isTopPosition) {
        el?.scrollTo(0, el.scrollHeight);
        } else {
        el?.scrollTo(0, 0);
        }
    },[position]);

    useEffect(() => {
        handleScrolling(listRef.current);
    }, [position, toast, handleScrolling]);

    const sortedData = position.includes("bottom")
        ? [...toast].reverse()
        : [...toast];

    return (
        <div>
            {sortedData.length > 0 ?
            <div
                className={`toast-list toast-list--${position}`}
                aria-live="assertive"
                ref={listRef}
            >
                {sortedData.map((_toast) => (
                <Toast
                    key={_toast.id}
                    message={_toast.message}
                    type={_toast.type}
                    link={_toast.link}
                    onClose={() => removeToast(_toast.id)}
                />
                ))}
            </div>
            :
            <div></div>
            }
        </div>
    );
};

ToastList.defaultProps = {
  position: "bottom-right",
};

ToastList.propTypes = {
  position: PropTypes.string.isRequired,
};


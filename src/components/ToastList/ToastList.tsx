import React, { useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import Toast from "../Toast/Toast";
import "./ToastList.css";

export default function ToastList(props:any){
    const { data, position, removeToast } = props
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
    }, [position, data, handleScrolling]);

    const sortedData = position.includes("bottom")
        ? [...data].reverse()
        : [...data];

    return (
        <div>
            {sortedData.length > 0 ?
            <div
                className={`toast-list toast-list--${position}`}
                aria-live="assertive"
                ref={listRef}
            >
                {sortedData.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    link={toast.link}
                    onClose={() => removeToast(toast.id)}
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
  data: PropTypes.array.isRequired,
  position: PropTypes.string.isRequired,
  removeToast: PropTypes.func.isRequired,
};


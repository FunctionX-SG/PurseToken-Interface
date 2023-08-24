import React from "react";
import PropTypes from "prop-types";
import "./Toast.css";
import exlink from '../../assets/images/link.png'

import {
  SuccessIcon,
  FailureIcon,
  WarningIcon,
  CloseIcon,
} from "../Icons/Icons";

export default function Toast (props:any){
    const {message,type,onClose,link} = props
    const iconMap = {
        success: <SuccessIcon />,
        failure: <FailureIcon />,
        warning: <WarningIcon />,
    };
    const toastIcon = iconMap[type as keyof typeof iconMap] || null;

    return (
        <div className={`toast toast--${type}`} role="alert">
        <div className="toast-message">
            {toastIcon && (
            <div className="icon icon--lg icon--thumb">{toastIcon}</div>
            )}
            <div>
            <p>{message}</p>
            {link?
            
            <div className='toast-dropdown' style={{ fontSize: '12px' }} onClick={() => {
              window.open(link, '_blank')
            }}>View&nbsp;Tx&nbsp;<img src={exlink} className='mb-1' height='10' alt="" />
            </div>
            :
            <div></div>
            }
            </div>

        </div>
        
        <button className="toast-close-btn" onClick={onClose}>
            <span className="icon">
            <CloseIcon />
            </span>
        </button>
        </div>
    );
};

Toast.defaultProps = {
  type: "success",
  message: "Add a meaningful toast message here.",
};

Toast.propTypes = {
  type: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  link: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};


import React from 'react'
import './Popup.css'
import CloseButton from 'react-bootstrap/CloseButton'

export default function Popup(props: any) {
    return (
        <div >
            {props.trigger ?
                <div className="popup">
                    <div className="popup-inner ml-auto mr-auto mt-5" >
                            <CloseButton data-bs-theme="dark" aria-label="Hide" onClick={() => {
                                props.setTrigger(false)
                            }}>close
                            </CloseButton>
                            {props.children}
                    </div>
                </div>
                : ""}
        </div>
    )
}
import React from 'react';

const Message = ({ type, message }) => {
    if (!message) return null;

    const className = `message-container ${type === 'success' ? 'message-success' : 'message-error'}`;

    return (
        <div className={className}>
            {message}
        </div>
    );
};

export default Message;
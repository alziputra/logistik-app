import React from 'react';

export default function InputError({ message, className = '', ...props }) {
  return message ? (
    <p {...props} className={'text-sm text-rose-400 mt-1 ' + className}>
      {message}
    </p>
  ) : null;
}
